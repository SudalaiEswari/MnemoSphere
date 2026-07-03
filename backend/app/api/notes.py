from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.models.note import NoteResponse
from app.services.llm_service import llm
from app.services.vector_store import vector_store
from app.services.scheduler import calculate_next_review
from app.core.database import db
from app.core.security import decode_access_token
import numpy as np
from datetime import datetime

router = APIRouter(prefix="/notes", tags=["Notes"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


def _mock_embedding(text: str) -> list[float]:
    np.random.seed(hash(text) % (2**31))
    return np.random.randn(384).tolist()


def _note_to_response(doc):
    return NoteResponse(
        id=doc["id"], user_id=doc["user_id"], title=doc["title"],
        content=doc["content"], summary=doc.get("summary"),
        source_type=doc.get("source_type", "text"),
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        next_review=doc.get("next_review"),
        review_stage=doc.get("review_stage", 0),
    )


@router.post("/")
async def create_note(token: str, title: str, content: str, source_type: str = "text", tags: str = ""):
    user_id = _get_user_id(token)
    summary = await llm.summarize(content)
    embedding = _mock_embedding(content)
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    next_review = calculate_next_review(0)
    doc = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "summary": summary,
        "embedding": embedding,
        "source_type": source_type,
        "tags": tag_list,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "next_review": next_review,
        "review_stage": 0,
        "review_count": 0,
        "last_reviewed": None,
    }
    note_id = await db.insert_one("notes", doc)
    vector_store.add(note_id, embedding)
    return {"id": note_id, "summary": summary, "next_review": next_review.isoformat()}


@router.get("/")
async def list_notes(token: str):
    user_id = _get_user_id(token)
    docs = await db.find("notes", {"user_id": user_id}, sort=("created_at", -1))
    return [_note_to_response(d) for d in docs]


@router.delete("/{note_id}")
async def delete_note(note_id: str, token: str):
    user_id = _get_user_id(token)
    doc = await db.find_one("notes", {"id": note_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Note not found")
    await db.delete_one("notes", {"id": note_id})
    vector_store.remove(note_id)
    return {"message": "Deleted"}


@router.post("/search")
async def search_notes(token: str, query: str):
    _get_user_id(token)
    query_emb = _mock_embedding(query)
    ids = vector_store.search(query_emb, k=10)
    results = []
    for nid in ids:
        doc = await db.find_one("notes", {"id": nid})
        if doc:
            results.append(_note_to_response(doc))
    return results
