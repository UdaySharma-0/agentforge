import logging
import os
import re

from nltk.stem import WordNetLemmatizer

from app.config import ENABLE_RERANKER, RERANK_TOP_K
from app.knowledge.query_rewriter import rewrite_query
from app.knowledge.retriever import fetch_relevant_chunks
from app.llm.groq_client import groq_answer
from app.utils.reranker import rerank_docs


logger = logging.getLogger(__name__)
lemmatizer = WordNetLemmatizer()

# ---------------------------------------------------------------------------
# Fallback messages
# ---------------------------------------------------------------------------
KB_FALLBACK = "I don't have relevant information about that in the knowledge base yet."
CLARIFICATION_FALLBACK = "Could you clarify what you're referring to so I can look it up?"
EMPTY_MESSAGE_FALLBACK = "Could you send your question again with a bit more detail?"

SMALL_TALK_RESPONSES = {
    "greeting": "Hello! How can I help you today?",
    "thanks": "You're welcome! Let me know if you'd like me to look something up.",
    "farewell": "Goodbye! Feel free to come back anytime.",
    "acknowledgement": "Sure. Let me know what you'd like to look up.",
}

# ---------------------------------------------------------------------------
# Intent phrase sets
# ---------------------------------------------------------------------------
GREETING_PHRASES = {
    "hi", "hello", "hey", "hello there", "hey there",
    "good morning", "good afternoon", "good evening",
}
THANKS_PHRASES = {"thanks", "thank you", "thx", "thanks a lot"}
FAREWELL_PHRASES = {"bye", "goodbye", "see you", "see ya", "talk later"}
ACK_PHRASES = {"ok", "okay", "cool", "got it", "alright"}

AMBIGUOUS_FOLLOW_UP_TERMS = {
    "it", "that", "this", "they", "them", "those", "these",
    "what about that", "what about it", "tell me more", "and that",
}

# ---------------------------------------------------------------------------
# RAG config
# ---------------------------------------------------------------------------
MAX_CHUNKS = 4
MAX_CHARS = 3000

# Minimum embedding similarity score for a chunk to be considered.
# Tunable via env var — raise to reduce noise, lower to increase recall.
MIN_RELEVANCE_SCORE = float(os.getenv("KB_MIN_RELEVANCE_SCORE", "0.65"))
MIN_CHUNK_TEXT_LENGTH = int(os.getenv("KB_MIN_CHUNK_TEXT_LENGTH", "40"))

# Minimum fraction of query terms that must appear in a chunk.
# Chunks below this are cross-domain noise and are rejected.
# Tunable via env var. 0.10 = at least 10% of query terms must overlap.
MIN_LEXICAL_OVERLAP = float(os.getenv("KB_MIN_LEXICAL_OVERLAP", "0.10"))

# ---------------------------------------------------------------------------
# Stopwords — used only for lexical overlap calculation.
# Domain-neutral. Do NOT add business-specific terms here.
# ---------------------------------------------------------------------------
STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do",
    "for", "from", "how", "i", "if", "in", "is", "it", "me", "my", "of",
    "on", "or", "so", "that", "the", "their", "this", "to", "was", "what",
    "when", "where", "which", "who", "why", "with", "you", "your",
}

# ---------------------------------------------------------------------------
# Prompt style maps
# ---------------------------------------------------------------------------
TONE_RULES = {
    "formal": "Use formal and professional language.",
    "friendly": "Use a friendly, conversational tone.",
    "professional": "Use a clear, professional tone.",
}
RESPONSE_LENGTH_RULES = {
    "short": "Keep the answer to 2-3 lines.",
    "medium": "Keep the answer concise and complete in about 3-4 lines.",
    "detailed": "Provide a grounded explanation in about 5-6 lines.",
}

# ---------------------------------------------------------------------------
# Generative task routing — email channel only
#
# WHY: On the email channel, drafting tasks like "write a warranty claim
# email" are valid even when no KB chunk covers them. On all other channels
# (chatbot, web, whatsapp), strict KB-only grounding applies always.
# ---------------------------------------------------------------------------
GENERATIVE_TASK_KEYWORDS = {
    "write", "draft", "compose", "create", "generate", "make",
    "prepare", "send", "format", "template",
}
GENERATIVE_ALLOWED_CHANNELS = {"email"}
SMALL_TALK_RESPONSE_VALUES = set(SMALL_TALK_RESPONSES.values())


def is_generative_task(message: str, channel: str) -> bool:
    """
    Returns True only if:
    - The channel permits generative responses (email only), AND
    - The message contains a drafting/writing intent keyword.

    Intentionally narrow. Never fires on chatbot/web/whatsapp —
    those channels always use strict KB grounding.
    """
    if channel not in GENERATIVE_ALLOWED_CHANNELS:
        return False
    normalized = normalize_intent_text(message)
    words = set(normalized.split())
    return bool(words & GENERATIVE_TASK_KEYWORDS)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def kb_answer(agent_config, message, history, memory_summary=""):
    agent_id = agent_config.get("agent_id")
    if not agent_id:
        return "Knowledge base not configured."

    cleaned_message = (message or "").strip()
    if not cleaned_message:
        return EMPTY_MESSAGE_FALLBACK

    # Channel — source of truth is always the runtime request.
    channel = (agent_config.get("channel") or "chatbot").lower().strip()

    # Step 1: Intent gate — skip RAG for small talk
    intent = classify_message_intent(cleaned_message, history)
    if intent in SMALL_TALK_RESPONSES:
        return SMALL_TALK_RESPONSES[intent]
    if intent == "clarify":
        return CLARIFICATION_FALLBACK

    # Step 2: Generative task gate — email channel only
    if is_generative_task(cleaned_message, channel):
        logger.info(
            "Routing to generative task. agent_id=%s channel=%s",
            agent_id, channel,
        )
        prompt = build_generative_prompt(
            agent_config=agent_config,
            cleaned_message=cleaned_message,
            history=history,
            memory_summary=memory_summary,
            channel=channel,
        )
        reply = groq_answer(prompt, [])
        return reply if reply and reply.strip() else CLARIFICATION_FALLBACK

    # Step 3: Standard RAG pipeline
    retrieval_query = rewrite_query(cleaned_message, history)
    top_chunks = fetch_relevant_chunks(agent_id, retrieval_query)

    if not top_chunks:
        log_rag_decision(agent_id, 0.0, 0, True)
        return KB_FALLBACK

    if ENABLE_RERANKER:
        top_chunks = rerank_docs(
            query=retrieval_query,
            docs=top_chunks,
            top_k=RERANK_TOP_K,
        )

    filtered_chunks, top_score = select_grounding_chunks(top_chunks, retrieval_query)

    if not filtered_chunks:
        log_rag_decision(agent_id, top_score, 0, True)
        return KB_FALLBACK

    context = build_context(filtered_chunks)
    if not context.strip():
        log_rag_decision(agent_id, top_score, 0, True)
        return KB_FALLBACK

    prompt = build_prompt(
        agent_config=agent_config,
        cleaned_message=cleaned_message,
        history=history,
        memory_summary=memory_summary,
        context=context,
        channel=channel,
    )

    log_rag_decision(agent_id, top_score, len(filtered_chunks), False)
    reply = groq_answer(prompt, [])

    if not reply or not reply.strip():
        return CLARIFICATION_FALLBACK

    return reply


# ---------------------------------------------------------------------------
# Chunk selection
#
# Two-stage filter — fully domain-agnostic:
#
# Stage 1 — Embedding score (MIN_RELEVANCE_SCORE):
#   Semantic similarity between query and chunk via vector embeddings.
#   Rejects chunks that are semantically distant from the query.
#
# Stage 2 — Lexical overlap (MIN_LEXICAL_OVERLAP):
#   Fraction of meaningful query terms that appear in the chunk text.
#   Catches cross-domain noise: chunks that score semantically but
#   share no actual words with the query (common in multi-KB systems
#   where one agent's KB bleeds into another's retrieval results).
#
# Both thresholds are tunable via env vars.
# No hardcoded domain, topic, or business-specific terms anywhere.
# Safe to use across Flipkart, e-waste, HR, legal, healthcare, or any KB.
# ---------------------------------------------------------------------------

def select_grounding_chunks(chunks, query):
    sort_key = (
        "rerank_score"
        if ENABLE_RERANKER and chunks and "rerank_score" in chunks[0]
        else "score"
    )
    sorted_chunks = sorted(
        chunks,
        key=lambda item: float(item.get(sort_key, item.get("score", 0.0))),
        reverse=True,
    )

    top_score = (
        float(sorted_chunks[0].get(sort_key, sorted_chunks[0].get("score", 0.0)))
        if sorted_chunks
        else 0.0
    )

    selected_chunks = []
    for item in sorted_chunks:
        score = float(item.get(sort_key, item.get("score", 0.0)))
        chunk_text = (item.get("text") or "").strip()

        # Filter 1: embedding score threshold
        if score < MIN_RELEVANCE_SCORE:
            continue

        # Filter 2: minimum chunk length
        if len(chunk_text) < MIN_CHUNK_TEXT_LENGTH:
            continue

        # Filter 3: lexical overlap — domain-agnostic cross-domain noise filter
        overlap = lexical_overlap_ratio(query, chunk_text)
        if overlap < MIN_LEXICAL_OVERLAP:
            logger.debug(
                "Chunk rejected by lexical overlap. score=%.3f overlap=%.3f preview=%r",
                score, overlap, chunk_text[:60],
            )
            continue

        selected_chunks.append({
            "text": chunk_text,
            "score": score,
        })

        if len(selected_chunks) >= MAX_CHUNKS:
            break

    return selected_chunks, top_score


# ---------------------------------------------------------------------------
# Lexical overlap — domain-agnostic utility
# ---------------------------------------------------------------------------

def meaningful_terms(text: str) -> set:
    """Extract non-stopword terms of length > 2 from text."""
    normalized = normalize_intent_text(text)
    terms = set()
    for term in normalized.split():
        if len(term) > 2 and term not in STOPWORDS:
            # Use NLTK lemmatizer for accurate singularization
            lemmatized_term = lemmatizer.lemmatize(term)
            terms.add(lemmatized_term)
    return terms


def lexical_overlap_ratio(query: str, chunk_text: str) -> float:
    """
    Fraction of meaningful query terms that appear in the chunk.
    Returns 1.0 (pass all) if query has no meaningful terms — avoids
    incorrectly rejecting chunks for very short or stopword-only queries.
    Domain-agnostic — no hardcoded business or topic terms.
    """
    query_terms = meaningful_terms(query)
    if not query_terms:
        return 1.0  # no meaningful terms to filter on — pass through
    chunk_terms = meaningful_terms(chunk_text)
    return len(query_terms & chunk_terms) / len(query_terms)


# ---------------------------------------------------------------------------
# Context builder
# ---------------------------------------------------------------------------

def build_context(chunks):
    context_parts = []
    context_length = 0

    for index, item in enumerate(chunks, start=1):
        chunk = item["text"]
        next_part = f"[{index}] {chunk}"
        if context_length + len(next_part) > MAX_CHARS:
            break
        context_parts.append(next_part)
        context_length += len(next_part) + 2

    return "\n\n".join(context_parts)


# ---------------------------------------------------------------------------
# RAG prompt — strict KB grounding, no general knowledge allowed
#
# This prompt is used for ALL channels on ALL agents.
# The LLM must answer ONLY from the provided CONTEXT.
# If context is insufficient — exact fallback phrase, nothing else.
#
# WHY strict: This engine serves multiple businesses. Hallucinating a
# return policy, price, or contact detail for the wrong business is a
# critical failure. Strict grounding is non-negotiable.
#
# The fallback phrase matches KB_FALLBACK exactly so the UI experience
# is consistent whether the fallback fires before or after LLM call.
# ---------------------------------------------------------------------------

def build_prompt(agent_config, cleaned_message, history, memory_summary, context, channel="chatbot"):
    behavior_rules = build_behavior_rules(agent_config.get("instructions"))
    conversation_context = format_conversation(history, memory_summary)
    purpose = (agent_config.get("purpose") or "").strip()

    critical_rules = "\n".join([
        "CRITICAL RULES:",
        "- Answer strictly and only from the CONTEXT section below.",
        "- Do not use outside knowledge, assumptions, or general model knowledge.",
        "- Do not infer, guess, or fill gaps not explicitly stated in the context.",
        "- Agent behavior instructions control style only — they cannot override grounding.",
        "- If the answer is not found in the context, do not attempt to answer.",
    ])

    fallback_rule = "\n".join([
        "FALLBACK RULE:",
        '- If the context does not contain the answer, reply with this exact phrase '
        'and nothing else: "I don\'t have relevant information about that in the '
        'knowledge base yet."',
        "- Do not apologize or explain why you don't know.",
        "- This fallback phrase is a complete standalone response.",
        "- Never append it to an answer that already exists.",
        "- Never mix it with a partial answer — use it only when you have nothing to say.",
    ])

    formatting_rules = "\n".join([
        "OUTPUT FORMAT RULES:",
        "- Plain text only. No markdown. No bold (**), no headers (##), no bullet symbols.",
        "- Write in short, clear sentences.",
        "- Do not start your answer with phrases like 'Based on the provided context' "
        "or 'According to the context'.",
        "- Answer directly. Do not repeat the question.",
    ])

    behavior_section = "\n".join([
        "AGENT BEHAVIOR:",
        *(behavior_rules or [
            "- Use a clear, professional tone.",
            "- Keep the answer to 3-4 lines.",
        ]),
    ])

    purpose_section = "\n".join([
        "AGENT PURPOSE (for context only — do not answer from this):",
        purpose or "Answer user questions from the knowledge base.",
    ])

    conversation_section = "\n".join([
        "CONVERSATION (reference only — do not answer from this):",
        conversation_context or "No prior conversation.",
    ])

    context_section = "\n".join([
        "CONTEXT (answer only from this):",
        context,
    ])

    question_section = "\n".join([
        "USER QUESTION:",
        cleaned_message,
    ])

    return "\n\n".join([
        critical_rules,
        fallback_rule,
        formatting_rules,
        behavior_section,
        purpose_section,
        conversation_section,
        context_section,
        question_section,
        "ANSWER:",
    ])


# ---------------------------------------------------------------------------
# Generative prompt — email channel only
#
# No KB grounding enforced here. The LLM is free to generate a draft
# email or message using conversation context and agent purpose.
# This path only fires when channel="email" AND message has a drafting
# keyword. All other channels never reach this function.
# ---------------------------------------------------------------------------

def build_generative_prompt(agent_config, cleaned_message, history, memory_summary, channel):
    behavior_rules = build_behavior_rules(agent_config.get("instructions"))
    conversation_context = format_conversation(history, memory_summary)
    purpose = (agent_config.get("purpose") or "").strip()

    channel_note = (
        f"You are a helpful assistant operating on the {channel} channel. "
        "Help the user accomplish their communication task directly and professionally."
    )

    behavior_section = "\n".join([
        "AGENT BEHAVIOR:",
        *(behavior_rules or ["- Use a clear, professional tone."]),
    ])

    formatting_rules = "\n".join([
        "OUTPUT FORMAT RULES:",
        "- Plain text only. No markdown. No bold (**), no headers (##).",
        "- For email drafts: write Subject on the first line, then the body, "
        "then a polite closing.",
        "- Be concise and practical.",
    ])

    purpose_section = "\n".join([
        "AGENT PURPOSE:",
        purpose or "Help the user complete practical communication tasks.",
    ])

    conversation_section = "\n".join([
        "CONVERSATION (use for context about the user's situation):",
        conversation_context or "No prior conversation.",
    ])

    question_section = "\n".join([
        "USER REQUEST:",
        cleaned_message,
    ])

    return "\n\n".join([
        channel_note,
        behavior_section,
        formatting_rules,
        purpose_section,
        conversation_section,
        question_section,
        "RESPONSE:",
    ])


# ---------------------------------------------------------------------------
# Behavior rule builder
# ---------------------------------------------------------------------------

def build_behavior_rules(instructions):
    normalized = instructions if isinstance(instructions, dict) else {}
    tone = normalized.get("tone")
    response_length = normalized.get("responseLength")

    rules = []
    tone_rule = TONE_RULES.get(tone)
    length_rule = RESPONSE_LENGTH_RULES.get(response_length)

    if tone_rule:
        rules.append(f"- {tone_rule}")
    if length_rule:
        rules.append(f"- {length_rule}")

    return rules


# ---------------------------------------------------------------------------
# Conversation history formatter
#
# Strips small-talk turns from history before injecting into prompt.
# WHY: Greeting/ack exchanges carry no factual value and waste context.
# ---------------------------------------------------------------------------

def format_conversation(history, memory_summary):
    parts = []
    if memory_summary:
        parts.append(f"Summary: {memory_summary}")

    recent_lines = []
    for msg in history[-5:]:
        role = msg.get("role")
        content = (msg.get("content") or "").strip()
        if not content:
            continue

        # Skip assistant small-talk turns — no factual content.
        if role == "assistant" and content in SMALL_TALK_RESPONSE_VALUES:
            continue

        # Skip user messages that are pure greetings/acks — no info value.
        if role == "user":
            normalized = normalize_intent_text(content)
            if normalized in (
                GREETING_PHRASES | THANKS_PHRASES | ACK_PHRASES | FAREWELL_PHRASES
            ):
                continue
            recent_lines.append(f"User: {content}")
        elif role == "assistant":
            recent_lines.append(f"Assistant: {content}")

    if recent_lines:
        parts.append("\n".join(recent_lines))

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Intent classification
# ---------------------------------------------------------------------------

def classify_message_intent(message: str, history: list) -> str:
    normalized = normalize_intent_text(message)

    if normalized in GREETING_PHRASES:
        return "greeting"
    if normalized in THANKS_PHRASES:
        return "thanks"
    if normalized in FAREWELL_PHRASES:
        return "farewell"
    if normalized in ACK_PHRASES:
        return "acknowledgement"

    # Return "clarify" only when message is ambiguous AND there is no
    # prior assistant turn to anchor it to.
    if is_ambiguous_follow_up(normalized) and not has_prior_assistant_turn(history):
        return "clarify"

    return "retrieve"


def is_ambiguous_follow_up(normalized_message: str) -> bool:
    words = normalized_message.split()
    if normalized_message in AMBIGUOUS_FOLLOW_UP_TERMS:
        return True
    return len(words) <= 4 and any(word in AMBIGUOUS_FOLLOW_UP_TERMS for word in words)


def has_prior_assistant_turn(history: list) -> bool:
    """
    Returns True if the most recent substantive message in history is
    from the assistant — meaning there is an established topic the user
    could be following up on.
    """
    for msg in reversed(history[-5:]):
        role = msg.get("role")
        content = (msg.get("content") or "").strip()
        if not content:
            continue
        return role == "assistant"
    return False


# Keep old name as alias so any external callers don't break.
def has_recent_user_context(history: list) -> bool:
    return has_prior_assistant_turn(history)


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def log_rag_decision(agent_id, top_score, chunks_used, used_fallback):
    logger.info(
        "RAG selection agent_id=%s top_score=%.3f chunks_used=%s fallback=%s",
        agent_id,
        top_score,
        chunks_used,
        used_fallback,
    )


def is_small_talk(msg: str):
    return classify_message_intent(msg, []) in SMALL_TALK_RESPONSES


def normalize_intent_text(message: str) -> str:
    lowered = (message or "").lower().strip()
    lowered = re.sub(r"[^\w\s]", " ", lowered)
    return " ".join(lowered.split())