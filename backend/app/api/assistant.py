from fastapi import APIRouter, HTTPException
from app.services.llm_service import llm
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
    notes = await db.find("notes", {"user_id": user_id})
    context = "\n\n".join([
        f"Title: {n['title']}\nContent: {n['content'][:500]}\nSummary: {n.get('summary', '')}"
        for n in notes[-5:]
    ])
    if not context:
        context = "No notes found. The user hasn't added any content yet."
    answer = await llm.chat(question, context)
    return {"answer": answer, "context_used": len(notes) > 0}
