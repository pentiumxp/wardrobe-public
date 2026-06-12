from __future__ import annotations

import hashlib
import json
import re
from http.server import BaseHTTPRequestHandler


PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY = "_multipart_photos"


def is_multipart_form_data(content_type: str) -> bool:
    normalized = (content_type or "").lower()
    return normalized.startswith("multipart/form-data") and "boundary=" in normalized


def _multipart_boundary(content_type: str) -> bytes:
    match = re.search(r'boundary=(?:"([^"]+)"|([^;]+))', content_type or "", flags=re.IGNORECASE)
    if not match:
        return b""
    return (match.group(1) or match.group(2) or "").strip().encode("utf-8")


def parse_multipart_parts(handler: BaseHTTPRequestHandler) -> list[dict]:
    boundary = _multipart_boundary(handler.headers.get("Content-Type", ""))
    if not boundary:
        return []
    length = int(handler.headers.get("Content-Length", "0"))
    body = handler.rfile.read(length)
    delimiter = b"--" + boundary
    parts: list[dict] = []
    for chunk in body.split(delimiter):
        if not chunk or chunk in {b"--", b"--\r\n"}:
            continue
        if chunk.startswith(b"\r\n"):
            chunk = chunk[2:]
        if chunk.endswith(b"--"):
            chunk = chunk[:-2]
        if chunk.endswith(b"\r\n"):
            chunk = chunk[:-2]
        if b"\r\n\r\n" not in chunk:
            continue
        head, data = chunk.split(b"\r\n\r\n", 1)
        headers = head.decode("utf-8", errors="ignore").split("\r\n")
        disposition = next((line for line in headers if line.lower().startswith("content-disposition:")), "")
        content_type_line = next((line for line in headers if line.lower().startswith("content-type:")), "")
        name = ""
        filename = None
        for part in disposition.split(";"):
            part = part.strip()
            if part.startswith("name="):
                name = part.split("=", 1)[1].strip('"')
            elif part.startswith("filename="):
                filename = part.split("=", 1)[1].strip('"')
        if not name:
            continue
        mime_type = content_type_line.split(":", 1)[1].strip() if ":" in content_type_line else ""
        parts.append(
            {
                "name": name,
                "filename": filename,
                "content": data,
                "content_type": mime_type,
            }
        )
    return parts


def multipart_part_text(part: dict) -> str:
    content = part.get("content") or b""
    if isinstance(content, str):
        return content.strip()
    return content.decode("utf-8-sig", errors="replace").strip()


def program_item_payload_from_multipart_parts(parts: list[dict]) -> dict:
    fields: dict[str, str] = {}
    files: list[dict] = []
    for part in parts:
        name = str(part.get("name") or "").strip()
        if not name:
            continue
        filename = str(part.get("filename") or "").strip()
        if filename:
            files.append(
                {
                    "name": name,
                    "filename": filename,
                    "content_type": str(part.get("content_type") or ""),
                    "content": part.get("content") or b"",
                }
            )
        else:
            fields[name] = multipart_part_text(part)

    payload: dict = {}
    raw_payload = fields.get("payload") or fields.get("json") or fields.get("body")
    if raw_payload:
        parsed = json.loads(raw_payload)
        if not isinstance(parsed, dict):
            raise ValueError("multipart_payload_must_be_object")
        payload = dict(parsed)
    elif fields.get("item"):
        parsed = json.loads(fields["item"])
        if not isinstance(parsed, dict):
            raise ValueError("multipart_item_must_be_object")
        if "item" in parsed or any(key in parsed for key in {"mode", "dry_run", "source", "external_id", "replace_photos"}):
            payload = dict(parsed)
        else:
            payload = {"item": dict(parsed)}

    control_fields = {"mode", "dry_run", "source", "external_id", "replace_photos", "owner"}
    skipped_fields = {"payload", "json", "body", "item"}
    for name, value in fields.items():
        if name in skipped_fields:
            continue
        if name in control_fields:
            payload[name] = value
            continue
        if not isinstance(payload.get("item"), dict):
            payload["item"] = {}
        payload["item"].setdefault(name, value)

    payload[PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY] = files
    return payload


def hashable_program_payload(payload: dict | list) -> dict | list:
    if not isinstance(payload, dict):
        return payload
    hashable = {key: value for key, value in payload.items() if key != PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY}
    photos = payload.get(PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY)
    if isinstance(photos, list):
        photo_meta = []
        for photo in photos:
            if not isinstance(photo, dict):
                continue
            content = photo.get("content") or b""
            if isinstance(content, str):
                content_bytes = content.encode("utf-8")
            else:
                content_bytes = bytes(content)
            photo_meta.append(
                {
                    "name": str(photo.get("name") or ""),
                    "filename": str(photo.get("filename") or ""),
                    "content_type": str(photo.get("content_type") or ""),
                    "size": len(content_bytes),
                    "sha256": hashlib.sha256(content_bytes).hexdigest(),
                }
            )
        hashable[PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY] = photo_meta
    return hashable
