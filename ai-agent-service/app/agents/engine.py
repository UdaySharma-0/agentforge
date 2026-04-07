from app.knowledge.kb_engine import kb_answer
from app.agents.rule_based import rule_based_agent

def run_agent(agent_config: dict, message: str, history=None) -> str:
    if history is None:
        history = []
    agent_type = agent_config.get("type")

    if agent_type == "knowledge_based":
        print("calling kb_answer file")
        return kb_answer(agent_config, message, history)

    if agent_type == "rule_based":
        return rule_based_agent(agent_config, message)

    return "Agent not configured properly."
