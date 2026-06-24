from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from wardrobe_app.wardrobe_mcp_stats import (
    STAT_TOOL_NAMES,
    STAT_TOOL_RESOURCES,
    run_stats_tool,
)


MCP_PROTOCOL_VERSION = "2025-06-18"
SERVER_NAME = "wardrobe-mcp"
SERVER_VERSION = "0.2.2"
JSON_HEADERS = {"Accept": "application/json"}
IMAGE_ACCEPT_HEADERS = {"Accept": "image/jpeg,image/png,image/*;q=0.8,*/*;q=0.1"}
DEFAULT_TIMEOUT_SECONDS = 30
RESOURCE_NAMES = {
    "items",
    "wear_counts",
    "featured_looks",
    "wear_history",
    "primary_photo_thumbnails",
    "rules",
}
WRITE_MODES = ("create_only", "upsert", "replace")
WRITE_MODE_SET = set(WRITE_MODES)
CANONICAL_LAYER_ROLES = (
    "Inner",
    "Middle",
    "Outer",
    "Bottom",
    "Footwear",
    "Watch",
    "Accessory",
    "Dress",
    "Home",
    "Bespoke",
)
CANONICAL_OUTFIT_ROLES = ("Inner", "Middle", "Outer", "Bottom", "Footwear", "Accessory", "Watch")


class WardrobeMcpError(Exception):
    pass


class WardrobeApiError(WardrobeMcpError):
    def __init__(self, status: int | None, message: str, payload: Any = None):
        super().__init__(message)
        self.status = status
        self.payload = payload


@dataclass(frozen=True)
class ApiResult:
    status: int
    headers: dict[str, str]
    data: Any
    raw: bytes = b""


@dataclass(frozen=True)
class WorkspaceRuntime:
    workspace: Path
    config: dict[str, Any]
    access_key: str
    api_base_url: str
    cache_dir: Path
    manifest_path: Path
    resource_cache_dir: Path
    photo_cache_dir: Path


def _json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _read_json_file(path: Path) -> Any | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, json.JSONDecodeError):
        return None


def _atomic_write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent))
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        temp_path.replace(path)
    finally:
        try:
            temp_path.unlink()
        except FileNotFoundError:
            pass


def _atomic_write_json(path: Path, data: Any) -> None:
    _atomic_write_bytes(path, (_json_dumps(data) + "\n").encode("utf-8"))


def _bool_arg(value: Any, *, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "on"}
    return default


def _resolve_under_workspace(workspace: Path, value: str, default: str) -> Path:
    raw = value or default
    path = Path(raw)
    if not path.is_absolute():
        path = workspace / path
    return path


def load_workspace(workspace_arg: str | None = None) -> WorkspaceRuntime:
    workspace = Path(
        workspace_arg
        or os.environ.get("WARDROBE_MCP_WORKSPACE")
        or os.getcwd()
    ).expanduser().resolve()
    config_path = workspace / ".hermes-wardrobe" / "config.json"
    config = _read_json_file(config_path)
    if not isinstance(config, dict):
        raise WardrobeMcpError(f"missing_or_invalid_config:{config_path}")

    api_base_url = str(config.get("api_base_url") or "").rstrip("/")
    if not api_base_url:
        raise WardrobeMcpError("missing_api_base_url")

    access_key_path = _resolve_under_workspace(
        workspace,
        str(config.get("access_key_file") or ""),
        ".hermes-wardrobe/access-key.txt",
    )
    try:
        access_key = access_key_path.read_text(encoding="utf-8").strip()
    except OSError as exc:
        raise WardrobeMcpError(f"missing_access_key_file:{access_key_path}") from exc
    if not access_key:
        raise WardrobeMcpError("empty_access_key")

    cache_dir = _resolve_under_workspace(
        workspace,
        str(config.get("cache_dir") or ""),
        ".hermes-cache",
    )
    manifest_path = _resolve_under_workspace(
        workspace,
        str(config.get("manifest_path") or ""),
        ".hermes-cache/outfit-context-manifest.json",
    )
    resource_cache_dir = _resolve_under_workspace(
        workspace,
        str(config.get("resource_cache_dir") or ""),
        ".hermes-cache/resources",
    )
    photo_cache_dir = _resolve_under_workspace(
        workspace,
        str(config.get("photo_cache_dir") or ""),
        ".hermes-cache/photos",
    )
    return WorkspaceRuntime(
        workspace=workspace,
        config=config,
        access_key=access_key,
        api_base_url=api_base_url,
        cache_dir=cache_dir,
        manifest_path=manifest_path,
        resource_cache_dir=resource_cache_dir,
        photo_cache_dir=photo_cache_dir,
    )


class WardrobeApiClient:
    def __init__(self, runtime: WorkspaceRuntime, timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS):
        self.runtime = runtime
        self.timeout_seconds = timeout_seconds

    def _url(self, path: str, query: dict[str, Any] | None = None) -> str:
        url = path if path.startswith("http://") or path.startswith("https://") else f"{self.runtime.api_base_url}{path}"
        clean_query = {
            key: value
            for key, value in (query or {}).items()
            if value is not None and value != ""
        }
        if clean_query:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}{urlencode(clean_query, doseq=True)}"
        return url

    def request_json(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, Any] | None = None,
        body: Any = None,
        headers: dict[str, str] | None = None,
        if_none_match: str | None = None,
        ok_statuses: set[int] | None = None,
    ) -> ApiResult:
        request_headers = {
            **JSON_HEADERS,
            "Authorization": f"Bearer {self.runtime.access_key}",
            **(headers or {}),
        }
        data = None
        if body is not None:
            data = _json_dumps(body).encode("utf-8")
            request_headers["Content-Type"] = "application/json"
        if if_none_match:
            request_headers["If-None-Match"] = if_none_match
        return self._request(
            method,
            self._url(path, query),
            data=data,
            headers=request_headers,
            ok_statuses=ok_statuses or {200, 201, 202, 204, 304},
            parse_json=True,
        )

    def request_binary(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, Any] | None = None,
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
        ok_statuses: set[int] | None = None,
    ) -> ApiResult:
        request_headers = {
            **IMAGE_ACCEPT_HEADERS,
            "Authorization": f"Bearer {self.runtime.access_key}",
            **(headers or {}),
        }
        return self._request(
            method,
            self._url(path, query),
            data=body,
            headers=request_headers,
            ok_statuses=ok_statuses or {200, 201, 202, 204, 304},
            parse_json=False,
        )

    def _request(
        self,
        method: str,
        url: str,
        *,
        data: bytes | None,
        headers: dict[str, str],
        ok_statuses: set[int],
        parse_json: bool,
    ) -> ApiResult:
        request = Request(url, data=data, headers=headers, method=method.upper())
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read()
                return self._parse_response(int(response.status), dict(response.headers), raw, ok_statuses, parse_json)
        except HTTPError as exc:
            raw = exc.read()
            status = int(exc.code)
            if status in ok_statuses:
                return self._parse_response(status, dict(exc.headers), raw, ok_statuses, parse_json)
            payload = self._decode_error_payload(raw)
            message = self._error_message(status, payload, raw)
            raise WardrobeApiError(status, message, payload) from exc
        except URLError as exc:
            raise WardrobeApiError(None, f"network_error:{exc.reason}") from exc

    def _parse_response(
        self,
        status: int,
        headers: dict[str, str],
        raw: bytes,
        ok_statuses: set[int],
        parse_json: bool,
    ) -> ApiResult:
        if status not in ok_statuses:
            raise WardrobeApiError(status, f"unexpected_status:{status}")
        if status == 304 or not raw:
            return ApiResult(status=status, headers=headers, data=None, raw=raw)
        if parse_json:
            try:
                return ApiResult(status=status, headers=headers, data=json.loads(raw.decode("utf-8")), raw=raw)
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise WardrobeApiError(status, "invalid_json_response") from exc
        return ApiResult(status=status, headers=headers, data=None, raw=raw)

    @staticmethod
    def _decode_error_payload(raw: bytes) -> Any:
        if not raw:
            return None
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            try:
                return raw.decode("utf-8", errors="replace")
            except Exception:
                return None

    @staticmethod
    def _error_message(status: int, payload: Any, raw: bytes) -> str:
        if isinstance(payload, dict):
            error = payload.get("error") or payload.get("message")
            if error:
                return f"http_{status}:{error}"
        if isinstance(payload, str) and payload:
            return f"http_{status}:{payload[:200]}"
        return f"http_{status}:{raw[:80].decode('utf-8', errors='replace') if raw else ''}"


ClientFactory = Callable[[WorkspaceRuntime], Any]


class WardrobeMcpService:
    def __init__(
        self,
        default_workspace: str | None = None,
        client_factory: ClientFactory | None = None,
        allow_workspace_override: bool = False,
    ):
        self.default_workspace = default_workspace
        self.client_factory = client_factory or (lambda runtime: WardrobeApiClient(runtime))
        self.allow_workspace_override = allow_workspace_override

    def tools(self) -> list[dict[str, Any]]:
        return [
            self._tool(
                "wardrobe.sync",
                "Wardrobe Sync",
                "Manifest-first resource sync. Downloads only changed resources and current first-photo thumbnails.",
                {
                    "workspace": {"type": "string"},
                    "resources": {"type": "array", "items": {"type": "string"}},
                    "refresh_thumbnails": {"type": "boolean", "default": True},
                },
            ),
            self._tool(
                "wardrobe.get_item",
                "Get Wardrobe Item",
                "Read one live item. Authoritative for current photo order and primary photo.",
                {"workspace": {"type": "string"}, "code": {"type": "string"}},
                ["code"],
            ),
            self._tool(
                "wardrobe.search_items",
                "Search Wardrobe Items",
                "Targeted item search through the Program API.",
                {
                    "workspace": {"type": "string"},
                    "q": {"type": "string"},
                    "brand": {"type": "string"},
                    "status": {"type": "string"},
                    "loc": {"type": "string"},
                    "layer_role": {
                        "type": "string",
                        "enum": list(CANONICAL_LAYER_ROLES),
                        "description": "Canonical item layer_role. Use Footwear, not Shoes; use Bottom, not Pants.",
                    },
                    "kind": {"type": "string", "enum": ["wardrobe", "watch"]},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 1000, "default": 500},
                },
            ),
            self._tool(
                "wardrobe.get_primary_thumbnail",
                "Get Primary Thumbnail",
                "Resolve or fetch the current first-photo safe JPEG thumbnail for one item.",
                {
                    "workspace": {"type": "string"},
                    "code": {"type": "string"},
                    "prefer_cache": {"type": "boolean", "default": True},
                },
                ["code"],
            ),
            self._tool(
                "wardrobe.set_primary_photo",
                "Set Primary Photo",
                "Move one product photo to first position. Defaults to dry-run.",
                {
                    "workspace": {"type": "string"},
                    "code": {"type": "string"},
                    "photo_id": {"type": "integer"},
                    "dry_run": {"type": "boolean", "default": True},
                },
                ["code", "photo_id"],
            ),
            self._tool(
                "wardrobe.write_history",
                "Write Wear History",
                "Write actual wear history through Program API. Defaults to dry-run.",
                {
                    "workspace": {"type": "string"},
                    "payload": {
                        "type": "object",
                        "description": (
                            "Program API outfit payload. payload.items[].role must use "
                            f"{', '.join(CANONICAL_OUTFIT_ROLES)}."
                        ),
                    },
                    "mode": {"type": "string", "enum": list(WRITE_MODES)},
                    "dry_run": {"type": "boolean", "default": True},
                    "idempotency_key": {"type": "string"},
                },
                ["payload"],
            ),
            self._tool(
                "wardrobe.write_item",
                "Write Wardrobe Item",
                "Create or update structured item metadata through Program API. Defaults to dry-run.",
                {
                    "workspace": {"type": "string"},
                    "payload": {
                        "type": "object",
                        "description": (
                            "Program API item payload. payload.item.layer_role must use "
                            f"{', '.join(CANONICAL_LAYER_ROLES)}. Price fields use "
                            "price_original, price_original_currency, and price_cny."
                        ),
                    },
                    "mode": {"type": "string", "enum": list(WRITE_MODES)},
                    "dry_run": {"type": "boolean", "default": True},
                    "idempotency_key": {"type": "string"},
                },
                ["payload"],
            ),
            self._tool(
                "wardrobe.upload_photo",
                "Upload Wardrobe Photo",
                "Upload one local image file to an existing item using raw image body. Defaults to dry-run.",
                {
                    "workspace": {"type": "string"},
                    "code": {"type": "string"},
                    "file_path": {"type": "string"},
                    "dry_run": {"type": "boolean", "default": True},
                    "replace_photos": {"type": "boolean", "default": False},
                    "idempotency_key": {"type": "string"},
                },
                ["code", "file_path"],
            ),
            *self._stats_tools(),
        ]

    def _stats_tools(self) -> list[dict[str, Any]]:
        properties = {
            "workspace": {"type": "string"},
            "refresh": {"type": "boolean", "default": True},
            "filters": {
                "type": "object",
                "description": "Optional filters. role/layer_role filters use canonical layer_role values such as Footwear, not Shoes.",
            },
            "group_by": {"type": "string"},
            "metric": {"type": "string"},
            "period": {"type": "string"},
            "year": {"type": "integer"},
            "category": {"type": "string", "enum": ["all", "wardrobe", "watch"]},
            "kind": {"type": "string", "enum": ["wardrobe", "watch"]},
            "top_n": {"type": "integer", "minimum": 1, "maximum": 100, "default": 20},
            "include_items": {"type": "boolean", "default": False},
        }
        specs = [
            ("wardrobe.stats_overview", "Wardrobe Stats Overview", "Owner dashboard counts from MCP resource cache."),
            ("wardrobe.stats_inventory", "Wardrobe Inventory Stats", "Inventory count/amount grouping from cached item metadata."),
            ("wardrobe.stats_watch", "Wardrobe Watch Stats", "Watch count/amount/wear grouping from cached item metadata."),
            ("wardrobe.stats_wear", "Wardrobe Wear Stats", "Wear totals and rankings by wear_date from cached items, wear_counts, and wear_history."),
            ("wardrobe.stats_maintenance", "Wardrobe Maintenance Stats", "Maintenance threshold state counts and due-item ranking."),
            ("wardrobe.stats_history", "Wardrobe History Stats", "Wear-history counts grouped by date/month/city/scene/temperature."),
            ("wardrobe.stats_featured_looks", "Wardrobe Featured Look Stats", "Featured-look counts and item/brand participation."),
            ("wardrobe.stats_photos", "Wardrobe Photo Stats", "Primary-photo and thumbnail-cache health, including no-photo items."),
            ("wardrobe.stats_data_quality", "Wardrobe Data Quality Stats", "Structured-field quality checks over cached resources."),
        ]
        return [self._tool(name, title, description, dict(properties)) for name, title, description in specs]

    @staticmethod
    def _tool(
        name: str,
        title: str,
        description: str,
        properties: dict[str, Any],
        required: list[str] | None = None,
    ) -> dict[str, Any]:
        return {
            "name": name,
            "title": title,
            "description": description,
            "inputSchema": {
                "type": "object",
                "properties": properties,
                "required": required or [],
                "additionalProperties": False,
            },
        }

    def call_tool(self, name: str, arguments: dict[str, Any] | None) -> dict[str, Any]:
        args = arguments or {}
        try:
            if name == "wardrobe.sync":
                return self._tool_result(self.sync(args))
            if name == "wardrobe.get_item":
                return self._tool_result(self.get_item(args))
            if name == "wardrobe.search_items":
                return self._tool_result(self.search_items(args))
            if name == "wardrobe.get_primary_thumbnail":
                return self._tool_result(self.get_primary_thumbnail(args))
            if name == "wardrobe.set_primary_photo":
                return self._tool_result(self.set_primary_photo(args))
            if name == "wardrobe.write_history":
                return self._tool_result(self.write_history(args))
            if name == "wardrobe.write_item":
                return self._tool_result(self.write_item(args))
            if name == "wardrobe.upload_photo":
                return self._tool_result(self.upload_photo(args))
            if name in STAT_TOOL_NAMES:
                return self._tool_result(self.stats(name, args))
            raise KeyError(name)
        except KeyError:
            raise
        except Exception as exc:
            payload = {"error": exc.__class__.__name__, "message": str(exc)}
            if isinstance(exc, WardrobeApiError):
                payload["status"] = exc.status
                payload["api_payload"] = exc.payload
            return self._tool_result(payload, is_error=True)

    @staticmethod
    def _tool_result(data: Any, *, is_error: bool = False) -> dict[str, Any]:
        return {
            "content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True)}],
            "structuredContent": data if isinstance(data, dict) else {"result": data},
            "isError": is_error,
        }

    def _runtime_and_client(self, args: dict[str, Any]) -> tuple[WorkspaceRuntime, Any]:
        workspace_arg = args.get("workspace")
        workspace = str(workspace_arg).strip() if isinstance(workspace_arg, str) else ""
        if workspace and not self.allow_workspace_override:
            if not self.default_workspace:
                raise WardrobeMcpError("workspace_override_not_allowed")
            requested = Path(workspace).expanduser().resolve()
            allowed = Path(self.default_workspace).expanduser().resolve()
            if requested != allowed:
                raise WardrobeMcpError("workspace_override_not_allowed")
        runtime = load_workspace(workspace or self.default_workspace or None)
        return runtime, self.client_factory(runtime)

    def sync(self, args: dict[str, Any]) -> dict[str, Any]:
        runtime, client = self._runtime_and_client(args)
        requested = self._requested_resources(args.get("resources"))
        refresh_thumbnails = _bool_arg(args.get("refresh_thumbnails"), default=True)
        local_manifest = _read_json_file(runtime.manifest_path)
        local_etag = local_manifest.get("etag") if isinstance(local_manifest, dict) else None

        manifest_result = client.request_json(
            "GET",
            "/api/v1/sync/outfit-context/manifest",
            if_none_match=local_etag,
            ok_statuses={200, 304},
        )
        if manifest_result.status == 304:
            if not isinstance(local_manifest, dict):
                raise WardrobeMcpError("manifest_304_without_valid_local_manifest")
            manifest = local_manifest
        else:
            manifest = self._require_dict(manifest_result.data, "manifest")

        resource_map = self._manifest_resource_map(manifest)
        resource_names = [
            name
            for name in resource_map
            if (requested is None or name in requested)
        ]
        changed_resources: list[str] = []
        reused_resources: list[str] = []
        resource_files: dict[str, str] = {}

        for name in resource_names:
            resource_file = runtime.resource_cache_dir / f"{name}.json"
            resource_files[name] = str(resource_file)
            entry = resource_map[name]
            local_resource = _read_json_file(resource_file)
            if self._resource_cache_matches(local_resource, manifest, entry):
                reused_resources.append(name)
                continue
            resource_result = client.request_json(
                "GET",
                str(entry.get("endpoint") or f"/api/v1/sync/outfit-context/resources/{name}"),
                if_none_match=self._resource_if_none_match(local_resource, manifest),
                ok_statuses={200, 304},
            )
            if resource_result.status == 304 and isinstance(local_resource, dict):
                reused_resources.append(name)
                continue
            resource_payload = self._require_dict(resource_result.data, f"resource:{name}")
            _atomic_write_json(resource_file, resource_payload)
            changed_resources.append(name)

        manifest_cache_updated = False
        if manifest_result.status == 200 and requested is None:
            _atomic_write_json(runtime.manifest_path, manifest)
            manifest_cache_updated = True

        thumbnail_summary = None
        if refresh_thumbnails:
            thumbnail_summary = self.refresh_primary_thumbnails(runtime, client)

        return {
            "workspace": str(runtime.workspace),
            "owner": manifest.get("owner"),
            "schema_version": manifest.get("schema_version"),
            "manifest_status": manifest_result.status,
            "manifest_cache_updated": manifest_cache_updated,
            "partial_sync": requested is not None,
            "changed_resources": changed_resources,
            "reused_resources": reused_resources,
            "resource_files": resource_files,
            "thumbnail_summary": thumbnail_summary,
        }

    def stats(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if name not in STAT_TOOL_RESOURCES:
            raise KeyError(name)
        sync_result = None
        sync_error = None
        if _bool_arg(args.get("refresh"), default=True):
            sync_args: dict[str, Any] = {
                "resources": list(STAT_TOOL_RESOURCES[name]),
                "refresh_thumbnails": False,
            }
            if args.get("workspace") not in (None, ""):
                sync_args["workspace"] = args.get("workspace")
            try:
                sync_result = self.sync(sync_args)
            except Exception as exc:
                sync_error = {"error": exc.__class__.__name__, "message": str(exc)}
                if isinstance(exc, WardrobeApiError):
                    sync_error["status"] = exc.status
                    sync_error["api_payload"] = exc.payload
        runtime, _ = self._runtime_and_client(args)
        return run_stats_tool(name, runtime, args, sync_result=sync_result, sync_error=sync_error)

    @staticmethod
    def _requested_resources(value: Any) -> set[str] | None:
        if value is None:
            return None
        if not isinstance(value, list):
            raise WardrobeMcpError("resources_must_be_array")
        requested = {str(item) for item in value}
        unknown = requested - RESOURCE_NAMES
        if unknown:
            raise WardrobeMcpError(f"unknown_resources:{','.join(sorted(unknown))}")
        return requested

    @staticmethod
    def _manifest_resource_map(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
        resources = manifest.get("resources")
        if not isinstance(resources, list):
            raise WardrobeMcpError("manifest_missing_resources")
        result: dict[str, dict[str, Any]] = {}
        for entry in resources:
            if isinstance(entry, dict) and entry.get("name"):
                result[str(entry["name"])] = entry
        return result

    @staticmethod
    def _resource_cache_matches(resource: Any, manifest: dict[str, Any], entry: dict[str, Any]) -> bool:
        return (
            isinstance(resource, dict)
            and resource.get("owner") == manifest.get("owner")
            and resource.get("schema_version") == manifest.get("schema_version")
            and resource.get("checksum") == entry.get("checksum")
            and resource.get("count") == entry.get("count")
        )

    @staticmethod
    def _resource_if_none_match(resource: Any, manifest: dict[str, Any]) -> str | None:
        if not isinstance(resource, dict):
            return None
        if resource.get("owner") != manifest.get("owner"):
            return None
        if resource.get("schema_version") != manifest.get("schema_version"):
            return None
        checksum_value = resource.get("checksum")
        return checksum_value if isinstance(checksum_value, str) and checksum_value else None

    @staticmethod
    def _require_dict(value: Any, label: str) -> dict[str, Any]:
        if not isinstance(value, dict):
            raise WardrobeMcpError(f"invalid_{label}_response")
        return value

    def refresh_primary_thumbnails(self, runtime: WorkspaceRuntime, client: Any) -> dict[str, Any]:
        resource_file = runtime.resource_cache_dir / "primary_photo_thumbnails.json"
        resource = _read_json_file(resource_file)
        if not isinstance(resource, dict):
            return {
                "listed": 0,
                "downloaded": 0,
                "reused": 0,
                "failed": 0,
                "removed_stale": 0,
                "reason": "missing_primary_photo_thumbnails_resource",
            }
        rows = resource.get("primary_photo_thumbnails") or resource.get("data") or []
        if not isinstance(rows, list):
            rows = []
        runtime.photo_cache_dir.mkdir(parents=True, exist_ok=True)
        allowed_files: set[str] = set()
        downloaded = reused = failed = 0
        failures: list[dict[str, Any]] = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            cache_filename = str(row.get("cache_filename") or "")
            thumbnail_path = str(row.get("thumbnail_path") or "")
            if not cache_filename or not thumbnail_path:
                continue
            allowed_files.add(cache_filename)
            target = runtime.photo_cache_dir / cache_filename
            if self._valid_jpeg_file(target):
                reused += 1
                continue
            try:
                result = client.request_binary("GET", thumbnail_path, ok_statuses={200})
                if not self._looks_like_jpeg(result.raw):
                    raise WardrobeMcpError("thumbnail_not_jpeg")
                _atomic_write_bytes(target, result.raw)
                downloaded += 1
            except Exception as exc:
                failed += 1
                failures.append(
                    {
                        "code": row.get("code"),
                        "photo_id": row.get("photo_id"),
                        "cache_filename": cache_filename,
                        "error": str(exc),
                    }
                )
        removed_stale = self._remove_stale_thumbnails(runtime.photo_cache_dir, allowed_files)
        return {
            "listed": len(rows),
            "downloaded": downloaded,
            "reused": reused,
            "failed": failed,
            "removed_stale": removed_stale,
            "failures": failures[:20],
        }

    @staticmethod
    def _remove_stale_thumbnails(photo_cache_dir: Path, allowed_files: set[str]) -> int:
        removed = 0
        if not photo_cache_dir.exists():
            return removed
        for path in photo_cache_dir.glob("*.jpg"):
            if path.name not in allowed_files:
                try:
                    path.unlink()
                    removed += 1
                except OSError:
                    pass
        return removed

    @classmethod
    def _valid_jpeg_file(cls, path: Path) -> bool:
        try:
            raw = path.read_bytes()
        except OSError:
            return False
        return bool(raw) and cls._looks_like_jpeg(raw)

    @staticmethod
    def _looks_like_jpeg(raw: bytes) -> bool:
        return len(raw) >= 4 and raw.startswith(b"\xff\xd8") and raw.endswith(b"\xff\xd9")

    def get_item(self, args: dict[str, Any]) -> dict[str, Any]:
        _, client = self._runtime_and_client(args)
        code = self._required_str(args, "code")
        result = client.request_json("GET", f"/api/v1/items/{quote(code, safe='')}", ok_statuses={200})
        return self._require_dict(result.data, "item")

    def search_items(self, args: dict[str, Any]) -> dict[str, Any]:
        _, client = self._runtime_and_client(args)
        query = {
            key: args.get(key)
            for key in ("q", "brand", "status", "loc", "layer_role", "kind", "limit")
            if args.get(key) not in (None, "")
        }
        if "limit" not in query:
            query["limit"] = 500
        result = client.request_json("GET", "/api/v1/items", query=query, ok_statuses={200})
        return self._require_dict(result.data, "items")

    def get_primary_thumbnail(self, args: dict[str, Any]) -> dict[str, Any]:
        runtime, client = self._runtime_and_client(args)
        code = self._required_str(args, "code")
        prefer_cache = _bool_arg(args.get("prefer_cache"), default=True)
        item_payload = self._require_dict(
            client.request_json("GET", f"/api/v1/items/{quote(code, safe='')}", ok_statuses={200}).data,
            "item",
        )
        item = item_payload.get("item") if isinstance(item_payload.get("item"), dict) else item_payload
        primary_photo = item.get("primary_photo") if isinstance(item, dict) else None
        if not primary_photo:
            return {
                "code": code,
                "has_photo": False,
                "local_path": None,
                "downloaded": False,
                "reason": "primary_photo_null",
            }
        cache_filename = str(primary_photo.get("cache_filename") or "")
        thumbnail_path = str(
            item.get("primary_photo_thumbnail_path")
            or primary_photo.get("thumbnail_path")
            or ""
        )
        if not cache_filename:
            cache_filename = self._fallback_cache_filename(code, primary_photo)
        target = runtime.photo_cache_dir / cache_filename
        listed = self._current_thumbnail_resource_lists(runtime, cache_filename)
        if prefer_cache and listed and self._valid_jpeg_file(target):
            return {
                "code": code,
                "has_photo": True,
                "photo_id": primary_photo.get("photo_id") or primary_photo.get("id"),
                "cache_filename": cache_filename,
                "local_path": str(target),
                "downloaded": False,
                "source": "cache",
            }
        if not thumbnail_path:
            raise WardrobeMcpError("missing_thumbnail_path")
        result = client.request_binary("GET", thumbnail_path, ok_statuses={200})
        if not self._looks_like_jpeg(result.raw):
            raise WardrobeMcpError("thumbnail_not_jpeg")
        _atomic_write_bytes(target, result.raw)
        return {
            "code": code,
            "has_photo": True,
            "photo_id": primary_photo.get("photo_id") or primary_photo.get("id"),
            "cache_filename": cache_filename,
            "local_path": str(target),
            "downloaded": True,
            "source": "api",
        }

    @staticmethod
    def _fallback_cache_filename(code: str, primary_photo: dict[str, Any]) -> str:
        photo_id = primary_photo.get("photo_id") or primary_photo.get("id") or "primary"
        checksum = str(primary_photo.get("checksum") or "no-checksum").removeprefix("sha256:")[:16]
        safe_code = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in code)
        return f"{safe_code}_{photo_id}_{checksum}.jpg"

    @staticmethod
    def _current_thumbnail_resource_lists(runtime: WorkspaceRuntime, cache_filename: str) -> bool:
        resource = _read_json_file(runtime.resource_cache_dir / "primary_photo_thumbnails.json")
        if not isinstance(resource, dict):
            return False
        rows = resource.get("primary_photo_thumbnails") or resource.get("data") or []
        return any(isinstance(row, dict) and row.get("cache_filename") == cache_filename for row in rows)

    def set_primary_photo(self, args: dict[str, Any]) -> dict[str, Any]:
        _, client = self._runtime_and_client(args)
        code = self._required_str(args, "code")
        photo_id = args.get("photo_id")
        if not isinstance(photo_id, int):
            raise WardrobeMcpError("photo_id_required")
        dry_run = _bool_arg(args.get("dry_run"), default=True)
        body = {"primary_photo_id": photo_id, "dry_run": dry_run}
        result = client.request_json(
            "POST",
            f"/api/v1/items/{quote(code, safe='')}/photos/order",
            body=body,
            ok_statuses={200, 201},
        )
        payload = self._require_dict(result.data, "photo_order")
        if not dry_run:
            payload["readback"] = self.get_item({**args, "code": code})
        return payload

    def write_history(self, args: dict[str, Any]) -> dict[str, Any]:
        _, client = self._runtime_and_client(args)
        payload = self._payload_with_default_dry_run(args)
        result = client.request_json(
            "POST",
            "/api/v1/history/outfits",
            body=payload,
            headers=self._idempotency_header(args),
            ok_statuses={200, 201, 409},
        )
        return self._require_dict(result.data, "history_write")

    def write_item(self, args: dict[str, Any]) -> dict[str, Any]:
        _, client = self._runtime_and_client(args)
        payload = self._payload_with_default_dry_run(args)
        result = client.request_json(
            "POST",
            "/api/v1/items",
            body=payload,
            headers=self._idempotency_header(args),
            ok_statuses={200, 201, 409},
        )
        response = self._require_dict(result.data, "item_write")
        if self._is_duplicate_code_response(result.status, response):
            response = dict(response)
            response.setdefault("mcp_retry", self._duplicate_code_retry_hint(payload))
        return response

    @staticmethod
    def _payload_with_default_dry_run(args: dict[str, Any]) -> dict[str, Any]:
        payload = args.get("payload")
        if not isinstance(payload, dict):
            raise WardrobeMcpError("payload_required")
        result = dict(payload)
        if "mode" in args:
            result["mode"] = WardrobeMcpService._mode_arg(args.get("mode"))
        if "dry_run" not in result:
            result["dry_run"] = _bool_arg(args.get("dry_run"), default=True)
        elif "dry_run" in args:
            result["dry_run"] = _bool_arg(args.get("dry_run"), default=True)
        return result

    @staticmethod
    def _mode_arg(value: Any) -> str:
        mode = str(value or "").strip().lower()
        if mode not in WRITE_MODE_SET:
            raise WardrobeMcpError("invalid_mode")
        return mode

    @staticmethod
    def _is_duplicate_code_response(status: int, payload: dict[str, Any]) -> bool:
        if status != 409:
            return False
        values = [
            payload.get("error"),
            payload.get("message"),
        ]
        api_payload = payload.get("api_payload")
        if isinstance(api_payload, dict):
            values.extend([api_payload.get("error"), api_payload.get("message")])
        return any(str(value or "").strip().lower() == "duplicate_code" for value in values)

    @staticmethod
    def _duplicate_code_retry_hint(payload: dict[str, Any]) -> dict[str, Any]:
        item = payload.get("item") if isinstance(payload.get("item"), dict) else {}
        return {
            "allowed": True,
            "tool": "wardrobe.write_item",
            "mode": "upsert",
            "reason": "existing_item_code_requires_update_mode",
            "code": item.get("code"),
            "message": (
                "The item code already exists. If the user intended to update this item, "
                "retry the same Wardrobe MCP write_item call with mode='upsert' "
                "or payload.mode='upsert'. Do not request direct HTTP or Program API fallback."
            ),
        }

    @staticmethod
    def _idempotency_header(args: dict[str, Any]) -> dict[str, str]:
        value = args.get("idempotency_key")
        return {"Idempotency-Key": str(value)} if value else {}

    def upload_photo(self, args: dict[str, Any]) -> dict[str, Any]:
        _, client = self._runtime_and_client(args)
        code = self._required_str(args, "code")
        file_path = Path(self._required_str(args, "file_path")).expanduser().resolve()
        if str(file_path).lower().startswith("file:"):
            raise WardrobeMcpError("file_uri_not_supported")
        try:
            raw = file_path.read_bytes()
        except OSError as exc:
            raise WardrobeMcpError(f"cannot_read_file:{file_path}") from exc
        if not raw:
            raise WardrobeMcpError("empty_photo_file")
        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        result = client.request_binary(
            "POST",
            f"/api/v1/items/{quote(code, safe='')}/photos",
            query={
                "dry_run": str(_bool_arg(args.get("dry_run"), default=True)).lower(),
                "replace_photos": str(_bool_arg(args.get("replace_photos"), default=False)).lower(),
                "filename": file_path.name,
            },
            body=raw,
            headers={
                "Content-Type": content_type,
                "X-Filename": file_path.name,
                **self._idempotency_header(args),
            },
            ok_statuses={200, 201},
        )
        try:
            data = json.loads(result.raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            data = {"status": result.status, "bytes": len(result.raw)}
        return data

    @staticmethod
    def _required_str(args: dict[str, Any], key: str) -> str:
        value = args.get(key)
        if not isinstance(value, str) or not value.strip():
            raise WardrobeMcpError(f"{key}_required")
        return value


class McpStdioServer:
    def __init__(self, service: WardrobeMcpService):
        self.service = service

    def serve(self) -> None:
        def on_message(message: dict[str, Any], framing: str) -> None:
            try:
                response = self.handle_message(message)
            except Exception as exc:
                request_id = message.get("id") if isinstance(message, dict) else None
                response = self._error_response(request_id, -32700, f"parse_or_dispatch_error:{exc}")
            if response is not None:
                self._write(response, framing)

        self._parse_messages(on_message)

    def handle_message(self, message: dict[str, Any]) -> dict[str, Any] | None:
        if not isinstance(message, dict) or message.get("jsonrpc") != "2.0":
            return self._error_response(message.get("id") if isinstance(message, dict) else None, -32600, "invalid_request")
        method = message.get("method")
        request_id = message.get("id")
        params = message.get("params") if isinstance(message.get("params"), dict) else {}
        if request_id is None:
            return None
        try:
            if method == "initialize":
                protocol_version = str(params.get("protocolVersion") or MCP_PROTOCOL_VERSION)
                return self._result_response(
                    request_id,
                    {
                        "protocolVersion": protocol_version,
                        "capabilities": {"tools": {"listChanged": False}},
                        "serverInfo": {"name": SERVER_NAME, "title": "Wardrobe MCP", "version": SERVER_VERSION},
                        "instructions": (
                            "Use these tools as a wrapper around the Wardrobe Program API. "
                            "The server never returns Access Keys and never reads SQLite directly."
                        ),
                    },
                )
            if method == "ping":
                return self._result_response(request_id, {})
            if method == "tools/list":
                return self._result_response(request_id, {"tools": self.service.tools()})
            if method == "tools/call":
                name = str(params.get("name") or "")
                arguments = params.get("arguments") if isinstance(params.get("arguments"), dict) else {}
                try:
                    return self._result_response(request_id, self.service.call_tool(name, arguments))
                except KeyError:
                    return self._error_response(request_id, -32602, f"unknown_tool:{name}")
            return self._error_response(request_id, -32601, f"method_not_found:{method}")
        except Exception as exc:
            return self._error_response(request_id, -32603, str(exc))

    @staticmethod
    def _result_response(request_id: Any, result: Any) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": request_id, "result": result}

    @staticmethod
    def _error_response(request_id: Any, code: int, message: str) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}

    @staticmethod
    def _encode_message(message: dict[str, Any], framing: str = "content-length") -> bytes:
        body = json.dumps(message, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        if framing == "ndjson":
            return body + b"\n"
        return f"Content-Length: {len(body)}\r\n\r\n".encode("ascii") + body

    @staticmethod
    def _parse_messages(on_message: Callable[[dict[str, Any], str], None]) -> None:
        buffer = b""
        stdin_buffer = sys.stdin.buffer
        while True:
            chunk = stdin_buffer.read1(65536)
            if not chunk:
                return
            buffer += chunk
            while True:
                buffer = buffer.lstrip()
                if not buffer:
                    break
                if buffer.startswith(b"{"):
                    newline = buffer.find(b"\n")
                    if newline < 0:
                        break
                    raw_line = buffer[:newline].strip()
                    buffer = buffer[newline + 1 :]
                    if raw_line:
                        on_message(json.loads(raw_line.decode("utf-8")), "ndjson")
                    continue
                header_end = buffer.find(b"\r\n\r\n")
                separator_size = 4
                if header_end < 0:
                    header_end = buffer.find(b"\n\n")
                    separator_size = 2
                if header_end < 0:
                    break
                header = buffer[:header_end].decode("ascii", errors="replace")
                length = 0
                for line in header.splitlines():
                    if line.lower().startswith("content-length:"):
                        length = int(line.split(":", 1)[1].strip())
                        break
                body_start = header_end + separator_size
                body_end = body_start + length
                if not length or len(buffer) < body_end:
                    break
                body = buffer[body_start:body_end]
                buffer = buffer[body_end:]
                on_message(json.loads(body.decode("utf-8")), "content-length")

    @staticmethod
    def _write(message: dict[str, Any], framing: str = "content-length") -> None:
        sys.stdout.buffer.write(McpStdioServer._encode_message(message, framing))
        sys.stdout.flush()


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Wardrobe Program API MCP wrapper")
    parser.add_argument(
        "--workspace",
        help="Active owner wardrobe directory containing .hermes-wardrobe/config.json",
    )
    parser.add_argument(
        "--allow-workspace-override",
        dest="allow_workspace_override",
        action="store_true",
        help="Allow tool calls to override the server default workspace.",
    )
    parser.add_argument(
        "--no-workspace-override",
        dest="allow_workspace_override",
        action="store_false",
        help="Reject tool calls that pass a workspace different from --workspace.",
    )
    parser.set_defaults(allow_workspace_override=False)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    service = WardrobeMcpService(
        default_workspace=args.workspace,
        allow_workspace_override=args.allow_workspace_override,
    )
    McpStdioServer(service).serve()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
