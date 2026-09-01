import os
import sys
from fpdf import FPDF

class InterviewGuidePDF(FPDF):
    def header(self):
        # We only print the header on pages after the cover page (page 1)
        if self.page_no() > 1:
            self.set_font("helvetica", "I", 8)
            self.set_text_color(100, 110, 120)
            self.cell(90, 8, "HealthAI2026 - Campus Placement Study Guide", 0, 0, "L")
            self.cell(90, 8, f"Page {self.page_no()}", 0, 1, "R")
            # Colored thin header separator
            self.set_draw_color(13, 148, 136) # Teal
            self.set_line_width(0.4)
            self.line(15, 18, 195, 18)
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font("helvetica", "I", 8)
            self.set_text_color(150, 150, 150)
            self.cell(90, 10, "Confidential - Final Year Major Project & Placements", 0, 0, "L")
            self.cell(90, 10, "Prepared by AI Coding Assistant", 0, 1, "R")

    def chapter_title(self, num, title):
        self.set_font("helvetica", "B", 14)
        self.set_text_color(15, 34, 64) # Navy Blue
        self.set_fill_color(240, 244, 248) # Very light blue-grey
        self.cell(0, 10, f"Chapter {num}: {title}", border="L", ln=1, fill=True)
        self.ln(4)

    def section_title(self, title):
        self.set_font("helvetica", "B", 11)
        self.set_text_color(13, 148, 136) # Teal
        self.cell(0, 8, title, ln=1)
        self.ln(2)

    def body_text(self, text, style=""):
        self.set_font("helvetica", style, 9)
        self.set_text_color(31, 41, 55) # Dark Charcoal
        self.multi_cell(0, 5, text)
        self.ln(3)

    def bullet_point(self, text, bold_prefix=""):
        self.set_font("helvetica", "", 9)
        self.set_text_color(31, 41, 55)
        # Indent bullet point
        self.set_x(20)
        if bold_prefix:
            self.set_font("helvetica", "B", 9)
            self.write(5, f"* {bold_prefix}: ")
            self.set_font("helvetica", "", 9)
            self.write(5, text + "\n")
        else:
            self.write(5, f"* {text}\n")
        self.set_x(15) # reset indent
        self.ln(1.5)

    def draw_code_box(self, code_text):
        self.set_font("courier", "", 8)
        self.set_text_color(40, 40, 40)
        self.set_fill_color(245, 247, 250)
        self.set_draw_color(200, 200, 200)
        # Draw multi_cell
        self.multi_cell(0, 4, code_text, border=1, fill=True)
        self.ln(3)

    def draw_qa_box(self, question, answer, follow_up=""):
        # Question part
        self.set_font("helvetica", "B", 9.5)
        self.set_text_color(15, 34, 64) # Navy
        self.set_fill_color(230, 242, 242) # Soft Teal Highlight
        self.set_draw_color(13, 148, 136) # Left border color (Teal)
        self.set_line_width(0.8)
        
        self.cell(0, 7, f"Interviewer Question: {question}", border="L", ln=1, fill=True)
        self.set_line_width(0.2) # reset
        self.ln(1)
        
        # Answer part
        self.set_font("helvetica", "", 9)
        self.set_text_color(31, 41, 55)
        self.multi_cell(0, 4.5, f"Suggested Answer:\n{answer}")
        
        if follow_up:
            self.ln(1)
            self.set_font("helvetica", "I", 8.5)
            self.set_text_color(100, 110, 120)
            self.multi_cell(0, 4, f"Follow-up Tip: {follow_up}")
            
        self.ln(4)

def build_pdf():
    pdf = InterviewGuidePDF()
    pdf.set_margin(15)
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # ------------------ COVER PAGE ------------------
    pdf.add_page()
    # Navy blue header block
    pdf.set_fill_color(15, 34, 64)
    pdf.rect(0, 0, 210, 85, "F")
    
    pdf.set_y(25)
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 12, "HealthAI2026", ln=1, align="C")
    
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(13, 148, 136) # Teal
    pdf.cell(0, 10, "AI-Driven Healthcare Portal & Real-Time Queue Scheduler", ln=1, align="C")
    
    pdf.set_y(95)
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(15, 34, 64)
    pdf.cell(0, 12, "ULTIMATE CAMPUS PLACEMENT STUDY GUIDE", ln=1, align="C")
    
    # Accent line
    pdf.set_draw_color(13, 148, 136)
    pdf.set_line_width(1.5)
    pdf.line(40, 110, 170, 110)
    pdf.set_line_width(0.2)
    
    pdf.set_y(120)
    pdf.set_font("helvetica", "", 10.5)
    pdf.set_text_color(50, 60, 70)
    pdf.multi_cell(0, 5.5, 
        "This guide is curated specifically to help you explain every technical detail of your final year project "
        "to campus placement interviewers. It covers system architecture, database design, the Machine Learning "
        "and Natural Language Processing pipelines, dynamic queue scheduling, real-time Socket.IO synchronization, "
        "multilingual systems, security validations, and a comprehensive set of 25 predicted interviewer questions with answers.\n\n"
        "Study this document thoroughly to answer any architectural, database, ML, or design questions with 100% confidence.",
        align="C"
    )
    
    pdf.set_y(220)
    pdf.set_fill_color(245, 247, 250)
    pdf.rect(15, 215, 180, 50, "F")
    pdf.set_y(220)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(15, 34, 64)
    pdf.cell(0, 6, "PROJECT CORE TECHNOLOGIES:", ln=1, align="C")
    
    pdf.set_font("courier", "B", 9.5)
    pdf.set_text_color(13, 148, 136)
    pdf.cell(0, 6, "React.js | Node.js | Express | Socket.IO | MongoDB", ln=1, align="C")
    pdf.cell(0, 6, "Python FastAPI | Scikit-Learn | Random Forest Classifier", ln=1, align="C")
    pdf.cell(0, 6, "Groq Cloud Llama API | Web Speech API | Nodemailer SMTP", ln=1, align="C")
    
    # ------------------ CHAPTER 1 ------------------
    pdf.add_page()
    pdf.chapter_title("1", "Project Definition & High-Level Architecture")
    
    pdf.body_text(
        "When an interviewer asks, 'Explain your project,' they want to hear a structured explanation "
        "covering: the problem, the solution, the architecture, and the business impact. Below is the standard "
        "elevator pitch followed by the technical specifications."
    )
    
    pdf.section_title("1.1 The Elevator Pitch (How to Introduce the Project)")
    pdf.body_text(
        "HealthAI2026 is an AI-powered healthcare portal combined with an intelligent, real-time consultation "
        "queue and appointment management system. The project resolves two major real-world problems:\n"
        "1. Diagnostics Access Barriers: Patients can verbally state symptoms in their native tongue (English, Hindi, or Gujarati). "
        "The system uses browser-based Speech-to-Text and Groq LLM API to extract clinical entities in English, "
        "passes them to a custom Random Forest classifier to predict the disease, and recommends local specialized doctors.\n"
        "2. Hospital Queue Inefficiencies: Instead of rigid time-slots, it uses a dynamic wait-time estimation engine. Doctors can "
        "adjust consultation durations on-the-fly, broadcasting real-time updates to patients' dashboards via Socket.IO."
    )
    
    pdf.section_title("1.2 High-Level Microservice Topology")
    pdf.body_text(
        "The application is split into separate specialized blocks which communicate over REST APIs and WebSockets. "
        "This separation of concerns allows each system to scale independently:"
    )
    
    pdf.bullet_point("React Client Portals (Frontends): Three role-based portals: Patient, Doctor, and Admin, styled with scoped CSS/Tailwind, supporting i18next multilingual switching.", "Client Layer")
    pdf.bullet_point("Central Node.js/Express API Gateway: Responsible for business logic, appointment bookings, queue scheduling, database CRUD operations via Mongoose, authentication, and emailing.", "Core Backend Layer")
    pdf.bullet_point("Python FastAPI Machine Learning Microservice: A lightweight Python web service dedicated to vectorizing inputs and performing fast Random Forest inference.", "AI/ML Service Layer")
    pdf.bullet_point("MongoDB Atlas (Database): Storehouse for persistent data collections (Users, Doctors, Appointments, and Admins).", "Database Layer")
    pdf.bullet_point("External Cloud APIs: Groq API for rapid multilingual clinical entity extraction, and Nodemailer SMTP for automated transactional emails.", "Cloud API Integrations")
    
    pdf.ln(2)
    pdf.section_title("1.3 High-Level System Architecture Diagram")
    
    diagram_text = (
        "+-------------------------------------------------------------------------+\n"
        "|                             CLIENT LAYER                                |\n"
        "|  [Patient App (React)]      [Doctor App (React)]     [Admin App (React)]|\n"
        "+-----------------------------------+-------------------------------------+\n"
        "                                    | (HTTP REST & Socket.IO)\n"
        "                                    v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                        CENTRAL BACKEND GATEWAY                          |\n"
        "|                 (Node.js + Express.js API Gateway)                      |\n"
        "+---------+-------------------+---------------------+---------------------+\n"
        "          |                   |                     |\n"
        "          | (HTTP REST)       | (Mongoose ODM)      | (HTTP REST)\n"
        "          v                   v                     v\n"
        "+-------------------+  +--------------+   +-------------------------------+\n"
        "|  AI prediction    |  | MongoDB Atlas|   |        Groq Cloud API         |\n"
        "| Python FastAPI    |  | (Cloud DB)   |   |    (Symptom Extraction)       |\n"
        "+-------------------+  +--------------+   +-------------------------------+\n"
    )
    pdf.draw_code_box(diagram_text)
    
    # ------------------ CHAPTER 2 ------------------
    pdf.add_page()
    pdf.chapter_title("2", "Database Design & Schema Structure")
    
    pdf.body_text(
        "The project uses MongoDB Atlas as its database and Mongoose ODM for structuring data schemas. "
        "The collections are structured to support fast query lookups, index filtering, and role-based permissions."
    )
    
    pdf.section_title("2.1 Core Mongoose Schemas")
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, "1. Unified User Schema (Users Collection)", ln=1)
    pdf.set_font("helvetica", "", 9)
    pdf.body_text(
        "Instead of separating patients and doctors into completely different collections, we utilize a unified "
        "User collection with a 'role' field (patient/doctor) which enables single-portal authentication and profile control."
    )
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, "2. Professional Doctor Profiles Schema (Doctors Collection)", ln=1)
    pdf.set_font("helvetica", "", 9)
    pdf.body_text(
        "Maintains specialized records for clinicians including shifts (morning, evening, lunch), standard consultation "
        "session length (consultationDuration in minutes), and general calendar availability. It is referenced by appointments."
    )
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, "3. Hospital Appointment & Queue Schema (Appointments Collection)", ln=1)
    pdf.set_font("helvetica", "", 9)
    pdf.body_text(
        "Connects patientId (User ref) and doctorId (Doctor ref). Tracks estimatedWaitTime (in minutes), status "
        "('pending', 'approved', 'in-progress', 'completed', 'cancelled'), queueNumber, appointmentDate, and details of "
        "the final medical prescription."
    )
    
    pdf.section_title("2.2 Entity Relationship Diagram (ERD)")
    erd_text = (
        "  +---------------------+           +------------------------+\n"
        "  |    USERS (Patients) |           |        DOCTORS         |\n"
        "  |---------------------|           |------------------------|\n"
        "  | _id (PK)            |           | _id (PK)               |\n"
        "  | name, email (UK)    |           | name, email (UK)       |\n"
        "  | password (hashed)   |           | specialization, city   |\n"
        "  | role: 'patient'     |           | timings {morning, etc} |\n"
        "  +----------+----------+           +-----------+------------+\n"
        "             |                                  |\n"
        "             | 1                                | 1\n"
        "             |                                  |\n"
        "             |           N                      |\n"
        "             +------------[ APPOINTMENTS ]------+ \n"
        "                          |---------------------|\n"
        "                          | _id (PK)            |\n"
        "                          | patientId (FK)      |\n"
        "                          | doctorId (FK)       |\n"
        "                          | status, queueNumber |\n"
        "                          | estimatedWaitTime   |\n"
        "                          +---------------------+\n"
    )
    pdf.draw_code_box(erd_text)
    
    # ------------------ CHAPTER 3 ------------------
    pdf.add_page()
    pdf.chapter_title("3", "The Machine Learning & NLP Diagnostic Pipeline")
    
    pdf.body_text(
        "The machine learning block is the core intelligence component of the portal. It handles raw symptom translation, "
        "clinical parsing, vector representation, and Random Forest evaluation. Interviewers will focus heavily here."
    )
    
    pdf.section_title("3.1 Symptom String Preprocessing & Cleaning")
    pdf.body_text(
        "To compile high-quality vector representations, the raw CSV dataset was preprocessed as follows:\n"
        "1. Trim Whitespace: Extra margins are stripped from column headers and disease labels.\n"
        "2. Lowercase Normalization: Symptoms are standardized to lower case.\n"
        "3. Regex Underline Replacement: Spaces are replaced with underscores (e.g. 'feverish cough' -> 'feverish_cough') and "
        "multiple consecutive underscores are compressed to single lines. Empty attributes are marked None."
    )
    
    pdf.section_title("3.2 One-Hot Binary Symptom Vectorization")
    pdf.body_text(
        "The model is trained on a binary array representing symptom presence. During preprocessing:\n"
        "1. Vocabulary Compilation: A sorted array of unique symptoms is compiled from the dataset columns.\n"
        "2. Binary Feature Vector: A zero-filled array of the vocabulary size is created. If the user presents a symptom, "
        "its index in the vocabulary is marked as 1. For example, if vocabulary = ['cough', 'fever', 'headache'] and the "
        "symptoms are ['fever'], the vector will be [0, 1, 0]."
    )
    
    pdf.section_title("3.3 Why Random Forest Classifier?")
    pdf.body_text(
        "We chose Random Forest over other options (Logistic Regression, Support Vector Machines, KNN, or Neural Networks) because:\n"
        "1. Handles Sparse/Binary Inputs: Symptom vectors are highly sparse. Random Forest partitions tree spaces based on binary "
        "splits (0/1) without needing scaling.\n"
        "2. Robust to Overfitting: By averaging 100 random decision trees (bagging), the variance is drastically reduced.\n"
        "3. Non-Linear Feature Interactions: Captures non-linear dependencies (e.g., symptom A + B implies typhoid, while B + C implies malaria) "
        "without explicit feature mapping.\n"
        "4. Feature Importance Scoring: Let's clinical auditing inspect which symptoms contributed most to the prediction."
    )
    
    # ------------------ CHAPTER 4 ------------------
    pdf.add_page()
    pdf.chapter_title("4", "Natural Language Processing (NLP) & Audio Flow")
    
    pdf.body_text(
        "Our ML model is strictly trained on English categorical symptoms. To support patients typing or speaking "
        "in Hindi or Gujarati, the system utilizes a robust NLP translation pipeline before running inference."
    )
    
    pdf.section_title("4.1 Speech-To-Text Recognition")
    pdf.body_text(
        "To avoid cloud processing costs and server latencies, the browser-native Web Speech API (window.SpeechRecognition "
        "or window.webkitSpeechRecognition) is implemented on the frontend. It captures audio input from the patient's microphone, "
        "performs speech recognition client-side, and extracts raw text in the selected locale (English, Hindi, or Gujarati)."
    )
    
    pdf.section_title("4.2 Multilingual NLP Parsing via Groq Cloud")
    pdf.body_text(
        "Once raw conversational text (in Hindi, Gujarati, or English) is sent to the backend endpoint "
        "(/api/v1/ai/detect), it initiates symptom extraction:\n"
        "1. Groq Llama-3-70B API Request: The backend routes the text to Groq's high-speed cloud endpoint with a customized system prompt.\n"
        "2. Clinical Standard Mapping: Groq translates the input and extracts standard clinical English symptoms. For example:\n"
        "   - Input (in Gujarati): 'Mane bahu tav che ane mathu dukhe che'\n"
        "   - Groq Output: ['fever', 'headache']\n"
        "3. Fallback Keyword Matching: If the Groq API key is missing or fails, a custom regex symptom matcher scans the raw input text "
        "for known synonyms in English, Hindi, and Gujarati to ensure system resilience."
    )
    
    pdf.section_title("4.3 Complete Prediction Data Pipeline Flow")
    pipeline_text = (
        " [User speaks: 'Mujhe tez bukhar hai' in Hindi] \n"
        "                   |\n"
        "                   v (Browser Web Speech API)\n"
        "          [Raw Text: 'Mujhe tez bukhar hai']\n"
        "                   |\n"
        "                   v (POST /api/v1/ai/detect to Node Backend)\n"
        "    [Express sends payload to Groq Llama-3 API]\n"
        "                   |\n"
        "                   v (Groq extracts & translates standard clinical keys)\n"
        "         [Symptoms Output: ['fever']]\n"
        "                   |\n"
        "                   v (POST /predict to Python FastAPI Service)\n"
        " [FastAPI preprocessor.py vectorizes -> [0, 0, 1, 0, ...]]\n"
        "                   |\n"
        "                   v (Random Forest Model Predicts Disease)\n"
        "      [Disease Output: 'Typhoid' (Internal English Key)]\n"
        "                   |\n"
        "                   v (Node Maps 'Typhoid' to 'General Physician' & localization)\n"
        "   [Displays: 'Taifoid' (translated UI text) + Recommend Dr. Rana in Gujarati]\n"
    )
    pdf.draw_code_box(pipeline_text)
    
    # ------------------ CHAPTER 5 ------------------
    pdf.add_page()
    pdf.chapter_title("5", "Intelligent Live Queue Management System")
    
    pdf.body_text(
        "Instead of hard-scheduled blocks (e.g., booking a patient for exactly 10:15 AM) which fall behind "
        "due to patient variability, HealthAI2026 utilizes an intelligent dynamic queue scheduling model."
    )
    
    pdf.section_title("5.1 Wait Time Estimation Algorithm")
    pdf.body_text(
        "Estimated wait times are computed dynamically based on the queue order and clinician shift configurations. "
        "The primary formula is:\n"
        "Estimated Wait Time = Remaining Patients ahead in Queue * Doctor's standard consultationDuration\n\n"
        "Additionally, a Lunch Break offset is dynamically added. If the accumulated waiting minutes push a patient's "
        "scheduled window into the doctor's lunch shift interval, the estimated waiting time is automatically incremented "
        "by the duration of the lunch break."
    )
    
    pdf.section_title("5.2 Shift Bound Check & Auto-Rejection")
    pdf.body_text(
        "When a patient books an appointment for a specific date, the backend checks queue safety:\n"
        "1. Sum of existing queues on that date is multiplied by the consultation length.\n"
        "2. If the total expected consultation start time is pushed past the doctor's eveningShift.endTime, the "
        "appointment booking request is rejected.\n"
        "3. The patient is notified that the doctor's daily quota is filled and they are suggested to select the next working date."
    )
    
    pdf.section_title("5.3 Real-Time Duration Adjustments & Socket.IO Broadcasting")
    pdf.body_text(
        "If a doctor determines a patient's checkup will take more time based on their condition, they can update "
        "the current session's checking time (e.g., from 15 mins to 45 mins). This initiates a live updates cascade:\n"
        "1. Express updates the active checkup duration and saves recalculations for subsequent wait times in MongoDB.\n"
        "2. The server triggers Socket.IO to emit a broadcast to the doctor's room: emit('queueUpdated', payload).\n"
        "3. All active patients joined to that doctor's room receive the event. Their dashboards instantly update the "
        "estimated wait times without needing to refresh their browsers."
    )
    
    pdf.section_title("5.4 Transactional Email Notifications & Cancellations")
    pdf.body_text(
        "Patients have the right to cancel their booked consultations. The cancellation workflow handles this securely:\n"
        "1. Clicking Cancel changes the appointment status in MongoDB to 'cancelled'.\n"
        "2. The backend automatically calls updateQueueProgression to re-sequence queue positions and wait times for downstream patients.\n"
        "3. An automatic confirmation email is dispatched to the patient using Nodemailer SMTP, containing updated receipt details."
    )
    
    # ------------------ CHAPTER 6 ------------------
    pdf.add_page()
    pdf.chapter_title("6", "Security Architecture, Authentication & Port configuration")
    
    pdf.body_text(
        "Security is a primary concern for hospital systems. HealthAI2026 implements strong authentication, authorization, "
        "and data defense systems."
    )
    
    pdf.section_title("6.1 Authentication System (Stateless JWT vs. Stateful Sessions)")
    pdf.body_text(
        "The system uses JSON Web Tokens (JWT) for stateless authentication. In comparison to stateful sessions:\n"
        "1. Scalability: The server doesn't store active sessions in a memory database. It signs a JWT with a secret key, "
        "returning it to the client. The client attaches this token to subsequent requests, which the backend decrypts.\n"
        "2. Role-Based Access Control (RBAC): The JWT contains the user's role (patient/doctor/admin). Custom Express middleware "
        "(protect, authorizeRoles) verifies permissions before exposing endpoints."
    )
    
    pdf.section_title("6.2 Port Configurations & Production Environments")
    pdf.bullet_point("Port 5000 (Local / Internal Routing)", "Central Node.js Backend Gateway")
    pdf.bullet_point("Port 8000 (Local / VPC Bound Internal Routing)", "Python FastAPI Microservice")
    pdf.bullet_point("Port 5173 (React Dev Server)", "Patient, Doctor, and Admin Frontend Portals")
    
    pdf.ln(3)
    pdf.section_title("6.3 System Middleware Security Controls")
    pdf.bullet_point("Hashes passwords with salt rounds of 10 to protect user records against breach attacks.", "bcrypt Password Hashing")
    pdf.bullet_point("Secures HTTP headers to protect against clickjacking, CSS sniffing, and cross-site scripting (XSS).", "Helmet.js Integration")
    pdf.bullet_point("Protects authorization tokens by loading them via HTTP-Only cookies, preventing script access.", "HTTP-Only Session Cookies")
    pdf.bullet_point("Prevents brute force attacks by restricting authentications to 10 requests per 15 minutes.", "express-rate-limit")
    
    # ------------------ CHAPTER 7 ------------------
    pdf.add_page()
    pdf.chapter_title("7", "Top 25 Campus Interview Questions & Answers")
    
    pdf.body_text(
        "This section prepares you for actual campus interview questions. Review these answers "
        "thoroughly to present yourself as a professional full-stack engineer."
    )
    
    # QA 1
    pdf.draw_qa_box(
        "Explain your project in simple terms.",
        "HealthAI2026 is an AI-powered healthcare portal. It lets patients describe symptoms verbally or in "
        "writing in English, Hindi, or Gujarati. Using an NLP translation API and a Random Forest Classifier, "
        "it predicts the disease and recommends local specialized doctors. It also has a dynamic queue system "
        "which calculates estimated wait times and updates patient dashboards in real-time via Socket.IO.",
        "Keep it concise. Highlight the integration of ML, NLP, and real-time WebSockets."
    )
    
    # QA 2
    pdf.draw_qa_box(
        "Why did you use a separate microservice for Python and Node.js?",
        "Node.js is asynchronous, non-blocking, and excellent for handles I/O operations, HTTP routing, and "
        "real-time Socket.IO connections. However, Node.js is single-threaded and struggles with CPU-heavy tasks "
        "like machine learning inference. Python has a rich ecosystem for ML (Scikit-Learn, Pandas, NumPy). "
        "By building the ML model as a separate Python FastAPI microservice, we keep the main Node server "
        "responsive while executing ML tasks in an optimized environment.",
        "This shows you understand thread management and architectural design patterns."
    )
    
    # QA 3
    pdf.draw_qa_box(
        "Why did you choose Random Forest over other algorithms like SVM or KNN?",
        "Our symptom-disease dataset consists of binary features (1 if a symptom is present, 0 if absent). "
        "Decision tree algorithms are naturally suited for binary splits. Random Forest aggregates multiple "
        "decision trees (ensemble bagging), which prevents overfitting. Unlike SVM or KNN, it does not assume "
        "continuous data or require feature scaling. It also naturally handles high-dimensional sparse data and "
        "non-linear interactions between multiple symptoms.",
        "Demonstrates deep conceptual understanding of machine learning models."
    )
    
    # QA 4
    pdf.draw_qa_box(
        "What is the mathematical formula behind Random Forest?",
        "Random Forest is an ensemble of decision trees. It works using Bootstrap Aggregation (Bagging). "
        "If there are T trees in the forest, each tree t is trained on a bootstrap sample of size N with replacement. "
        "For classification, the final prediction is based on majority voting:\n"
        "  Y_pred = argmax_c [ Sum_{t=1..T} I( Y_t(x) == c ) ]\n"
        "where Y_t(x) is the prediction of tree t, and I is the indicator function.",
        "Mentioning bagging and majority voting will impress ML interviewers."
    )
    
    # QA 5
    pdf.add_page() # Start on new page for the next batch
    pdf.draw_qa_box(
        "How is the speech-to-text functionality implemented?",
        "We used the browser's native Web Speech API (window.SpeechRecognition or window.webkitSpeechRecognition). "
        "This runs directly inside the client's browser, eliminating server-side audio file uploads, "
        "reducing API latency to zero, and saving server bandwidth and external API costs.",
        "Emphasize the performance and cost benefits of using client-side Web Speech API."
    )
    
    # QA 6
    pdf.draw_qa_box(
        "Why did you use Groq Cloud API for symptom extraction?",
        "Patients describe symptoms in natural language (e.g. 'my throat is burning'). The ML model only understands "
        "standardized keys (e.g. 'throat_irritation'). Groq Llama-3 processes this conversational text, translates it from "
        "Hindi/Gujarati if necessary, and extracts standardized English symptoms. Groq's custom LPU hardware allows this "
        "inference to return in less than 100ms.",
        "Highlight that Groq is used as a clinical entity parser, translating conversational text to standardized keys."
    )
    
    # QA 7
    pdf.draw_qa_box(
        "How do you handle fallback symptom extraction if the Groq API fails or is offline?",
        "We implemented a custom regex-based symptom extraction fallback. The backend loads localized symptom synonym mappings "
        "for English, Hindi, and Gujarati. If the Groq API fails, the backend runs a pattern search on the input text "
        "to find matching symptoms, ensuring diagnostic availability even during network outages.",
        "This proves that your system is resilient and designed with production failovers in mind."
    )
    
    # QA 8
    pdf.draw_qa_box(
        "How does the dynamic queue wait time calculation work?",
        "The wait time is calculated dynamically: Wait Time = Remaining Patients * Doctor's standard consultationDuration. "
        "If the doctor's shift contains a lunch break, the algorithm dynamically checks if the patient's turn falls after "
        "the break. If so, it adds the lunch break duration to the estimated wait time. If the calculated wait time pushes "
        "the patient's consultation past the doctor's end shift time, the system auto-rejects the booking.",
        "Make sure to mention the shift boundary check and the lunch break calculation."
    )
    
    # QA 9
    pdf.draw_qa_box(
        "How does the system ensure real-time queue updates across client dashboards?",
        "We use Socket.IO. When a doctor updates a patient's consultation duration or clicks 'Call Next Patient', the backend "
        "updates the database and triggers a recalculation of the queue. Once updated, the backend emits a Socket.IO "
        "event ('queueUpdated') to the specific doctor's room. All client portals subscribed to that room receive the "
        "new queue details and update their state immediately without page refreshes.",
        "Highlight Socket.IO rooms as the mechanism for broadcasting updates to selective client groups."
    )
    
    # QA 10
    pdf.draw_qa_box(
        "Why did you choose JWT over Session-based authentication?",
        "JWT (JSON Web Tokens) are stateless. The backend server does not need to query a database or session store to "
        "authenticate a user on every request. The user's details and role are encoded in the token signature, which "
        "the backend verifies cryptographically. This reduces database overhead and makes it highly scalable.",
        "Explain that statelessness improves application horizontal scalability."
    )
    
    # QA 11
    pdf.add_page()
    pdf.draw_qa_box(
        "How do you protect JWTs from Cross-Site Scripting (XSS) and Session Hijacking?",
        "We store the JWT inside an HTTP-Only Cookie instead of localStorage. HTTP-Only cookies are inaccessible to "
        "client-side JavaScript. This protects the token from script injection (XSS). We also set the 'Secure' flag to ensure "
        "the token is only transmitted over HTTPS, and use 'SameSite=Strict' to prevent Cross-Site Request Forgery (CSRF).",
        "This shows strong security awareness regarding web vulnerabilities."
    )
    
    # QA 12
    pdf.draw_qa_box(
        "What data preprocessing and cleaning steps were done on the dataset?",
        "The preprocessing script load_and_clean_dataset: 1. Strips outer whitespaces from headers. 2. Converts symptom strings "
        "to lowercase, replacing spaces with single underscores. 3. Compresses consecutive underscores. 4. Replaces empty values "
        "and 'nan' placeholders with None. 5. Extracts a sorted, unique list of symptoms which serves as the vocabulary matrix.",
        "Be specific about capitalization, underscore parsing, and null value replacement."
    )
    
    # QA 13
    pdf.draw_qa_box(
        "Why did you use standard CSS instead of Tailwind CSS for the Landing page?",
        "The project has pre-existing CSS rules. Introducing Tailwind's global utility classes could cause stylesheet leakage "
        "and distort the layout of the dashboards. We wrote scoped Vanilla CSS wrapped in unique page roots (e.g. .landing-page-root) "
        "to guarantee that the custom cinematic animations and layout presets are completely isolated.",
        "Shows an understanding of stylesheet isolation and scoping in frontend applications."
    )
    
    # QA 14
    pdf.draw_qa_box(
        "How is the multilingual i18n support structured?",
        "We use 'i18next' and 'react-i18next' on the frontend for UI components (buttons, text labels, navigation menus). "
        "For disease diagnoses and recommendations, the backend loads localized translation files (disease_en.json, "
        "disease_hi.json, disease_gu.json) using the predicted disease as the dictionary key, mapping it dynamically.",
        "Mention that the UI translations are on the client-side, while disease translations are loaded from backend JSONs."
    )
    
    # QA 15
    pdf.draw_qa_box(
        "What happens when a patient cancels an appointment?",
        "When a patient clicks 'Cancel', the appointment status in MongoDB is set to 'cancelled'. This triggers an automatic "
        "re-sequencing of the active doctor's daily queue, recalculating estimated wait times for downstream patients and "
        "updating their dashboards in real-time. An automatic email is sent to the patient using Nodemailer.",
        "Emphasize the cascade effect: Status Update -> Queue Recalculation -> Socket Broadcast -> Email Notification."
    )
    
    # QA 16
    pdf.draw_qa_box(
        "How do you prevent a patient from booking multiple appointments with the same doctor?",
        "In the bookAppointment controller, the backend executes a query to check for active appointments for the patient "
        "with that doctor. If an appointment exists with a status of 'pending', 'approved', or 'in-progress', the booking "
        "is rejected. This prevents resource double-booking.",
        "Mention that this constraint spans all dates to prevent double-booking."
    )
    
    # QA 17
    pdf.add_page()
    pdf.draw_qa_box(
        "How is the Doctor Recommendation system implemented?",
        "When the Random Forest model predicts a disease key (e.g. 'Migraine'), the Node.js backend uses a specialization mapping "
        "(specializationMap.json) to map the disease to a medical specialty (e.g. 'Neurologist'). It then queries MongoDB "
        "for doctors matching this specialization, filtered by the patient's city and availability on the scheduled date.",
        "Explain that the mapping is resolved via a static JSON map in the backend before querying the Doctor collection."
    )
    
    # QA 18
    pdf.draw_qa_box(
        "What are the parameters for your Random Forest training model?",
        "The model is instantiated using scikit-learn's RandomForestClassifier(n_estimators=100, random_state=42). "
        "We split the cleaned dataset using a test_size=0.2 (20% test, 80% train). The model achieves near 100% accuracy, "
        "precision, recall, and f1-score due to clean, distinct symptom clusters in the structured medical dataset.",
        "Remember: 100 estimators, random state 42, 80/20 train/test split."
    )
    
    # QA 19
    pdf.draw_qa_box(
        "Explain the difference between Accuracy, Precision, Recall, and F1-score.",
        "1. Accuracy: Total correct predictions divided by total predictions. 2. Precision: True Positives divided by "
        "total predicted positives. 3. Recall (Sensitivity): True Positives divided by actual positives. "
        "4. F1-score: The harmonic mean of Precision and Recall, which is useful when dealing with imbalanced datasets.",
        "Knowing basic classification metrics is a must for any engineering candidate."
    )
    
    # QA 20
    pdf.draw_qa_box(
        "How does the backend Node server communicate with the FastAPI service?",
        "The Node backend uses the Axios HTTP client to send POST requests to the FastAPI microservice. The payload "
        "contains the extracted symptoms list (e.g., {'symptoms': ['fever']}). The FastAPI server receives this, "
        "vectorizes it, runs model inference, and returns the predicted disease in the JSON response.",
        "Keep it simple: REST API communication via Axios over HTTP."
    )
    
    # QA 21
    pdf.draw_qa_box(
        "What security measures are implemented on the Node.js server?",
        "1. Helmet.js: Sets HTTP response headers to prevent clickjacking and XSS. 2. Express-Rate-Limit: Limits API requests "
        "on auth and ML endpoints. 3. Express-Validator: Sanitizes and validates all request inputs. 4. Environment Variables: "
        "Keeps configuration secrets separate from the source code.",
        "Give a bulleted response listing Helmet, Rate Limiter, Validator, and Env Secrets."
    )
    
    # QA 22
    pdf.draw_qa_box(
        "How are MongoDB connections managed in Node.js?",
        "We use Mongoose's mongoose.connect() to initialize a connection pool to MongoDB Atlas. We configure the client with "
        "options to ensure connection stability and catch errors during initialization, maintaining a single persistent pool.",
        "Mention that Mongoose maintains a default connection pool, so we do not open a new connection for each request."
    )
    
    # QA 23
    pdf.add_page()
    pdf.draw_qa_box(
        "Explain the difference between client-side translation and server-side translation in your project.",
        "UI elements (buttons, labels) are translated client-side using react-i18next translation bundles. However, disease "
        "details, descriptions, and recommendations are translated server-side. The backend loads the translated JSON file "
        "based on the client's language selection and returns the localized data in the API response.",
        "UI is client-side (react-i18next), medical content is server-side (loaded from backend localization JSONs)."
    )
    
    # QA 24
    pdf.draw_qa_box(
        "How does the doctor dashboard update the active patient consultation room?",
        "When the doctor clicks 'Call Next Patient', it requests the POST /api/v1/queue/next route. The backend marks the current "
        "in-progress patient as 'completed' and transition the next queued patient's status to 'in-progress'. The backend "
        "recalculates wait times, updates MongoDB, and broadcasts the new queue state via Socket.IO to update patient screens.",
        "Emphasize the state transition: in-progress -> completed, and next pending -> in-progress."
    )
    
    # QA 25
    pdf.draw_qa_box(
        "If you had to scale this application to support 100,000 active users, what changes would you make?",
        "1. Horizontal Scaling: Deploy multiple instances of the Node backend behind an AWS Application Load Balancer. "
        "2. Redis Adapter: Implement a Redis adapter for Socket.IO so that socket connections are synchronized across multiple "
        "backend servers. 3. Database Indexing: Create index patterns on frequently queried MongoDB fields (like status, doctorId, "
        "and appointmentDate). 4. Caching: Cache doctor profile records using Redis to reduce MongoDB read load.",
        "This is an advanced scaling question. Mentioning load balancing, Redis socket adapter, and database indexing shows high senior-level potential."
    )
    
    # Save PDF
    output_dir = "docs"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "HealthAI2026_Campus_Interview_Guide.pdf")
    pdf.output(output_path)
    print(f"Guide compiled successfully: {output_path}")

if __name__ == "__main__":
    build_pdf()
