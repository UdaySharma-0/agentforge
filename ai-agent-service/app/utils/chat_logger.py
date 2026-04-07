import json
from datetime import datetime
from pathlib import Path

LOG_FILE = Path("chat_logs.json")

def log_chat(business_name, customer, message, reply):
    log_entry = {
        "business": business_name,
        "customer": customer,
        "message": message,
        "reply": reply,
        "timestamp": datetime.utcnow().isoformat()
    }

    logs = []
    if LOG_FILE.exists():
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)

    logs.append(log_entry)

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)
