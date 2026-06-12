from __future__ import annotations

import hashlib
import json
import re
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable


DEFAULT_PLUGIN_SCOPES = ("history:write", "items:read", "items:write", "sync:read")
PLUGIN_MANIFEST_VERSION = 1
PLUGIN_ID = "wardrobe"
FRAME_ANCESTORS_SETTING_KEY = "hermes_plugin_frame_ancestors"
APPEARANCE_THEMES = ("dark", "light")
APPEARANCE_FONT_SIZES = ("small", "default", "large", "xlarge", "xxlarge")
DEFAULT_APPEARANCE = {"theme": "light", "fontSize": "default"}
HERMES_PLUGIN_ACTIONS = (
    {"id": "style", "label": "配衣服", "route": "style", "priority": 10},
    {"id": "today", "label": "今日穿搭", "route": "today", "priority": 20},
    {"id": "add_item", "label": "衣物入库", "route": "add_item", "priority": 30},
    {"id": "inventory", "label": "衣物目录", "route": "inventory", "priority": 40},
    {"id": "outfit_history", "label": "穿搭记录", "route": "outfit_history", "priority": 50},
    {"id": "packing", "label": "出行打包", "route": "packing", "priority": 60},
)


class HermesPluginError(ValueError):
    def __init__(self, code: str, message: str = ""):
        super().__init__(message or code)
        self.code = code
        self.message = message or code


def normalize_text(value: object) -> str:
    return str(value or "").strip()


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def token_prefix(token: str) -> str:
    return token[:16]


def ensure_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS hermes_plugin_workspaces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workspace_id TEXT NOT NULL UNIQUE,
            owner TEXT NOT NULL,
            display_name TEXT,
            api_base_url TEXT,
            token_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hermes_plugin_workspaces_owner
        ON hermes_plugin_workspaces(owner);

        CREATE TABLE IF NOT EXISTS hermes_plugin_launch_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token_hash TEXT NOT NULL UNIQUE,
            workspace_id TEXT NOT NULL,
            owner TEXT NOT NULL,
            token_id INTEGER,
            appearance_json TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT NOT NULL,
            consumed_at TEXT,
            FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hermes_plugin_launch_tokens_hash
        ON hermes_plugin_launch_tokens(token_hash);

        CREATE INDEX IF NOT EXISTS idx_hermes_plugin_launch_tokens_workspace
        ON hermes_plugin_launch_tokens(workspace_id);

        CREATE TABLE IF NOT EXISTS hermes_plugin_sessions (
            session_id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            owner TEXT NOT NULL,
            appearance_json TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """
    )
    launch_columns = {
        row["name"] for row in conn.execute("PRAGMA table_info(hermes_plugin_launch_tokens)").fetchall()
    }
    if "appearance_json" not in launch_columns:
        conn.execute("ALTER TABLE hermes_plugin_launch_tokens ADD COLUMN appearance_json TEXT")
    conn.commit()


def default_owner_slug(owner: str) -> str:
    normalized = normalize_text(owner)
    ascii_slug = re.sub(r"[^0-9A-Za-z_-]+", "-", normalized).strip("-").lower()
    if ascii_slug:
        return ascii_slug
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:12]


def build_plugin_manifest(
    *,
    base_url: str,
    app_version: str,
    mcp_version: str,
    sync_schema_version: int,
    resource_names: list[str],
    frame_ancestors: list[str] | None = None,
    requested_frame_ancestor: str = "",
) -> dict[str, Any]:
    normalized_base = normalize_text(base_url).rstrip("/")
    normalized_requested = normalize_frame_ancestor(requested_frame_ancestor)
    normalized_frame_ancestors = normalize_frame_ancestors(frame_ancestors or [])
    return {
        "schema_version": PLUGIN_MANIFEST_VERSION,
        "id": PLUGIN_ID,
        "title": "Wardrobe",
        "description": "Owner-scoped wardrobe application embedded in Hermes Mobile.",
        "kind": "embedded_app",
        "version": app_version,
        "entry": {
            "type": "web",
            "url": f"{normalized_base}/?embed=hermes",
            "frame_policy": "allow_configured_hermes_origins",
        },
        "navigation": {
            "state_event": "wardrobe.plugin.navigation",
            "back_event": "hermes.plugin.back",
            "back_result_event": "wardrobe.plugin.back_result",
            "refresh_required_event": "wardrobe.plugin.refresh_required",
            "preserve_iframe_state": True,
            "message_version": 1,
        },
        "appearance_sync": {
            "theme": list(APPEARANCE_THEMES),
            "fontSize": list(APPEARANCE_FONT_SIZES),
            "launch_field": "appearance",
            "entry_query": {
                "theme": "pluginTheme",
                "fontSize": "pluginFontSize",
            },
            "session_endpoint": "/api/v1/hermes/plugin/session",
        },
        "embedding": {
            "frame_ancestors": normalized_frame_ancestors,
            "requested_frame_ancestor": normalized_requested,
            "requested_frame_ancestor_allowed": (
                normalized_requested in normalized_frame_ancestors if normalized_requested else None
            ),
            "registration_endpoint": "/api/v1/hermes/plugin/frame-ancestors",
        },
        "mcp": {
            "server": "wardrobe-mcp",
            "version": mcp_version,
            "toolset": "wardrobe",
            "required_tools": [
                "wardrobe.sync",
                "wardrobe.get_item",
                "wardrobe.search_items",
                "wardrobe.get_primary_thumbnail",
                "wardrobe.set_primary_photo",
                "wardrobe.write_history",
                "wardrobe.write_item",
                "wardrobe.upload_photo",
            ],
        },
        "program_api": {
            "base_url": normalized_base,
            "plugin_manifest": "/api/v1/hermes/plugin/manifest",
            "workspace_registration": "/api/v1/hermes/plugin/workspaces",
            "plugin_launch": "/api/v1/hermes/plugin/launch",
            "sync_manifest": "/api/v1/sync/outfit-context/manifest",
            "sync_resource": "/api/v1/sync/outfit-context/resources/{name}",
            "resource_names": resource_names,
            "sync_schema_version": sync_schema_version,
        },
        "owner_binding": {
            "strategy": "workspace_generated_access_key",
            "config_file": ".hermes-wardrobe/config.json",
            "access_key_file": ".hermes-wardrobe/access-key.txt",
            "cache_dir": ".hermes-cache",
            "raw_key_returned_by_wardrobe": False,
        },
        "permissions": {
            "register_workspace_requires": ["owners:write", "admin:*"],
            "owner_token_scopes": list(DEFAULT_PLUGIN_SCOPES),
        },
        "actions": [
            {
                "id": action["id"],
                "label": action["label"],
                "placement": ["plugin_drawer_frequent", "dock_long_press", "search"],
                "priority": action["priority"],
                "entry": {"type": "plugin_route", "pluginRoute": action["route"]},
            }
            for action in HERMES_PLUGIN_ACTIONS
        ],
    }


def _workspace_id_from_owner(owner: str) -> str:
    return f"owner-{default_owner_slug(owner)}"


def normalize_frame_ancestor(value: object) -> str:
    raw = normalize_text(value)
    if not raw:
        return ""
    if raw == "'self'":
        return raw
    if raw in {"http://127.0.0.1:*", "http://localhost:*"}:
        return raw
    from urllib.parse import urlparse

    parsed = urlparse(raw)
    if parsed.scheme not in {"https", "http"} or not parsed.netloc:
        raise HermesPluginError("invalid_frame_ancestor", "frame ancestor must be an origin")
    if parsed.path not in {"", "/"} or parsed.params or parsed.query or parsed.fragment:
        raise HermesPluginError("invalid_frame_ancestor", "frame ancestor must not include path, query, or fragment")
    host = parsed.hostname or ""
    if parsed.scheme == "http" and host not in {"127.0.0.1", "localhost", "::1"}:
        raise HermesPluginError("invalid_frame_ancestor", "non-local frame ancestor must use https")
    port = f":{parsed.port}" if parsed.port else ""
    return f"{parsed.scheme}://{parsed.hostname}{port}"


def normalize_frame_ancestors(values: list[object]) -> list[str]:
    result: list[str] = []
    for value in values:
        normalized = normalize_frame_ancestor(value)
        if normalized and normalized not in result:
            result.append(normalized)
    return result


def load_frame_ancestors(
    conn: sqlite3.Connection,
    defaults: list[str],
    *,
    setting_key: str = FRAME_ANCESTORS_SETTING_KEY,
) -> list[str]:
    values = normalize_frame_ancestors(defaults)
    row = conn.execute("SELECT value FROM app_settings WHERE key = ?", (setting_key,)).fetchone()
    if row is not None:
        try:
            stored = json.loads(str(row["value"] or "[]"))
        except json.JSONDecodeError:
            stored = []
        if isinstance(stored, list):
            for value in normalize_frame_ancestors(stored):
                if value not in values:
                    values.append(value)
    return values


def save_frame_ancestors(
    conn: sqlite3.Connection,
    origins: list[str],
    *,
    setting_key: str = FRAME_ANCESTORS_SETTING_KEY,
) -> list[str]:
    normalized = normalize_frame_ancestors(origins)
    conn.execute(
        """
        INSERT INTO app_settings(key, value, updated_at)
        VALUES(?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
        """,
        (setting_key, json.dumps(normalized, ensure_ascii=False, sort_keys=True)),
    )
    return normalized


def register_frame_ancestors(
    conn: sqlite3.Connection,
    payload: dict[str, Any],
    defaults: list[str],
    *,
    setting_key: str = FRAME_ANCESTORS_SETTING_KEY,
) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise HermesPluginError("invalid_payload", "JSON body must be an object")
    requested_values: list[object] = []
    if "origin" in payload:
        requested_values.append(payload.get("origin"))
    if "frame_ancestor" in payload:
        requested_values.append(payload.get("frame_ancestor"))
    if isinstance(payload.get("origins"), list):
        requested_values.extend(payload.get("origins") or [])
    if isinstance(payload.get("frame_ancestors"), list):
        requested_values.extend(payload.get("frame_ancestors") or [])
    additions = normalize_frame_ancestors(requested_values)
    if not additions:
        raise HermesPluginError("frame_ancestor_required", "origin or origins is required")
    current = load_frame_ancestors(conn, defaults, setting_key=setting_key)
    merged = list(current)
    for value in additions:
        if value not in merged:
            merged.append(value)
    saved = save_frame_ancestors(conn, merged, setting_key=setting_key)
    return {
        "registered": True,
        "added": additions,
        "frame_ancestors": saved,
    }


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _sql_timestamp(value: datetime) -> str:
    return value.strftime("%Y-%m-%d %H:%M:%S")


def create_launch_token(
    conn: sqlite3.Connection,
    payload: dict[str, Any],
    token_context: dict[str, Any],
    *,
    lifetime_seconds: int = 90,
) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise HermesPluginError("invalid_payload", "JSON body must be an object")
    workspace_id = normalize_text(payload.get("workspace_id") or payload.get("workspaceId"))
    if not workspace_id:
        raise HermesPluginError("workspace_id_required", "workspace_id is required")
    appearance = normalize_appearance(payload.get("appearance"))
    ensure_tables(conn)
    workspace = conn.execute(
        """
        SELECT *
        FROM hermes_plugin_workspaces
        WHERE workspace_id = ?
        """,
        (workspace_id,),
    ).fetchone()
    if workspace is None:
        raise HermesPluginError("workspace_not_registered", "workspace is not registered")
    context_token_id = int(token_context.get("token_id") or 0)
    workspace_token_id = int(workspace["token_id"] or 0)
    context_owner = normalize_text(token_context.get("owner"))
    workspace_owner = normalize_text(workspace["owner"])
    scopes = set(token_context.get("scopes") or [])
    if "admin:*" not in scopes and (
        not context_token_id
        or context_token_id != workspace_token_id
        or context_owner != workspace_owner
    ):
        raise HermesPluginError("workspace_token_mismatch", "workspace_id is not bound to this access key")
    now = _utc_now()
    expires_at = now + timedelta(seconds=max(30, int(lifetime_seconds)))
    conn.execute(
        """
        DELETE FROM hermes_plugin_launch_tokens
        WHERE consumed_at IS NOT NULL OR expires_at <= ?
        """,
        (_sql_timestamp(now),),
    )
    launch_token = "wpl_" + secrets.token_urlsafe(32)
    conn.execute(
        """
        INSERT INTO hermes_plugin_launch_tokens (
            token_hash, workspace_id, owner, token_id, appearance_json, expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            token_hash(launch_token),
            workspace_id,
            workspace_owner,
            workspace_token_id or None,
            json.dumps(appearance, ensure_ascii=False, sort_keys=True),
            _sql_timestamp(expires_at),
        ),
    )
    entry_path = (
        f"/?embed=hermes&launch={launch_token}"
        f"&pluginTheme={appearance['theme']}&pluginFontSize={appearance['fontSize']}"
    )
    return {
        "launch_token": launch_token,
        "token_type": "one_time_plugin_launch",
        "expires_in": max(30, int(lifetime_seconds)),
        "workspace_id": workspace_id,
        "owner": workspace_owner,
        "appearance": appearance,
        "entry_path": entry_path,
    }


def consume_launch_token(conn: sqlite3.Connection, launch_token: str) -> dict[str, Any]:
    normalized_token = normalize_text(launch_token)
    if not normalized_token:
        raise HermesPluginError("launch_token_required", "launch token is required")
    ensure_tables(conn)
    now = _utc_now()
    row = conn.execute(
        """
        SELECT *
        FROM hermes_plugin_launch_tokens
        WHERE token_hash = ?
          AND consumed_at IS NULL
          AND expires_at > ?
        """,
        (token_hash(normalized_token), _sql_timestamp(now)),
    ).fetchone()
    if row is None:
        raise HermesPluginError("invalid_launch_token", "launch token is invalid or expired")
    conn.execute(
        """
        UPDATE hermes_plugin_launch_tokens
        SET consumed_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (int(row["id"]),),
    )
    return {
        "workspace_id": normalize_text(row["workspace_id"]),
        "owner": normalize_text(row["owner"]),
        "token_id": int(row["token_id"] or 0),
        "appearance": normalize_appearance_json(row["appearance_json"]),
    }


def normalize_appearance(value: object) -> dict[str, str]:
    if not isinstance(value, dict):
        return dict(DEFAULT_APPEARANCE)
    theme = normalize_text(value.get("theme"))
    font_size = normalize_text(value.get("fontSize") or value.get("font_size"))
    return {
        "theme": theme if theme in APPEARANCE_THEMES else DEFAULT_APPEARANCE["theme"],
        "fontSize": font_size if font_size in APPEARANCE_FONT_SIZES else DEFAULT_APPEARANCE["fontSize"],
    }


def normalize_appearance_json(value: object) -> dict[str, str]:
    try:
        parsed = json.loads(normalize_text(value) or "{}")
    except json.JSONDecodeError:
        parsed = {}
    return normalize_appearance(parsed)


def bind_session_appearance(
    conn: sqlite3.Connection,
    session_id: str,
    launch: dict[str, Any],
) -> dict[str, str]:
    appearance = normalize_appearance(launch.get("appearance"))
    normalized_session_id = normalize_text(session_id)
    if not normalized_session_id:
        raise HermesPluginError("session_id_required", "session_id is required")
    ensure_tables(conn)
    conn.execute(
        """
        INSERT INTO hermes_plugin_sessions (
            session_id, workspace_id, owner, appearance_json, updated_at
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(session_id) DO UPDATE SET
            workspace_id = excluded.workspace_id,
            owner = excluded.owner,
            appearance_json = excluded.appearance_json,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            normalized_session_id,
            normalize_text(launch.get("workspace_id")),
            normalize_text(launch.get("owner")),
            json.dumps(appearance, ensure_ascii=False, sort_keys=True),
        ),
    )
    return appearance


def session_appearance(conn: sqlite3.Connection, session_id: str) -> dict[str, Any]:
    normalized_session_id = normalize_text(session_id)
    if not normalized_session_id:
        raise HermesPluginError("session_id_required", "session_id is required")
    ensure_tables(conn)
    row = conn.execute(
        """
        SELECT workspace_id, owner, appearance_json
        FROM hermes_plugin_sessions
        WHERE session_id = ?
        """,
        (normalized_session_id,),
    ).fetchone()
    if row is None:
        return {"appearance": dict(DEFAULT_APPEARANCE)}
    return {
        "workspace_id": normalize_text(row["workspace_id"]),
        "owner": normalize_text(row["owner"]),
        "appearance": normalize_appearance_json(row["appearance_json"]),
    }


def _normalize_scopes(value: object) -> list[str]:
    if value is None:
        return list(DEFAULT_PLUGIN_SCOPES)
    if not isinstance(value, list):
        raise HermesPluginError("invalid_scopes", "scopes must be an array")
    scopes = sorted({normalize_text(item) for item in value if normalize_text(item)})
    if not scopes:
        return list(DEFAULT_PLUGIN_SCOPES)
    missing = set(DEFAULT_PLUGIN_SCOPES) - set(scopes)
    return sorted(set(scopes) | missing)


def normalize_workspace_registration_payload(payload: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise HermesPluginError("invalid_payload", "JSON body must be an object")
    owner = normalize_text(payload.get("owner"))
    if not owner:
        raise HermesPluginError("owner_required", "owner is required")
    access_key = normalize_text(
        payload.get("access_key")
        or payload.get("workspace_key")
        or payload.get("key")
    )
    if not access_key:
        raise HermesPluginError("access_key_required", "access_key is required")
    workspace_id = normalize_text(payload.get("workspace_id")) or _workspace_id_from_owner(owner)
    display_name = normalize_text(payload.get("display_name") or payload.get("workspace_name")) or owner
    api_base_url = normalize_text(payload.get("api_base_url"))
    replace_existing_key = bool(payload.get("replace_existing_key"))
    store_access_key = payload.get("store_access_key")
    if store_access_key is None:
        store_access_key = True
    frame_ancestor_values: list[object] = []
    for key in ("origin", "frame_ancestor", "hermes_origin"):
        if payload.get(key):
            frame_ancestor_values.append(payload.get(key))
    for key in ("origins", "frame_ancestors"):
        if isinstance(payload.get(key), list):
            frame_ancestor_values.extend(payload.get(key) or [])
    return {
        "owner": owner,
        "access_key": access_key,
        "workspace_id": workspace_id,
        "display_name": display_name,
        "api_base_url": api_base_url,
        "scopes": _normalize_scopes(payload.get("scopes")),
        "replace_existing_key": replace_existing_key,
        "store_access_key": bool(store_access_key),
        "frame_ancestors": normalize_frame_ancestors(frame_ancestor_values),
    }


def _validate_access_key(access_key: str, *, token_prefix_value: str, min_length: int) -> None:
    if not access_key.startswith(token_prefix_value):
        raise HermesPluginError("invalid_access_key_prefix", "access_key has invalid prefix")
    if len(access_key) < min_length:
        raise HermesPluginError("invalid_access_key_length", "access_key is too short")


def _upsert_token(
    conn: sqlite3.Connection,
    *,
    owner: str,
    workspace_id: str,
    access_key: str,
    scopes: list[str],
    replace_existing_key: bool,
) -> sqlite3.Row:
    access_hash = token_hash(access_key)
    existing_token = conn.execute(
        """
        SELECT *
        FROM api_tokens
        WHERE token_hash = ?
        """,
        (access_hash,),
    ).fetchone()
    if existing_token is not None:
        if normalize_text(existing_token["owner"]) != owner:
            raise HermesPluginError("access_key_already_registered", "access_key is bound to another owner")
        conn.execute(
            """
            UPDATE api_tokens
            SET name = ?,
                token_prefix = ?,
                scopes_json = ?,
                enabled = 1
            WHERE id = ?
            """,
            (
                f"hermes-workspace-{workspace_id}",
                token_prefix(access_key),
                json.dumps(sorted(set(scopes)), ensure_ascii=False, sort_keys=True),
                int(existing_token["id"]),
            ),
        )
        return conn.execute("SELECT * FROM api_tokens WHERE id = ?", (int(existing_token["id"]),)).fetchone()

    owner_rows = conn.execute(
        """
        SELECT *
        FROM api_tokens
        WHERE owner = ?
          AND COALESCE(enabled, 1) = 1
        """,
        (owner,),
    ).fetchall()
    if owner_rows and not replace_existing_key:
        raise HermesPluginError("owner_key_exists", "owner already has an enabled access key")
    if owner_rows and replace_existing_key:
        conn.execute(
            "UPDATE api_tokens SET enabled = 0 WHERE owner = ? AND COALESCE(enabled, 1) = 1",
            (owner,),
        )

    cursor = conn.execute(
        """
        INSERT INTO api_tokens (
            name, token_prefix, token_hash, owner, scopes_json, enabled
        )
        VALUES (?, ?, ?, ?, ?, 1)
        """,
        (
            f"hermes-workspace-{workspace_id}",
            token_prefix(access_key),
            access_hash,
            owner,
            json.dumps(sorted(set(scopes)), ensure_ascii=False, sort_keys=True),
        ),
    )
    return conn.execute("SELECT * FROM api_tokens WHERE id = ?", (int(cursor.lastrowid),)).fetchone()


def register_workspace(
    conn: sqlite3.Connection,
    payload: dict[str, Any],
    *,
    token_prefix_value: str,
    token_min_length: int,
    secret_dir: Path,
    owner_slug_fn: Callable[[str], str] = default_owner_slug,
    default_frame_ancestors: list[str] | None = None,
) -> dict[str, Any]:
    ensure_tables(conn)
    normalized = normalize_workspace_registration_payload(payload)
    _validate_access_key(
        normalized["access_key"],
        token_prefix_value=token_prefix_value,
        min_length=token_min_length,
    )
    token_row = _upsert_token(
        conn,
        owner=normalized["owner"],
        workspace_id=normalized["workspace_id"],
        access_key=normalized["access_key"],
        scopes=normalized["scopes"],
        replace_existing_key=normalized["replace_existing_key"],
    )
    conn.execute(
        """
        INSERT INTO option_catalogs(option_type, value)
        VALUES('owner', ?)
        ON CONFLICT(option_type, value) DO NOTHING
        """,
        (normalized["owner"],),
    )
    conn.execute(
        """
        INSERT INTO hermes_plugin_workspaces (
            workspace_id, owner, display_name, api_base_url, token_id, updated_at
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(workspace_id) DO UPDATE SET
            owner = excluded.owner,
            display_name = excluded.display_name,
            api_base_url = excluded.api_base_url,
            token_id = excluded.token_id,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            normalized["workspace_id"],
            normalized["owner"],
            normalized["display_name"],
            normalized["api_base_url"],
            int(token_row["id"]),
        ),
    )
    secret_path = secret_dir / f"{owner_slug_fn(normalized['owner'])}.token"
    access_key_stored = False
    if normalized["store_access_key"]:
        secret_dir.mkdir(parents=True, exist_ok=True)
        secret_path.write_text(normalized["access_key"] + "\n", encoding="utf-8")
        try:
            secret_path.chmod(0o600)
        except OSError:
            pass
        access_key_stored = True
    frame_ancestors: list[str] = []
    if normalized["frame_ancestors"]:
        frame_ancestors = register_frame_ancestors(
            conn,
            {"frame_ancestors": normalized["frame_ancestors"]},
            default_frame_ancestors or [],
        )["frame_ancestors"]
    return {
        "registered": True,
        "workspace_id": normalized["workspace_id"],
        "owner": normalized["owner"],
        "display_name": normalized["display_name"],
        "api_base_url": normalized["api_base_url"],
        "token_id": int(token_row["id"]),
        "token_prefix": normalize_text(token_row["token_prefix"]),
        "scopes": json.loads(token_row["scopes_json"]),
        "access_key_stored": access_key_stored,
        "secret_path": str(secret_path) if access_key_stored else "",
        "frame_ancestors": frame_ancestors,
    }
