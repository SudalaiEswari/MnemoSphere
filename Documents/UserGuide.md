# MnemoSphere — User Guide

## Getting Started

### 1. Create an Account
1. Open MnemoSphere in your browser: [https://api-production-3196.up.railway.app](https://api-production-3196.up.railway.app)
2. Enter your email and password
3. Click **Sign In** or **Create Account** if you're new
4. You'll be redirected to the Dashboard automatically

### 2. Add Your First Note
1. Navigate to **Notes** page from the navbar
2. Enter a **Title** (e.g., "Python Basics")
3. Type or paste your **Content** in the text area
4. Add **Tags** (e.g., "python, programming")
5. Click **Save Note**
6. The AI will automatically generate a summary, categorize the note, and add relevant tags

### 3. Review Notes (Adaptive 1-3-7 Method)
1. Navigate to **Review** page
2. See all notes due for review with their current stage
3. Click a note to start the review session
4. Read the note summary, then click **Start Quiz**
5. Answer AI-generated multiple-choice questions
6. Score ≥ 85% → skip ahead 2 stages (reviews spaced further apart)
7. Score ≥ 60% → advance 1 stage
8. Score < 40% → go back 1 stage (review sooner)
9. After all stages complete, the note is **Mastered**

### 4. Chat with Memory Twin AI
1. Navigate to **AI Assistant** page
2. Choose between two modes:
   - **RAG Chat** — Ask questions and the AI searches your notes for the answer
   - **Memory Twin** — The AI knows your knowledge profile and gives personalized advice
3. Type your question or tap the 🎤 microphone to speak
4. The AI responds with answers based on your notes

**Example questions:**
- "What did I learn about ESP32?"
- "What should I review today?"
- "What do I keep forgetting?"
- "Connect my related notes"
- "Explain my weakest topic"
- "Create a quiz for me"

### 5. Use the Dashboard
The Dashboard is your command center:

| Section | What It Shows |
|---|---|
| **Stats Grid** | Total notes, reviews done, memory score %, streak days, reviews due, weekly reviews |
| **Today's Plan** | AI Agent's personalized recommendations for what to study |
| **Weekly Chart** | Bar chart of reviews completed each day (Mon–Sun) |
| **Memory Strength** | Per-topic retention scores with color coding (green ≥ 70%, yellow ≥ 40%, red < 40%) |
| **Needs Attention** | Weakest topics ranked by strength |
| **Keep Forgetting** | Notes you've failed quiz questions on most often |
| **Quick Actions** | Buttons to add note, chat with AI, start review, etc. |

### 6. Track Goals & Habits
1. Navigate to **Goals** to create and track goals with progress bars
2. Navigate to **Habits** to set daily habits and maintain streaks
3. Each habit shows current streak and longest streak

### 7. View Timeline
1. Navigate to **Timeline** to see chronological activity
2. Shows notes, tasks, reviews, and goals in one feed
3. Filter by type or scroll through history

### 8. Daily/Weekly Summaries
1. Navigate to **Summary** page
2. **Daily Summary:** Overview of what happened today
3. **Weekly Summary:** AI-generated insights about your learning patterns

### 9. Upload Files & Images
1. On the **Notes** page, click **Upload File**
2. Select an image (PNG, JPG, WebP)
3. The AI extracts text using OCR and creates a note automatically
4. Summary and categorization are generated automatically

### 10. Install as a Mobile App (PWA)
1. Open MnemoSphere in Chrome on Android or Safari on iOS
2. You'll see an install banner at the top — tap **Install**
3. Or use browser menu → **Add to Home Screen**
4. The app will install with the 🧠 icon and open in full-screen mode

## Tips for Best Results

- **Add notes regularly:** The more content you add, the better the AI adapts to your knowledge
- **Review daily:** Check the Review page each day for due items
- **Use tags:** Tag notes by topic for better analytics and memory strength tracking
- **Be detailed:** More content = better summaries and quizzes
- **Score honestly:** Answer quiz questions truthfully to help the AI identify your weak areas
- **Use voice input:** Speaking can be faster than typing for quick questions
- **Check Memory Twin daily:** The AI gives you a personalized study plan each day

## FAQ

**Q: What happens when I complete all review stages?**
A: The note is marked as "Mastered" and won't appear in review. You can re-review anytime by visiting the note.

**Q: How does the AI generate questions?**
A: The AI analyzes your note content and generates personalized questions using the Groq LLM. Questions adapt to your performance history.

**Q: What is "Memory Twin AI"?**
A: Memory Twin is MnemoSphere's unique AI agent. Unlike a normal chatbot, it tracks what you know, what you forget, and gives personalized learning recommendations based on your actual knowledge profile.

**Q: How is memory strength calculated?**
A: Memory strength per topic combines your review scores (40%), quiz accuracy (40%), and review stage (20%). Higher scores mean better retention.

**Q: Can I upload images?**
A: Yes! Upload images on the Notes page. The AI extracts text using OCR and creates a searchable note.

**Q: Is voice input supported?**
A: Yes. Tap the 🎤 microphone icon on the AI Assistant page to speak your question. Works on Chrome and Edge browsers.

**Q: Is my data private?**
A: Yes. Your notes are stored in your personal account. Only you can access them. API keys are stored server-side.

**Q: Can I install this on my phone?**
A: Yes. MnemoSphere is a Progressive Web App (PWA). Open in Chrome → "Add to Home Screen" to use it like a native app.

**Q: What if I don't have a Groq API key?**
A: The app works in "mock mode" with pre-defined responses. For full AI features (summaries, quizzes, Memory Twin), add your free Groq API key in Settings.
