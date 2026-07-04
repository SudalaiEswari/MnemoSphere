import numpy as np
import faiss
import pickle
import os
from typing import Optional
from app.core.config import settings
from app.services.embedding import compute_embedding


class VectorStore:
    def __init__(self):
        os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
        self.index_path = os.path.join(settings.VECTOR_DB_PATH, "faiss.index")
        self.mapping_path = os.path.join(settings.VECTOR_DB_PATH, "mapping.pkl")
        self.dimension = 2048
        self.index = self._load_or_create_index()
        self.id_mapping = self._load_or_create_mapping()

    def _load_or_create_index(self):
        if os.path.exists(self.index_path):
            return faiss.read_index(self.index_path)
        return faiss.IndexFlatIP(self.dimension)

    def _load_or_create_mapping(self):
        if os.path.exists(self.mapping_path):
            with open(self.mapping_path, "rb") as f:
                return pickle.load(f)
        return {}

    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.mapping_path, "wb") as f:
            pickle.dump(self.id_mapping, f)

    def add(self, note_id: str, text: str):
        embedding = compute_embedding(text)
        vec = np.array([embedding], dtype=np.float32)
        idx = self.index.ntotal
        self.index.add(vec)
        self.id_mapping[idx] = {"id": note_id, "text_snippet": text[:100]}
        self._save()

    def add_with_vector(self, note_id: str, embedding: list[float]):
        vec = np.array([embedding], dtype=np.float32)
        idx = self.index.ntotal
        self.index.add(vec)
        self.id_mapping[idx] = {"id": note_id, "text_snippet": ""}
        self._save()

    def search(self, query_embedding: list[float], k: int = 5) -> list[str]:
        if self.index.ntotal == 0:
            return []
        vec = np.array([query_embedding], dtype=np.float32)
        distances, indices = self.index.search(vec, min(k, self.index.ntotal))
        results = []
        for i in range(min(k, len(indices[0]))):
            idx = indices[0][i]
            if idx in self.id_mapping and idx != -1:
                results.append(self.id_mapping[idx]["id"])
        return results

    def remove(self, note_id: str):
        to_delete = [idx for idx, data in self.id_mapping.items() if data["id"] == note_id]
        for idx in sorted(to_delete, reverse=True):
            del self.id_mapping[idx]
        self._save()

    def get_count(self) -> int:
        return self.index.ntotal


vector_store = VectorStore()
