from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.core.security import decode_access_token
from app.services.scheduler import BASE_INTERVALS
from app.services.memory_service import memory_service
from datetime import datetime, date

router = APIRouter(prefix="/reminders", tags=["Reminders"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.get("/smart")
async def get_smart_reminders(token: str):
    try:
        user_id = _get_user_id(token)
        now = datetime.now()
        today = date.today()
        reminders = []

        notes = await db.find("notes", {"user_id": user_id})

        due_notes = [n for n in notes if n.get("next_review") and n["next_review"] <= now]
        for n in due_notes:
            stage = n.get("review_stage", 0) or 0
            interval_days = BASE_INTERVALS[stage] if stage < len(BASE_INTERVALS) else 30
            reminders.append({
                "type": "review",
                "priority": "high" if stage <= 1 else "medium",
                "title": f"Review: {n['title']}",
                "body": f"Stage {stage}/4 — next review in {interval_days} days",
                "link": "/review",
                "note_id": n["id"],
            })

        tasks = await db.find("tasks", {"user_id": user_id, "status": "pending"})
        for t in tasks:
            if t.get("deadline") and t["deadline"] <= now:
                reminders.append({
                    "type": "task",
                    "priority": "high",
                    "title": f"Task: {t['title']}",
                    "body": "Overdue" if t["deadline"] < now else "Due today",
                    "link": "/tasks",
                    "task_id": t["id"],
                })

        habits = await db.find("habits", {"user_id": user_id})
        for h in habits:
            logs = await db.find("habit_logs", {"habit_id": h["id"], "user_id": user_id})
            today_str = today.isoformat()
            done_today = any(
                str(l.get("date", ""))[:10] == today_str
                for l in logs
            )
            if not done_today:
                reminders.append({
                    "type": "habit",
                    "priority": "medium",
                    "title": f"Habit: {h['name']}",
                    "body": f"Streak: {h.get('streak', 0)} days",
                    "link": "/habits",
                    "habit_id": h["id"],
                })

        goals = await db.find("goals", {"user_id": user_id, "status": "active"})
        for g in goals:
            if g.get("target_date"):
                target = g["target_date"]
                if isinstance(target, datetime):
                    target = target.date()
                remaining = (target - today).days
                if 0 <= remaining <= 7:
                    reminders.append({
                        "type": "goal",
                        "priority": "medium",
                        "title": f"Goal approaching: {g['title']}",
                        "body": f"{remaining} days left — {g.get('progress', 0)}% done",
                        "link": "/goals",
                        "goal_id": g["id"],
                    })

        try:
            streak = await memory_service.get_learning_streak(user_id)
            if streak and streak > 0 and streak % 7 == 0:
                reminders.append({
                    "type": "streak",
                    "priority": "low",
                    "title": f"{streak}-day streak!",
                    "body": "Keep reviewing daily!",
                    "link": "/dashboard",
                })
        except:
            pass

        try:
            topic_strengths = await memory_service.get_topic_strengths(user_id)
            weak_topics = {t: s for t, s in topic_strengths.items() if s < 40}
            for topic, score in sorted(weak_topics.items(), key=lambda x: x[1])[:3]:
                reminders.append({
                    "type": "memory",
                    "priority": "high",
                    "title": f"Memory weakening: {topic}",
                    "body": f"Strength at {score}%",
                    "link": f"/notes",
                    "topic": topic,
                })
        except:
            pass

        return sorted(reminders, key=lambda r: {"high": 0, "medium": 1, "low": 2}.get(r["priority"], 2))
    except Exception as e:
        raise HTTPException(500, str(e))
