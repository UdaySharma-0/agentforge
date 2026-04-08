import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.run_agent import router as agent_router
from .api.manual_text import router as manual_text_router
from .api.knowledge_listing import router as knowledge_listing_router
from app.api.scrape_website import router as scrape_router
from app.api.upload_doc import router as upload_router

logger = logging.getLogger(__name__)

# Initialize FastAPI app with NO lifespan - instant startup
app = FastAPI(title="AI Agent Service")

# ====== CORS Configuration ======
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]

# Validate CORS configuration: wildcard origins cannot be used with allow_credentials=True
if "*" in cors_origins:
    raise ValueError(
        "CORS configuration error: wildcard origin '*' is incompatible with allow_credentials=True. "
        "Either specify explicit origins or disable credentials. "
        "Set CORS_ORIGINS to a comma-separated list of allowed origins (e.g., 'https://example.com,https://app.example.com')"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router, prefix="/api")
app.include_router(manual_text_router, prefix="/api")
app.include_router(knowledge_listing_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(scrape_router, prefix="/api")


@app.get("/")
def health():
    return {"status": "AI Agent Service running"}
