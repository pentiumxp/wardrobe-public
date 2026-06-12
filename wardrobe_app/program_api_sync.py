from __future__ import annotations

import hashlib
import json
from datetime import datetime
from typing import Any


SYNC_SCHEMA_VERSION = 6
SYNC_SCOPE = "outfit_context"
SYNC_RESOURCE_ENDPOINT_PREFIX = "/api/v1/sync/outfit-context/resources"
SYNC_RESOURCE_NAMES = (
    "items",
    "wear_counts",
    "featured_looks",
    "wear_history",
    "primary_photo_thumbnails",
    "rules",
)


def stable_hash(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def checksum(value: Any) -> str:
    return f"sha256:{stable_hash(value)}"


def payload_count(payload: Any) -> int:
    if isinstance(payload, (list, dict)):
        return len(payload)
    return 1 if payload is not None else 0


def resource_endpoint(name: str) -> str:
    return f"{SYNC_RESOURCE_ENDPOINT_PREFIX}/{name}"


def resource_manifest(name: str, payload: Any) -> dict[str, Any]:
    return {
        "name": name,
        "count": payload_count(payload),
        "checksum": checksum(
            {
                "schema_version": SYNC_SCHEMA_VERSION,
                "resource": name,
                "payload": payload,
            }
        ),
        "endpoint": resource_endpoint(name),
    }


def build_manifest(owner: str, resources: list[dict[str, Any]]) -> dict[str, Any]:
    content = {
        "schema_version": SYNC_SCHEMA_VERSION,
        "scope": SYNC_SCOPE,
        "owner": owner,
        "resource_base_endpoint": SYNC_RESOURCE_ENDPOINT_PREFIX,
        "resources": resources,
    }
    content_hash = stable_hash(content)
    return {
        **content,
        "data_version": f"v{SYNC_SCHEMA_VERSION}-{content_hash[:16]}",
        "etag": f"sha256:{content_hash}",
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
    }


def build_resource_envelope(owner: str, name: str, payload: Any, checksum_payload: Any | None = None) -> dict[str, Any]:
    manifest = resource_manifest(name, payload if checksum_payload is None else checksum_payload)
    resource_hash = manifest["checksum"].removeprefix("sha256:")
    return {
        "schema_version": SYNC_SCHEMA_VERSION,
        "scope": SYNC_SCOPE,
        "owner": owner,
        "resource": name,
        "data_version": f"v{SYNC_SCHEMA_VERSION}-{name}-{resource_hash[:16]}",
        "checksum": manifest["checksum"],
        "count": manifest["count"],
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "data": payload,
        name: payload,
    }
