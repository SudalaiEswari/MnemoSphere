import httpx
import json
from typing import Optional
from app.core.config import settings

SYSTEM_PROMPT = """You are MnemoSphere, an AI memory assistant. 
Your role is to help users retain information using spaced repetition.
Be concise, accurate, and adaptive to the user's learning level."""


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.groq_api_key = settings.GROQ_API_KEY
        self.groq_model = settings.GROQ_MODEL
        self._mock_mode = not self.groq_api_key

    async def _call_groq(self, messages: list[dict]) -> str:
        if self._mock_mode:
            return self._mock_response(messages)
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.groq_model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    def _mock_response(self, messages: list[dict]) -> str:
        user_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        if "summarize" in messages[0]["content"].lower() if messages else "":
            return "- Key concept from the content\n- Important detail to remember\n- Practical application or example"
        if "JSON" in messages[0]["content"] if messages else "":
            return json.dumps({
                "question": "What is the main topic of this content?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "This is a mock explanation. Set GROQ_API_KEY in .env for real AI responses.",
            })
        if "JSON array" in messages[0]["content"] if messages else "":
            return json.dumps([{
                "question": "What is the key takeaway?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct_answer": "Option 1",
                "explanation": "Mock explanation. Add GROQ_API_KEY for real AI.",
                "hint": "Review the main points of your note.",
            }])
        if "Answer based on this context" in messages[0]["content"] if messages else "":
            return "Based on your notes, here's what I found. Set GROQ_API_KEY in .env for real AI-powered answers."
        if "Explain" in messages[0]["content"] if messages else "":
            return "This is a mock explanation. Set GROQ_API_KEY in .env for real AI explanations."
        return "Mock AI response. Set GROQ_API_KEY in your .env file for real AI responses."

    async def summarize(self, content: str) -> str:
        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT} Summarize content in 3 concise bullet points for spaced repetition. Focus on key facts needing recall."},
            {"role": "user", "content": content},
        ]
        return await self._call_groq(messages)

    async def generate_quiz(self, content: str, difficulty: str = "medium") -> dict:
        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT} Generate a multiple-choice question. Return valid JSON with keys: question (str), options (list of 4 strings), correct_answer (str), explanation (str). Difficulty: {difficulty}."},
            {"role": "user", "content": content},
        ]
        raw = await self._call_groq(messages)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"question": raw, "options": ["True", "False"], "correct_answer": "True", "explanation": "Could not parse response"}

    async def generate_personalized_quiz(self, content: str, user_score: float, weak_topics: list[str]) -> list[dict]:
        topics_hint = f"Focus on: {', '.join(weak_topics)}" if weak_topics else ""
        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT} User score: {user_score}%. {topics_hint} Generate 2 multiple-choice questions targeting weak areas. Return a JSON array with objects containing: question, options, correct_answer, explanation, hint."},
            {"role": "user", "content": content},
        ]
        raw = await self._call_groq(messages)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return []

    async def explain(self, content: str, level: str = "simple") -> str:
        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT} Explain this concept in {level} language. Use analogies and examples."},
            {"role": "user", "content": content},
        ]
        return await self._call_groq(messages)

    async def chat(self, question: str, context: str) -> str:
        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT} Answer based on this context. If unsure, say so."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ]
        return await self._call_groq(messages)

    async def categorize(self, title: str, content: str, existing_tags: str) -> dict:
        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT} Categorize this note. Return valid JSON with keys: category (one of: study, work, personal, health, finance, technology, ideas, general), tags (array of 2-4 relevant keywords), suggested_summary (one sentence)."},
            {"role": "user", "content": f"Title: {title}\nContent: {content[:1000]}\nExisting tags: {existing_tags}"},
        ]
        raw = await self._call_groq(messages)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"category": "general", "tags": [], "suggested_summary": ""}

    async def analyze_image(self, base64_image: str) -> str:
        if self._mock_mode:
            return "Uploaded image. Set GROQ_API_KEY for AI-powered image analysis and text extraction."
        messages = [
            {"role": "user", "content": [
                {"type": "text", "text": "Extract all text from this image and describe what you see in detail."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
            ]},
        ]
        vision_model = "llama-3.2-11b-vision-preview"
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": vision_model,
                        "messages": messages,
                        "temperature": 0.3,
                        "max_tokens": 2048,
                    },
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                return f"[Could not analyze image: {str(e)}]"


llm = LLMService()
