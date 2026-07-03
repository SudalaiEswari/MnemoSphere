from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: str
    explanation: str


class QuizSubmit(BaseModel):
    note_id: str
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool


class ReviewSession(BaseModel):
    id: str
    user_id: str
    note_id: str
    stage: int
    score: float
    completed: bool
    created_at: datetime = datetime.now()


class AnalyticsResponse(BaseModel):
    total_notes: int
    total_reviews: int
    memory_score: float
    topics_mastered: list[str]
    topics_struggling: list[str]
    reviews_due: int
    streak_days: int
