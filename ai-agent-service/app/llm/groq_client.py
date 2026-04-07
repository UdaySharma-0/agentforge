import json
import logging
import os
import time

from groq import Groq


logger = logging.getLogger(__name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def request_size_bytes(payload: dict) -> int:
    return len(json.dumps(payload).encode("utf-8"))


def trim_sources(sources: list[str], max_bytes: int, base_payload: dict) -> list[str]:
    trimmed = []
    for src in sources:
        test_payload = {
            **base_payload,
            "messages": base_payload["messages"] + [
                {"role": "user", "content": "\n".join(trimmed + [src])}
            ],
        }
        if request_size_bytes(test_payload) > max_bytes:
            break
        trimmed.append(src)
    return trimmed


def groq_answer(prompt: str, sources: list[str] | None = None) -> str:
    sources = sources or []
    print(prompt)
    start = time.time()
    res = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=300
    )

    logger.info("Groq response received in %.2f seconds", time.time() - start)
    return res.choices[0].message.content.strip()
