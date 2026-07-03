from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.config import settings
from app.models.note import NoteResponse
from app.services.llm_service import llm
from app.services.vector_store import vector_store
from app.services.scheduler import calculate_next_review
from app.core.database import db
from app.core.security import decode_access_token
import numpy as np
import os
import base64
import uuid
from datetime import datetime

router = APIRouter(prefix="/notes", tags=["Notes"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


def _embedding(text: str) -> list[float]:
    np.random.seed(hash(text) % (2**31))
    vec = np.random.randn(384)
    vec = vec / np.linalg.norm(vec)
    return vec.tolist()


def _note_to_response(doc):
    return NoteResponse(
        id=doc["id"], user_id=doc["user_id"], title=doc["title"],
        content=doc["content"], summary=doc.get("summary"),
        source_type=doc.get("source_type", "text"),
        tags=doc.get("tags", []),
        category=doc.get("category", "general"),
        created_at=doc["created_at"],
        next_review=doc.get("next_review"),
        review_stage=doc.get("review_stage", 0),
    )


@router.post("/")
async def create_note(token: str, title: str, content: str, source_type: str = "text", tags: str = ""):
    user_id = _get_user_id(token)
    summary = await llm.summarize(content)
    categorization = await llm.categorize(title, content, tags)
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    if categorization.get("tags"):
        for t in categorization["tags"]:
            if t not in tag_list:
                tag_list.append(t)
    category = categorization.get("category", "general")
    if category not in tag_list:
        tag_list.append(category)
    embedding = _embedding(content)
    next_review = calculate_next_review(0)
    doc = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "summary": categorization.get("suggested_summary", "") or summary,
        "embedding": embedding,
        "source_type": source_type,
        "tags": tag_list,
        "category": category,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "next_review": next_review,
        "review_stage": 0,
        "review_count": 0,
        "last_reviewed": None,
        "file_path": None,
    }
    note_id = await db.insert_one("notes", doc)
    vector_store.add(note_id, embedding)
    return {"id": note_id, "summary": doc["summary"], "category": category, "tags": tag_list, "next_review": next_review.isoformat()}


@router.post("/upload")
async def upload_file(token: str = Form(...), title: str = Form(""), file: UploadFile = File(...)):
    user_id = _get_user_id(token)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    content_bytes = await file.read()
    with open(filepath, "wb") as f:
        f.write(content_bytes)
    content_text = ""
    source_type = "file"
    if ext.lower() in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
        source_type = "image"
        b64 = base64.b64encode(content_bytes).decode()
        content_text = await llm.analyze_image(b64)
    else:
        try:
            content_text = content_bytes.decode("utf-8")
        except:
            content_text = f"[Uploaded file: {file.filename}]"
    if not title:
        title = file.filename or "Untitled"
    summary = await llm.summarize(content_text)
    categorization = await llm.categorize(title, content_text, "")
    tag_list = categorization.get("tags", [])
    category = categorization.get("category", "general")
    if category not in tag_list:
        tag_list.append(category)
    embedding = _embedding(content_text)
    next_review = calculate_next_review(0)
    doc = {
        "user_id": user_id,
        "title": title,
        "content": content_text,
        "summary": categorization.get("suggested_summary", "") or summary,
        "embedding": embedding,
        "source_type": source_type,
        "tags": tag_list,
        "category": category,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "next_review": next_review,
        "review_stage": 0,
        "review_count": 0,
        "last_reviewed": None,
        "file_path": filepath,
    }
    note_id = await db.insert_one("notes", doc)
    vector_store.add(note_id, embedding)
    return {"id": note_id, "summary": doc["summary"], "category": category, "source_type": source_type, "file_path": filepath}


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
    if doc.get("file_path") and os.path.exists(doc["file_path"]):
        os.remove(doc["file_path"])
    await db.delete_one("notes", {"id": note_id})
    vector_store.remove(note_id)
    return {"message": "Deleted"}


@router.post("/search")
async def search_notes(token: str, query: str):
    _get_user_id(token)
    query_emb = _embedding(query)
    ids = vector_store.search(query_emb, k=10)
    results = []
    for nid in ids:
        doc = await db.find_one("notes", {"id": nid})
        if doc:
            results.append(_note_to_response(doc))
    return results