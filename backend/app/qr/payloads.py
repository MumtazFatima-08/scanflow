"""
Payload builders.

Each QR code type has a real, standard text format that phone cameras and
QR apps already know how to interpret. ScanFlow builds the *exact* string
that would go inside the QR — this is the "how it actually works" part
most people never see. No proprietary format, no shortcuts.
"""
from __future__ import annotations

import re

SOCIAL_DOMAINS = ["instagram.com", "twitter.com", "x.com", "linkedin.com", "facebook.com",
                   "github.com", "tiktok.com", "youtube.com", "threads.net"]
FORM_DOMAINS = ["forms.gle", "docs.google.com", "typeform.com", "jotform.com", "forms.office.com"]

UPI_RE = re.compile(r"^[\w.\-]{2,}@[\w.\-]{2,}$")


class ValidationError(Exception):
    pass


def _escape_wifi(value: str) -> str:
    # Per the WIFI: QR spec, these characters must be backslash-escaped.
    return re.sub(r'([\\;,:"])', r"\\\1", value)


def classify_link(url: str) -> str:
    lowered = url.lower()
    if any(d in lowered for d in FORM_DOMAINS):
        return "FORM"
    if any(d in lowered for d in SOCIAL_DOMAINS):
        return "SOCIAL"
    return "WEBSITE"


def build_link_payload(fields: dict) -> tuple[str, str, dict]:
    url = (fields.get("url") or "").strip()
    if not url:
        raise ValidationError("A link is required.")
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        url = "https://" + url
    link_kind = fields.get("link_kind") or classify_link(url)
    return url, link_kind, {"url": url}


def build_wifi_payload(fields: dict) -> tuple[str, str, dict]:
    ssid = (fields.get("ssid") or "").strip()
    if not ssid:
        raise ValidationError("A network name (SSID) is required.")
    password = (fields.get("password") or "").strip()
    security = (fields.get("security") or "WPA").upper()
    if security not in ("WPA", "WEP", "NOPASS"):
        security = "WPA"
    hidden = bool(fields.get("hidden", False))
    if security == "NOPASS":
        password = ""
    elif not password:
        raise ValidationError("A password is required unless the network is open.")

    payload = (
        f"WIFI:T:{security};S:{_escape_wifi(ssid)};"
        f"P:{_escape_wifi(password)};H:{'true' if hidden else 'false'};;"
    )
    return payload, "WIFI", {"ssid": ssid, "security": security, "hidden": hidden, "has_password": bool(password)}


def build_contact_payload(fields: dict) -> tuple[str, str, dict]:
    name = (fields.get("name") or "").strip()
    if not name:
        raise ValidationError("A name is required.")
    phone = (fields.get("phone") or "").strip()
    email = (fields.get("email") or "").strip()
    org = (fields.get("organization") or "").strip()

    lines = ["BEGIN:VCARD", "VERSION:3.0", f"FN:{name}"]
    if org:
        lines.append(f"ORG:{org}")
    if phone:
        lines.append(f"TEL:{phone}")
    if email:
        lines.append(f"EMAIL:{email}")
    lines.append("END:VCARD")
    payload = "\n".join(lines)
    return payload, "CONTACT", {"name": name, "phone": phone, "email": email, "organization": org}


def build_upi_payload(fields: dict) -> tuple[str, str, dict]:
    upi_id = (fields.get("upi_id") or "").strip()
    if not UPI_RE.match(upi_id):
        raise ValidationError("Enter a valid UPI ID, like name@bank.")
    payee_name = (fields.get("payee_name") or "").strip()
    amount = (fields.get("amount") or "").strip()

    params = [f"pa={upi_id}"]
    if payee_name:
        params.append(f"pn={payee_name.replace(' ', '%20')}")
    if amount:
        params.append(f"am={amount}")
    params.append("cu=INR")
    payload = "upi://pay?" + "&".join(params)
    return payload, "UPI", {"upi_id": upi_id, "payee_name": payee_name, "amount": amount}


BUILDERS = {
    "LINK": build_link_payload,
    "WIFI": build_wifi_payload,
    "CONTACT": build_contact_payload,
    "UPI": build_upi_payload,
}


def build_payload(qr_type: str, fields: dict) -> tuple[str, str, dict]:
    builder = BUILDERS.get(qr_type.upper())
    if not builder:
        raise ValidationError(f"Unknown QR type '{qr_type}'.")
    return builder(fields)
