# Product Requirements Document (PRD)
# HealthAI Intelligent AI Agent System

---

# 1. Product Overview

## Product Name
# HealthAI AI Assistant / AI Agent

## Product Vision

Build an intelligent healthcare AI assistant integrated into the HealthAI platform that can:
- understand natural language
- assist users conversationally
- automate healthcare workflows
- interact with backend APIs
- perform secure healthcare actions
- provide intelligent healthcare guidance

The AI assistant should function similar to:
- Ask Reddi
- ChatGPT assistants
- AI healthcare copilots
- modern SaaS AI agents

while maintaining:
- healthcare-safe behavior
- professional communication
- reliable backend orchestration

---

# 2. Product Goals

The AI assistant should:

- improve user experience
- simplify healthcare workflows
- automate appointment processes
- reduce manual navigation
- provide conversational healthcare interaction
- intelligently guide users through the platform

---

# 3. Core Functionalities

## 3.1 Conversational AI Chat

The assistant must support:
- natural conversations
- healthcare-related guidance
- contextual replies
- intelligent user assistance

Example:

User:
"I have headache and fever"

Assistant:
"Your symptoms may indicate a viral infection. Would you like to run AI disease analysis?"

---

## 3.2 Intent Detection

The assistant must identify user intent.

Supported intents:

- symptom_analysis
- appointment_booking
- queue_tracking
- doctor_search
- appointment_cancel
- leave_inquiry
- general_help

---

## 3.3 Symptom Extraction

Convert human language into structured symptoms.

Example:

"I have headache and body pain"

↓

["headache", "body_pain"]

Technology:
- Groq API

---

## 3.4 Disease Prediction Integration

The assistant should integrate with:
- existing Random Forest ML model
- FastAPI disease prediction service

Workflow:

Symptoms
→ FastAPI ML Service
→ Disease Prediction
→ Confidence Score

---

## 3.5 Doctor Recommendation

The assistant should:
- map disease to specialization
- fetch doctors
- filter by city and availability

---

## 3.6 AI Agent Action Execution

The assistant should perform actions.

Supported actions:
- Book Appointment
- Cancel Appointment
- Queue Tracking
- Doctor Search
- Appointment History

---

# 4. System Architecture

Frontend Chat Widget
        ↓
Node.js AI Gateway
        ↓
Gemini / Groq APIs
        ↓
Intent Detection Layer
        ↓
Backend Action Layer
        ↓
Healthcare APIs
        ↓
MongoDB + FastAPI

---

# 5. Technology Stack

- Frontend: React
- Backend: Node.js + Express
- Conversational AI: Gemini API
- Symptom NLP: Groq API
- Disease Prediction: Random Forest
- ML Service: FastAPI
- Database: MongoDB Atlas
- Realtime: Socket.IO
- Notifications: Resend
- Scheduler: node-cron

---

# 6. Frontend Requirements

## Chat Widget UI

Requirements:
- floating chatbot button
- expandable chat window
- typing animation
- loading states
- responsive design
- professional healthcare UI
- light modern SaaS appearance

---

# 7. Backend Requirements

Create backend services:

backend/
├── services/
│   ├── aiAssistantService.js
│   ├── llmService.js
│   ├── intentService.js
│   ├── actionService.js
│   ├── symptomExtractionService.js
│   └── responseFormatter.js

Main Route:
POST /assistant/chat

---

# 8. Internal AI Workflow

1. User sends message
2. Backend injects context + system prompt
3. Gemini/Groq processes NLP
4. Intent detection + entity extraction
5. Backend executes actions securely
6. Optional FastAPI ML prediction
7. Final AI response generation

---

# 9. Prompt Engineering

System Prompt Example:

"You are HealthAI Assistant.

You help users with:
- symptom guidance
- appointments
- queue tracking
- doctor recommendations

Always:
- remain professional
- remain polite
- avoid dangerous medical advice
- recommend consulting healthcare professionals."

---

# 10. AI Safety Rules

Assistant must:
- avoid fake diagnosis
- avoid dangerous medical advice
- avoid medicine prescriptions
- avoid emergency medical claims

Always recommend:
"Consult a healthcare professional for proper diagnosis."

---

# 11. Realtime Features

- realtime queue tracking
- live updates
- Socket.IO notifications

---

# 12. Future Features

- voice assistant
- multilingual AI
- WhatsApp integration
- AI memory
- RAG knowledge base

---

# 13. Deployment Architecture

Frontend → AWS S3 / CloudFront
Backend → AWS EC2
FastAPI ML → AWS EC2
MongoDB → Atlas
LLM APIs → Gemini / Groq

---

# 14. Success Metrics

The assistant is successful if:
- intent detection accurate
- appointment automation works
- queue tracking works
- symptom extraction reliable
- users interact conversationally

---

# 15. Interview Explanation Summary

The HealthAI assistant combines Large Language Models, backend orchestration, healthcare APIs, realtime systems, and a Random Forest ML prediction engine.

Gemini API is used for conversational understanding, intent detection, and entity extraction, while Groq API handles optimized symptom extraction workflows.

The Node.js backend acts as an orchestration layer that securely triggers internal healthcare APIs and FastAPI ML microservices.

The assistant supports:
- symptom analysis
- appointment booking
- doctor recommendation
- queue tracking
- realtime healthcare assistance

using a hybrid AI agent architecture.
