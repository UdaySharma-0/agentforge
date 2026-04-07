from bson import ObjectId
from fastapi import APIRouter

from app.config import mongo_db

router = APIRouter()


@router.get("/knowledge/agent/{agent_id}")
def get_knowledge_by_agent(agent_id: str):
    collection = mongo_db["knowledge_chunks"]
    docs = list(
        collection.find(
            {"agentId": ObjectId(agent_id)},
            {
                "_id": 0,
                "sourceType": 1,
                "sourceName": 1,
                "url": 1,
                "text": 1,
                "createdAt": 1,
            },
        ).sort("createdAt", -1)
    )

    websites = {}
    documents = {}
    manual_text_chunks = []

    for doc in docs:
        source_type = doc.get("sourceType")
        if source_type == "website":
            key = doc.get("url") or doc.get("sourceName") or "website"
            entry = websites.setdefault(key, {"url": key, "chunkCount": 0})
            entry["chunkCount"] += 1
        elif source_type == "document":
            key = doc.get("sourceName") or "document"
            entry = documents.setdefault(key, {"sourceName": key, "chunkCount": 0})
            entry["chunkCount"] += 1
        elif source_type == "manual_text":
            manual_text_chunks.append(doc.get("text", ""))

    manual_preview = " ".join(chunk.strip() for chunk in manual_text_chunks if chunk.strip()).strip()
    manual_preview = manual_preview[:240].strip()

    return {
        "success": True,
        "websites": list(websites.values()),
        "documents": list(documents.values()),
        "manualText": {
            "exists": bool(manual_text_chunks),
            "chunkCount": len(manual_text_chunks),
            "preview": manual_preview,
        },
    }
