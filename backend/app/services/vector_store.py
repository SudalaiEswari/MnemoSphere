import numpy as np
import faiss
import pickle
import os
from typing import Optional
from app.core.config import settings


class VectorStore:
    def __init__(self):
        os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
        self.index_path = os.path.join(settings.VECTOR_DB_PATH, "faiss.index")
        self.mapping_path = os.path.join(settings.VECTOR_DB_PATH, "mapping.pkl")
        self.dimension = 384
        self.index = self._load_or_create_index()
        self.id_mapping = self._load_or_create_mapping()

    def _load_or_create_index(self):
        if os.path.exists(self.index_path):
            return faiss.read_index(self.index_path)
        return faiss.IndexFlatL2(self.dimension)

    def _load_or_create_mapping(self):
        if os.path.exists(self.mapping_path):
            with open(self.mapping_path, "rb") as f:
                return pickle.load(f)
        return {}

    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.mapping_path, "wb") as f:
            pickle.dump(self.id_mapping, f)

    def add(self, note_id: str, embedding: list[float]):
        vec = np.array([embedding], dtype=np.float32)
        idx = self.index.ntotal
        self.index.add(vec)
        self.id_mapping[idx] = note_id
        self._save()

    def search(self, query_embedding: list[float], k: int = 5) -> list[str]:
        vec = np.array([query_embedding], dtype=np.float32)
        distances, indices = self.index.search(vec, k)
        results = []
        for i in range(k):
            idx = indices[0][i]
            if idx in self.id_mapping and idx != -1:
                results.append(self.id_mapping[idx])
        return results

    def remove(self, note_id: str):
        to_delete = [idx for idx, nid in self.id_mapping.items() if nid == note_id]
        for idx in sorted(to_delete, reverse=True):
            del self.id_mapping[idx]
        self._save()

    def get_count(self) -> int:
        return self.index.ntotal


vector_store = VectorStore()
