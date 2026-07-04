import re
import math
from collections import Counter


STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "this", "that",
    "these", "those", "i", "me", "my", "we", "our", "you", "your", "he",
    "she", "it", "they", "them", "their", "not", "no", "nor", "so", "if",
    "then", "than", "too", "very", "just", "about", "up", "out", "also",
    "more", "some", "any", "each", "every", "all", "both", "few", "most",
    "other", "into", "over", "such", "only", "own", "same", "its", "what",
    "which", "who", "whom", "when", "where", "why", "how", "get", "got",
    "use", "used", "using", "make", "made", "making", "like", "well",
}


def _tokenize(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = text.split()
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]


def _char_ngrams(text: str, n: int = 3) -> list[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]", "", text)
    return [text[i:i + n] for i in range(len(text) - n + 1)]


_VOCAB_CACHE = {}
_VOCAB_SIZE = 2048


def compute_embedding(text: str) -> list[float]:
    tokens = _tokenize(text)
    ngrams = _char_ngrams(text)
    freq = Counter(tokens + ngrams)
    if not freq:
        freq = Counter(["<empty>"])
    vec = [0.0] * _VOCAB_SIZE
    for term, count in freq.items():
        idx = abs(hash(term)) % _VOCAB_SIZE
        tf = 1 + math.log(count) if count > 0 else 0
        vec[idx] += tf
    mag = math.sqrt(sum(v * v for v in vec))
    if mag > 0:
        vec = [v / mag for v in vec]
    return vec


def compute_similarity(vec1: list[float], vec2: list[float]) -> float:
    dot = sum(a * b for a, b in zip(vec1, vec2))
    return dot
