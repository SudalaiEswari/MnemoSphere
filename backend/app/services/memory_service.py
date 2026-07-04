from datetime import datetime, timedelta
from typing import Optional
from app.core.database import db


class MemoryService:
    async def get_topic_strengths(self, user_id: str) -> dict:
        notes = await db.find("notes", {"user_id": user_id})
        review_logs = await db.find("review_logs", {"user_id": user_id})
        quiz_logs = await db.find("quiz_logs", {"user_id": user_id})

        review_scores = {}
        for r in review_logs:
            nid = r.get("note_id")
            if nid not in review_scores:
                review_scores[nid] = []
            review_scores[nid].append(r.get("score", 0) or 0)

        quiz_acc = {}
        for q in quiz_logs:
            nid = q.get("note_id")
            if nid not in quiz_acc:
                quiz_acc[nid] = {"correct": 0, "total": 0}
            quiz_acc[nid]["total"] += 1
            if q.get("is_correct"):
                quiz_acc[nid]["correct"] += 1

        topic_scores = {}
        for note in notes:
            tags = note.get("tags", []) or []
            nid = note["id"]
            r_scores = review_scores.get(nid, [])
            avg_review = sum(r_scores) / len(r_scores) if r_scores else 0.5
            q_data = quiz_acc.get(nid, {"correct": 0, "total": 0})
            acc = q_data["correct"] / q_data["total"] if q_data["total"] > 0 else 0.5
            stage = note.get("review_stage", 0)
            stage_bonus = min(stage * 0.1, 0.3)
            composite = (avg_review * 0.4 + acc * 0.4 + stage_bonus) * 100
            for tag in tags:
                if tag not in topic_scores or composite > topic_scores[tag]:
                    topic_scores[tag] = round(composite, 1)

        return topic_scores

    async def get_weakest_topics(self, user_id: str, limit: int = 5) -> list:
        strengths = await self.get_topic_strengths(user_id)
        sorted_topics = sorted(strengths.items(), key=lambda x: x[1])
        return [{"topic": t, "score": s} for t, s in sorted_topics[:limit]]

    async def get_learning_streak(self, user_id: str) -> int:
        logs = await db.find("review_logs", {"user_id": user_id}, sort=("created_at", -1))
        if not logs:
            return 0
        dates = set()
        for log in logs:
            dt = log.get("created_at")
            if dt:
                if isinstance(dt, str):
                    dt = datetime.fromisoformat(dt)
                dates.add(dt.date())
        sorted_dates = sorted(dates, reverse=True)
        streak = 1
        for i in range(1, len(sorted_dates)):
            diff = (sorted_dates[i - 1] - sorted_dates[i]).days
            if diff == 1:
                streak += 1
            else:
                break
        return streak

    async def weekly_progress(self, user_id: str) -> dict:
        week_ago = datetime.now() - timedelta(days=7)
        reviews = await db.find("review_logs", {"user_id": user_id})
        weekly_reviews = [r for r in reviews if r.get("created_at") and r["created_at"] >= week_ago]
        daily = {}
        i = 0
        while i < 7:
            day = (datetime.now() - timedelta(days=i)).strftime("%a")
            daily[day] = 0
            i += 1
        for r in weekly_reviews:
            dt = r.get("created_at")
            if dt:
                if isinstance(dt, str):
                    dt = datetime.fromisoformat(dt)
                day_name = dt.strftime("%a")
                if day_name in daily:
                    daily[day_name] += 1
        return {
            "daily_reviews": daily,
            "total": len(weekly_reviews),
        }

    async def get_what_forgotten(self, user_id: str) -> list:
        quiz_logs = await db.find("quiz_logs", {"user_id": user_id})
        note_failures = {}
        for q in quiz_logs:
            nid = q.get("note_id")
            if not q.get("is_correct"):
                if nid not in note_failures:
                    note_failures[nid] = 0
                note_failures[nid] += 1
        sorted_notes = sorted(note_failures.items(), key=lambda x: x[1], reverse=True)[:5]
        result = []
        for nid, fails in sorted_notes:
            note = await db.find_one("notes", {"id": nid})
            if note:
                result.append({"title": note["title"], "fails": fails, "id": nid})
        return result


memory_service = MemoryService()
