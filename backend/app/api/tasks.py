from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/")
async def create_task(token: str, title: str, description: str = "", category: str = "general", priority: str = "medium", deadline: str = ""):
    user_id = _get_user_id(token)
    doc = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "category": category,
        "priority": priority,
        "deadline": datetime.fromisoformat(deadline) if deadline else None,
        "status": "pending",
        "created_at": datetime.now(),
        "completed_at": None,
    }
    task_id = await db.insert_one("tasks", doc)
    return {"id": task_id, "message": "Task created"}


@router.get("/")
async def list_tasks(token: str, status: str = ""):
    user_id = _get_user_id(token)
    if status:
        docs = await db.find("tasks", {"user_id": user_id, "status": status}, sort=("created_at", -1))
    else:
        docs = await db.find("tasks", {"user_id": user_id}, sort=("created_at", -1))
    return [
        {
            "id": d["id"],
            "title": d["title"],
            "description": d.get("description", ""),
            "category": d.get("category", "general"),
            "priority": d.get("priority", "medium"),
            "deadline": d.get("deadline").isoformat() if d.get("deadline") else None,
            "status": d.get("status", "pending"),
            "created_at": d["created_at"].isoformat(),
            "completed_at": d.get("completed_at").isoformat() if d.get("completed_at") else None,
        }
        for d in docs
    ]


@router.put("/{task_id}")
async def update_task(task_id: str, token: str, status: str = "", title: str = "", priority: str = ""):
    user_id = _get_user_id(token)
    doc = await db.find_one("tasks", {"id": task_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Task not found")
    update = {}
    if status:
        update["status"] = status
        if status == "completed":
            update["completed_at"] = datetime.now()
    if title:
        update["title"] = title
    if priority:
        update["priority"] = priority
    await db.update_one("tasks", {"id": task_id}, {"$set": update})
    return {"message": "Updated"}


@router.delete("/{task_id}")
async def delete_task(task_id: str, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("tasks", {"id": task_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Task not found")
    await db.delete_one("tasks", {"id": task_id})
    return {"message": "Deleted"}
