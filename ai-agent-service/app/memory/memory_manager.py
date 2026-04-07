from app.config import ENABLE_MEMORY_SUMMARY, SUMMARY_TIMEOUT_S
from app.utils.summarizer import summarize_text


def update_memory_summary(old_summary: str, history: list):
    if not ENABLE_MEMORY_SUMMARY:
        return old_summary.strip()

    recent_messages = ""

    for msg in history[-6:]:
        role = msg["role"]
        content = msg["content"]
        recent_messages += f"{role}: {content}\n"

    prompt = f"""
You are maintaining a conversation summary.

Existing summary:
{old_summary}

New conversation messages:
{recent_messages}

Update the summary to include the new information.
Keep it concise (max 5 sentences).
"""

    summary = summarize_text(prompt, max_sentences=2, timeout_s=SUMMARY_TIMEOUT_S)

    return summary.strip()
