AI-Powered Multilingual Disease Detection and Smart Hospital Queue Management System
FINAL MASTER DOCUMENTATION
PRD • SRS • Workflow • Architecture • Backend Logic • AI/NLP Flow • Queue System • Multilingual System
1. Project Introduction
This project is an AI-powered healthcare web platform that predicts diseases using machine learning, extracts symptoms using NLP APIs, and manages intelligent hospital appointment queues in realtime.

The system contains:
• Patient Application
• Doctor Application
• Admin Application
• Central Backend API
• Python ML Service
• MongoDB Atlas Database
• Realtime Queue Engine
• Multilingual Support System

The main goal of the project is to provide intelligent disease guidance, doctor recommendation, and realistic hospital appointment management.
2. Main Features
• AI disease prediction
• NLP symptom extraction
• Multilingual system
• Speech-to-text support
• Doctor recommendation system
• Dynamic queue management
• Realtime waiting updates
• Appointment booking
• Doctor dashboard
• Admin dashboard
• JWT authentication
• Role-based authorization
• Appointment history
• Queue tracking
• Consultation notes
• Email notifications
• Responsive UI
3. Complete Technology Stack
Frontend:
• React.js
• Tailwind CSS
• React Router
• Axios
• React Hook Form
• i18next
• react-i18next

Backend:
• Node.js
• Express.js
• JWT
• bcrypt
• Socket.IO
• express-validator
• Helmet.js
• Rate Limiting

Database:
• MongoDB Atlas
• Mongoose

AI/ML:
• Python
• FastAPI
• Scikit-learn
• Pandas
• NumPy
• Random Forest

NLP:
• Groq API

Speech:
• Browser Speech Recognition API

Email:
• Nodemailer
4. High Level System Architecture
Patient Frontend (React)
Doctor Frontend (React)
Admin Frontend (React)

↓

Single Backend API (Node.js + Express)

↓

--------------------------------
MongoDB Atlas
Python ML Service
Groq API
Socket.IO
--------------------------------

This architecture uses:
• 3 separate frontend applications
• 1 centralized backend API
• 1 separate Python ML service
5. User Roles
Patient:
• Signup/Login
• AI prediction
• Book appointments
• Queue tracking
• Appointment history
• Disease history

Doctor:
• Login only
• View appointments
• Start consultation
• Update consultation duration
• Complete appointments
• Queue management

Admin:
• Login only
• Add doctors
• Edit doctors
• Remove doctors
• Analytics
• Monitor queues
6. AI + NLP Workflow
STEP 1:
Patient enters symptoms using text or speech.

Examples:
• English
• Hindi
• Gujarati

STEP 2:
Speech Recognition API converts speech to text.

STEP 3:
Groq API processes the sentence using NLP.

Example Input:
"મને તાવ અને કમજોરી લાગે છે"

Groq Output:
["fever","weakness"]

STEP 4:
English symptoms sent to Python ML model.

STEP 5:
Random Forest model predicts disease.

Example:
Typhoid

STEP 6:
Backend loads disease JSON file.

STEP 7:
Backend fetches:
• disease description
• precautions

STEP 8:
Backend maps disease to doctor specialization.

STEP 9:
MongoDB fetches matching doctors.

STEP 10:
Frontend displays prediction and doctor recommendations.
7. Machine Learning Architecture
The ML model is trained ONLY using English symptom datasets.

The ML model does NOT directly understand:
• Gujarati
• Hindi

Instead:
Groq API converts multilingual symptoms into standardized English symptoms before prediction.

Training Dataset:
Symptoms → Disease

Model:
Random Forest Classifier

Prediction Flow:
Symptoms → Vectorization → Model Prediction → Disease
8. Disease JSON Architecture
The system uses multilingual disease JSON files.

Example Files:
• disease_en.json
• disease_gu.json
• disease_hi.json

IMPORTANT:
All JSON files use SAME English disease key.

Example:

"Typhoid": {
   "name":"ટાઈફોઈડ"
}

The ML model predicts:
Typhoid

Backend uses:
Typhoid

as internal key for:
• JSON matching
• database logic
• backend processing

Only displayed values are translated.
9. Multilingual System Workflow
The system supports:
• English
• Gujarati
• Hindi

Frontend multilingual support:
• i18next
• react-i18next

The frontend translates:
• buttons
• forms
• labels
• navbar
• dashboard text

Disease outputs are translated using multilingual JSON files.

Workflow:
User selects language
↓
Frontend stores selected language
↓
Backend loads matching JSON file
↓
Frontend displays translated disease data
10. Doctor Recommendation System
The backend contains specialization mapping.

Example:
Typhoid → General Physician
Migraine → Neurologist

Workflow:
1. ML predicts disease
2. Backend finds specialization
3. MongoDB fetches doctors using:
   • specialization
   • city
   • availability

If no matching doctor found:
Frontend shows:
"No doctor available currently"
11. Dynamic Queue Management System
The project uses intelligent queue-based appointment booking instead of manual slots.

Patient only selects:
• Doctor
• Date

Backend automatically calculates:
• pending patients
• consultation duration
• lunch break timing
• estimated waiting time

Formula:
Estimated Wait Time = Remaining Patients × Consultation Time

The queue updates dynamically in realtime.
12. Consultation Duration Update System
Doctor can dynamically update current patient consultation time.

Example:
Current consultation:
20 mins → updated to 30 mins

After update:
• Queue recalculates
• Waiting time updates
• All patient dashboards update instantly

Realtime updates implemented using Socket.IO.
13. Doctor Timing Logic
Doctor timings contain:
• Morning Shift
• Lunch Break
• Evening Shift

Example:
Morning:
9 AM → 1 PM

Lunch:
1 PM → 3 PM

Evening:
3 PM → 6 PM

If estimated queue exceeds doctor end time:
System automatically rejects booking and suggests next day booking.
14. Appointment Status Flow
Appointment statuses:
• pending
• approved
• in-progress
• completed
• cancelled

Doctor Workflow:
1. Accept appointment
2. Start consultation
3. Update duration
4. Complete appointment

Patient Workflow:
1. Book appointment
2. Track queue
3. Receive updates
4. Cancel appointment
15. Authentication & Security
Authentication:
• JWT Authentication
• Role-Based Access Control
• bcrypt Password Hashing

Security:
• Helmet.js
• Rate Limiting
• Protected Routes
• Input Validation
• Environment Variables
• Secure Password Rules

Patient:
• Signup/Login

Doctor:
• Login only
• Credentials created by admin

Admin:
• Fixed credentials
• No public signup
16. Database Collections
Users Collection:
• name
• email
• password
• role
• appointment history

Doctors Collection:
• specialization
• city
• hospital
• timings
• consultation duration
• availability

Appointments Collection:
• patientId
• doctorId
• disease
• queue number
• estimated time
• status

Admin Collection:
• email
• password
17. Realtime Features
Implemented using Socket.IO.

Realtime Features:
• Queue updates
• Waiting time updates
• Consultation duration updates
• Appointment cancellation
• Appointment approval
• Dashboard synchronization
18. Validation Rules
Patient Validation:
• Strong password
• Valid email
• No duplicate account
• No past date booking

Doctor Validation:
• Unique email
• Valid timings
• Positive consultation fees

Appointment Validation:
• Queue availability
• Timing validation
• Shift limit checking
• Auto rejection if queue full
19. Dashboard Features
Patient Dashboard:
• AI prediction
• Doctor recommendation
• Queue tracking
• Appointment history
• Disease history

Doctor Dashboard:
• Today's appointments
• Active consultation
• Queue management
• Consultation updates
• Appointment completion
• History

Admin Dashboard:
• Add doctor
• Remove doctor
• Edit doctor
• Analytics
• Queue monitoring
20. Complete Backend Workflow
1. Frontend sends patient input
2. Backend sends text to Groq API
3. Groq extracts English symptoms
4. Backend sends symptoms to Python ML API
5. ML predicts disease
6. Backend loads disease JSON
7. Backend loads selected language data
8. Backend maps specialization
9. Backend fetches matching doctors
10. Backend calculates queue timing
11. Backend returns final response
12. Frontend displays translated result
21. Why This Project Is Strong
This project demonstrates:
• Full Stack Development
• Machine Learning
• NLP
• Realtime Systems
• Queue Algorithms
• Authentication & Security
• API Design
• System Architecture
• Multilingual Systems
• Database Design

The project is much stronger than standard CRUD projects.
22. Conclusion
This project is a professional AI-powered healthcare management platform.

The system combines:
• AI/ML
• NLP
• Realtime Queue Management
• Secure Authentication
• Full Stack Development
• Healthcare Workflow Automation

The project is suitable for:
• Final Year Major Project
• Campus Placement
• Resume Showcase
• Professional Portfolio
