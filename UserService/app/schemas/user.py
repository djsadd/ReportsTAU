from pydantic import BaseModel


class User(BaseModel):
    id: int
    telegram_id: int
    first_name: str | None
    last_name: str | None
    username: str | None
    fio: str | None
    position: str | None
    department: str | None
    phone: str | None
    is_admin: bool


class UserCreate(BaseModel):
    telegram_id: int
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    fio: str | None = None
    position: str | None = None
    department: str | None = None
    phone: str | None = None
