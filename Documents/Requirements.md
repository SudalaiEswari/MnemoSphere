# MnemoSphere — Requirements Document

## 1. Functional Requirements

### FR-01: User Registration & Authentication
- Users shall register with email, name, and password
- Users shall login with email and password
- JWT tokens shall be used for session management (24-hour expiry)
- Passwords shall be hashed using bcrypt

### FR-02: Note Management
- Users shall create notes with title, content, and tags
- Users shall view all their notes sorted by creation date
- Users shall delete notes
- AI shall auto-generate summaries for each new note
- AI shall auto-categorize notes (study, work, personal, health, etc.)
- AI shall auto-generate relevant tags

### FR-03: AI Summarization
- System shall generate AI summaries for each new note
- Summaries shall be concise (3 bullet points)
- Users can trigger re-summarization via the agent

### FR-04: Quiz Generation
- System shall generate multiple-choice questions from note content
- Questions shall be personalized based on user performance
- Each question shall have 4 options, correct answer, and explanation
- System shall support auto-quiz generation for due reviews

### FR-05: Adaptive 1-3-7 Review Scheduling
- New notes shall be scheduled for review
- Review intervals: 1, 3, 7, 14, 30 days
- Score ≥ 0.85 → advance 2 stages (skip ahead)
- Score ≥ 0.60 → advance 1 stage
- Score 0.40–0.60 → stay at current stage
- Score < 0.40 → go back 1 stage
- Strong performance (≥ 0.7) → interval multiplied by 1.2x
- Weak performance (< 0.4) → interval multiplied by 0.5x

### FR-06: Analytics Dashboard
- Display total notes count
- Display total reviews completed
- Display overall memory score percentage
- Display per-topic memory strength with bar chart
- Display weakest topics (bottom 5)
- Display weekly review bar chart (Mon–Sun)
- Display learning streak (consecutive days)
- Display forgotten notes (most frequently failed in quizzes)
- Display reviews due count

### FR-07: Semantic Search (RAG)
- Users shall search notes using natural language queries
- FAISS vector similarity shall rank search results
- System shall retrieve top-8 relevant notes
- LLM shall generate answer from retrieved context

### FR-08: AI Agent
- Agent shall generate a personalized daily learning plan
- Agent shall auto-generate quizzes for due reviews
- Agent shall answer questions using RAG (vector search + LLM)
- Agent shall act as "Memory Twin" — personal knowledge companion
- Agent shall discover related notes by semantic similarity
- Agent shall auto-summarize new unsaved notes

### FR-09: Voice Input
- Users shall input questions using speech
- Web Speech API shall transcribe speech to text
- Transcribed text shall be sent to AI agent for response

### FR-10: Goals & Habits
- Users shall create goals with title, description, category, and target date
- Goals shall track progress percentage
- Users shall create daily habits
- Habits shall track streaks and longest streaks

### FR-11: File Upload & OCR
- Users shall upload images (PNG, JPG, WebP)
- System shall extract text from images using Groq Vision API
- Extracted text shall be saved as a note with AI summary

### FR-12: Timeline
- System shall display chronological activity feed
- Feed shall include notes, tasks, reviews, and goals
- Items shall be sorted by date (newest first)

### FR-13: Daily/Weekly Summaries
- System shall provide daily summary (notes created, tasks, reviews due)
- System shall provide weekly AI summary (trends, top topics, progress)

### FR-14: PWA Support
- Application shall be installable as a mobile app
- Service worker shall cache static assets
- Manifest shall provide app name, icons, and theme color

## 2. Non-Functional Requirements

### NFR-01: Performance
- API response time shall be < 500ms for standard requests
- LLM queries may take up to 5 seconds
- Vector search shall complete in < 100ms
- Frontend bundle size shall be < 300KB gzipped

### NFR-02: Scalability
- System shall support up to 100 concurrent users
- Database shall handle up to 10,000 notes per user
- FAISS index shall handle up to 100,000 vectors

### NFR-03: Security
- Passwords shall be hashed using bcrypt
- JWT tokens shall expire after 24 hours
- API keys shall not be exposed to frontend
- SQL injection prevented via parameterized queries
- CORS shall restrict unauthorized origins

### NFR-04: Availability
- Application shall be deployed on Railway (production)
- Docker container shall auto-restart on failure
- Static files shall be served directly by backend

### NFR-05: Usability
- Interface shall be responsive (mobile + desktop)
- Dark theme with proper contrast
- Navigation shall require ≤ 3 clicks for any action
- Loading states shall be displayed during API calls

## 3. Technology Stack Requirements

| Requirement | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Frontend Language | JavaScript (JSX) |
| Backend Framework | FastAPI (Python 3.12) |
| Database | SQLite 3 |
| Vector Database | FAISS (2048-dim, IndexFlatIP) |
| Embedding Method | TF-IDF + char n-gram |
| LLM API | Groq (LLaMA 3.3-70B) |
| LLM Fallback | Google Gemini 2.0 Flash |
| Authentication | JWT (HS256) + bcrypt |
| Voice Input | Web Speech API |
| PWA | Service Worker + Manifest |
| Deployment | Docker + Railway |
| Containerization | Docker (multi-stage build) |

## 4. API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Sign in |
| POST | /notes/ | Yes | Create note |
| GET | /notes/ | Yes | List notes |
| DELETE | /notes/{id} | Yes | Delete note |
| POST | /notes/search | Yes | Semantic search |
| POST | /notes/upload | Yes | Upload file/image |
| POST | /quiz/generate | Yes | Generate quiz |
| POST | /quiz/submit | Yes | Submit answer |
| GET | /review/due | Yes | Get due reviews |
| POST | /review/complete | Yes | Complete review |
| POST | /agent/ask | Yes | RAG Q&A |
| GET | /agent/today | Yes | Today's plan |
| GET | /agent/quiz | Yes | Auto quiz |
| POST | /agent/memory-twin | Yes | Memory Twin chat |
| POST | /agent/summarize | Yes | Auto summarize |
| GET | /agent/connections | Yes | Note connections |
| GET | /agent/memory-strength | Yes | Topic strengths |
| GET | /analytics/dashboard | Yes | Full dashboard |
| GET | /timeline/ | Yes | Activity feed |
| GET | /summary/daily | Yes | Daily summary |
| GET | /summary/weekly | Yes | Weekly AI summary |
| CRUD | /tasks/ | Yes | Task management |
| CRUD | /goals/ | Yes | Goal tracking |
| CRUD | /habits/ | Yes | Habit tracking |
