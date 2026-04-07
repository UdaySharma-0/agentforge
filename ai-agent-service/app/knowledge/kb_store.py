from datetime import datetime
from bson import ObjectId
from app.config import mongo_db


def save_chunks(agent_id: str, chunks: list, source_name: str, url: str, embeddings, source_type: str):

    docs = []

    for index, chunk in enumerate(chunks):

        docs.append({
            "agentId": ObjectId(agent_id),
            "text": chunk,
            "embedding": embeddings[index],
            "sourceType": source_type,
            "sourceName": source_name,
            "url": url,
            "chunkIndex": index,
            "createdAt": datetime.utcnow()
        })
    print(docs)
    if docs:
        mongo_db["knowledge_chunks"].insert_many(docs)


def delete_chunks_by_source_type(agent_id: str, source_type: str):
    return mongo_db["knowledge_chunks"].delete_many({
        "agentId": ObjectId(agent_id),
        "sourceType": source_type,
    })
