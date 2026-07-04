from fastapi import APIRouter, HTTPException
from app.services.agent_service import agent_service
from app.services.memory_service import memory_service
from app.core.database import db
from app.core.security import decode_access_token

router = APIRouter(prefix="/agent", tags=["AI Agent"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/ask")
async def agent_ask(token: str, question: str):
    user_id = _get_user_id(token)
    return await agent_service.ask_with_rag(user_id, question)


@router.get("/today")
async def today_plan(token: str):
    user_id = _get_user_id(token)
    return await agent_service.get_today_plan(user_id)


@router.get("/quiz")
async def auto_quiz(token: str, note_id: str = None):
    user_id = _get_user_id(token)
    return await agent_service.auto_generate_quiz(user_id, note_id)


@router.post("/memory-twin")
async def memory_twin(token: str, query: str):
    user_id = _get_user_id(token)
    return await agent_service.memory_twin(user_id, query)


@router.post("/summarize")
async def auto_summarize(token: str):
    user_id = _get_user_id(token)
    return await agent_service.auto_summarize_new(user_id)


@router.get("/connections")
async def connections(token: str):
    user_id = _get_user_id(token)
    return await agent_service.recommend_connections(user_id)


@router.get("/memory-strength")
async def memory_strength(token: str):
    user_id = _get_user_id(token)
    strengths = await memory_service.get_topic_strengths(user_id)
    weakest = await memory_service.get_weakest_topics(user_id)
    streak = await memory_service.get_learning_streak(user_id)
    progress = await memory_service.weekly_progress(user_id)
    forgotten = await memory_service.get_what_forgotten(user_id)
    return {
        "topic_strengths": strengths,
        "weakest_topics": weakest,
        "streak_days": streak,
        "weekly_progress": progress,
        "forgotten_notes": forgotten,
    }
