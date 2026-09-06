from __future__ import annotations

import time

from fastapi import APIRouter, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.qr.parser import parse_payload
from app.qr.payloads import ValidationError, build_payload
from app.qr.qr_image import decode_qr, encode_qr
from app.utils.pipeline import PipelineBuilder, WorkflowLog, build_result

router = APIRouter(prefix="/api/qr", tags=["qr"])

GENERATE_STEPS = [
    ("validate", "Validate Details"),
    ("build", "Build QR Payload"),
    ("encode", "Encode QR Image"),
    ("verify", "Verify It Scans Back Correctly"),
    ("ready", "Ready to Download"),
]

DECODE_STEPS = [
    ("validate", "Read Input"),
    ("locate", "Locate QR Code"),
    ("decode", "Decode Payload"),
    ("classify", "Classify Target Type"),
    ("extract", "Extract Fields"),
    ("reveal", "Reveal Target"),
]


class GenerateInput(BaseModel):
    qr_type: str
    fields: dict


class DecodeTextInput(BaseModel):
    text: str


@router.post("/generate")
def generate(payload_in: GenerateInput):
    started_at = time.time()
    log = WorkflowLog()
    pipeline = PipelineBuilder(GENERATE_STEPS)

    pipeline.mark("validate", "active")
    try:
        payload, resolved_type, fields = build_payload(payload_in.qr_type, payload_in.fields)
    except ValidationError as e:
        pipeline.mark("validate", "error", str(e))
        log.error("VALIDATE", str(e))
        return build_result(
            direction="generate", qr_type=payload_in.qr_type, pipeline=pipeline, log=log,
            payload=None, fields={}, qr_image_data_url=None, started_at=started_at, status="failed",
        )
    pipeline.mark("validate", "done")
    log.success("VALIDATE", "All required details look good")

    pipeline.mark("build", "active")
    log.log("BUILD", f"Building the standard {resolved_type} QR format")
    pipeline.mark("build", "done")
    log.success("BUILD", "Payload string built")

    pipeline.mark("encode", "active")
    _png_bytes, data_url = encode_qr(payload)
    pipeline.mark("encode", "done")
    log.success("ENCODE", "QR image generated")

    pipeline.mark("verify", "active")
    import base64
    raw_png = base64.b64decode(data_url.split(",", 1)[1])
    round_trip = decode_qr(raw_png)
    verified = round_trip == payload
    pipeline.mark("verify", "done" if verified else "error")
    if verified:
        log.success("VERIFY", "Scanned the generated image back — payload matches exactly")
    else:
        log.warn("VERIFY", "Could not confirm round-trip decode, but the image was generated")

    pipeline.mark("ready", "done")
    log.success("READY", "Your QR code is ready to download")

    return build_result(
        direction="generate", qr_type=resolved_type, pipeline=pipeline, log=log,
        payload=payload, fields=fields, qr_image_data_url=data_url, started_at=started_at,
    )


@router.post("/decode")
async def decode(file: UploadFile | None = None, text: str | None = Form(None)):
    started_at = time.time()
    log = WorkflowLog()
    pipeline = PipelineBuilder(DECODE_STEPS)

    pipeline.mark("validate", "active")
    if not file and not text:
        pipeline.mark("validate", "error")
        log.error("VALIDATE", "Upload a QR image or paste its text")
        return build_result(
            direction="decode", qr_type="UNKNOWN", pipeline=pipeline, log=log,
            payload=None, fields={}, qr_image_data_url=None, started_at=started_at, status="failed",
        )
    pipeline.mark("validate", "done")

    raw_payload = None
    if file:
        log.log("VALIDATE", f"Image received: {file.filename}")
        pipeline.mark("locate", "active")
        image_bytes = await file.read()
        raw_payload = decode_qr(image_bytes)
        if not raw_payload:
            pipeline.mark("locate", "error")
            log.error("LOCATE", "No QR code could be found in that image")
            return build_result(
                direction="decode", qr_type="UNKNOWN", pipeline=pipeline, log=log,
                payload=None, fields={}, qr_image_data_url=None, started_at=started_at, status="failed",
            )
        pipeline.mark("locate", "done")
        log.success("LOCATE", "QR code found in image")
        pipeline.mark("decode", "done")
        log.success("DECODE", "Payload extracted")
    else:
        log.log("VALIDATE", "Using pasted QR text directly")
        pipeline.mark("locate", "done", "skipped — text provided directly")
        raw_payload = text.strip()
        pipeline.mark("decode", "done")
        log.success("DECODE", "Payload read")

    pipeline.mark("classify", "active")
    qr_type, fields = parse_payload(raw_payload)
    pipeline.mark("classify", "done", qr_type)
    log.success("CLASSIFY", f"This looks like a {qr_type} QR code")

    pipeline.mark("extract", "active")
    log.log("EXTRACT", f"Fields parsed: {', '.join(fields.keys()) or 'none'}")
    pipeline.mark("extract", "done")

    pipeline.mark("reveal", "done")
    log.success("REVEAL", "Target revealed")

    return build_result(
        direction="decode", qr_type=qr_type, pipeline=pipeline, log=log,
        payload=raw_payload, fields=fields, qr_image_data_url=None, started_at=started_at,
    )
