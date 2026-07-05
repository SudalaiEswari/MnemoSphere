from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.config import settings
from app.api import auth, notes, quiz, review, analytics, assistant, tasks, goals, habits, timeline, summary, agent, reminders
import os


class StripPrefixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path.startswith("/api/"):
            request.scope["path"] = path[4:]
            request.scope["root_path"] = ""
        response = await call_next(request)
        return response


app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(StripPrefixMiddleware)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(quiz.router)
app.include_router(review.router)
app.include_router(analytics.router)
app.include_router(assistant.router)
app.include_router(tasks.router)
app.include_router(goals.router)
app.include_router(habits.router)
app.include_router(timeline.router)
app.include_router(summary.router)
app.include_router(agent.router)
app.include_router(reminders.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(static_dir):
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("health"):
            raise HTTPException(404)
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(static_dir, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path, media_type="text/html")
        raise HTTPException(404)
