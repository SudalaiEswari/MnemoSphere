from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter(prefix="/timeline", tags=["Timeline"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.get("/")
async def get_timeline(token: str, days: int = 30):
    user_id = _get_user_id(token)
    notes = await db.find("notes", {"user_id": user_id}, sort=("created_at", -1))
    tasks = await db.find("tasks", {"user_id": user_id}, sort=("created_at", -1))
    reviews = await db.find("review_logs", {"user_id": user_id}, sort=("created_at", -1))
    goals = await db.find("goals", {"user_id": user_id}, sort=("created_at", -1))

    items = []
    for n in notes:
        items.append({
            "type": "note",
            "id": n["id"],
            "title": n["title"],
            "description": n.get("summary", n["content"][:100]),
            "category": n.get("category", "general"),
            "tags": n.get("tags", []),
            "date": n["created_at"].isoformat() if hasattr(n["created_at"], "isoformat") else str(n["created_at"]),
        })
    for t in tasks:
        items.append({
            "type": "task",
            "id": t["id"],
            "title": t["title"],
            "description": t.get("description", ""),
            "category": t.get("category", "general"),
            "tags": [],
            "date": t["created_at"].isoformat() if hasattr(t["created_at"], "isoformat") else str(t["created_at"]),
        })
    for r in reviews:
        items.append({
            "type": "review",
            "id": r["id"],
            "title": f"Review (stage {r.get('stage', 0)}, score: {r.get('score', 0):.0%})",
            "description": "",
            "category": "review",
            "tags": [],
            "date": r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"]),
        })
    for g in goals:
        items.append({
            "type": "goal",
            "id": g["id"],
            "title": g["title"],
            "description": f"Progress: {g.get('progress', 0)}%",
            "category": g.get("category", "general"),
            "tags": [],
            "date": g["created_at"].isoformat() if hasattr(g["created_at"], "isoformat") else str(g["created_at"]),
        })

    items.sort(key=lambda x: x["date"], reverse=True)
    return items[:50]