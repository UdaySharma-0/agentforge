"""
Embedding module with pluggable backend support.

Supports two backends:
1. Cohere API (production) - No model loading, instant startup
2. Sentence-Transformers (local development) - Better privacy, runs locally
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Import config after it's fully initialized
_config_loaded = False
USE_LOCAL_EMBEDDING = None
COHERE_API_KEY = None
COHERE_MODEL = None


def _ensure_config():
    """Lazily load config on first use to avoid startup delays."""
    global _config_loaded, USE_LOCAL_EMBEDDING, COHERE_API_KEY, COHERE_MODEL
    
    if not _config_loaded:
        from app.config import (
            USE_LOCAL_EMBEDDING as _use_local,
            COHERE_API_KEY as _cohere_key,
            COHERE_MODEL as _cohere_model,
        )
        USE_LOCAL_EMBEDDING = _use_local
        COHERE_API_KEY = _cohere_key
        COHERE_MODEL = _cohere_model
        _config_loaded = True
        logger.info(
            f"Embedding backend: {'local (sentence-transformers)' if USE_LOCAL_EMBEDDING else 'Cohere API'}"
        )


# ============================================================================
# COHERE API BACKEND (Production)
# ============================================================================

def _embed_with_cohere(text: str, input_type: str = "search_document") -> list[float]:
    """
    Embed text using Cohere API.
    
    Args:
        text: Text to embed
        input_type: Type of input for Cohere
            - "search_document": For knowledge base chunks
            - "search_query": For user queries
            - "classification": For classification tasks
            - "clustering": For clustering
    
    Returns:
        List of floats representing the embedding (1024-dimensional)
    """
    _ensure_config()
    
    import cohere
    
    try:
        client = cohere.ClientV2(api_key=COHERE_API_KEY)
        response = client.embed(
            model=COHERE_MODEL,
            texts=[text],
            input_type=input_type,
            embedding_types=["float"]
        )
        
        if response.embeddings and response.embeddings.float:
            embedding = response.embeddings.float[0]
            logger.debug(f"Cohere embedding generated: dim={len(embedding)}, input_type={input_type}")
            return embedding
        else:
            raise ValueError("Cohere API returned empty embedding")
            
    except Exception as e:
        logger.error(f"Cohere embedding failed: {type(e).__name__}: {str(e)}")
        raise RuntimeError(f"Failed to generate embedding with Cohere: {str(e)}")


# ============================================================================
# LOCAL SENTENCE-TRANSFORMERS BACKEND (Optional Development)
# ============================================================================

_local_model = None
_model_lock = None


def _embed_with_local_model(text: str, input_type: str = "search_document") -> list[float]:
    """
    Embed text using local all-MiniLM-L6-v2 model.
    Only used if USE_LOCAL_EMBEDDING=true.
    """
    global _local_model, _model_lock
    
    if _model_lock is None:
        from threading import Lock
        _model_lock = Lock()
    
    # Lazy load model on first use (not at import time)
    if _local_model is None:
        with _model_lock:
            if _local_model is None:
                try:
                    from sentence_transformers import SentenceTransformer
                    import os
                    
                    logger.info("Loading sentence-transformers model (local development)...")
                    hf_token = os.getenv("HF_TOKEN")
                    _local_model = SentenceTransformer(
                        "all-MiniLM-L6-v2",
                        token=hf_token
                    )
                    logger.info("Sentence-transformers model loaded successfully")
                except Exception as e:
                    logger.error(f"Failed to load sentence-transformers: {e}")
                    raise RuntimeError(f"Could not load sentence-transformers model: {str(e)}")
    
    try:
        embedding = _local_model.encode(text)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Local embedding failed: {type(e).__name__}: {str(e)}")
        raise RuntimeError(f"Failed to generate embedding with sentence-transformers: {str(e)}")


# ============================================================================
# PUBLIC API - UNIFIED EMBEDDING FUNCTION
# ============================================================================

def embed_text(text: str, input_type: str = "search_document") -> list[float]:
    """
    Generate embedding for text using configured backend.
    
    Routes to either Cohere API (production) or sentence-transformers (local).
    Does NOT block application startup - embedding generation happens on-demand.
    
    Args:
        text: Text to embed
        input_type: Type of input, defaults to "search_document"
                   - "search_document": For knowledge base chunks (MongoDB storage)
                   - "search_query": For user queries (MongoDB vector search)
                   - "classification": For classification tasks
                   - "clustering": For clustering
    
    Returns:
        list[float]: Embedding vector
        - Cohere (embed-v4.0): 1024 dimensions
        - Local (all-MiniLM-L6-v2): 384 dimensions
    
    Raises:
        TypeError: If text is not a string
        ValueError: If text is empty
        RuntimeError: If embedding generation fails
    """
    # Input validation
    if not isinstance(text, str):
        raise TypeError(f"embed_text expected string, got {type(text)}")
    
    text = text.strip()
    if not text:
        raise ValueError("embed_text received empty string")
    
    # Route to appropriate backend
    _ensure_config()
    
    if USE_LOCAL_EMBEDDING:
        logger.debug(f"Using local embedding backend for text: {text[:50]}...")
        return _embed_with_local_model(text, input_type)
    else:
        logger.debug(f"Using Cohere API backend for text: {text[:50]}...")
        return _embed_with_cohere(text, input_type)


def get_embedding_info() -> dict:
    """Get information about the current embedding backend."""
    _ensure_config()
    
    if USE_LOCAL_EMBEDDING:
        return {
            "backend": "local",
            "model": "all-MiniLM-L6-v2",
            "dimensions": 384,
            "startup_time": "blocks (model loads on first embed)",
            "note": "For development only - not suitable for production"
        }
    else:
        return {
            "backend": "cohere",
            "model": COHERE_MODEL,
            "dimensions": 1024,
            "startup_time": "instant (API-based)",
            "note": "Production-ready - no startup delays"
        }
