from app.services.llm_service import llm
from app.services.vector_store import vector_store
from app.services.embedding import compute_embedding
from app.services.memory_service import memory_service
from app.services.scheduler import get_notes_due, calculate_next_review, advance_stage
from app.core.database import db
from datetime import datetime
import json


class AgentService:
    async def ask_with_rag(self, user_id: str, question: str) -> dict:
        query_emb = compute_embedding(question)
        candidate_ids = vector_store.search(query_emb, k=8)
        notes = []
        for nid in candidate_ids:
            doc = await db.find_one("notes", {"id": nid, "user_id": user_id})
            if doc:
                notes.append(doc)
        if not notes:
            all_notes = await db.find("notes", {"user_id": user_id}, sort=("created_at", -1))
            notes = all_notes[:5]

        context_parts = []
        for n in notes:
            context_parts.append(
                f"Title: {n['title']}\nTags: {', '.join(n.get('tags', []) or [])}\nContent: {n['content'][:600]}\nSummary: {n.get('summary', '')}"
            )
        context = "\n\n---\n\n".join(context_parts) if context_parts else "No notes found."
        answer = await llm.chat(question, context)
        return {
            "answer": answer,
            "notes_used": len(notes),
            "rag": len(candidate_ids) > 0,
        }

    async def get_today_plan(self, user_id: str) -> dict:
        all_notes = await db.find("notes", {"user_id": user_id})
        due = get_notes_due(all_notes)
        topic_strengths = await memory_service.get_topic_strengths(user_id)
        weakest = sorted(topic_strengths.items(), key=lambda x: x[1])[:3]
        forgotten = await memory_service.get_what_forgotten(user_id)
        streak = await memory_service.get_learning_streak(user_id)
        progress = await memory_service.weekly_progress(user_id)

        plan_parts = []
        if due:
            plan_parts.append(f"- Review {len(due)} notes due today")
        if weakest:
            for t, s in weakest:
                plan_parts.append(f"- Revise '{t}' (strength: {s}%)")
        if forgotten:
            for f in forgotten:
                plan_parts.append(f"- Re-learn '{f['title']}' (failed {f['fails']} times)")

        recommendations = "\n".join(plan_parts) if plan_parts else "- Add some notes to get started!"
        ai_advice = await llm.chat(
            "Plan my learning day",
            f"User has {len(all_notes)} notes, {len(due)} due for review. "
            f"Weakest topics: {weakest}. Forgot: {forgotten}. "
            f"Streak: {streak} days. Recommend a personalized study plan.",
        )
        return {
            "reviews_due": len(due),
            "total_notes": len(all_notes),
            "weakest_topics": [{"topic": t, "score": s} for t, s in weakest],
            "forgotten_notes": forgotten,
            "streak_days": streak,
            "weekly_reviews": progress,
            "recommendations": recommendations,
            "ai_advice": ai_advice,
            "due_notes": [
                {"id": n["id"], "title": n["title"], "stage": n.get("review_stage", 0)}
                for n in due[:5]
            ],
        }

    async def auto_generate_quiz(self, user_id: str, note_id: str = None) -> dict:
        if note_id:
            notes = [await db.find_one("notes", {"id": note_id, "user_id": user_id})]
            notes = [n for n in notes if n]
        else:
            all_notes = await db.find("notes", {"user_id": user_id})
            due = get_notes_due(all_notes)
            notes = due[:3] if due else all_notes[:3]

        all_questions = []
        for note in notes:
            score = min((note.get("review_count", 0) or 0) * 20, 100)
            try:
                questions = await llm.generate_personalized_quiz(note["content"], score, [])
                if isinstance(questions, list):
                    for q in questions:
                        q["note_id"] = note["id"]
                        q["note_title"] = note["title"]
                    all_questions.extend(questions)
            except Exception:
                continue
        return {
            "questions": all_questions,
            "notes_count": len(notes),
            "type": "mixed",
        }

    async def memory_twin(self, user_id: str, query: str) -> dict:
        all_notes = await db.find("notes", {"user_id": user_id})
        topic_strengths = await memory_service.get_topic_strengths(user_id)
        forgotten = await memory_service.get_what_forgotten(user_id)
        query_emb = compute_embedding(query)
        candidate_ids = vector_store.search(query_emb, k=5)
        related = []
        for nid in candidate_ids:
            doc = await db.find_one("notes", {"id": nid})
            if doc and doc.get("user_id") == user_id:
                related.append(doc)
        context = ""
        if related:
            context = "Related notes:\n" + "\n".join(
                f"- {n['title']}: {n['content'][:300]}" for n in related
            )
        context += f"\n\nUser's topic strengths: {json.dumps(topic_strengths)}"
        context += f"\n\nFrequently forgotten: {[f['title'] for f in forgotten]}"
        system_prompt = (
            "You are Memory Twin AI — a personal knowledge companion. "
            "You know everything the user has learned. Answer using their notes. "
            "Point out connections they might have missed. "
            "If they're weak on a topic, suggest review. "
            "Be personal, insightful, and proactive."
        )
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
        ]
        answer = await llm._call_groq(messages)
        return {
            "answer": answer,
            "related_notes": len(related),
            "total_notes": len(all_notes),
            "weakest": sorted(topic_strengths.items(), key=lambda x: x[1])[:3],
        }

    async def auto_summarize_new(self, user_id: str) -> dict:
        all_notes = await db.find("notes", {"user_id": user_id}, sort=("created_at", -1))
        recent = [n for n in all_notes if not n.get("summary")][:5]
        results = []
        for note in recent:
            try:
                summary = await llm.summarize(note["content"])
                await db.update_one("notes", {"id": note["id"]}, {"$set": {"summary": summary}})
                results.append({"id": note["id"], "title": note["title"], "summary": summary})
            except Exception:
                continue
        return {"summarized": len(results), "notes": results}

    async def recommend_connections(self, user_id: str) -> dict:
        all_notes = await db.find("notes", {"user_id": user_id})
        if len(all_notes) < 2:
            return {"connections": [], "message": "Add more notes to discover connections"}
        embeddings = []
        note_map = {}
        for n in all_notes:
            emb = n.get("embedding")
            if emb:
                embeddings.append((n["id"], emb))
                note_map[n["id"]] = n
        connections = []
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                from app.services.embedding import compute_similarity
                sim = compute_similarity(embeddings[i][1], embeddings[j][1])
                if sim > 0.6:
                    connections.append({
                        "note_a": note_map[embeddings[i][0]]["title"],
                        "note_a_id": embeddings[i][0],
                        "note_b": note_map[embeddings[j][0]]["title"],
                        "note_b_id": embeddings[j][0],
                        "similarity": round(sim, 3),
                    })
        connections.sort(key=lambda x: x["similarity"], reverse=True)
        return {"connections": connections[:10], "total_notes": len(all_notes)}


agent_service = AgentService()
