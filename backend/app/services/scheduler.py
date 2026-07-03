from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings


def calculate_next_review(stage: int) -> datetime:
    if stage >= len(settings.REVIEW_INTERVALS_DAYS):
        return datetime.max
    days = settings.REVIEW_INTERVALS_DAYS[stage]
    return datetime.now() + timedelta(days=days)


def get_notes_due(notes: list[dict]) -> list[dict]:
    now = datetime.now()
    return [n for n in notes if n.get("next_review") and n["next_review"] <= now]


def advance_stage(current_stage: int, score: float) -> int:
    if score >= 0.7:
        return current_stage + 1
    elif score >= 0.4:
        return current_stage
    return max(0, current_stage - 1)
