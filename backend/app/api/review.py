from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.services.scheduler import get_notes_due, calculate_next_review, advance_stage
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter(prefix="/review", tags=["Review"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.get("/due")
async def get_due_reviews(token: str):
    user_id = _get_user_id(token)
    notes = await db.find("notes", {"user_id": user_id})
    due = get_notes_due(notes)
    return [
        {
            "id": n["id"],
            "title": n["title"],
            "summary": n.get("summary"),
            "stage": n.get("review_stage", 0),
            "next_review": n.get("next_review").isoformat() if n.get("next_review") else None,
        }
        for n in due
    ]


@router.post("/complete")
async def complete_review(note_id: str, score: float, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("notes", {"id": note_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Note not found")
    current_stage = doc.get("review_stage", 0) or 0
    new_stage = advance_stage(current_stage, score)
    next_review = calculate_next_review(new_stage) if new_stage < len(settings.REVIEW_INTERVALS_DAYS) else None
    await db.update_one("notes", {"id": note_id}, {
        "$set": {
            "review_stage": new_stage,
            "next_review": next_review,
            "last_reviewed": datetime.now(),
        },
        "$inc": {"review_count": 1},
    })
    await db.insert_one("review_logs", {
        "user_id": user_id,
        "note_id": note_id,
        "stage": current_stage,
        "score": score,
        "completed": 1,
        "created_at": datetime.now(),
    })
    return {
        "message": "Review complete",
        "new_stage": new_stage,
        "next_review": next_review.isoformat() if next_review else None,
    }
