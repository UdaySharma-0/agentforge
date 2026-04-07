from bson import ObjectId
from typing import Dict, List

from app.config import mongo_db
from app.utils.embedding import embed_text

collection = mongo_db["knowledge_chunks"]


def fetch_relevant_chunks(
    agent_id: str,
    query: str,
    limit: int = 15
) -> List[Dict]:
    query_embedding = embed_text(query)

    vector_results = list(collection.aggregate(_build_vector_pipeline(agent_id, query_embedding, limit)))
    keyword_results = list(collection.aggregate(_build_keyword_pipeline(agent_id, query, limit)))

    return merge_search_results(vector_results, keyword_results, query, limit=limit)


def _build_vector_pipeline(agent_id: str, query_embedding: List[float], limit: int) -> List[Dict]:
    return [
        {
            "$vectorSearch": {
                "index": "knowledge_embedding_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": limit,
                "filter": {
                    "agentId": ObjectId(agent_id)
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "sourceType": 1,
                "sourceName": 1,
                "url": 1,
                "score": {"$meta": "vectorSearchScore"},
                "searchType": {"$literal": "vector"},
            }
        }
    ]


def _build_keyword_pipeline(agent_id: str, query: str, limit: int) -> List[Dict]:
    return [
        {
            "$match": {
                "agentId": ObjectId(agent_id),
                "$text": {"$search": query}
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "sourceType": 1,
                "sourceName": 1,
                "url": 1,
                "score": {"$meta": "textScore"},
                "searchType": {"$literal": "keyword"},
            }
        },
        {
            "$limit": limit
        }
    ]


def merge_search_results(
    vector_results: List[Dict],
    keyword_results: List[Dict],
    query: str,
    limit: int = 15,
) -> List[Dict]:
    normalized_vector = _normalize_scores(vector_results)
    normalized_keyword = _normalize_scores(keyword_results)
    query_terms = _extract_query_terms(query)

    combined = {}

    for doc in normalized_vector:
        key = _normalize_text(doc.get("text", ""))
        if not key:
            continue
        combined[key] = _build_result_doc(doc, query_terms)

    for doc in normalized_keyword:
        key = _normalize_text(doc.get("text", ""))
        if not key:
            continue

        candidate = _build_result_doc(doc, query_terms)
        if key in combined:
            combined[key]["score"] = max(combined[key]["score"], candidate["score"])
            combined[key]["keywordMatchCount"] = max(
                combined[key]["keywordMatchCount"],
                candidate["keywordMatchCount"],
            )
            combined[key]["searchType"] = "hybrid"
            if not combined[key].get("sourceType"):
                combined[key]["sourceType"] = candidate.get("sourceType")
            if not combined[key].get("sourceName"):
                combined[key]["sourceName"] = candidate.get("sourceName")
            if not combined[key].get("url"):
                combined[key]["url"] = candidate.get("url")
        else:
            combined[key] = candidate

    combined_list = sorted(
        combined.values(),
        key=lambda item: (
            item.get("keywordMatchCount", 0),
            item.get("score", 0.0),
            _source_type_rank(item.get("sourceType")),
        ),
        reverse=True,
    )

    return combined_list[:limit]


def _build_result_doc(doc: Dict, query_terms: set) -> Dict:
    text = doc.get("text", "")
    keyword_match_count = _count_keyword_matches(query_terms, text)
    score = float(doc.get("_normalizedScore", doc.get("score", 0.0)))

    if doc.get("searchType") == "keyword":
        score += 0.12
    score += min(keyword_match_count * 0.04, 0.2)
    score += _source_type_rank(doc.get("sourceType")) * 0.03

    return {
        "text": text,
        "score": score,
        "sourceType": doc.get("sourceType"),
        "sourceName": doc.get("sourceName"),
        "url": doc.get("url"),
        "searchType": doc.get("searchType"),
        "keywordMatchCount": keyword_match_count,
    }


def _normalize_scores(results: List[Dict]) -> List[Dict]:
    if not results:
        return []

    raw_scores = [float(item.get("score", 0.0)) for item in results]
    max_score = max(raw_scores)
    min_score = min(raw_scores)

    normalized = []
    for item, raw_score in zip(results, raw_scores):
        if max_score == min_score:
            score = 1.0 if max_score > 0 else 0.0
        else:
            score = (raw_score - min_score) / (max_score - min_score)

        normalized.append({
            **item,
            "_normalizedScore": score,
        })

    return normalized


def _count_keyword_matches(query_terms: set, text: str) -> int:
    text_terms = set(_normalize_text(text).split())
    return sum(1 for term in query_terms if term in text_terms)


def _extract_query_terms(query: str) -> set:
    return {term for term in _normalize_text(query).split() if len(term) > 2}


def _normalize_text(value: str) -> str:
    return " ".join((value or "").lower().split())


def _source_type_rank(source_type: str) -> int:
    source_type = (source_type or "").lower().strip()
    if source_type in {"manual_text", "document", "upload"}:
        return 3
    if source_type in {"faq", "policy", "kb"}:
        return 2
    if source_type == "website":
        return 1
    return 0
