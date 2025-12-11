import hashlib
import hmac
from app.core.config import settings




def validate_telegram_auth(data: dict) -> bool:
    check_hash = data.pop("hash")
    data_check_string = " ".join([f"{k}={v}" for k, v in sorted(data.items())])
    secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return calculated_hash == check_hash