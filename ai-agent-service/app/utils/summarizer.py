import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

logger = logging.getLogger(__name__)


def _get_default_timeout() -> float:
    return float(os.getenv("SUMMARY_TIMEOUT_S", "3.0"))


def _log_event(event: str, status: str, **fields) -> None:
    payload = {
        "component": "summarizer",
        "event": event,
        "status": status,
        **fields,
    }
    logger.info(json.dumps(payload, default=str))


def _fallback_summary(text: str, max_sentences: int) -> str:
    cleaned = " ".join(text.split())
    if not cleaned:
        return ""

    sentences = [segment.strip() for segment in cleaned.replace("!", ".").replace("?", ".").split(".") if segment.strip()]
    if sentences:
        return ". ".join(sentences[:max_sentences]).strip() + "."

    words = cleaned.split()
    return " ".join(words[: min(len(words), 40)]).strip()


def _build_prompt(text: str, max_sentences: int) -> str:
    return f"""
You are a summarization utility.

Summarize the input in at most {max_sentences} sentences.
Rules:
- No bullet points
- No heading
- No preamble
- No explanations about what you are doing
- Keep only the most important facts
- If the input is already short, compress it without expanding

TEXT:
{text}
"""


def _run_summary_request(prompt: str) -> str:
    from app.llm.groq_client import groq_answer

    return groq_answer(prompt)


def summarize_text(text: str, max_sentences: int = 2, timeout_s: float | None = None) -> str:
    cleaned = " ".join(text.split())
    if not cleaned:
        _log_event("summarize", "skipped", reason="empty_input")
        return ""

    effective_timeout = _get_default_timeout() if timeout_s is None else timeout_s
    prompt = _build_prompt(cleaned, max_sentences)
    started_at = time.perf_counter()

    _log_event(
        "summarize",
        "started",
        input_chars=len(cleaned),
        timeout_s=effective_timeout,
        max_sentences=max_sentences,
    )

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_run_summary_request, prompt)

        try:
            summary = future.result(timeout=effective_timeout)
            elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)

            if not summary or not summary.strip():
                fallback = _fallback_summary(cleaned, max_sentences)
                _log_event(
                    "summarize",
                    "fallback",
                    reason="empty_response",
                    elapsed_ms=elapsed_ms,
                    fallback_used=True,
                )
                return fallback

            _log_event(
                "summarize",
                "completed",
                elapsed_ms=elapsed_ms,
                output_chars=len(summary.strip()),
            )
            return summary.strip()
        except FuturesTimeoutError:
            elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)
            fallback = _fallback_summary(cleaned, max_sentences)
            _log_event(
                "summarize",
                "timeout",
                elapsed_ms=elapsed_ms,
                timeout_s=effective_timeout,
                fallback_used=True,
            )
            return fallback
        except Exception as error:
            elapsed_ms = round((time.perf_counter() - started_at) * 1000, 2)
            fallback = _fallback_summary(cleaned, max_sentences)
            _log_event(
                "summarize",
                "error",
                elapsed_ms=elapsed_ms,
                error_type=type(error).__name__,
                error_message=str(error),
                fallback_used=True,
            )
            return fallback
