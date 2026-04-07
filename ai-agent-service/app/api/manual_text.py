from fastapi import APIRouter
from pydantic import BaseModel

from app.knowledge.chunker import chunk_text
from app.knowledge.kb_store import delete_chunks_by_source_type, save_chunks
from app.utils.embedding import embed_text

router = APIRouter()


class ManualTextRequest(BaseModel):
    agentId: str
    text: str


@router.post("/manual-text")
def save_manual_text(req: ManualTextRequest):
    cleaned_text = (req.text or "").strip()
    if not cleaned_text:
        return {
            "success": False,
            "message": "Manual knowledge text is required.",
        }

    delete_chunks_by_source_type(req.agentId, "manual_text")

    chunks = chunk_text(cleaned_text)
    embeddings = [embed_text(chunk) for chunk in chunks]

    save_chunks(
        agent_id=req.agentId,
        chunks=chunks,
        source_name="manual_text",
        url="manual_text",
        embeddings=embeddings,
        source_type="manual_text",
    )

    return {
        "success": True,
        "agentId": req.agentId,
        "chunksCreated": len(chunks),
        "source": "manual_text",
    }
