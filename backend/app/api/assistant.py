from fastapi import APIRouter, HTTPException
from app.services.agent_service import agent_service
from app.core.database import db
from app.core.security import decode_access_token

router = APIRouter(prefix="/assistant", tags=["Assistant"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


@router.post("/ask")
async def ask_assistant(token: str, question: str):
    user_id = _get_user_id(token)
    result = await agent_service.ask_with_rag(user_id, question)
    return {"answer": result["answer"], "rag": result["rag"]}
