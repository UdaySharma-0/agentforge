PRONOUNS = {"it", "they", "them", "that", "this", "he", "she", "those", "these"}
FOLLOW_UP_PHRASES = {
    "under warranty",
    "not charging",
    "same issue",
    "that issue",
    "this issue",
    "what about",
}
SMALL_TALK_TERMS = {"hi", "hello", "hey", "thanks", "thank you", "ok", "okay"}


def rewrite_query(message: str, history: list) -> str:
    """
    Improve retrieval query using the last 1-2 meaningful user turns.
    """
    cleaned_message = " ".join((message or "").strip().split())
    if not cleaned_message:
        return message

    if not is_follow_up(cleaned_message):
        return cleaned_message

    previous_turns = get_last_meaningful_user_turns(history, exclude=cleaned_message, limit=2)
    if not previous_turns:
        return cleaned_message

    return " ".join(previous_turns + [cleaned_message])


def is_follow_up(message: str) -> bool:
    normalized = normalize_text(message)
    words = set(normalized.split())

    if normalized in FOLLOW_UP_PHRASES:
        return True
    if any(phrase in normalized for phrase in FOLLOW_UP_PHRASES):
        return True
    if words & PRONOUNS:
        return True
    return len(words) <= 6 and any(term in normalized for term in {"warranty", "charging", "refund", "return"})


def get_last_meaningful_user_turns(history: list, exclude: str = "", limit: int = 2) -> list:
    meaningful_turns = []
    exclude_normalized = normalize_text(exclude)

    for msg in reversed(history):
        if msg.get("role") != "user":
            continue

        content = " ".join((msg.get("content") or "").strip().split())
        normalized = normalize_text(content)
        if not content or normalized == exclude_normalized:
            continue
        if normalized in SMALL_TALK_TERMS:
            continue

        meaningful_turns.append(content)
        if len(meaningful_turns) >= limit:
            break

    return list(reversed(meaningful_turns))


def normalize_text(value: str) -> str:
    return " ".join((value or "").lower().split())
