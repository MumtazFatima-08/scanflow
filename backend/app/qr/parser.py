"""
Payload parser — the reverse direction.

Given the raw text that came out of a QR code, work out what kind of
target it points to and pull out the structured fields a person actually
cares about (an SSID and password, a name and phone number, a UPI ID and
amount, or just a link).
"""
from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse

from app.qr.payloads import FORM_DOMAINS, SOCIAL_DOMAINS


def _unescape_wifi(value: str) -> str:
    return re.sub(r"\\(.)", r"\1", value)


def _parse_wifi(payload: str) -> dict:
    # WIFI:T:WPA;S:MySSID;P:MyPassword;H:false;;
    body = payload[len("WIFI:"):]
    parts = re.split(r"(?<!\\);", body)
    out = {"security": "WPA", "ssid": "", "password": "", "hidden": False}
    for part in parts:
        if ":" not in part:
            continue
        key, _, value = part.partition(":")
        value = _unescape_wifi(value)
        if key == "T":
            out["security"] = value or "WPA"
        elif key == "S":
            out["ssid"] = value
        elif key == "P":
            out["password"] = value
        elif key == "H":
            out["hidden"] = value.lower() == "true"
    return out


def _parse_vcard(payload: str) -> dict:
    out = {"name": "", "phone": "", "email": "", "organization": ""}
    for line in payload.splitlines():
        line = line.strip()
        if line.upper().startswith("FN:"):
            out["name"] = line.split(":", 1)[1]
        elif line.upper().startswith("TEL"):
            out["phone"] = line.split(":", 1)[1] if ":" in line else ""
        elif line.upper().startswith("EMAIL"):
            out["email"] = line.split(":", 1)[1] if ":" in line else ""
        elif line.upper().startswith("ORG:"):
            out["organization"] = line.split(":", 1)[1]
    return out


def _parse_upi(payload: str) -> dict:
    parsed = urlparse(payload)
    q = parse_qs(parsed.query)
    return {
        "upi_id": q.get("pa", [""])[0],
        "payee_name": q.get("pn", [""])[0],
        "amount": q.get("am", [""])[0],
        "currency": q.get("cu", [""])[0],
    }


def _classify_link(url: str) -> str:
    lowered = url.lower()
    if any(d in lowered for d in FORM_DOMAINS):
        return "FORM"
    if any(d in lowered for d in SOCIAL_DOMAINS):
        return "SOCIAL"
    return "WEBSITE"


def parse_payload(payload: str) -> tuple[str, dict]:
    """Returns (qr_type, fields). qr_type is one of WEBSITE/FORM/SOCIAL/WIFI/CONTACT/UPI/TEXT."""
    stripped = payload.strip()

    if stripped.upper().startswith("WIFI:"):
        return "WIFI", _parse_wifi(stripped)

    if stripped.upper().startswith("BEGIN:VCARD"):
        return "CONTACT", _parse_vcard(stripped)

    if stripped.lower().startswith("upi://"):
        return "UPI", _parse_upi(stripped)

    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", stripped) or re.match(
        r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+", stripped
    ):
        url = stripped if "://" in stripped else "https://" + stripped
        kind = _classify_link(url)
        return kind, {"url": url}

    return "TEXT", {"raw": stripped}
