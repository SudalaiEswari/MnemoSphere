# MnemoSphere — Architecture Document

## 1. System Overview

MnemoSphere is a three-tier web application with React frontend, FastAPI backend, MongoDB database, FAISS vector store, and Groq LLM integration.

## 2. Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  React SPA  │────▶│  FastAPI     │────▶│  MongoDB    │
│  (Port 3000)│     │  (Port 8000) │     │  (Port 27017)│
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐     ┌─────────────┐
                    │  FAISS       │     │  Groq LLM   │
                    │  Vector DB   │     │  (External) │
                    └──────────────┘     └─────────────┘
```

## 3. Component Architecture

### 3.1 Frontend (React)
- **Pages:** Home, Dashboard, Notes, Review, Analytics
- **State:** localStorage for JWT token
- **Routing:** React Router v6
- **HTTP:** Axios client with proxy to backend

### 3.2 Backend (FastAPI)
- **API Layer:** 5 route modules (auth, notes, quiz, review, analytics)
- **Service Layer:** LLM service, vector store, scheduler
- **Data Layer:** MongoDB via Motor (async driver)

### 3.3 Database (MongoDB)
- **Collections:** users, notes, quiz_logs, review_logs
- **Indexing:** user_id indexes for fast queries

### 3.4 Vector Store (FAISS)
- **Embedding Dim:** 384
- **Index Type:** IndexFlatL2 (brute force nearest neighbor)
- **Storage:** Local file persistence

### 3.5 LLM (Groq)
- **Model:** LLaMA 3.3-70B Versatile
- **API:** REST over HTTPS
- **Fallback:** Google Gemini 2.0 Flash

## 4. Data Flow

### Note Creation
1. User submits note text
2. Backend stores raw content in MongoDB
3. LLM generates summary via Groq API
4. Embedding computed and stored in FAISS
5. Scheduler sets next_review = now + 1 day

### Review Flow
1. User opens Review page
2. GET /review/due returns notes past their review date
3. POST /quiz/generate calls Groq to create personalized questions
4. User answers → POST /quiz/submit logs result
5. POST /review/complete updates review_stage and score

## 5. Security
- JWT-based authentication
- bcrypt password hashing
- All API endpoints (except auth) require valid token
- MongoDB injection prevention via Motor (parameterized queries)
- CORS configured for frontend origin
