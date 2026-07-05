from datetime import datetime, timedelta
from app.core.config import settings


BASE_INTERVALS = [0, 1, 3, 7, 14, 30]


def calculate_next_review(stage: int, score: float = None) -> datetime:
    if score is not None and score < 0.4:
        effective_stage = max(0, stage - 1)
    elif score is not None and score >= 0.9:
        effective_stage = min(stage + 2, len(BASE_INTERVALS) - 1)
    else:
        effective_stage = stage
    if effective_stage >= len(BASE_INTERVALS):
        return datetime.max
    days = BASE_INTERVALS[effective_stage]
    if score is not None and score >= 0.7:
        days = int(days * 1.2)
    elif score is not None and score < 0.4:
        days = max(1, int(days * 0.5))
    return datetime.now() + timedelta(days=days)


def get_notes_due(notes: list[dict]) -> list[dict]:
    now = datetime.now()
    return [n for n in notes if n.get("next_review") and n["next_review"] <= now]


def advance_stage(current_stage: int, score: float) -> int:
    if score >= 0.85:
        return min(current_stage + 2, len(BASE_INTERVALS) - 1)
    elif score >= 0.6:
        return min(current_stage + 1, len(BASE_INTERVALS) - 1)
    elif score >= 0.4:
        return current_stage
    return max(0, current_stage - 1)
