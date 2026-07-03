from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.core.security import decode_access_token
from app.services.llm_service import llm
from datetime import datetime, timedelta

router = APIRouter(prefix="/summary", tags=["Summary"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.get("/daily")
async def daily_summary(token: str):
    user_id = _get_user_id(token)
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    notes_today = await db.find("notes", {"user_id": user_id})
    notes_today = [n for n in notes_today if n.get("created_at", today) >= today]
    tasks_today = await db.find("tasks", {"user_id": user_id})
    tasks_today = [t for t in tasks_today if t.get("created_at", today) >= today]
    tasks_due = [t for t in tasks_today if t.get("status") != "completed"]
    all_notes = await db.find("notes", {"user_id": user_id})
    reviews_due = sum(1 for n in all_notes if n.get("next_review") and n["next_review"] <= datetime.now())
    return {
        "date": today.isoformat(),
        "notes_created": len(notes_today),
        "tasks_created": len(tasks_today),
        "tasks_pending": len(tasks_due),
        "reviews_due": reviews_due,
        "total_notes": len(all_notes),
    }


@router.get("/weekly")
async def weekly_summary(token: str):
    user_id = _get_user_id(token)
    week_ago = datetime.now() - timedelta(days=7)
    all_notes = await db.find("notes", {"user_id": user_id})
    notes_week = [n for n in all_notes if n.get("created_at", week_ago) >= week_ago]
    all_tasks = await db.find("tasks", {"user_id": user_id})
    tasks_week = [t for t in all_tasks if t.get("created_at", week_ago) >= week_ago]
    reviews = await db.find("review_logs", {"user_id": user_id})
    reviews_week = [r for r in reviews if r.get("created_at", week_ago) >= week_ago]
    all_tags = []
    for n in notes_week:
        all_tags.extend(n.get("tags", []) or [])
    topic_counts = {}
    for t in all_tags:
        topic_counts[t] = topic_counts.get(t, 0) + 1
    top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    tasks_due = [t for t in all_tasks if t.get("status") != "completed"]
    reviews_due = sum(1 for n in all_notes if n.get("next_review") and n["next_review"] <= datetime.now())
    context = f"Weekly summary: {len(notes_week)} notes, {len(reviews_week)} reviews, {len(tasks_week)} tasks. Top topics: {', '.join(t[0] for t in top_topics)}"
    ai_summary = await llm.summarize(context)
    return {
        "week_start": week_ago.isoformat(),
        "notes_created": len(notes_week),
        "reviews_completed": len(reviews_week),
        "tasks_created": len(tasks_week),
        "tasks_pending": len(tasks_due),
        "reviews_due": reviews_due,
        "top_topics": [{"topic": t, "count": c} for t, c in top_topics],
        "ai_summary": ai_summary,
    }