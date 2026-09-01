# HealthAI2026 🏥
### AI-Powered Multilingual Disease Detection & Smart Hospital Queue Management System

HealthAI2026 is an enterprise-grade healthcare web platform that combines Machine Learning diagnostics, NLP-driven symptom extraction, multilingual translation support, browser voice detection, and real-time waiting-queue scheduling. 

It is divided into three client portals (**Patient**, **Doctor**, and **Admin**) powered by a centralized Node.js/Express API Gateway and an internal Python FastAPI machine learning microservice.

---

## 🌟 Key Features

* **AI Disease Diagnostics**: Classifies diseases using a custom-trained Scikit-Learn **Random Forest Classifier** with categorical binary symptom vector inputs.
* **Multilingual NLP Extraction**: Uses **Groq Cloud (Llama-3-70B)** to translate and map conversational text or verbal sentences in English, Hindi, and Gujarati to clinical English symptom arrays.
* **Speech-to-Text Integration**: Seamless client-side audio capture using the native browser **Web Speech API** (`window.SpeechRecognition`).
* **Intelligent Queue Scheduling**: Dynamic estimated wait-time calculation:
  $$\text{Wait Time} = \text{Remaining Patients ahead} \times \text{Consultation Duration} + \text{Lunch Break Offsets}$$
* **Real-time Consultation Recalculation**: Doctors can adjust active checking session times on-the-fly, broadcasting updated wait times to waiting patient dashboards instantly via **Socket.IO**.
* **Automatic Shift Rejection**: Rejects bookings if the expected queue start time overflows past the doctor's evening shift limit.
* **Multi-role Dashboards**:
  * **Patient Portal**: Diagnosis predictor, recommendation engine, history tracking, real-time queue tracker, and cancellation manager.
  * **Doctor Panel**: Active consultation rooms, queue progressions, dynamic timer adjustments, and history auditing.
  * **Admin Panel**: Location-based doctor CRUD controls, live system queue monitors, and dispatch logs.
* **Transactional Email system**: Dispatches real-time booking confirmations and cancellation emails using Nodemailer.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontends** | React.js (Vite), CSS/Tailwind CSS, React Router, Axios, i18next & react-i18next |
| **Backend Gateway** | Node.js, Express.js, Socket.IO, JWT, bcrypt, express-validator, Helmet.js, express-rate-limit, Nodemailer |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Machine Learning** | Python 3.10, FastAPI, Uvicorn, Scikit-Learn (Random Forest), Pandas, NumPy |
| **Cloud APIs** | Groq Cloud API (Llama models), Web Speech API |

---

## 📐 System Architecture

```text
                                  +-----------------------+
                                  |      React Client     |
                                  |    (Patient/Doctor/   |
                                  |     Admin Portals)    |
                                  +-----------+-----------+
                                              |
                                              | (HTTP REST & WebSockets via Socket.IO)
                                              v
                                  +-----------+-----------+
                                  | Node.js + Express API |
                                  |       (Gateway)       |
                                  +-----+-----+-----+-----+
                                        |     |     |
                 +----------------------+     |     +----------------------+
                 | (HTTP REST)                | (Mongoose ODM)             | (HTTP REST)
                 v                            v                            v
      +----------+----------+       +---------+---------+       +----------+----------+
      |    Python FastAPI   |       |   MongoDB Atlas   |       |    Groq Cloud API   |
      |   (ML Prediction)   |       |    (Database)     |       | (Symptom Extraction)|
      +---------------------+       +-------------------+       +---------------------+
```

---

## 📁 Repository Structure

```text
HealthAI2026/
├── backend/                       # Node.js Express Backend API Gateway
│   ├── config/                    # DB & Socket connections
│   ├── controllers/               # Business logic controllers
│   ├── data/                      # Local localized disease description maps
│   ├── moddleware/                # Authentication, RBAC, Rate-limiters, & validation
│   ├── models/                    # MongoDB Mongoose collection schemas
│   ├── routes/                    # Route endpoints definitions
│   ├── services/                  # Mailer, Socket emitter, & Groq nlpService
│   ├── server.js                  # Initialization and server spin up
│   └── .env                       # Environment secrets (IGNORED ON GIT)
│
├── frontend/                      # React Frontend Applications
│   ├── src/
│   │   ├── components/            # Shared, Patient, Doctor, & Admin components
│   │   ├── layouts/               # Layout elements (Navbar, sidebars)
│   │   ├── pages/                 # Portal layout layouts
│   │   ├── i18n.js                # i18next multilingual configure
│   │   └── App.jsx                # Router controls
│   └── package.json
│
├── ai-model/                      # Python ML Service
│   ├── app/
│   │   ├── main.py                # FastAPI endpoints
│   │   ├── services/              # Prediction and preprocessor algorithms
│   │   └── utils/                 # Cleaning pipeline
│   ├── datasets/                  # Symptom-disease datasets
│   ├── trained_models/            # Serialized Classifier (.joblib) & Vocabulary (.json)
│   ├── train.py                   # Data cleaning and Random Forest training script
│   └── requirements.txt           # Virtual environment python libraries
│
└── generate_guide.py              # Compilation script for Placement PDF Guide
```

---

## 🚀 Setup & Installation Instructions

Follow these steps to run the complete environment locally:

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)
* **MongoDB Atlas** database account
* **Groq Cloud** account API key

---

### Step 1: Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   CLIENT_URL_PATIENT=http://localhost:5173
   CLIENT_URL_DOCTOR=http://localhost:5173
   CLIENT_URL_ADMIN=http://localhost:5173
   AI_SERVICE_URL=http://localhost:8000
   GROQ_API_KEY=your_groq_cloud_api_key
   RESEND_API_KEY=your_resend_smtp_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on **`http://localhost:5000`***

---

### Step 2: Machine Learning Microservice Setup
1. Navigate to the `ai-model` folder:
   ```bash
   cd ../ai-model
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Train the Random Forest Classifier:
   ```bash
   python train.py
   ```
5. Start the FastAPI microservice:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The FastAPI server runs on **`http://localhost:8000`***

---

### Step 3: Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client app runs on **`http://localhost:5173`***

---

## 🔒 Security Configuration on GitHub

Always ensure your environment configuration files (`.env`) are **NOT** pushed to GitHub repositories. 
This project has configured `.gitignore` rules at both the workspace level and the backend sub-folder level:

```bash
# Untrack .env from Git cache if it was previously pushed
git rm --cached backend/.env
git add .gitignore backend/.gitignore
git commit -m "security: add gitignore rules and untrack secrets"
git push origin main
```
