from fastapi import APIRouter, HTTPException
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.database import db
from app.models.user import UserCreate, UserLogin, UserResponse
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(user: UserCreate):
    existing = await db.find_one("users", {"email": user.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    doc = {
        "email": user.email,
        "name": user.name,
        "hashed_password": hash_password(user.password),
        "created_at": datetime.now(),
        "memory_score": 0.0,
        "topics": [],
    }
    user_id = await db.insert_one("users", doc)
    token = create_access_token({"sub": user_id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": user_id}


@router.post("/login")
async def login(user: UserLogin):
    doc = await db.find_one("users", {"email": user.email})
    if not doc or not verify_password(user.password, doc["hashed_password"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": doc["id"], "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": doc["id"]}


@router.get("/me")
async def get_me(token: str):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    doc = await db.find_one("users", {"id": payload["sub"]})
    if not doc:
        raise HTTPException(404, "User not found")
    return UserResponse(id=doc["id"], email=doc["email"], name=doc["name"], created_at=doc["created_at"], memory_score=doc.get("memory_score", 0.0))
