# 🧠 MnemoSphere

**AI-Powered Personal Memory Assistant — Memory Twin AI with Adaptive 1-3-7 Spaced Repetition**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-000000?style=for-the-badge&logo=groq)](https://groq.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![FAISS](https://img.shields.io/badge/FAISS-Vector_DB-16A34A?style=for-the-badge&logo=facebook)](https://faiss.ai)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway)](https://railway.app)

> **MnemoSphere** is an intelligent **Memory Twin AI** — an AI agent that knows everything you've learned. It combines Retrieval-Augmented Generation (RAG), adaptive 1-3-7 spaced repetition, and semantic vector search to help you retain knowledge and never forget what matters.

**Live:** [https://api-production-3196.up.railway.app](https://api-production-3196.up.railway.app)  
**GitHub:** [https://github.com/SudalaiEswari/MnemoSphere](https://github.com/SudalaiEswari/MnemoSphere)

---

## 📑 Table of Contents

- [🎯 Key Features](#-key-features)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [🧠 AI Agent Pipeline](#-ai-agent-pipeline)
- [📅 Adaptive 1-3-7 Review System](#-adaptive-1-3-7-review-system)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📖 API Reference](#-api-reference)
- [🐳 Docker Deployment](#-docker-deployment)
- [📚 Documentation](#-documentation)

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 🤖 **Memory Twin AI** | AI agent that knows what you know — asks "What do I keep forgetting?", "What should I revise today?" |
| 🔍 **RAG-Powered Q&A** | Retrieval-Augmented Generation — searches your notes via FAISS vector DB, then answers with LLM |
| 📝 **Smart Notes** | Text upload, image OCR, voice input — AI auto-tags, categorizes, and summarizes |
| 🎯 **Auto Quiz Generation** | AI generates MCQs, fill-in-the-blanks, and short-answer questions for your due reviews |
| 📅 **Adaptive 1-3-7** | Dynamic intervals that shorten when you struggle and lengthen when you excel |
| 🏆 **Memory Strength Score** | Per-topic retention scores calculated from reviews, quizzes, and recall accuracy |
| 🎙️ **Voice Interaction** | Web Speech API — speak your questions and the AI responds |
| 🔗 **Smart Connections** | Discovers related notes by semantic similarity — "Your ESP32 notes relate to IoT" |
| 📊 **Analytics Dashboard** | Weekly bar chart, topic strength bars, streak counter, weakest topics, forgotten notes |
| 🎯 **Goals & Habits** | Track goals with progress bars, build daily habits with streaks |
| 📅 **Timeline** | Chronological view of all notes, reviews, tasks, and goals |
| 📎 **File Upload & OCR** | Upload images — AI extracts text via Groq Vision |
| 📱 **PWA Ready** | Install as a mobile app with offline service worker |
| 🐳 **Docker Ready** | Single Dockerfile builds frontend + backend |

---

## 🏗️ System Architecture

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
│  └────────────────────────────┴────────────────────────────┘  │  │
│                                                               │  │
└───────────────────────────┬───────────────────────────────────┘  │
                           │                                      │
        ┌──────────────────┼──────────────────┐                    │
        ▼                  ▼                  ▼                     │
  ┌──────────┐      ┌──────────┐       ┌──────────┐                │
  │  SQLite  │      │  FAISS   │       │   Groq   │                │
  │(Primary) │      │(Vector)  │       │   LLM    │                │
  └──────────┘      └──────────┘       │ (LLaMA)  │                │
                                        └──────────┘                │
```

### Data Flow

1. User adds a note (text, image OCR, or voice) via React frontend
2. FastAPI stores in SQLite, generates embedding using TF-IDF+ngram → FAISS
3. LLM Service summarizes + categorizes via Groq
4. Agent calculates next review using adaptive scheduler (score-dependent intervals)
5. When reviewing: Agent retrieves relevant notes via RAG → generates personalized quiz
6. Memory Twin AI answers questions using vector search + LLM inference
7. Dashboard shows per-topic memory strength, weekly progress, weakest topics

---

## 🧠 AI Agent Pipeline

### Prompt Engineering Strategy

| Task | Prompt Technique | Example |
|---|---|---|
| **Memory Twin** | System persona + RAG context injection | *"You are Memory Twin AI — you know everything the user has learned. Answer using their notes. Point out connections they might have missed."* |
| **RAG Question** | Context + question with retrieved notes | *"Context: [vector-searched notes]. Question: [user query]"* |
| **Today's Plan** | Multi-signal aggregation | *"User has X notes, Y due. Weakest: [...]. Forgot: [...]. Recommend a personalized study plan."* |
| **Quiz Generation** | Structured JSON output with difficulty | *"Return JSON array: {question, options[], correct_answer, explanation, hint}. User score: X%. Focus on weak areas."* |
| **Summarization** | Zero-shot with role instruction | *"You are a memory assistant. Summarize in 3 concise bullet points for spaced repetition."* |
| **Categorization** | Structured JSON output | *"Return JSON: {category, tags[], suggested_summary}"* |
| **Image Analysis** | Multi-modal (Groq Vision) | *"Extract all text from this image and describe what you see."* |

### AI Agent Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    AI AGENT (agent_service.py)                  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              QUERY ROUTER                                 │  │
│  │  Determines intent: question | plan | quiz | twin |      │  │
│  │  summarize | connections                                  │  │
│  └─────────────────────┬───────────────────────────────────┘  │
│                        │                                      │
│         ┌──────────────┼──────────────┬──────────────┐        │
│         ▼              ▼              ▼              ▼        │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐   │
│  │  RAG     │  │ Today's    │  │ Auto     │  │ Memory   │   │
│  │  Answer  │  │ Plan       │  │ Quiz     │  │ Twin     │   │
│  └────┬─────┘  └─────┬──────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │          │
│       ▼              ▼              ▼              ▼          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              LLM ORCHESTRATOR (llm_service.py)           │  │
│  │  Groq (LLaMA 3.3-70B) · Gemini 2.0 Flash (fallback)    │  │
│  │  Mock mode (no API key) → deterministic responses       │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### RAG Pipeline

```
User Question: "What did I learn about ESP32?"
       │
       ▼
┌──────────────────┐
│ 1. Embed Question │  TF-IDF + char n-gram → 2048-dim vector
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 2. FAISS Search  │  Cosine similarity → top-8 matching notes
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 3. Retrieve Docs │  Fetch from SQLite by ID
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 4. Build Context │  Title + Tags + Content + Summary
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 5. LLM Answer    │  Groq generates answer from context
└────────┬─────────┘
         ▼
    "The ESP32 is a microcontroller with WiFi + Bluetooth..."

```

### Memory Twin AI

The **Memory Twin** is MnemoSphere's unique feature — it's not just a chatbot. It:

- **Knows your knowledge graph:** Tracks per-topic memory strength from quiz accuracy + review scores
- **Remembers what you forget:** Logs every failed quiz answer → "You've forgotten 'ADC on ESP32' 3 times"
- **Recommends connections:** Finds semantically similar notes → "Your 'ESP32 WiFi' note connects to 'IoT Network Protocols' (85% match)"
- **Generates personalized plans:** "Review 3 due notes + revise 'Analog Electronics' (weakest at 35%) + re-learn 'ESP32 ADC' (failed 2x)"
- **Answers in context:** "Explain ESP32 using my previous notes" → finds your ESP32 notes + IoT notes → comprehensive answer

---

## 📅 Adaptive 1-3-7 Review System

### Dynamic Interval Calculation

```
                    ┌──────────────────┐
                    │  New Note Added  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Stage 0        │
                    │   Review in 1d   │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────────────┐
                    │      ADAPTIVE REVIEW       │
                    │                            │
                    │  Score ≥ 0.85 → +2 stages │
                    │  Score ≥ 0.60 → +1 stage  │
                    │  Score ≥ 0.40 → stay      │
                    │  Score < 0.40 → -1 stage  │
                    └────────┬──────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ Strengthen │ │ Maintain   │ │ Weaken     │
     │ +20% time  │ │ Normal     │ │ -50% time  │
     └────────────┘ └────────────┘ └────────────┘
              │              │              │
              ▼              ▼              ▼
     ┌──────────────────────────────────────────┐
     │  Intervals: 1, 3, 7, 14, 30 days         │
     │  (score 0.9 → 1d*1.2 → 1.2d → next 3.6d) │
     │  (score 0.3 → 1d*0.5 → 0.5d → retry 1d)  │
     └──────────────────────────────────────────┘
```

### Stage Transitions

| Current Stage | Score ≥ 0.85 | Score ≥ 0.60 | Score ≥ 0.40 | Score < 0.40 |
|---|---|---|---|---|
| Stage 0 (1d) | Stage 2 (7d) | Stage 1 (3d) | Stage 0 (1d) | Stage 0 (1d) |
| Stage 1 (3d) | Stage 3 (14d) | Stage 2 (7d) | Stage 1 (3d) | Stage 0 (1d) |
| Stage 2 (7d) | Stage 4 (30d) | Stage 3 (14d) | Stage 2 (7d) | Stage 1 (3d) |
| Stage 3 (14d) | ✓ Mastered | Stage 4 (30d) | Stage 3 (14d) | Stage 2 (7d) |
| Stage 4 (30d) | ✓ Mastered | ✓ Mastered | Stage 4 (30d) | Stage 3 (14d) |

### Memory Strength Calculation

```
strength = (avg_review_score × 0.4) + (quiz_accuracy × 0.4) + (stage_bonus × 0.2)

where:
  avg_review_score = mean of all review scores for this topic's notes
  quiz_accuracy    = correct / total quiz answers for this topic
  stage_bonus      = min(review_stage × 10%, 30%)

Final: strength × 100 → percentage (displayed per-topic on Dashboard)
```

---

## 📁 Project Structure

```
MnemoSphere/
│
├── backend/
│   ├── app/
│   │   ├── main.py                    FastAPI entry point + middleware
│   │   ├── api/
│   │   │   ├── auth.py               POST /register, /login
│   │   │   ├── notes.py              CRUD notes + upload + OCR + search
│   │   │   ├── quiz.py               Generate + submit quizzes
│   │   │   ├── review.py             1-3-7 review management
│   │   │   ├── analytics.py          Memory score + strength + weekly
│   │   │   ├── assistant.py          RAG-powered Q&A
│   │   │   ├── agent.py              AI Agent endpoints
│   │   │   ├── tasks.py              Task management
│   │   │   ├── goals.py              Goal tracking
│   │   │   ├── habits.py             Habit tracking
│   │   │   ├── timeline.py           Activity timeline
│   │   │   └── summary.py            Daily/weekly summaries
│   │   ├── core/
│   │   │   ├── config.py             Environment configuration
│   │   │   ├── database.py           SQLite async wrapper
│   │   │   └── security.py           JWT + bcrypt
│   │   ├── services/
│   │   │   ├── llm_service.py        Groq/Gemini integration
│   │   │   ├── vector_store.py       FAISS semantic search
│   │   │   ├── scheduler.py          Adaptive 1-3-7 logic
│   │   │   ├── embedding.py          TF-IDF + char n-gram embeddings
│   │   │   ├── agent_service.py      AI Agent (RAG + plan + quiz + Memory Twin)
│   │   │   └── memory_service.py     Topic strength + streaks + progress
│   │   └── models/
│   │       ├── user.py               User pydantic model
│   │       ├── note.py               Note pydantic model
│   │       └── review.py             Review/Analytics pydantic models
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json             PWA manifest
│   │   ├── sw.js                     Service worker
│   │   └── icons/                    App icons (SVG + PNG)
│   ├── src/
│   │   ├── App.jsx                   Router + navbar + layout
│   │   ├── index.css                 Theme + components styling
│   │   ├── components/
│   │   │   ├── InstallPrompt.jsx     PWA install banner
│   │   │   └── VoiceInput.jsx        Speech-to-text input
│   │   └── pages/
│   │       ├── Home.jsx              Landing + auth
│   │       ├── Dashboard.jsx         Memory Twin dashboard
│   │       ├── Notes.jsx             Create + list + search
│   │       ├── Review.jsx            1-3-7 review flow
│   │       ├── Assistant.jsx         Memory Twin AI chat
│   │       ├── Analytics.jsx         Memory stats
│   │       ├── Timeline.jsx          Activity feed
│   │       ├── Goals.jsx             Goal tracking
│   │       ├── Habits.jsx            Habit tracking
│   │       ├── Tasks.jsx             Task management
│   │       └── Summary.jsx           Daily/weekly summaries
│   ├── package.json
│   └── index.html
│
├── Documents/
│   ├── Architecture.md               System architecture
│   ├── Requirements.md               Functional requirements
│   └── UserGuide.md                  User manual
├── Dockerfile                        Multi-stage build
├── railway.toml                      Railway config
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key ([get free key](https://console.groq.com))

### 1. Clone & Configure

```bash
git clone https://github.com/SudalaiEswari/MnemoSphere.git
cd MnemoSphere
cp .env.example .env
# Edit .env: add GROQ_API_KEY
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open Browser

```
Frontend: http://localhost:3000
Backend:  http://localhost:8000/docs (Swagger UI)
```

---

## 🔧 Configuration

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | Groq API key (get at console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model name |
| `GEMINI_API_KEY` | — | Google Gemini fallback key |
| `LLM_PROVIDER` | `groq` | LLM provider (`groq` or `gemini`) |
| `JWT_SECRET` | `super-secret-key...` | Secret key for JWT tokens |
| `VECTOR_DB_PATH` | `./data/vector_store` | FAISS index storage path |
| `DEBUG` | `True` | Enable debug mode |

---

## 📖 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Sign in |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/notes/` | Create note with AI summary + tags |
| GET | `/notes/` | List all notes |
| DELETE | `/notes/{id}` | Delete note |
| POST | `/notes/search` | Semantic vector search |
| POST | `/notes/upload` | Upload file/image with OCR |

### Quiz & Review

| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz/generate` | Generate AI quiz for note |
| POST | `/quiz/submit` | Submit answer |
| GET | `/review/due` | Get due reviews |
| POST | `/review/complete` | Complete review (adaptive scheduling) |

### AI Agent

| Method | Endpoint | Description |
|---|---|---|
| POST | `/agent/ask` | RAG-powered Q&A |
| GET | `/agent/today` | Today's learning plan |
| GET | `/agent/quiz` | Auto-generate quiz for due notes |
| POST | `/agent/memory-twin` | Memory Twin AI chat |
| POST | `/agent/summarize` | Auto-summarize unsaved notes |
| GET | `/agent/connections` | Discover related notes |
| GET | `/agent/memory-strength` | Per-topic memory strengths |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/dashboard` | Full dashboard with strengths + weekly |

### Tasks, Goals, Habits

| Method | Endpoint | Description |
|---|---|---|
| CRUD | `/tasks/` | Task management |
| CRUD | `/goals/` | Goal tracking with progress |
| CRUD | `/habits/` | Habit tracking with streaks |

### Timeline & Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/timeline/` | Activity feed |
| GET | `/summary/daily` | Daily summary |
| GET | `/summary/weekly` | Weekly AI summary |

---

## 🐳 Docker Deployment

```bash
# Build and run (single Dockerfile builds frontend + backend)
docker build -t mnemosphere .
docker run -p 8000:8000 --env-file .env mnemosphere
```

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link
railway login
railway link

# Deploy
railway up
```

---

## ✅ Requirements Checklist

| Requirement | Status | Implementation |
|---|---|---|
| Individual project (unique topic) | ✅ | Memory Twin AI — no duplicate topic |
| Programming language | ✅ | Python 3.12 (backend) + JavaScript (frontend) |
| Prompt Engineering | ✅ | 7 prompt strategies: persona, RAG, JSON mode, zero-shot, multi-modal |
| LLM API (Groq/Gemini) | ✅ | Groq LLaMA 3.3-70B + Gemini 2.0 Flash fallback |
| Database (Vector DB) | ✅ | SQLite + FAISS vector store (2048-dim embeddings) |
| Web framework | ✅ | FastAPI + React 18 (Vite) |
| Frontend (HTML/CSS/JS/TS) | ✅ | React + JSX + CSS + JavaScript |
| Deployment (AWS/Azure/Docker) | ✅ | Docker + Railway (production live) |
| GitHub Repository | ✅ | [github.com/SudalaiEswari/MnemoSphere](https://github.com/SudalaiEswari/MnemoSphere) |
| Documentation | ✅ | Architecture, Requirements, User Guide |

---

## 📚 Documentation

- [Architecture Overview](Documents/Architecture.md)
- [Requirements Document](Documents/Requirements.md)
- [User Guide](Documents/UserGuide.md)

---

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Python web framework |
| [React](https://react.dev) | Frontend UI library |
| [Vite](https://vitejs.dev) | Frontend build tool |
| [SQLite](https://sqlite.org) | Primary database |
| [FAISS](https://faiss.ai) | Vector similarity search |
| [Groq](https://groq.com) | LLM inference API |
| [Docker](https://docker.com) | Containerization |
| [Railway](https://railway.app) | Deployment platform |

---

## 👤 Developer

**Sudalai Eswari S**  
Project developed as part of academic coursework.

---

## 📝 License

This project is developed for academic purposes.
