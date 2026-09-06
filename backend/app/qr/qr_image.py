"""
The actual QR encode/decode work — no mocks. Uses the `qrcode` library to
build a real, camera-scannable QR image, and OpenCV's built-in QR detector
to read one back.
"""
from __future__ import annotations

import base64
from io import BytesIO

import cv2
import numpy as np
import qrcode
from qrcode.constants import ERROR_CORRECT_M


def encode_qr(payload: str) -> tuple[bytes, str]:
    """Returns (png_bytes, data_url)."""
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=8, border=3)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#211E13", back_color="#FFFFFF")
    buf = BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()
    data_url = "data:image/png;base64," + base64.b64encode(png_bytes).decode("ascii")
    return png_bytes, data_url


def decode_qr(image_bytes: bytes) -> str | None:
    """Returns the decoded text, or None if no QR code could be found."""
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    detector = cv2.QRCodeDetector()
    data, points, _ = detector.detectAndDecode(img)
    return data or None
