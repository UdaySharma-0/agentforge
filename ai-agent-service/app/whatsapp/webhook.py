from fastapi import APIRouter, Request
from app.whatsapp.sender import send_whatsapp_message
from app.agents.engine import run_agent
from app.whatsapp.business_registry import BUSINESSES
from app.utils.chat_logger import log_chat

router = APIRouter()

@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    data = await request.form()

    incoming_msg = data.get("Body")
    from_number = data.get("From")
    to_number = data.get("To")

    business = BUSINESSES.get(to_number)

    if not business:
        send_whatsapp_message(
            from_number,
            "Sorry, this business is not registered."
        )
        return {"status": "unknown business"}

    agent_config = business["agent_config"]
    business_name = business["business_name"]

    reply = run_agent(agent_config, incoming_msg)

    # 🔥 LOG THE CHAT
    log_chat(
        business_name=business_name,
        customer=from_number,
        message=incoming_msg,
        reply=reply
    )

    send_whatsapp_message(from_number, reply)

    return {"status": "message processed"}
