from fastapi import APIRouter
from pydantic import BaseModel

from app.knowledge.scraper import crawl_website
from app.knowledge.chunker import chunk_text
from app.knowledge.kb_store import save_chunks
from app.utils.embedding import embed_text

router = APIRouter()

class ScrapeRequest(BaseModel):
    agentId: str
    url: str


@router.post("/scrape-website")
def scrape_and_store(req: ScrapeRequest):
    pages = crawl_website(req.url, max_pages=10)  # now returns [{url, text}]
    total_chunks = 0
    print(pages)

    for page in pages:
        chunks = chunk_text(page["text"])
        embeddings = [embed_text(chunk) for chunk in chunks]

        save_chunks(
            agent_id=req.agentId,
            chunks=chunks,
            source_name=page["url"],
            url=page["url"],
            embeddings=embeddings,
            source_type="website",
        )

        total_chunks += len(chunks)

    return {
        "success": True,
        "chunks_added": total_chunks
    }
