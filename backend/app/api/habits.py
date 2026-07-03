from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime, date

router = APIRouter(prefix="/habits", tags=["Habits"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/")
async def create_habit(token: str, name: str, description: str = "", frequency: str = "daily", category: str = "general"):
    user_id = _get_user_id(token)
    doc = {
        "user_id": user_id,
        "name": name,
        "description": description,
        "frequency": frequency,
        "category": category,
        "streak": 0,
        "longest_streak": 0,
        "created_at": datetime.now(),
    }
    habit_id = await db.insert_one("habits", doc)
    return {"id": habit_id, "message": "Habit created"}


@router.get("/")
async def list_habits(token: str):
    user_id = _get_user_id(token)
    docs = await db.find("habits", {"user_id": user_id}, sort=("created_at", -1))
    today = date.today().isoformat()
    results = []
    for d in docs:
        logs = await db.find("habit_logs", {"habit_id": d["id"], "user_id": user_id}, sort=("date", -1))
        today_done = any(
            l.get("date").isoformat()[:10] == today if hasattr(l.get("date"), "isoformat") else str(l.get("date"))[:10] == today
            for l in logs
        ) if logs else False
        results.append({
            "id": d["id"],
            "name": d["name"],
            "description": d.get("description", ""),
            "frequency": d.get("frequency", "daily"),
            "category": d.get("category", "general"),
            "streak": d.get("streak", 0),
            "longest_streak": d.get("longest_streak", 0),
            "today_done": today_done,
            "created_at": d["created_at"].isoformat(),
        })
    return results


@router.post("/{habit_id}/checkin")
async def checkin_habit(habit_id: str, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("habits", {"id": habit_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Habit not found")
    today = date.today()
    today_str = today.isoformat()
    existing = await db.find("habit_logs", {"habit_id": habit_id, "user_id": user_id})
    already_done = any(
        l.get("date").isoformat()[:10] == today_str if hasattr(l.get("date"), "isoformat") else str(l.get("date"))[:10] == today_str
        for l in existing
    ) if existing else False
    if already_done:
        return {"message": "Already checked in today", "streak": doc.get("streak", 0)}
    log = {
        "user_id": user_id,
        "habit_id": habit_id,
        "date": today,
        "completed": 1,
        "created_at": datetime.now(),
    }
    await db.insert_one("habit_logs", log)
    streak = doc.get("streak", 0) + 1
    longest = max(streak, doc.get("longest_streak", 0))
    await db.update_one("habits", {"id": habit_id}, {"$set": {"streak": streak, "longest_streak": longest}})
    return {"message": "Checked in", "streak": streak}


@router.delete("/{habit_id}")
async def delete_habit(habit_id: str, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("habits", {"id": habit_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Habit not found")
    await db.delete_one("habits", {"id": habit_id})
    await db.delete_one("habit_logs", {"habit_id": habit_id})
    return {"message": "Deleted"}