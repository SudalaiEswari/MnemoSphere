from fastapi import APIRouter, HTTPException
from app.models.review import AnalyticsResponse
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.get("/dashboard")
async def get_dashboard(token: str):
    user_id = _get_user_id(token)
    total_notes = await db.count_documents("notes", {"user_id": user_id})
    total_reviews = await db.count_documents("review_logs", {"user_id": user_id})

    review_logs = await db.find("review_logs", {"user_id": user_id})
    scores = [r.get("score", 0) or 0 for r in review_logs]
    memory_score = (sum(scores) / len(scores) * 100) if scores else 0

    notes = await db.find("notes", {"user_id": user_id})
    reviews_due = 0
    all_tags = []
    now = datetime.now()
    for n in notes:
        all_tags.extend(n.get("tags", []) or [])
        nr = n.get("next_review")
        if nr and nr <= now:
            reviews_due += 1

    topic_counts = {}
    for t in all_tags:
        topic_counts[t] = topic_counts.get(t, 0) + 1
    mastered = [t for t, c in topic_counts.items() if c >= 3]
    struggling = [t for t, c in topic_counts.items() if c == 1]

    return AnalyticsResponse(
        total_notes=total_notes,
        total_reviews=total_reviews,
        memory_score=round(memory_score, 1),
        topics_mastered=mastered,
        topics_struggling=struggling,
        reviews_due=reviews_due,
        streak_days=total_reviews,
    )
