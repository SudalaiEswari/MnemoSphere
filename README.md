# 🧠 MnemoSphere

**AI-Powered Personal Memory Assistant — 1-3-7 Spaced Repetition Learning System**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-000000?style=for-the-badge&logo=groq)](https://groq.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![FAISS](https://img.shields.io/badge/FAISS-Vector_DB-16A34A?style=for-the-badge&logo=facebook)](https://faiss.ai)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)

> **MnemoSphere** is an intelligent memory assistant that combines AI, Retrieval-Augmented Generation, and the scientifically proven 1-3-7 spaced repetition method to help you retain knowledge and never forget what matters.

---

## 📑 Table of Contents

- [🎯 Key Features](#-key-features)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [🧠 AI Pipeline](#-ai-pipeline)
- [📅 1-3-7 Review System](#-1-3-7-review-system)
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
| 🤖 **AI Summarization** | Automatically generates concise summaries from notes, PDFs, and text |
| 📝 **Smart Notes** | Upload text, voice transcripts, or images — AI organizes and tags content |
| 🎯 **Personalized Quizzes** | AI generates multiple-choice questions based on your learning history |
| 📅 **1-3-7 Scheduler** | Automatic review reminders after 1, 3, and 7 days |
| 📊 **Memory Analytics** | Track memory score, topic mastery, and revision progress |
| 🔍 **Semantic Search** | Find past knowledge using natural language queries |
| 🎚️ **Adaptive Difficulty** | Questions adapt based on your performance — harder when you're strong, easier when you struggle |
| 🐳 **Docker Ready** | One-command deployment with Docker Compose |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     🌐 REACT FRONTEND                        │
│              (Vite · React Router · Axios)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────────────┐
│                    ⚡ FASTAPI BACKEND                         │
│                       (Python 3.12)                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Auth    │  │  Notes   │  │  Quiz    │  │   Review    │  │
│  │  API     │  │  API     │  │  API     │  │   API       │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       │             │             │               │          │
│  ┌────▼─────────────▼─────────────▼───────────────▼──────┐   │
│  │                   SERVICES LAYER                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │   │
│  │  │   LLM    │  │  Vector  │  │   Scheduler      │    │   │
│  │  │  Service │  │  Store   │  │   (1-3-7)        │    │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────────────┘    │   │
│  └───────┼─────────────┼─────────────────────────────────┘   │
│          │             │                                      │
└──────────┼─────────────┼──────────────────────────────────────┘
           │             │
     ┌─────▼─────┐  ┌───▼─────┐
     │  MongoDB  │  │  FAISS  │
     │ (Primary) │  │(Vector) │
     └───────────┘  └─────────┘
           │
     ┌─────▼─────┐
     │   Groq    │
     │   LLM     │
     │  (LLaMA)  │
     └───────────┘
```

### Data Flow

1. User uploads note text via React frontend
2. FastAPI stores content in MongoDB
3. LLM Service generates summary using Groq API
4. Embedding is generated and stored in FAISS vector DB
5. Scheduler calculates next review date (1/3/7 days)
6. Review page fetches due notes and generates AI quiz
7. User answers quiz → score updates analytics

---

## 🧠 AI Pipeline

### Prompt Engineering Strategy

| Task | Prompt Technique | Example |
|---|---|---|
| **Summarization** | Zero-shot with role instruction | *"You are a memory assistant. Summarize in 3 bullet points for spaced repetition."* |
| **Quiz Generation** | Structured output (JSON mode) | *"Return JSON: {question, options[], correct_answer, explanation}"* |
| **Adaptive Review** | Dynamic context injection | *"User scored X% on [topic]. Generate 2 questions targeting weak areas."* |
| **Explanation** | Level-adjusted prompting | *"Explain in simple language with analogies."* |

### LLM Integration

- **Provider:** Groq (free tier, fast inference)
- **Model:** LLaMA 3.3-70B Versatile
- **Fallback:** Google Gemini 2.0 Flash
- **Rate limiting:** Built-in retry with exponential backoff

---

## 📅 1-3-7 Review System

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
                    ┌────────▼─────────┐
                    │   Review Day 1   │
                    │   ┌───────────┐  │
                    │   │ AI Quiz   │  │
                    │   │ Score ≥70%│──┼─────► Stage 1 (Review in 3d)
                    │   │ Score <70%│──┼─────► Stage 0 (Retry in 1d)
                    │   └───────────┘  │
                    └──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Review Day 3   │
                    │   Score ≥70% ────┼─────► Stage 2 (Review in 7d)
                    │   Score <70% ────┼─────► Stage 1 (Retry in 3d)
                    └──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Review Day 7   │
                    │   Score ≥70% ────┼─────► ✓ MASTERED
                    │   Score <70% ────┼─────► Stage 2 (Retry in 7d)
                    └──────────────────┘
```

---

## 📁 Project Structure

```
MnemoSphere/
│
├── backend/
│   ├── app/
│   │   ├── main.py                 FastAPI entry point
│   │   ├── api/                    REST API routes
│   │   │   ├── auth.py            POST /register, /login
│   │   │   ├── notes.py           CRUD notes + search
│   │   │   ├── quiz.py            Generate + submit quizzes
│   │   │   ├── review.py          1-3-7 review management
│   │   │   └── analytics.py       Memory score + progress
│   │   ├── core/
│   │   │   ├── config.py          Environment configuration
│   │   │   └── security.py        JWT + password hashing
│   │   ├── models/                Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── note.py
│   │   │   └── review.py
│   │   └── services/
│   │       ├── llm_service.py     Groq/Gemini integration
│   │       ├── vector_store.py    FAISS semantic search
│   │       └── scheduler.py       1-3-7 logic
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               Router + layout
│   │   ├── index.css             Styling
│   │   └── pages/
│   │       ├── Home.jsx          Landing + auth
│   │       ├── Dashboard.jsx     Overview
│   │       ├── Notes.jsx         Create + list + search
│   │       ├── Review.jsx        1-3-7 review flow
│   │       └── Analytics.jsx     Memory stats
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── Documents/
│   ├── Architecture.md
│   ├── Requirements.md
│   └── UserGuide.md
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
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Groq API key ([get free key](https://console.groq.com))

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd MnemoSphere
cp .env.example .env
# Edit .env: add GROQ_API_KEY and MONGODB_URL
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
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB_NAME` | `mnemosphere` | Database name |
| `GROQ_API_KEY` | — | Groq API key (get at console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model name |
| `LLM_PROVIDER` | `groq` | LLM provider (`groq` or `gemini`) |
| `JWT_SECRET` | — | Secret key for JWT tokens |
| `VECTOR_DB_PATH` | `./data/vector_store` | FAISS index storage path |
| `DEBUG` | `True` | Enable debug mode |

---

## 📖 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Sign in |
| GET | `/auth/me` | Get current user |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/notes/` | Create note |
| GET | `/notes/` | List all notes |
| DELETE | `/notes/{id}` | Delete note |
| POST | `/notes/search` | Semantic search |

### Quiz & Review

| Method | Endpoint | Description |
|---|---|---|
| POST | `/quiz/generate` | Generate AI quiz |
| POST | `/quiz/submit` | Submit answer |
| GET | `/review/due` | Get due reviews |
| POST | `/review/complete` | Complete review |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/dashboard` | Get dashboard stats |

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Individual services
docker-compose up backend
docker-compose up frontend
docker-compose up mongodb

# Stop
docker-compose down
```

### Deploy to Railway

1. Push code to GitHub
2. Create account at [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Add environment variables from `.env.example`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

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
| [MongoDB](https://mongodb.com) | Primary database |
| [FAISS](https://faiss.ai) | Vector similarity search |
| [Groq](https://groq.com) | LLM inference API |
| [Docker](https://docker.com) | Containerization |

---

## 📝 License

This project is developed as part of an academic project.
