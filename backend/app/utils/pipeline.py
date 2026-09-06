"""
Shared pipeline/log helpers.

Both directions of ScanFlow (Target → QR, and QR → Target) walk through a
small ordered pipeline of stages. This module gives both flows the same
result shape, so the frontend can render either one through one component.
"""
from __future__ import annotations

import time


class PipelineBuilder:
    def __init__(self, steps: list[tuple[str, str]]):
        self.steps = [{"id": sid, "label": label, "status": "pending", "detail": None} for sid, label in steps]

    def mark(self, step_id: str, status: str, detail: str | None = None) -> None:
        for s in self.steps:
            if s["id"] == step_id:
                s["status"] = status
                if detail:
                    s["detail"] = detail
                return


class WorkflowLog:
    def __init__(self) -> None:
        self.entries: list[dict] = []

    def log(self, stage: str, message: str, level: str = "info") -> None:
        self.entries.append({"stage": stage, "message": message, "level": level, "timestamp": time.time()})

    def success(self, stage: str, message: str) -> None:
        self.log(stage, message, "success")

    def warn(self, stage: str, message: str) -> None:
        self.log(stage, message, "warn")

    def error(self, stage: str, message: str) -> None:
        self.log(stage, message, "error")


def build_result(
    *,
    direction: str,  # "generate" | "decode"
    qr_type: str,
    pipeline: PipelineBuilder,
    log: WorkflowLog,
    payload: str | None,
    fields: dict,
    qr_image_data_url: str | None,
    started_at: float,
    status: str = "completed",
) -> dict:
    return {
        "direction": direction,
        "qr_type": qr_type,
        "status": status,
        "duration_ms": int((time.time() - started_at) * 1000),
        "pipeline": pipeline.steps,
        "log": log.entries,
        "payload": payload,
        "fields": fields,
        "qr_image": qr_image_data_url,
    }
