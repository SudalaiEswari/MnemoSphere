from fastapi import APIRouter, HTTPException
from app.services.llm_service import llm
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter(prefix="/quiz", tags=["Quiz"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/generate")
async def generate_quiz(note_id: str, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("notes", {"id": note_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Note not found")
    score = min((doc.get("review_count", 0) or 0) * 20, 100)
    content = doc["content"]
    if content.startswith("[") and content.endswith("]"):
        return {"questions": [], "note_title": doc["title"], "error": "No extractable text"}
    questions = await llm.generate_personalized_quiz(content[:3000], score, [])
    if not questions:
        try:
            single = await llm.generate_quiz(content[:2000])
            if single and "question" in single:
                questions = [single]
        except:
            pass
    return {"questions": questions, "note_title": doc["title"]}


@router.post("/submit")
async def submit_answer(note_id: str, question: str, user_answer: str, correct_answer: str, is_correct: bool, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("notes", {"id": note_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Note not found")
    await db.insert_one("quiz_logs", {
        "user_id": user_id,
        "note_id": note_id,
        "question": question,
        "user_answer": user_answer,
        "correct_answer": correct_answer,
        "is_correct": 1 if is_correct else 0,
        "timestamp": datetime.now(),
    })
    return {"message": "Logged", "is_correct": is_correct}
