from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str
    content: str
    source_type: str = "text"
    tags: list[str] = []


class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    summary: Optional[str] = None
    source_type: str
    tags: list[str]
    category: str = "general"
    created_at: datetime
    next_review: Optional[datetime] = None
    review_stage: int = 0


class NoteInDB(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    summary: Optional[str] = None
    embedding: Optional[list[float]] = None
    source_type: str
    tags: list[str]
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    next_review: Optional[datetime] = None
    review_stage: int = 0
    review_count: int = 0
    last_reviewed: Optional[datetime] = None
