from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime
    memory_score: float = 0.0


class UserInDB(BaseModel):
    id: str
    email: str
    name: str
    hashed_password: str
    created_at: datetime = datetime.now()
    memory_score: float = 0.0
    topics: list[str] = []
