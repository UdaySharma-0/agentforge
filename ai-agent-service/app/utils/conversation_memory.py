from app.config import mongo_db  # assuming db is exposed here

def fetch_recent_messages(conversation_id: str, limit: int = 8):
    total_messages = mongo_db.messages.count_documents({"conversationId": conversation_id})
    skip = max(total_messages - limit, 0)

    cursor = (
        mongo_db.messages.find(
            {"conversationId": conversation_id},
            {"_id": 0, "role": 1, "content": 1},
        )
        .sort("createdAt", 1)
        .skip(skip)
        .limit(limit)
    )

    return list(cursor)
