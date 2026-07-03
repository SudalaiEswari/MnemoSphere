# MnemoSphere — Requirements Document

## 1. Functional Requirements

### FR-01: User Registration & Authentication
- Users shall register with email, name, and password
- Users shall login with email and password
- JWT tokens shall be used for session management

### FR-02: Note Management
- Users shall create notes with title, content, and tags
- Users shall view all their notes
- Users shall delete notes
- Users shall search notes using natural language

### FR-03: AI Summarization
- System shall generate AI summaries for each new note
- Summaries shall be concise (3 bullet points)

### FR-04: Quiz Generation
- System shall generate multiple-choice questions from note content
- Questions shall be personalized based on user performance
- Each question shall have 4 options, correct answer, and explanation

### FR-05: 1-3-7 Review Scheduling
- New notes shall be scheduled for review after 1 day
- Stage 1 review shall schedule next review after 3 days
- Stage 2 review shall schedule next review after 7 days
- Stage 3 shall mark as mastered

### FR-06: Adaptive Review
- Score ≥ 70% advances to next stage
- Score 40-69% stays at current stage
- Score < 40% goes back one stage

### FR-07: Analytics Dashboard
- Display total notes count
- Display total reviews completed
- Display memory score percentage
- Display topics mastered and struggling
- Display reviews due count

### FR-08: Semantic Search
- Users shall search notes using natural language queries
- FAISS vector similarity shall rank search results

## 2. Non-Functional Requirements

### NFR-01: Performance
- API response time shall be < 2 seconds for standard requests
- LLM queries may take up to 5 seconds

### NFR-02: Scalability
- System shall support up to 100 concurrent users
- Database shall handle up to 10,000 notes per user

### NFR-03: Security
- Passwords shall be hashed using bcrypt
- JWT tokens shall expire after 24 hours
- API keys shall not be exposed to frontend

### NFR-04: Availability
- System shall have 99% uptime during business hours
- Docker containers shall auto-restart on failure

### NFR-05: Usability
- Interface shall be responsive (mobile + desktop)
- Navigation shall require ≤ 3 clicks for any action

## 3. Technology Stack Requirements

| Requirement | Technology |
|---|---|
| Frontend Framework | React 18 |
| Backend Framework | FastAPI (Python 3.12) |
| Database | MongoDB 7 |
| Vector Database | FAISS |
| LLM API | Groq (LLaMA 3.3-70B) |
| Authentication | JWT + bcrypt |
| Deployment | Docker + Docker Compose |

## 4. API Endpoints

| Method | Endpoint | Auth Required |
|---|---|---|
| POST | /auth/register | No |
| POST | /auth/login | No |
| GET | /auth/me | Yes |
| POST | /notes/ | Yes |
| GET | /notes/ | Yes |
| DELETE | /notes/{id} | Yes |
| POST | /notes/search | Yes |
| POST | /quiz/generate | Yes |
| POST | /quiz/submit | Yes |
| GET | /review/due | Yes |
| POST | /review/complete | Yes |
| GET | /analytics/dashboard | Yes |
