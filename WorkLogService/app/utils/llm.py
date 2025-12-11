import os
from functools import lru_cache
from typing import Optional

try:
    # Новая версия клиента OpenAI
    from openai import OpenAI  # type: ignore
except ImportError:  # pragma: no cover - мягкий фолбэк, если пакет не установлен
    OpenAI = None  # type: ignore


OPENAI_API_KEY_ENV = "OPENAI_SECRET_KEY"
OPENAI_MODEL_ENV = "OPENAI_MODEL"
DEFAULT_MODEL_NAME = "gpt-4o-mini"


@lru_cache()
def _get_client() -> Optional["OpenAI"]:
    """
    Создаёт и кеширует клиент OpenAI.
    Если ключа или библиотеки нет — возвращает None,
    чтобы сервис продолжал работать без LLM.
    """
    if OpenAI is None:
        return None

    api_key = os.getenv(OPENAI_API_KEY_ENV)
    if not api_key:
        return None

    return OpenAI(api_key=api_key)


def beautify_worklog_description(text: str) -> str:
    """
    Отправляет исходный текст отчёта в GPT‑4 для красивой деловой
    переформулировки. При любой ошибке возвращает исходный текст.
    """
    client = _get_client()
    if client is None or not text:
        return text

    model_name = os.getenv(OPENAI_MODEL_ENV, DEFAULT_MODEL_NAME)

    system_prompt = (
        "Ты помощник по оформлению рабочих отчётов.\n"
        "Перепиши текст аккуратным, понятным деловым русским языком.\n"
        "Сохраняй факты и смысл, ничего не выдумывай и не сокращай критично.\n"
        "Не добавляй комментариев, списков задач и пояснений — только финальный текст отчёта."
    )

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            temperature=0.3,
        )
        content = response.choices[0].message.content or ""
        content = content.strip()
        return content or text
    except Exception:
        # Если LLM упал по любой причине, не ломаем создание отчёта
        return text
