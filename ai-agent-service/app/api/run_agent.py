from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.engine import run_agent
from ..utils.conversation_memory import fetch_recent_messages

router = APIRouter()

class AgentRequest(BaseModel):
    agent_config: dict
    message: str
    conversationId: str

@router.post("/run-agent")
def run_agent_engine(data: AgentRequest):
    agent_config = data.agent_config
    memory_window = agent_config.get("memory_window", 5)
    history = fetch_recent_messages(
        data.conversationId,
        limit=memory_window
    )

    reply = run_agent(
        agent_config=agent_config,
        message=data.message,
        history=history
    )

    return {"reply": reply}
