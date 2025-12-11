import asyncio
import os
from datetime import date, timedelta

import httpx
import uvicorn
from aiogram import Bot, Dispatcher
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)
from fastapi import FastAPI

bot = Bot(token=os.getenv("TELEGRAM_API_BOT") or "")
if not bot.token:
    raise RuntimeError("Environment variable TELEGRAM_API_BOT is required")

dp = Dispatcher()
app = FastAPI()

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8001/users/")
WORKLOG_SERVICE_URL = os.getenv("WORKLOG_SERVICE_URL", "http://localhost:8003/worklogs/")

user_data: dict[int, dict] = {}
user_states: dict[int, dict] = {}

REG_STEPS = ["fio", "position", "department", "phone"]
REG_PROMPTS = {
    "fio": "Введите, пожалуйста, вашу фамилию, имя и отчество:",
    "position": "Введите вашу должность:",
    "department": "Введите ваш отдел:",
    "phone": "Введите ваш номер телефона:",
}

REGISTERED_ACTION_TEXT = "Создать отчёт"


def _registered_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=REGISTERED_ACTION_TEXT)]],
        resize_keyboard=True,
    )


def _build_date_keyboard() -> InlineKeyboardMarkup:
    today = date.today()
    rows: list[list[InlineKeyboardButton]] = []
    for i in range(7):
        d = today + timedelta(days=i)
        rows.append(
            [
                InlineKeyboardButton(
                    text=d.strftime("%d.%m.%Y"),
                    callback_data=f"pick_date:{d.isoformat()}",
                )
            ]
        )
    rows.append(
        [
            InlineKeyboardButton(text="Сегодня", callback_data=f"pick_date:{today.isoformat()}"),
            InlineKeyboardButton(
                text="Вчера",
                callback_data=f"pick_date:{(today - timedelta(days=1)).isoformat()}",
            ),
        ]
    )
    rows.append([InlineKeyboardButton(text="Отмена", callback_data="pick_date:cancel")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def send_step_prompt(message: Message, step: int):
    field = REG_STEPS[step]
    prompt = REG_PROMPTS[field]
    if field == "phone":
        markup = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="Отправить мой номер телефона", request_contact=True)]],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await message.answer(prompt, reply_markup=markup)
    else:
        await message.answer(prompt, reply_markup=ReplyKeyboardRemove())


async def reply_existing_user(message: Message):
    await message.answer(
        "Вы уже зарегистрированы.\nНажмите «Создать отчёт», чтобы добавить запись.",
        reply_markup=_registered_keyboard(),
    )


async def fetch_user_from_service(telegram_id: int):
    async with httpx.AsyncClient(timeout=10) as client:
        # USER_SERVICE_URL обычно заканчивается на `/users/`
        response = await client.get(f"{USER_SERVICE_URL}{telegram_id}")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json()


async def sync_user_to_service(message: Message, data: dict) -> dict | None:
    payload = {
        "telegram_id": message.from_user.id,
        "first_name": message.from_user.first_name,
        "last_name": message.from_user.last_name,
        "username": message.from_user.username,
        "fio": data.get("fio"),
        "position": data.get("position"),
        "department": data.get("department"),
        "phone": data.get("phone"),
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(USER_SERVICE_URL, json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        await message.answer("Не удалось сохранить данные пользователя, попробуйте позже.")
        return None


async def create_worklog(message: Message, user_id: int, description: str, work_date: date):
    payload = {
        "user_id": user_id,
        "description": description,
        "date": work_date.isoformat(),
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(WORKLOG_SERVICE_URL.rstrip("/"), json=payload)
            response.raise_for_status()
    except httpx.HTTPError:
        await message.answer("Не удалось создать запись, попробуйте позже.")


async def handle_registration_message(message: Message, state: dict):
    user_id = message.from_user.id
    step = state["step"]
    data = state["data"]
    current_field = REG_STEPS[step]

    value = None
    if current_field == "phone" and message.contact:
        value = message.contact.phone_number
    elif message.text:
        value = message.text.strip()

    if not value:
        await message.answer(
            "Я не смог прочитать сообщение. Пожалуйста, введите значение ещё раз."
        )
        await send_step_prompt(message, step)
        return

    data[current_field] = value
    step += 1

    if step < len(REG_STEPS):
        state["step"] = step
        await send_step_prompt(message, step)
        return

    # Регистрация завершена, синхронизируем пользователя с UserService,
    # чтобы получить его id для создания worklog.
    del user_states[user_id]

    remote_user = await sync_user_to_service(message, data.copy())
    if remote_user:
        user_data[user_id] = remote_user
        await message.answer("Отлично! Вы успешно зарегистрированы.", reply_markup=_registered_keyboard())
        await message.answer(f"Ваши данные: {data}")
    else:
        await message.answer("Регистрация не завершена из‑за ошибки сохранения пользователя.")


async def handle_registered_user_message(message: Message, remote_user: dict):
    user_id = message.from_user.id
    text = (message.text or "").strip()

    if text == REGISTERED_ACTION_TEXT:
        user_states[user_id] = {
            "type": "worklog",
            "step": "waiting_description",
            "data": {"user_id": remote_user.get("id")},
        }
        await message.answer("Опишите, чем вы занимались:", reply_markup=ReplyKeyboardRemove())
        return

    await reply_existing_user(message)


async def handle_worklog_message(message: Message, state: dict):
    user_id = message.from_user.id
    step = state["step"]
    data = state["data"]

    if step == "waiting_description":
        if not message.text:
            await message.answer("Я не понял сообщение, опишите, чем вы занимались.")
            return
        data["description"] = message.text.strip()
        state["step"] = "waiting_date"
        await message.answer("Выберите дату для отчёта:", reply_markup=_build_date_keyboard())
        return


@dp.message()
async def handle_message(message: Message):
    user_id = message.from_user.id
    state = user_states.get(user_id)

    if state:
        state_type = state.get("type", "registration")
        if state_type == "registration":
            await handle_registration_message(message, state)
            return
        if state_type == "worklog":
            await handle_worklog_message(message, state)
            return

    remote_user = user_data.get(user_id)

    if remote_user is None:
        try:
            remote_user = await fetch_user_from_service(user_id)
        except httpx.HTTPError:
            await message.answer("Не удалось получить данные пользователя, попробуйте позже.")
            return

        if remote_user:
            user_data[user_id] = remote_user

    if remote_user:
        await handle_registered_user_message(message, remote_user)
        return

    user_states[user_id] = {"type": "registration", "step": 0, "data": {}}
    await message.answer(
        "Привет! Давайте познакомимся. Пожалуйста, укажите несколько данных о себе.",
        reply_markup=ReplyKeyboardRemove(),
    )
    await send_step_prompt(message, 0)


@dp.callback_query()
async def handle_callback(query: CallbackQuery):
    data = query.data or ""
    if not data.startswith("pick_date:"):
        await query.answer()
        return

    user_id = query.from_user.id
    state = user_states.get(user_id)
    if not state or state.get("type") != "worklog" or state.get("step") != "waiting_date":
        await query.answer()
        return

    value = data.split(":", 1)[1]
    if value == "cancel":
        del user_states[user_id]
        await query.message.edit_reply_markup(reply_markup=None)
        await query.message.answer("Создание отчёта отменено.", reply_markup=_registered_keyboard())
        await query.answer("Отменено")
        return

    try:
        selected_date = date.fromisoformat(value)
    except ValueError:
        await query.answer("Некорректная дата", show_alert=True)
        return

    worklog_data = state["data"]
    description = worklog_data.get("description")
    remote_user_id = worklog_data.get("user_id")

    await query.message.edit_reply_markup(reply_markup=None)
    await query.answer("Дата выбрана")

    if remote_user_id and description:
        await create_worklog(query.message, remote_user_id, description, selected_date)
        await query.message.answer(
            "Запись успешно создана.", reply_markup=_registered_keyboard()
        )
    else:
        await query.message.answer(
            "Не удалось сохранить запись, попробуйте ещё раз.",
            reply_markup=_registered_keyboard(),
        )

    if user_id in user_states:
        del user_states[user_id]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.on_event("startup")
async def start_bot():
    asyncio.create_task(dp.start_polling(bot))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

