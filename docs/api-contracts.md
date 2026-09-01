# AI-Powered Multilingual Disease Detection & Smart Hospital Queue Management System
## Central REST API Contracts Specification (V1)

This specification defines the HTTP API routes, request bodies, expected responses, headers, validation constraints, and Socket.IO events for the centralized Node.js/Express gateway.

---

## 1. Authentication & Security Routes (`/api/v1/auth`)

All routes use JWT-based authentication via HTTP-Only cookies.

### 1.1 Patient Registration
* **Endpoint**: `POST /auth/register`
* **Access**: Public
* **Validation (express-validator)**:
  - `email`: Must be a valid, unique email address.
  - `password`: Strong password rules (min 8 characters, at least 1 uppercase, 1 symbol).
  - `name`: Cannot be empty.
* **Request Body**:
```json
{
  "name": "Arjun Patel",
  "email": "arjun.patel@gmail.com",
  "password": "SecurePassword123!"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": "603d7c4a1234567890abcdef",
    "name": "Arjun Patel",
    "email": "arjun.patel@gmail.com",
    "role": "patient"
  }
}
```

### 1.2 Unified User Login (Patient, Doctor, Admin)
* **Endpoint**: `POST /auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "doctor.shah@hospital.com",
  "password": "DoctorSecurePass!"
}
```
* **Headers Set on Success**:
  - `Set-Cookie: accessToken=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=900`
  - `Set-Cookie: refreshToken=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "603d7c4a1234567890abc111",
      "name": "Dr. Devendra Shah",
      "email": "doctor.shah@hospital.com",
      "role": "doctor"
    }
  }
}
```

### 1.3 Refresh Authentication Session
* **Endpoint**: `POST /auth/refresh`
* **Access**: Public (Requires valid `refreshToken` HttpOnly cookie)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Session token rotated successfully."
}
```

---

## 2. AI Multilingual Diagnosis Services (`/api/v1/ai`)

### 2.1 Analyze Symptoms (Speech or Text)
* **Endpoint**: `POST /ai/detect`
* **Access**: Private (Patient Role)
* **Request Body**:
  - `inputText`: String (Could be text written or transcribed transcript from Speech API).
  - `lang`: String enum (`"en"`, `"gu"`, `"hi"`).
* **Execution Flow**:
  1. Input text is sent to the **Groq NLP API** to extract English symptoms.
  2. Extracted list sent to the **Python ML service** (Random Forest model) for disease key classification.
  3. Loaded corresponding language JSON matching the canonical internal key.
  4. Specialized doctors returned.
* **Request Body**:
```json
{
  "inputText": "મને કાલે રાતથી બહુ તાવ આવે છે અને શરીરમાં કમજોરી લાગે છે",
  "lang": "gu"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "extractedSymptoms": ["fever", "weakness"],
    "internalKey": "Typhoid",
    "prediction": {
      "diseaseName": "ટાઈફોઈડ",
      "description": "ટાઈફોઈડ એ બેક્ટેરિયલ ચેપ છે જે દૂષિત ખોરાક કે પાણીથી ફેલાય છે.",
      "precautions": [
        "ઉકાળેલું પાણી પીવો",
        "પૂરતો આરામ કરો",
        "હળવો ખોરાક લો"
      ]
    },
    "recommendedSpecialization": "General Physician",
    "recommendedDoctors": [
      {
        "id": "603d7c4a1234567890abc999",
        "name": "Dr. Devendra Shah",
        "hospital": "Apex Hospital",
        "city": "Ahmedabad",
        "consultationDuration": 15,
        "timings": {
          "morningShift": { "startTime": "09:00", "endTime": "13:00" },
          "lunchBreak": { "startTime": "13:00", "endTime": "15:00" },
          "eveningShift": { "startTime": "15:00", "endTime": "18:00" }
        }
      }
    ]
  }
}
```

---

## 3. Dynamic Queue-based Appointments (`/api/v1/appointments`)

This system uses a dynamic scheduling queue instead of fixed slot picking.

### 3.1 Request Booking
* **Endpoint**: `POST /appointments/book`
* **Access**: Private (Patient Role)
* **Request Body**:
```json
{
  "doctorId": "603d7c4a1234567890abc999",
  "appointmentDate": "2026-06-15",
  "disease": "Typhoid"
}
```
* **Response (210 Queue Checked & Created)**:
  - Calculates estimated wait times based on default durations and pending patients.
  - Automatically rejects with a `400 Bad Request` if queue extends past the doctor's shift limit.
```json
{
  "success": true,
  "message": "Appointment created. Queue details assigned.",
  "data": {
    "appointmentId": "603d7c4a1234567890abcd22",
    "queueNumber": 6,
    "estimatedWaitTime": 90, 
    "status": "pending"
  }
}
```

### 3.2 List Active Sessions (Patient / Doctor specific)
* **Endpoint**: `GET /appointments/my-appointments`
* **Access**: Private (Filtered contextually by token role)
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": "603d7c4a1234567890abcd22",
      "doctorName": "Dr. Devendra Shah",
      "patientName": "Arjun Patel",
      "disease": "Typhoid",
      "queueNumber": 6,
      "estimatedWaitTime": 90,
      "status": "pending",
      "appointmentDate": "2026-06-15T00:00:00.000Z"
    }
  ]
}
```

### 3.3 Update Consultation Status
* **Endpoint**: `PATCH /appointments/:id/status`
* **Access**: Private (Doctor / Patient Role)
* **Request Body**:
  - `status`: String enum (`"approved"`, `"in-progress"`, `"completed"`, `"cancelled"`).
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Status updated successfully.",
  "data": {
    "appointmentId": "603d7c4a1234567890abcd22",
    "status": "approved"
  }
}
```

### 3.4 Change Consultation Duration (Live Queue Rescheduler)
* **Endpoint**: `PATCH /appointments/:id/duration`
* **Access**: Private (Doctor Role)
* **Request Body**:
```json
{
  "newDuration": 25 // new estimate in minutes
}
```
* **Socket.IO Event Triggered**: Emits `queue_update` to recalculate wait time positions of downstream clients.
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Consultation duration altered. Queue recalculations propagated."
}
```

### 3.5 Complete Consultation (Prescription Release)
* **Endpoint**: `POST /appointments/:id/complete`
* **Access**: Private (Doctor Role)
* **Request Body**:
```json
{
  "medicines": [
    { "name": "Paracetamol 650mg", "dosage": "1-0-1 after meals", "duration": "5 days" }
  ],
  "notes": "Drink warm fluids and get adequate bed rest."
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Prescription attached. Appointment marked completed."
}
```

---

## 4. Administration Controls (`/api/v1/admin`)

Requires Admin Role JWT credentials. No public signups permitted.

### 4.1 Create Doctor Profile
* **Endpoint**: `POST /admin/doctors`
* **Request Body**:
```json
{
  "name": "Dr. Kavita Desai",
  "email": "kavita.desai@clinic.com",
  "password": "SecureDoctorPass123!",
  "specialization": "Neurologist",
  "city": "Surat",
  "hospital": "Desai Neuro Center",
  "consultationDuration": 20,
  "availability": ["Monday", "Wednesday", "Friday"],
  "timings": {
    "morningShift": { "startTime": "10:00", "endTime": "13:00" },
    "lunchBreak": { "startTime": "13:00", "endTime": "14:30" },
    "eveningShift": { "startTime": "14:30", "endTime": "19:00" }
  }
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Doctor profile and credentials generated successfully."
}
```

### 4.2 Delete/Update Doctor Profile
* **Endpoints**: `PUT /admin/doctors/:id` | `DELETE /admin/doctors/:id`
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Doctor record modified successfully."
}
```

### 4.3 Monitor Active Queues
* **Endpoint**: `GET /admin/queues`
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "doctorId": "603d7c4a1234567890abc999",
      "doctorName": "Dr. Devendra Shah",
      "activePatientsInQueue": 5,
      "currentAverageWaitTime": 75
    }
  ]
}
```

---

## 5. Realtime Socket.IO Event Specification

Clients connect using their authenticated user session token namespace.

| Event Channel | Direction | Payload Schema | Action / Trigger |
| :--- | :--- | :--- | :--- |
| `join_room` | Client -> Server | `{ doctorId: "string" }` | Enters a doctor's active daily scheduler queue update channel. |
| `queue_update` | Server -> Client | `{ doctorId: "string", updatedWaitTimes: [{ appointmentId: "string", estimatedWaitTime: 45 }] }` | Broadcast when a consultation completes or status updates, syncs local wait estimations. |
| `duration_change` | Server -> Client | `{ doctorId: "string", targetAppointmentId: "string", newWaitTime: 30 }` | Broadcast when a doctor edits the active duration of the current patient checkup. |
| `appointment_cancelled` | Server -> Client | `{ appointmentId: "string", message: "string" }` | Emitted to update active status changes immediately. |
