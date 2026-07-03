from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter(prefix="/goals", tags=["Goals"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/")
async def create_goal(token: str, title: str, description: str = "", category: str = "general", target_date: str = ""):
    user_id = _get_user_id(token)
    doc = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "category": category,
        "target_date": datetime.fromisoformat(target_date) if target_date else None,
        "status": "active",
        "progress": 0.0,
        "created_at": datetime.now(),
        "completed_at": None,
    }
    goal_id = await db.insert_one("goals", doc)
    return {"id": goal_id, "message": "Goal created"}


@router.get("/")
async def list_goals(token: str, status: str = ""):
    user_id = _get_user_id(token)
    filter_dict = {"user_id": user_id}
    if status:
        filter_dict["status"] = status
    docs = await db.find("goals", filter_dict, sort=("created_at", -1))
    return [
        {
            "id": d["id"],
            "title": d["title"],
            "description": d.get("description", ""),
            "category": d.get("category", "general"),
            "target_date": d.get("target_date").isoformat() if d.get("target_date") else None,
            "status": d.get("status", "active"),
            "progress": d.get("progress", 0.0),
            "created_at": d["created_at"].isoformat(),
            "completed_at": d.get("completed_at").isoformat() if d.get("completed_at") else None,
        }
        for d in docs
    ]


@router.put("/{goal_id}")
async def update_goal(goal_id: str, token: str, title: str = "", description: str = "", progress: float = -1, status: str = ""):
    user_id = _get_user_id(token)
    doc = await db.find_one("goals", {"id": goal_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Goal not found")
    update = {}
    if title:
        update["title"] = title
    if description:
        update["description"] = description
    if progress >= 0:
        update["progress"] = min(progress, 100.0)
        if update["progress"] >= 100:
            update["status"] = "completed"
            update["completed_at"] = datetime.now()
    if status:
        update["status"] = status
        if status == "completed":
            update["completed_at"] = datetime.now()
    await db.update_one("goals", {"id": goal_id}, {"$set": update})
    return {"message": "Updated"}


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("goals", {"id": goal_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Goal not found")
    await db.delete_one("goals", {"id": goal_id})
    return {"message": "Deleted"}