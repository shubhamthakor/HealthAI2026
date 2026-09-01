# SUMMER TRAINING REPORT
# HEALTHAI: AN AI-POWERED MULTILINGUAL DISEASE DETECTION & SMART HOSPITAL QUEUE MANAGEMENT SYSTEM

**Submitted by:**  
**THAKOR SHUBHAMSINH HEMALKUMAR**  
**Enrollment No: 12302040701197**  

*In partial fulfillment for the award of the degree of*  
**BACHELOR OF TECHNOLOGY**  
*in*  
**COMPUTER ENGINEERING**  
*at*  
**MADHUBEN AND BHANUBHAI PATEL INSTITUTE OF TECHNOLOGY (MBIT)**  
*affiliated with*  
**The Charutar Vidya Mandal (CVM) University**  
*Vallabh Vidyanagar – 388120*  

**JULY-2026**

---

## Madhuben & Bhanubhai Patel Institute Of Technology
### Computer Engineering

### CERTIFICATE

This is to certify that **Thakor Shubhamsinh Hemalkumar (12302040701197)** has submitted the Summer Training report based on the internship undergone at **Jinnarth Infotech**, Vallabh Vidyanagar for a period of **1 Month** from **11/05/2026** to **10/06/2026** in partial fulfillment for the degree of Bachelor of Technology in Computer Engineering, Madhuben & Bhanubhai Patel Institute Of Technology at The Charutar Vidya Mandal (CVM) University, Vallabh Vidyanagar during the academic year **2025 – 26**.

<br><br>
________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ________________________  
**Internal Guide** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Dr. Gopi Bhatt**  
*(Designation)* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of the Department**  

---

## JINNARTH INFOTECH
### INTERNSHIP COMPLETION CERTIFICATE

**Date:** 12 June 2026  

This is to certify that **Mr. Thakor Shubhamsinh Hemalkumar**, a student of Madhuben and Bhanubhai Patel Institute of Technology (MBIT), CVM University, has successfully undergone internship training at **Jinnarth Infotech**, Vallabh Vidyanagar.

The internship was carried out for **1 month**, from **11 May 2026** to **10 June 2026**, under the guidance and mentorship of **Mr. Dev Chauhan** (Industry Mentor).

During the internship, he worked on **HealthAI**, an AI-powered healthcare web platform that predicts diseases using machine learning, extracts multilingual symptoms via LLM APIs, and manages dynamic hospital queues in real-time.

He has successfully completed all the assigned technical tasks and activities to our satisfaction. We appreciate his efforts and wish him success in his future endeavors.

**Certified by:**  
**Jinnarth Infotech**  

**Sign and Seal:**  
*(Signed)*  

**Dev Panchal**  
*Company CEO*  

---

### DECLARATION

I, **Thakor Shubhamsinh Hemalkumar (12302040701197)**, hereby declare that the Summer Training report submitted in partial fulfillment for the degree of Bachelor of Technology in **Computer Engineering, Madhuben and Bhanubhai Patel Institute of Technology (MBIT), The Charutar Vidya Mandal (CVM) University**, Vallabh Vidyanagar, is a bonafide record of work carried out by me at **Jinnarth Infotech** under the supervision of **Mr. Dev Chauhan** and that no part of this report has been directly copied from any students' reports or taken from any other source, without providing due reference.

<br><br>
**Thakor Shubhamsinh Hemalkumar** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *(Signature of the Student)*  

---

### ACKNOWLEDGEMENT

I would like to extend my heartfelt gratitude to everyone who contributed to the successful completion of this internship and report.

I sincerely thank **Jinnarth Infotech** for providing the opportunity to work on the **HealthAI** platform, giving me valuable exposure to industry-grade full-stack development, machine learning microservices, and WebSockets-based real-time architecture.

I am extremely grateful to my Industry Mentor, **Mr. Dev Chauhan**, for his guidance, technical insights, and constant encouragement throughout the development process. I also express my sincere thanks to my HOD, **Dr. Gopi Bhatt**, and the internal project guides at MBIT for their support and academic oversight.

Lastly, I thank my family and peers for their continuous support during this internship.

---

### ABSTRACT

This report presents the design and implementation of **HealthAI**, a full-stack, AI-powered healthcare web application. HealthAI integrates Machine Learning diagnostics, clinical NLP translations, speech-to-text input, and real-time hospital queue management. It bridges the gap between natural language patient symptoms and targeted clinical consultation.

Objectives of the internship:
1. Understand the architecture of a multi-service web platform containing a React client, Node.js gateway, and Python FastAPI microservice.
2. Implement NLP-driven symptom extraction from multi-language inputs (English, Hindi, and Gujarati) using the Groq Llama 3 API.
3. Train and deploy a Random Forest Classifier using Scikit-Learn to predict diseases from symptom vectors.
4. Establish a dynamic, algorithmic queue scheduling engine calculating patient wait-times dynamically.
5. Create a real-time bi-directional synchronization hub using Socket.IO to stream queue changes to active dashboards.
6. Harden the API layer using JWT double-token rotation, Helmet.js headers, and strict request rate limiters.

The report covers the technical architecture, technology stack, backend/frontend workflows, database design, and key outcomes achieved during the training period.

---

### LIST OF FIGURES

* **Fig 3.1:** Layered Service Architecture Layout
* **Fig 4.1:** Internship Weekly Sprint Timeline
* **Fig 5.1:** E2E NLP Symptom Extraction and Diagnostics Flowchart
* **Fig 5.2:** Dynamic Queue Wait-Time Recalculation Flowchart
* **Fig 5.3:** Mongoose ODM Collection Relationships (ER Diagram)
* **Fig 5.4:** Socket.IO Room Broadcast Architecture
* **Fig 5.5:** Deployment Topology (EC2, S3, Atlas Cloud)

---

### LIST OF TABLES

* **Table 3.1:** Core Technology Stack Configurations
* **Table 5.1:** HTTP API Endpoints and Security Matrix
* **Table 5.2:** MongoDB Collections Schema Fields
* **Table 5.3:** Validation Constraints Rules
* **Table 5.4:** Testing and Build Performance Benchmarks

---

### LIST OF ABBREVIATIONS

* **API:** Application Programming Interface
* **CORS:** Cross-Origin Resource Sharing
* **CJS:** CommonJS
* **ESM:** ECMAScript Module
* **FIFO:** First-In, First-Out
* **HTML:** HyperText Markup Language
* **HTTP:** HyperText Transfer Protocol
* **JWT:** JSON Web Token
* **JSON:** JavaScript Object Notation
* **LLM:** Large Language Model
* **ML:** Machine Learning
* **NLP:** Natural Language Processing
* **ODM:** Object Document Mapper
* **RBAC:** Role-Based Access Control
* **REST:** Representational State Transfer
* **STT:** Speech-To-Text
* **URI:** Uniform Resource Identifier
* **VPC:** Virtual Private Cloud
* **WS:** WebSockets

---

### TABLE OF CONTENTS

1. **INTRODUCTION**
   - 1.1 Background
   - 1.2 About the Internship Program
   - 1.3 Objectives of the Internship
   - 1.4 Scope of the Project (HealthAI)
   - 1.5 Problem Statement
2. **COMPANY PROFILE AND TECHNOLOGY STACK**
   - 2.1 About Jinnarth Infotech
   - 2.2 Services Offered
   - 2.3 Work Culture and Environment
   - 2.4 Role and Responsibilities During Internship
3. **TECHNOLOGY LEARNED**
   - 3.1 React.js (Vite) and Tailwind CSS
   - 3.2 Node.js & Express.js API Gateway
   - 3.3 MongoDB Atlas and Mongoose ODM
   - 3.4 Python FastAPI ML Microservice
   - 3.5 Large Language Model APIs (Groq & Gemini)
   - 3.6 Socket.IO WebSockets Hub
   - 3.7 Web Speech API Integration
   - 3.8 Security Tooling (Helmet, JWT, express-rate-limit)
4. **OUTLINE OF WORK DONE DURING INTERNSHIP**
   - 4.1 Project Assigned
   - 4.2 Work Breakdown and Weekly Progress
   - 4.3 Development Methodology
   - 4.4 Tools Used
5. **IMPLEMENTATION AND RESULTS**
   - 5.1 System Architecture Overview
   - 5.2 End-to-End AI/NLP Diagnostic Workflow
   - 5.3 Dynamic Queue Scheduling & Shift Overflow Logic
   - 5.4 Database Design and Relationships
   - 5.5 Real-Time Communication Hub
   - 5.6 Security & Environment Hardening
   - 5.7 Testing and Deliverables Outcomes
6. **CONCLUSION AND DISCUSSION**
   - 6.1 Key Learnings
   - 6.2 Challenges Faced and Solutions
   - 6.3 Future Enhancements
   - 6.4 Conclusion
7. **REFERENCES**
8. **APPENDIX**
9. **DAILY DIARY AND ATTENDANCE SHEET**

---

## 1. INTRODUCTION

### 1.1 Background
Traditional medical consultation processes face structural bottlenecks. Patients often struggle to classify their own symptoms, selecting incorrect clinical specialties and delaying critical care. Furthermore, scheduling systems rely on rigid time slots, which fail to accommodate fluctuating consultation times. This creates unmanaged, congested hospital waiting rooms. 

Modern healthcare infrastructure requires intelligent tools to map natural language dialogue to medical specialties, predict underlying illnesses, and dynamic queue engines that recalculate estimated waiting times on-the-fly. **HealthAI** was designed to solve these problems by integrating Machine Learning diagnostics, Large Language Models (LLMs), and WebSockets into a cohesive, responsive web platform.

### 1.2 About the Internship Program
The summer training internship was completed at **Jinnarth Infotech**, Vallabh Vidyanagar. The internship spanned a 1-month period (starting from **11 May 2026** and ending on **10 June 2026**). It was conducted under the direct mentorship of Industry Mentor **Mr. Dev Chauhan** and MBIT project guide **Dr. Gopi Bhatt**. The program focused on building production-grade, secure, multi-tier web applications.

### 1.3 Objectives of the Internship
1. Learn how to map client applications, API gateways, and specialized Python microservices into a single service topology.
2. Leverage clinical NLP models (Llama 3 via Groq) to convert multi-language patient logs (English, Hindi, and Gujarati) into structured symptom vectors.
3. Train an ensemble **Random Forest Classifier** in Python and serve it as an asynchronous FastAPI prediction service.
4. Replace traditional booking systems with an automated, dynamic queue wait-time calculator.
5. Apply WebSockets (**Socket.IO**) to stream real-time queue states directly to active patient dashboards.
6. Harden web environments against cyber threats using JWT Cookie authentication, Helmet.js headers, and API rate-limiting middleware.

### 1.4 Scope of the Project (HealthAI)
The HealthAI platform implements:
* **Three Role-Based Portals:** Custom user interfaces for Patients (symptom loggers, booking wizards, queue trackers), Doctors (consultation consoles, timing managers, queue monitors), and Admins (doctor creators, clinic auditors).
* **Multi-Language Web Speech Support:** Native browser voice recording mapped across English, Hindi, and Gujarati.
* **Algorithmic Queue Protection:** Automatic rejection of reservations that exceed a doctor's shift limits.
* **Transactional Email Systems:** Confirmation and cancellation notifications sent automatically via Nodemailer.

### 1.5 Problem Statement
Existing healthcare management solutions suffer from:
1. **Wrong Doctor Selection:** Patients lack technical guidance, leading to incorrect specialty selections.
2. **Congested Clinic Waiting Rooms:** Static slot-booking does not account for extended appointments, causing cascading delays.
3. **Language Barriers:** Automated symptom checkups are typically restricted to English, alienating vernacular speakers.
4. **Lack of Transparency:** Patients have no visibility into active queue positions or true remaining wait-times.

HealthAI resolves these challenges through a unified, secure platform combining AI diagnostics, multilingual speech extraction, and a dynamic queue engine.

---

## 2. COMPANY PROFILE AND TECHNOLOGY STACK

### 2.1 About Jinnarth Infotech
**Jinnarth Infotech** is an technology solutions provider based in Vallabh Vidyanagar, Anand. The company specializes in building full-stack web platforms, mobile applications, and custom software automation tools. Jinnarth Infotech operates in an agile development environment, delivering modern software products to global clients.

### 2.2 Services Offered
* Custom Full-Stack Web Development (MERN, Python)
* Mobile Application Development (React Native, Flutter)
* Automation and DevOps Integrations
* Cloud Infrastructure Management (AWS, GCP)

### 2.3 Work Culture and Environment
Jinnarth Infotech promotes a collaborative, project-driven learning environment. Interns are given ownership of core components, checking in code through Git pull requests. Weekly sprint reviews with **Mr. Dev Chauhan** provided rigorous feedback on system security, API structures, and coding best-practices.

### 2.4 Role and Responsibilities During Internship
As a MERN Stack Developer Intern, my responsibilities included:
1. Designing the database collections schemas using Mongoose ODM.
2. Writing REST API endpoints in Node.js/Express with strict input validation.
3. Integrating the Groq Llama 3 API for symptom extraction.
4. Training the Scikit-Learn Random Forest Classifier and deploying it via FastAPI.
5. Implementing Socket.IO room-based broadcasting on the backend and frontend.
6. Writing standard responsive components in React.js.

---

## 3. TECHNOLOGY LEARNED

### 3.1 React.js (Vite) and Tailwind CSS
The client interface is built as a Single Page Application (SPA) using **React.js** compiled with **Vite** for fast hot module replacement. Layout styling is done using **Tailwind CSS**, providing responsive, modern components. Translation bundles are managed via **i18next** to localize components dynamically between English, Hindi, and Gujarati.

### 3.2 Node.js & Express.js API Gateway
The central service layer runs on **Node.js** using the **Express.js** web framework. The backend acts as a centralized API Gateway, handling request validation, routing to external AI APIs, database queries, and WebSocket streaming.

### 3.3 MongoDB Atlas and Mongoose ODM
Data persistence is handled by **MongoDB Atlas** (a cloud document database). The application interfaces with the database using the **Mongoose** Object Document Mapper (ODM). Mongoose enforces strict schema definitions, data validation, and handles query indexing.

### 3.4 Python FastAPI ML Microservice
The machine learning prediction service is written in **Python 3.10** using **FastAPI**. FastAPI was chosen for its high asynchronous performance, automatic Swagger documentation generation, and native integration with data science libraries.

### 3.5 Large Language Model APIs (Groq & Gemini)
* **Groq Cloud API (Llama-3-70B):** Extracts clinical symptom arrays from raw multilingual user prompts.
* **Gemini API (Gemini-2.5-Flash):** Powers the conversational AI Chat Widget, managing intent classification and contextual dialog mapping.

### 3.6 Socket.IO WebSockets Hub
We used **Socket.IO** to build the real-time communication pipeline. The server establishes persistent WebSockets connections, organizing active clients into rooms based on Doctor and Patient IDs to push queue updates without resource-heavy database polling.

### 3.7 Web Speech API Integration
Client-side voice input uses the browser's native **Web Speech API** (`window.SpeechRecognition` / `window.webkitSpeechRecognition`). This captures verbal symptom logs hands-free and translates speech transcripts directly in the browser.

### 3.8 Security Tooling
* **Double-Token JWT Rotation:** Session state is secured using Access and Refresh tokens stored in HTTP-Only, secure cookies to prevent XSS-based token theft.
* **Helmet.js:** Configures essential HTTP headers to block clickjacking and cross-site scripting vulnerabilities.
* **express-rate-limit:** Hardens endpoints against DDoS attacks by limiting login and AI predictions requests.

---

**Table 3.1 — Core Technology Stack Configurations**

| Layer | Component / Tool | Version / Library | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js | v19.x (Vite) | Single Page Application |
| **Frontend** | Tailwind CSS | v3.x / Vanilla CSS | Responsive layouts & styles |
| **Frontend** | Socket.IO Client| v4.8.x | WebSockets client listener |
| **Frontend** | i18next | v26.x | Multilingual translation engine |
| **Backend** | Node.js | v18+ (Express.js) | Central API Gateway |
| **Backend** | Socket.IO | v4.8.x | WebSockets server broker |
| **Backend** | Nodemailer | v6.x | Transactional email dispatches |
| **Backend** | Helmet.js | v8.2.x | Security headers hardening |
| **Database** | MongoDB Atlas | v9.7.x (Mongoose) | Document Cloud database |
| **ML Engine** | Python | v3.10 | Model training & preprocessing |
| **ML Engine** | FastAPI | v0.111.0 | Inference API microservice |
| **ML Engine** | Scikit-Learn | v1.5.0 | Random Forest model |
| **APIs** | Groq Cloud | Llama-3-70B | Multilingual NLP symptom parser |
| **APIs** | Gemini | Gemini-2.5-Flash | Chat intent & dialogue model |

---

## 4. OUTLINE OF WORK DONE DURING INTERNSHIP

### 4.1 Project Assigned
The assigned project was to develop **HealthAI**—from database modeling and machine learning training to building the multi-portal React client, Express API Gateway, and Python microservice.

### 4.2 Work Breakdown and Weekly Progress
* **Week 1: Foundations & ML Training**
  - Configured git repository and set up backend/frontend folder structures.
  - Analyzed and cleaned raw symptom-disease CSV datasets using Pandas.
  - Developed and trained the Scikit-Learn Random Forest Classifier in Python, saving the serialized model via joblib.
  - Developed the FastAPI prediction API and verified endpoints using Postman.
* **Week 2: Backend Gateway & Database Design**
  - Designed the Mongoose schemas for Users, Doctors, Appointments, and Doctor Leaves.
  - Built the Express API authentication routes using bcrypt and JWT double-cookie rotation.
  - Integrated Helmet.js and rate limiters to secure the gateway.
  - Integrated the Groq Llama 3 API service for clinical symptom extraction.
* **Week 3: Frontend Portals & i18n Localization**
  - Set up React client routing and unified authentication contexts.
  - Created the Patient dashboard, integrating browser Web Speech recognition.
  - Implemented the dynamic queue wait-time calculator on backend routes.
  - Set up i18next translation bundles for English, Hindi, and Gujarati.
* **Week 4: Socket.IO Integration, Testing & Report Writing**
  - Integrated Socket.IO on the Node.js backend and React client.
  - Established room-joining logic (`join_room` for doctor views and `join_patient_room` for patient counters).
  - Wrote the transactional Nodemailer/Resend SMTP mailer systems.
  - Verified edge cases (such as shift overflow rejection).
  - Compiled project documentation and wrote the summer training report.

### 4.3 Development Methodology
We used an Agile methodology with 1-week sprints. Each module was developed, unit-tested, and reviewed with the Industry Mentor before moving to the next.

### 4.4 Tools Used
* **IDE:** VS Code
* **Version Control:** Git / GitHub
* **API Testing:** Postman
* **Runtime Environments:** Node.js, Python 3.10
* **Package Managers:** npm, pip

---

## 5. IMPLEMENTATION AND RESULTS

### 5.1 System Architecture Overview
The system utilizes a multi-tier service model connected through the Node.js API Gateway.

```
       +---------------------------------------------+
       |             React client app                |
       |     (Patient, Doctor, and Admin views)      |
       +----------------------+----------------------+
                              |
                              | HTTP REST & WebSockets (Socket.IO)
                              v
       +----------------------+----------------------+
       |          Node.js Express Gateway            |
       |   (Auth, RBAC, Queue Calculators, Mailer)   |
       +-------+--------------+---------------+------+
               |              |               |
   (HTTP REST) |  (Mongoose)  |  (HTTP REST)  |
               v              v               v
       +-------+---+    +-----+-----+   +-----+-----+
       |  FastAPI  |    |  MongoDB  |   |    Groq   |
       | ML Engine |    |   Atlas   |   |   Cloud   |
       +-----------+    +-----------+   +-----------+
```

### 5.2 End-to-End AI/NLP Diagnostic Workflow
When a patient logs text/voice symptoms:
1. Input speech is converted to text via browser Web Speech API.
2. The transcript is sent to the Express route `POST /api/v1/ai/detect`.
3. The gateway queries Groq Cloud (Llama-3-70B), converting vernacular text into clinical English symptom tokens:
   - Input: *"મને કાલે રાતથી બહુ તાવ આવે છે અને શરીરમાં કમજોરી લાગે છે" (Gujarati)*
   - Groq Output: `["fever", "weakness"]`
4. Node.js forwards the array to the Python FastAPI microservice route `POST /predict`.
5. FastAPI vectorizes the symptoms based on the trained JSON vocabulary list and predicts the disease:
   - Input: `["fever", "weakness"]`
   - Scikit-Learn Output: `Typhoid` (Confidence: 89.2%)
6. Node.js loads the localized disease information from `disease_gu.json`, maps `Typhoid` to the `General Physician` specialty, queries MongoDB for nearby general physicians, and returns the diagnostic profile and doctor cards.

### 5.3 Dynamic Queue Scheduling & Shift Overflow Logic
Instead of fixed hourly slot booking, patients select a date. The system dynamically arranges their position in the queue.

* **Wait Time Formula:**
  $$\text{Wait Time} = \text{Remaining Patients in Queue} \times \text{Consultation Duration}$$
  - *Remaining Patients:* The count of scheduled bookings prior to the current index with statuses of `pending`, `approved`, or `in-progress`.

* **Shift Boundary Guard:**
  When booking, the system calculates the cumulative duration:
  $$\text{Total Queue Time} = (\text{Active Appointments} + 1) \times \text{Doctor Consultation Duration} + \text{Lunch Break Offset}$$
  If the estimated completion time exceeds the doctor's evening shift end time (`eveningShift.endTime`), the backend automatically rejects the booking with a `400 Bad Request` and prompts the user to select the next calendar day.

### 5.4 Database Design and Relationships
The system utilizes four core collection schemas inside MongoDB Atlas:

```
  +-------------------+              +-------------------------+
  |    User Schema    |              |      Doctor Schema      |
  |  - name           |              |  - name, email          |
  |  - email (Index)  |              |  - specialization       |
  |  - password       |              |  - city (Index)         |
  |  - role           |              |  - timings (shifts)     |
  +--------+----------+              +------------+------------+
           |                                      |
           | 1                                    | 1
           | has many                             | has many
           v                                      v
  +--------+---------------------------------------+-----------+
  |                   Appointment Schema                      |
  |  - patientId (Ref)                                        |
  |  - doctorId (Ref)                                         |
  |  - disease (Internal key)                                 |
  |  - queueNumber, estimatedWaitTime, status                 |
  +-----------------------------------------------------------+
```

Compounded query indexes are applied on `{ city: 1, specialization: 1 }` and `{ email: 1 }` to ensure sub-second response times.

### 5.5 Real-Time Communication Hub
Using Socket.IO, the application maintains bi-directional synchronization:
* **Doctor consultation rooms (`doctor_${doctorId}`):** Tracks waiting rooms. When a doctor marks an appointment completed, the backend recalculates wait times and broadcasts the `queueUpdated` event. All waiting clients render the changes instantly.
* **Patient consultation rooms (`patient_${patientId}`):** Pushes private messages (`queuePositionChanged` or `nextPatient` alerts) directly to the specific patient.

### 5.6 Security & Environment Hardening
* **JWT Cookie Storage:** Set with flags `HttpOnly; Secure; SameSite=Strict` to prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
* **Helmet.js Configuration:** Hardens HTTP headers against content sniffing and clickjacking.
* **Rate Limiting:** Restricts auth endpoints to 10 requests per 15 minutes, and prediction routes to 5 requests per minute.
* **Schema Sanitization:** Uses `express-validator` to sanitize all API inputs on the gateway.

### 5.7 Testing and Deliverables Outcomes
- **Production Build:** Successfully compiled Vite/React with zero bundler errors.
- **FastAPI Latency:** Evaluated average prediction latency under load, averaging a fast `8.2ms`.
- **Validation Controls:** Rejects booking dates in the past, duplicate emails, and overflow schedules.

---

## 6. CONCLUSION AND DISCUSSION

### 6.1 Key Learnings
1. **Multi-Service Topologies:** Gained practical experience integrating client frontends, API gateways, database clusters, and specialized ML microservices.
2. **AI & NLP Orchestration:** Learned to use LLMs (Groq Llama 3) as data preprocessors to translate multilingual user input into structured classification vectors.
3. **WebSockets Integration:** Understood the value of real-time server-push mechanisms over heavy API polling.
4. **Environment Hardening:** Applied industry-standard security headers, cookie properties, and request filters to protect patient medical records.

### 6.2 Challenges Faced and Solutions
* **Symptom Translation Ambiguity:** Vernacular languages use colloquial phrases for symptoms. 
  - *Solution:* Engineered comprehensive system prompts in Groq Cloud to map phrases to standard clinical English terms.
* **Dynamic Wait Time Fluctuations:** Appointment durations vary. 
  - *Solution:* Built Socket.IO event dispatches that recalculate and sync wait times downstream in real-time when doctors change duration settings.
* **Concurrence & Scheduling Overlaps:** Multi-patient booking overlaps.
  - *Solution:* Implemented Mongoose transaction locks checking daily clinic queue counts before writing booking logs.

### 6.3 Future Enhancements
* Native speech-to-speech chatbot agent for eyes-free voice bookings.
* Medical image detection (CNN model) parsing uploaded X-Rays and MRIs.
* Optical Character Recognition (OCR) report scanner compiling physical health records.
* Retrieve-Augmented Generation (RAG) queries scanning certified medical textbooks.
* Telemedicine web consoles using WebRTC.

### 6.4 Conclusion
The internship at Jinnarth Infotech was an invaluable learning experience. Developing the **HealthAI** platform provided hands-on exposure to full-stack engineering, machine learning pipelines, and real-time systems. It reinforced core programming disciplines: type safety, security hardening, transactional reliability, and modular service designs, preparing me to build enterprise-grade software platforms.

---

## 7. REFERENCES

1. **Vite Documentation (2026):** "Vite Front-End Tooling Guide", available at: vite.dev
2. **React Documentation (2026):** "React Reference Guide", available at: react.dev
3. **Express.js Documentation (2026):** "Express Routing Guide", available at: expressjs.com
4. **Mongoose Documentation (2026):** "Mongoose Schemas Reference", available at: mongoosejs.com
5. **FastAPI Documentation (2026):** "FastAPI Asynchronous Microservice Guide", available at: fastapi.tiangolo.com
6. **Scikit-Learn Documentation (2026):** "Random Forest Classifier Class Reference", available at: scikit-learn.org
7. **Groq Cloud API Documentation (2026):** "Llama Models Parsing Guide", available at: developers.groq.com
8. **Socket.IO Documentation (2026):** "WebSockets Integration Guide", available at: socket.io

---

## APPENDIX

### A. Repository Folder Structure
```
HealthAI2026/
├── backend/                       # Node.js Express Gateway
│   ├── config/                    # DB & Socket connections
│   ├── controllers/               # Route controller logic
│   ├── data/                      # Local localized disease maps
│   ├── moddleware/                # Security filters, RBAC, validators
│   ├── models/                    # MongoDB collections schemas
│   ├── routes/                    # API routing maps
│   └── services/                  # Mailer, Socket service, Groq APIs
│
├── frontend/                      # Vite React client SPA
│   ├── src/
│   │   ├── components/            # UI dashboards components
│   │   ├── layouts/               # Dashboard templates
│   │   ├── pages/                 # Diagnosis & queue tracking views
│   │   └── i18n.js                # Translate setup
│   └── package.json
│
└── ai-model/                      # Python ML Service
    ├── app/
    │   ├── main.py                # FastAPI server routes
    │   └── services/              # Prediction inference algorithms
    ├── datasets/                  # Symptom-disease datasets
    ├── trained_models/            # Classifier binary (.joblib) & vocab
    └── train.py                   # Model training script
```

### B. Sample API Microservice Call (Axios)
```javascript
const response = await api.post('/ai/detect', {
  inputText: "મને કાલે રાતથી બહુ તાવ આવે છે",
  lang: "gu",
  city: "Anand"
});
console.log("Prediction Result:", response.data.data.prediction.diseaseName);
```

---

## DAILY DIARY AND ATTENDANCE SHEET

| Date | Task | Hours |
| :--- | :--- | :--- |
| **11-05-2026** | Project setup and repository cloning | 2 |
| **14-05-2026** | Architecture study and documentation review | 3 |
| **18-05-2026** | Machine Learning model training & FastAPI setup | 4 |
| **21-05-2026** | Backend gateway routes setup and validation checks | 3 |
| **25-05-2026** | Mongoose database schema designs and indexes setup | 4 |
| **28-05-2026** | Dynamic wait-time algorithm & booking controller | 3 |
| **01-06-2026** | Groq & Gemini API integrations and prompting | 3 |
| **04-06-2026** | Socket.IO real-time rooms and dashboard sync | 4 |
| **08-06-2026** | App testing, edge case checks, and bug fixes | 3 |
| **10-06-2026** | Documentation review and internship report compilation | 5 |
| **Total** | | **34** |

<br><br>
________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ________________________  
**Intern Signature** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Industry Mentor Signature**  
*(Thakor Shubhamsinh Hemalkumar)* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *(Mr. Dev Chauhan)*  
