import os
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv
from pathlib import Path
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY_ENV = "OPENAI_SECRET_KEY"
OPENAI_MODEL_ENV = "gpt-4o-mini"
DEFAULT_MODEL_NAME = "gpt-4o-mini"


@lru_cache()
def _get_client() -> Optional[OpenAI]:
    api_key = os.getenv(OPENAI_API_KEY_ENV)
    print("OPENAI_SECRET_KEY:", api_key)
    if not api_key:
        return None
    return OpenAI(api_key=api_key)


def beautify_worklog_description(text: str) -> str:
    if not text:
        return text

    client = _get_client()
    if client is None:
        return text

    model_name = os.getenv(OPENAI_MODEL_ENV, DEFAULT_MODEL_NAME)

    system_prompt = (
        "Ты помощник по оформлению рабочих отчётов.\n"
        "Перепиши текст аккуратным, понятным деловым русским языком.\n"
        "Сохраняй факты и смысл, ничего не придумывай.\n"
        "Без комментариев, без пояснений — только итоговый текст."
    )

    try:
        response = client.responses.create(
            model=model_name,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            temperature=0.2,
        )

        result = response.output_text
        return result.strip() if result else text

    except Exception as ex:
        print("LLM ERROR:", ex)
        return text
