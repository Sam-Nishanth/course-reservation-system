import base64
import hashlib
import hmac
import json
from urllib import request
from urllib.error import HTTPError, URLError

from config import Config, get_env


RAZORPAY_BASE_URL = "https://api.razorpay.com/v1"


def _credentials():
    key_id = Config.RAZORPAY_KEY_ID or get_env("RAZORPAY_KEY_ID", required=True)
    key_secret = Config.RAZORPAY_KEY_SECRET or get_env("RAZORPAY_KEY_SECRET", required=True)
    return key_id, key_secret


def public_key():
    key_id, _ = _credentials()
    return key_id


def create_order(amount_paise, receipt, notes=None):
    key_id, key_secret = _credentials()
    auth_token = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("utf-8")
    payload = json.dumps(
        {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,
            "notes": notes or {},
        }
    ).encode("utf-8")
    http_request = request.Request(
        f"{RAZORPAY_BASE_URL}/orders",
        data=payload,
        headers={
            "Authorization": f"Basic {auth_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(http_request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        details = error.read().decode("utf-8")
        raise ValueError(details or "Razorpay request failed") from error
    except URLError as error:
        raise ValueError("Unable to reach Razorpay") from error


def verify_signature(order_id, payment_id, signature):
    _, key_secret = _credentials()
    generated = hmac.new(
        key_secret.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated, signature)
