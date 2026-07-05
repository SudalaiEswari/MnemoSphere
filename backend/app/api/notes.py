from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.config import settings
from app.models.note import NoteResponse
from app.services.llm_service import llm
from app.services.vector_store import vector_store
from app.services.scheduler import calculate_next_review
from app.services.embedding import compute_embedding
from app.core.database import db
from app.core.security import decode_access_token
import numpy as np
import os
import base64
import uuid
from datetime import datetime
import io
import fitz

router = APIRouter(prefix="/notes", tags=["Notes"])


def _get_user_id(token: str) -> str:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload["sub"]


def _embedding(text: str) -> list[float]:
    return compute_embedding(text)


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
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    is_placeholder = content.startswith("[Image uploaded:") or content.startswith("[Uploaded file:") or content.startswith("[PDF uploaded:")
    if is_placeholder:
        summary = f"Uploaded: {title}"
        category = "general"
        if "uploaded" not in tag_list:
            tag_list.append("uploaded")
    else:
        try:
            summary = await llm.summarize(content[:2000])
        except:
            summary = ""
        try:
            categorization = await llm.categorize(title, content[:1000], tags)
            if categorization.get("tags"):
                for t in categorization["tags"]:
                    if t not in tag_list:
                        tag_list.append(t)
            category = categorization.get("category", "general")
        except:
            category = "general"
        if category not in tag_list:
            tag_list.append(category)
    embedding = _embedding(content)
    next_review = calculate_next_review(0)
    doc = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "summary": summary,
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
    vector_store.add(note_id, content)
    return {"id": note_id, "summary": summary, "category": category, "tags": tag_list, "next_review": next_review.isoformat()}


@router.post("/upload")
async def upload_file(token: str = Form(...), title: str = Form(""), file: UploadFile = File(...)):
    try:
        user_id = _get_user_id(token)
        ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
        content_bytes = await file.read()
        content_text = ""
        source_type = "file"
        if ext.lower() in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
            source_type = "image"
            try:
                b64 = base64.b64encode(content_bytes).decode()
                content_text = await llm.analyze_image(b64)
            except:
                content_text = f"[Image uploaded: {file.filename}]"
        elif ext.lower() == ".pdf":
            source_type = "pdf"
            try:
                doc = fitz.open(stream=content_bytes, filetype="pdf")
                pages_text = []
                for page_num in range(min(len(doc), 50)):
                    pages_text.append(doc[page_num].get_text())
                doc.close()
                content_text = "\n\n".join(pages_text)
                if not content_text.strip():
                    doc = fitz.open(stream=content_bytes, filetype="pdf")
                    ocr_pages = []
                    for page_num in range(min(len(doc), 5)):
                        pix = doc[page_num].get_pixmap()
                        img_bytes = pix.tobytes("png")
                        b64 = base64.b64encode(img_bytes).decode()
                        ocr_text = await llm.analyze_image(b64)
                        ocr_pages.append(ocr_text)
                    doc.close()
                    content_text = "\n\n".join(ocr_pages)
                    if not content_text.strip():
                        content_text = f"[PDF uploaded: {file.filename} - no extractable text]"
            except:
                content_text = f"[PDF uploaded: {file.filename}]"
        else:
            try:
                content_text = content_bytes.decode("utf-8")
            except:
                content_text = f"[Uploaded file: {file.filename}]"
        if not title:
            title = file.filename or "Untitled"
        return {
            "preview": True,
            "title": title,
            "content": content_text,
            "summary": "",
            "tags": "",
            "category": "general",
            "source_type": source_type,
        }
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")


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
    try:
        user_id = _get_user_id(token)
        all_notes = await db.find("notes", {"user_id": user_id})
        keyword = query.lower()
        results = []
        for n in all_notes:
            text = (n.get("title") or "") + " " + (n.get("content") or "")
            if keyword in text.lower():
                results.append(_note_to_response(n))
                if len(results) >= 10:
                    break
        return results
    except Exception as e:
        raise HTTPException(500, str(e))