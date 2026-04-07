"""
Result re-ranking module - optional feature for improving result relevance.

Can use sentence-transformers CrossEncoder if available (local development).
In production (Render), this is typically disabled via ENABLE_RERANKER=false.
"""

import json
import logging
import os
import time
from threading import Lock

logger = logging.getLogger(__name__)

_cross_encoder = None
_model_load_error = None
_model_lock = Lock()


def _get_default_top_k() -> int:
    return int(os.getenv("RERANK_TOP_K", "8"))


def _log_event(event: str, status: str, **fields) -> None:
    payload = {
        "component": "reranker",
        "event": event,
        "status": status,
        **fields,
    }
    logger.info(json.dumps(payload, default=str))


def _get_cross_encoder():
    """
    Lazily load CrossEncoder model only if reranking is enabled.
    Does NOT load during application startup.
    """
    global _cross_encoder, _model_load_error

    if _cross_encoder is not None:
        return _cross_encoder

    if _model_load_error is not None:
        raise _model_load_error

    with _model_lock:
        if _cross_encoder is not None:
            return _cross_encoder

        if _model_load_error is not None:
            raise _model_load_error

        started_at = time.perf_counter()
        _log_event("load_model", "started", model="cross-encoder/ms-marco-MiniLM-L-6-v2")

        try:
            from sentence_transformers import CrossEncoder

            logger.info("Loading CrossEncoder for re-ranking (on-demand)...")
            _cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            _log_event(
                "load_model",
                "completed",
                model="cross-encoder/ms-marco-MiniLM-L-6-v2",
                elapsed_ms=round((time.perf_counter() - started_at) * 1000, 2),
            )
            logger.info("CrossEncoder loaded successfully")
            return _cross_encoder
        except Exception as error:
            _model_load_error = error
            _log_event(
                "load_model",
                "error",
                model="cross-encoder/ms-marco-MiniLM-L-6-v2",
                elapsed_ms=round((time.perf_counter() - started_at) * 1000, 2),
                error_type=type(error).__name__,
                error_message=str(error),
            )
            logger.error(f"Failed to load CrossEncoder: {error}")
            raise


def rerank_docs(query: str, docs: list[dict], top_k: int = 8) -> list[dict]:
    """
    Re-rank documents using CrossEncoder model.
    
    Note: This is an OPTIONAL feature disabled by default in production.
    Enable with ENABLE_RERANKER=true in environment.
    """
    if not docs:
        _log_event("rerank", "skipped", reason="empty_docs", doc_count=0)
        return []

    effective_top_k = max(1, int(top_k or _get_default_top_k() or 8))
    sorted_docs = sorted(docs, key=lambda doc: float(doc.get("score", 0.0)), reverse=True)
    shortlisted_docs = [dict(doc) for doc in sorted_docs[:effective_top_k]]

    _log_event(
        "rerank",
        "started",
        doc_count=len(docs),
        shortlisted_count=len(shortlisted_docs),
        top_k=effective_top_k,
    )

    try:
        cross_encoder = _get_cross_encoder()
        pairs = [(query, doc["text"]) for doc in shortlisted_docs]
        started_at = time.perf_counter()
        scores = cross_encoder.predict(pairs)

        for doc, score in zip(shortlisted_docs, scores):
            doc["rerank_score"] = float(score)

        reranked_docs = sorted(
            shortlisted_docs,
            key=lambda doc: doc["rerank_score"],
            reverse=True,
        )

        _log_event(
            "rerank",
            "completed",
            top_k=effective_top_k,
            doc_count=len(docs),
            shortlisted_count=len(shortlisted_docs),
            elapsed_ms=round((time.perf_counter() - started_at) * 1000, 2),
        )
        return reranked_docs
    except Exception as error:
        _log_event(
            "rerank",
            "fallback",
            top_k=effective_top_k,
            doc_count=len(docs),
            shortlisted_count=len(shortlisted_docs),
            error_type=type(error).__name__,
            error_message=str(error),
            fallback_used=True,
        )
        logger.warning(f"Re-ranking failed, returning shortlisted docs: {error}")
        return shortlisted_docs


def cross_encoder_rerank(query, docs):
    return rerank_docs(query=query, docs=docs, top_k=_get_default_top_k())
