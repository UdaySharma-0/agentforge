from fastapi import APIRouter, UploadFile, File, Form
import os
from app.knowledge.document_loader import load_document
from app.knowledge.chunker import chunk_text
from app.knowledge.kb_store import save_chunks
from app.utils.embedding import embed_text

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-document")
async def upload_document(
    agentId: str = Form(...),
    file: UploadFile = File(...)
):
    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = load_document(file_path)
    chunks = chunk_text(text)
    embeddings = [embed_text(chunk) for chunk in chunks]

    save_chunks(
        agent_id=agentId,
        chunks=chunks,
        source_name=file.filename,
        url="uploaded_document",
        embeddings=embeddings,
        source_type="document",
    )

    return {
        "success": True,
        "agentId": agentId,
        "chunksCreated": len(chunks),
        "source": file.filename
    }
