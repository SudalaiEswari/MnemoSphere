# MnemoSphere — Architecture Document

## 1. System Overview

MnemoSphere is a three-tier web application with a React frontend, FastAPI backend, SQLite database, FAISS vector store, and Groq LLM integration. It implements an **AI Agent** architecture with **Retrieval-Augmented Generation (RAG)**, adaptive spaced repetition scheduling, and a **Memory Twin** personal knowledge model.

## 2. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     🌐 REACT FRONTEND (Vite)                      │
│              React Router · Axios · Web Speech API                │
│              PWA Service Worker · VoiceInput Component            │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTP / REST (JSON)
┌──────────────────────────▼───────────────────────────────────────┐
│                      ⚡ FASTAPI BACKEND (Python 3.12)              │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Auth    │ │  Notes   │ │  Quiz    │ │  Review  │ │ Agent  │ │
│  │  API     │ │  API     │ │  API     │ │  API     │ │  API   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │            │            │            │            │       │
│  ┌────▼────────────▼────────────▼────────────▼────────────▼───┐  │
│  │                     SERVICES LAYER                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  │
│  │  │   LLM    │ │  Vector  │ │ Agent    │ │   Memory     │ │  │
│  │  │  Service │ │  Store   │ │ Service  │ │   Service    │ │  │
│  │  │ (Groq)   │ │ (FAISS)  │ │ (RAG)    │ │ (Strength)   │ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ │  │
│  │  ┌────┴─────┐ ┌────┴─────┐ ┌────┴──────────────┴───────┐ │  │
│  │  │Embedding │ │Scheduler │ │   Agent Actions:           │ │  │
│  │  │(TF-IDF)  │ │(Adaptive)│ │   · Today's Plan           │ │  │
│  │  └──────────┘ └──────────┘ │   · Auto Quiz              │ │  │
│  │                            │   · Memory Twin            │ │  │
│  │                            │   · Summarize              │ │  │
│  │                            │   · Connections            │ │  │
│  └────────────────────────────┴────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐       ┌──────────┐
  │  SQLite  │      │  FAISS   │       │   Groq   │
  │(Primary) │      │(Vector)  │       │   LLM    │
  └──────────┘      └──────────┘       │ (LLaMA)  │
                                        └──────────┘
```

## 3. Component Architecture

### 3.1 Frontend (React)
- **Pages (11):** Home, Dashboard, Notes, Review, Assistant (Memory Twin), Analytics, Tasks, Goals, Habits, Timeline, Summary
- **Components:** InstallPrompt (PWA), VoiceInput (Web Speech API)
- **State:** localStorage for JWT token
- **Routing:** React Router v6 with protected routes
- **HTTP:** Axios client with token-based auth
- **Styling:** Custom CSS with dark theme, purple/green gradient, glass-morphism

### 3.2 Backend (FastAPI)
- **API Layer (12 modules):** auth, notes, quiz, review, analytics, assistant, agent, tasks, goals, habits, timeline, summary
- **Service Layer (6 services):** LLM service, vector store, scheduler, embedding, agent service, memory service
- **Data Layer:** SQLite via custom async wrapper with JSON serialization
- **Middleware:** CORS, JWT validation, API prefix stripping (/api/ → /)

### 3.3 Database (SQLite)
- **Tables (8):** users, notes, quiz_logs, review_logs, tasks, goals, habits, habit_logs
- **Schema:** Flexible with JSON field serialization for lists/dicts
- **Indexing:** user_id indexes for all queries

### 3.4 Vector Store (FAISS)
- **Embedding Dim:** 2048
- **Index Type:** IndexFlatIP (inner product = cosine similarity)
- **Embedding Method:** TF-IDF + character n-grams with stop word removal
- **Storage:** Local file persistence (faiss.index + mapping.pkl)

### 3.5 LLM (Groq)
- **Model:** LLaMA 3.3-70B Versatile
- **API:** REST over HTTPS with httpx
- **Fallback:** Google Gemini 2.0 Flash
- **Mock Mode:** Deterministic responses when no API key configured

## 4. Data Flow

### Note Creation Flow
1. User submits note (text, image, or voice)
2. Backend stores content in SQLite
3. LLM generates summary via Groq API
4. LLM categorizes note (study/work/personal/etc.) and generates tags
5. Embedding computed using TF-IDF + n-gram → stored in FAISS
6. Adaptive scheduler calculates next_review based on stage + performance

### Review Flow
1. User opens Review page → GET /review/due returns notes past their review date
2. User selects a note → Agent generates personalized quiz using LLM
3. User answers quiz → POST /quiz/submit logs correct/incorrect
4. POST /review/complete: adaptive scheduler calculates new stage
   - Score ≥ 0.85 → advance 2 stages
   - Score ≥ 0.60 → advance 1 stage
   - Score 0.40-0.60 → stay
   - Score < 0.40 → go back 1 stage

### RAG Question Flow
1. User asks "What did I learn about ESP32?"
2. Question is embedded using TF-IDF + n-gram
3. FAISS searches for top-8 similar notes
4. Retrieved notes + question sent to LLM
5. LLM generates answer based on context
6. Response includes RAG metadata (notes used, vector match count)

### Memory Twin Flow
1. User queries "What should I review today?"
2. Agent collects: due reviews, topic strengths, forgotten notes, streak, weekly progress
3. Context assembled with user's full knowledge profile
4. LLM generates personalized plan with specific recommendations
5. Response includes actionable items + AI advice

## 5. Adaptive 1-3-7 Scheduling

```python
BASE_INTERVALS = [1, 3, 7, 14, 30]

def advance_stage(current_stage: int, score: float) -> int:
    if score >= 0.85: return min(current_stage + 2, 4)
    elif score >= 0.60: return min(current_stage + 1, 4)
    elif score >= 0.40: return current_stage
    return max(0, current_stage - 1)

def calculate_next_review(stage: int, score: float) -> datetime:
    days = BASE_INTERVALS[stage]
    if score >= 0.7: days *= 1.2    # Strengthen → longer interval
    elif score < 0.4: days *= 0.5   # Weaken → shorter interval
    return now + timedelta(days=days)
```

## 6. Security
- JWT-based authentication (HS256, 24-hour expiry)
- bcrypt password hashing (12 rounds)
- All API endpoints (except auth) require valid JWT token
- CORS configured for all origins (development)
- SQL injection prevention via parameterized queries
- No API keys exposed to frontend
- Rate limiting via API design

## 7. Deployment Architecture

```
┌────────────────────────────────────────────┐
│              Docker Container               │
│                                              │
│  ┌────────────────┐                         │
│  │   FastAPI App  │──► Port 8000            │
│  │                │                         │
│  │  Static files  │──► Serves React SPA    │
│  │  (dist/)       │                         │
│  └────────┬───────┘                         │
│           │                                 │
│  ┌────────▼───────┐                         │
│  │   SQLite DB    │  ./data/mnemosphere.db  │
│  ├────────────────┤                         │
│  │   FAISS Index  │  ./data/vector_store/   │
│  └────────────────┘                         │
└────────────────────────────────────────────┘
         │
         ▼
┌────────────────┐
│   Railway.app  │
│  (Production)  │
└────────────────┘
```
