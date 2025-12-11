import hashlib
import hmac
from app.core.config import settings


def validate_telegram_auth(data: dict) -> bool:
    """
    Validate Telegram login payload according to official docs.

    The payload we receive may already be parsed and normalised (e.g. by
    Pydantic), which means optional fields that were not actually sent by
    Telegram can appear in the dict with a value of None. These fields must
    be ignored when building the data_check_string, otherwise the hash will
    not match and a valid login attempt will be rejected.
    """
    check_hash = data.pop("hash", None)
    if not isinstance(check_hash, str):
        return False

    # Ignore fields that have no value (typically added by schema defaults)
    filtered_items = [(k, v) for k, v in data.items() if v is not None]

    # According to Telegram docs, data_check_string must be built as
    # key=value pairs separated by newline characters, sorted by key.
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(filtered_items))

    bot_token = settings.TELEGRAM_BOT_TOKEN or ""
    if not bot_token:
        # If the token is not configured, we cannot validate; fail closed.
        return False

    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    return calculated_hash == check_hash
