import json
from urllib import request
from urllib.error import HTTPError, URLError

from config import Config, get_env


XAI_RESPONSES_URL = "https://api.x.ai/v1/responses"


def _api_key():
    return Config.XAI_API_KEY or get_env("XAI_API_KEY", required=True)


def _extract_text(payload):
    if payload.get("output_text"):
        return payload["output_text"].strip()

    parts = []
    for item in payload.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                parts.append(content.get("text", ""))
    return "\n".join(part for part in parts if part).strip()


def generate_course_tutor_reply(system_prompt, recent_messages):
    api_key = _api_key()
    payload = json.dumps(
        {
            "model": Config.XAI_MODEL,
            "input": [{"role": "system", "content": system_prompt}, *recent_messages],
            "temperature": 0.3,
            "max_output_tokens": 500,
        }
    ).encode("utf-8")
    http_request = request.Request(
        XAI_RESPONSES_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(http_request, timeout=45) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        details = error.read().decode("utf-8")
        raise ValueError(details or "xAI request failed") from error
    except URLError as error:
        raise ValueError("Unable to reach xAI") from error

    text = _extract_text(payload)
    if not text:
        raise ValueError("xAI returned an empty response.")
    return text
