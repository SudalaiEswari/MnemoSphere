import sqlite3
import json
import os
import uuid
from datetime import datetime
from typing import Optional


DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "mnemosphere.db")


def _serialize(val):
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, list):
        return json.dumps(val)
    if isinstance(val, dict):
        return json.dumps(val)
    if isinstance(val, float):
        return val
    return str(val) if val is not None else None


def _deserialize(val, field_type=None):
    if val is None:
        return None
    if field_type == "datetime":
        try:
            return datetime.fromisoformat(val)
        except:
            return None
    if field_type == "list":
        try:
            return json.loads(val)
        except:
            return []
    if field_type == "dict":
        try:
            return json.loads(val)
        except:
            return {}
    if field_type == "float":
        try:
            return float(val)
        except:
            return 0.0
    if field_type == "int":
        try:
            return int(val)
        except:
            return 0
    return val


TABLE_SCHEMAS = {
    "users": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("email", "TEXT UNIQUE"),
            ("name", "TEXT"),
            ("hashed_password", "TEXT"),
            ("created_at", "TEXT"),
            ("memory_score", "REAL DEFAULT 0.0"),
            ("topics", "TEXT DEFAULT '[]'"),
        ],
        "types": {"created_at": "datetime", "topics": "list", "memory_score": "float"},
    },
    "notes": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("title", "TEXT"),
            ("content", "TEXT"),
            ("summary", "TEXT"),
            ("embedding", "TEXT"),
            ("source_type", "TEXT DEFAULT 'text'"),
            ("tags", "TEXT DEFAULT '[]'"),
            ("category", "TEXT DEFAULT 'general'"),
            ("created_at", "TEXT"),
            ("updated_at", "TEXT"),
            ("next_review", "TEXT"),
            ("review_stage", "INTEGER DEFAULT 0"),
            ("review_count", "INTEGER DEFAULT 0"),
            ("last_reviewed", "TEXT"),
            ("file_path", "TEXT"),
        ],
        "types": {"created_at": "datetime", "updated_at": "datetime", "next_review": "datetime", "last_reviewed": "datetime", "tags": "list", "embedding": "list", "review_stage": "int", "review_count": "int"},
    },
    "quiz_logs": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("note_id", "TEXT"),
            ("question", "TEXT"),
            ("user_answer", "TEXT"),
            ("correct_answer", "TEXT"),
            ("is_correct", "INTEGER"),
            ("timestamp", "TEXT"),
        ],
        "types": {"timestamp": "datetime", "is_correct": "int"},
    },
    "tasks": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("title", "TEXT"),
            ("description", "TEXT"),
            ("category", "TEXT DEFAULT 'general'"),
            ("priority", "TEXT DEFAULT 'medium'"),
            ("deadline", "TEXT"),
            ("status", "TEXT DEFAULT 'pending'"),
            ("created_at", "TEXT"),
            ("completed_at", "TEXT"),
        ],
        "types": {"deadline": "datetime", "created_at": "datetime", "completed_at": "datetime"},
    },
    "review_logs": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("note_id", "TEXT"),
            ("stage", "INTEGER"),
            ("score", "REAL"),
            ("completed", "INTEGER"),
            ("created_at", "TEXT"),
        ],
        "types": {"created_at": "datetime", "stage": "int", "score": "float", "completed": "int"},
    },
    "goals": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("title", "TEXT"),
            ("description", "TEXT"),
            ("category", "TEXT DEFAULT 'general'"),
            ("target_date", "TEXT"),
            ("status", "TEXT DEFAULT 'active'"),
            ("progress", "REAL DEFAULT 0.0"),
            ("created_at", "TEXT"),
            ("completed_at", "TEXT"),
        ],
        "types": {"target_date": "datetime", "created_at": "datetime", "completed_at": "datetime", "progress": "float"},
    },
    "habits": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("name", "TEXT"),
            ("description", "TEXT"),
            ("frequency", "TEXT DEFAULT 'daily'"),
            ("category", "TEXT DEFAULT 'general'"),
            ("streak", "INTEGER DEFAULT 0"),
            ("longest_streak", "INTEGER DEFAULT 0"),
            ("created_at", "TEXT"),
        ],
        "types": {"created_at": "datetime", "streak": "int", "longest_streak": "int"},
    },
    "habit_logs": {
        "columns": [
            ("id", "TEXT PRIMARY KEY"),
            ("user_id", "TEXT"),
            ("habit_id", "TEXT"),
            ("date", "TEXT"),
            ("completed", "INTEGER DEFAULT 1"),
            ("created_at", "TEXT"),
        ],
        "types": {"date": "datetime", "created_at": "datetime", "completed": "int"},
    },
}


class SQLiteDB:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_tables()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        conn = self._get_conn()
        for name, schema in TABLE_SCHEMAS.items():
            cols = ", ".join(f"{c} {t}" for c, t in schema["columns"])
            conn.execute(f"CREATE TABLE IF NOT EXISTS {name} ({cols})")
        conn.commit()
        conn.close()

    async def _run(self, query, params=None):
        conn = self._get_conn()
        try:
            if params:
                conn.execute(query, params)
            else:
                conn.execute(query)
            conn.commit()
        finally:
            conn.close()

    async def _fetchone(self, query, params=None):
        conn = self._get_conn()
        try:
            if params:
                row = conn.execute(query, params).fetchone()
            else:
                row = conn.execute(query).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    async def _fetchall(self, query, params=None):
        conn = self._get_conn()
        try:
            if params:
                rows = conn.execute(query, params).fetchall()
            else:
                rows = conn.execute(query).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def _row_to_doc(self, table, row):
        if not row:
            return None
        schema = TABLE_SCHEMAS[table]
        doc = {}
        for col, _ in schema["columns"]:
            col_name = col.split()[0] if " " in col else col
            ftype = schema["types"].get(col_name)
            doc[col_name] = _deserialize(row.get(col_name), ftype)
        return doc

    def _rows_to_docs(self, table, rows):
        return [self._row_to_doc(table, r) for r in rows]

    async def find_one(self, table, filter=None):
        if not filter:
            row = await self._fetchone(f"SELECT * FROM {table} LIMIT 1")
            return self._row_to_doc(table, row)
        conditions = " AND ".join(f"{k} = ?" for k in filter)
        params = tuple(_serialize(v) for v in filter.values())
        row = await self._fetchone(f"SELECT * FROM {table} WHERE {conditions}", params)
        return self._row_to_doc(table, row)

    async def find(self, table, filter=None, sort=None, limit=None):
        if filter:
            conditions = " AND ".join(f"{k} = ?" for k in filter)
            params = tuple(_serialize(v) for v in filter.values())
            rows = await self._fetchall(f"SELECT * FROM {table} WHERE {conditions}", params)
        else:
            rows = await self._fetchall(f"SELECT * FROM {table}")
        docs = self._rows_to_docs(table, rows)
        if sort:
            key, direction = sort if isinstance(sort, (list, tuple)) else (sort, -1)
            docs.sort(key=lambda x: x.get(key, ""), reverse=(direction == -1))
        if limit:
            docs = docs[:limit]
        return docs

    async def insert_one(self, table, document):
        doc_id = str(uuid.uuid4())
        document["id"] = doc_id
        schema = TABLE_SCHEMAS[table]
        cols = [c.split()[0] for c, _ in schema["columns"]]
        vals = {k: _serialize(document.get(k)) for k in cols}
        placeholders = ", ".join("?" for _ in cols)
        col_names = ", ".join(cols)
        params = tuple(vals.get(c) for c in cols)
        await self._run(f"INSERT OR REPLACE INTO {table} ({col_names}) VALUES ({placeholders})", params)
        return doc_id

    async def update_one(self, table, filter, update):
        set_values = {}
        for op, fields in update.items():
            if op == "$set":
                for k, v in fields.items():
                    set_values[k] = _serialize(v)
            elif op == "$inc":
                current = await self.find_one(table, filter)
                if current:
                    for k, v in fields.items():
                        set_values[k] = _serialize((current.get(k, 0) or 0) + v)
        if not set_values:
            return
        conditions = " AND ".join(f"{k} = ?" for k in filter)
        set_clause = ", ".join(f"{k} = ?" for k in set_values)
        params = tuple(set_values.values()) + tuple(_serialize(v) for v in filter.values())
        await self._run(f"UPDATE {table} SET {set_clause} WHERE {conditions}", params)

    async def delete_one(self, table, filter):
        conditions = " AND ".join(f"{k} = ?" for k in filter)
        params = tuple(_serialize(v) for v in filter.values())
        await self._run(f"DELETE FROM {table} WHERE {conditions}", params)

    async def count_documents(self, table, filter=None):
        if filter:
            conditions = " AND ".join(f"{k} = ?" for k in filter)
            params = tuple(_serialize(v) for v in filter.values())
            row = await self._fetchone(f"SELECT COUNT(*) as cnt FROM {table} WHERE {conditions}", params)
        else:
            row = await self._fetchone(f"SELECT COUNT(*) as cnt FROM {table}")
        return row["cnt"] if row else 0


db = SQLiteDB()
