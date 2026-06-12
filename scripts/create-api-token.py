from __future__ import annotations

import argparse
import hashlib
import json
import secrets
import sqlite3
from pathlib import Path


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def ensure_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS api_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            token_prefix TEXT NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            owner TEXT NOT NULL,
            scopes_json TEXT NOT NULL DEFAULT '[]',
            enabled INTEGER DEFAULT 1,
            expires_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_used_at TEXT
        );

        CREATE TABLE IF NOT EXISTS api_idempotency_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token_id INTEGER NOT NULL,
            idempotency_key TEXT NOT NULL,
            request_hash TEXT NOT NULL,
            response_json TEXT,
            status_code INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE CASCADE,
            UNIQUE (token_id, idempotency_key)
        );

        CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);
        CREATE INDEX IF NOT EXISTS idx_api_tokens_owner ON api_tokens(owner);
        """
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a wardrobe API bearer token.")
    parser.add_argument("--db", default="data/wardrobe.db", help="SQLite database path.")
    parser.add_argument("--name", required=True, help="Human-readable token name.")
    parser.add_argument("--owner", required=True, help="Owner bound to the token.")
    parser.add_argument(
        "--scope",
        action="append",
        dest="scopes",
        default=[],
        help="Scope to grant. Can be repeated.",
    )
    parser.add_argument("--expires-at", default="", help="Optional UTC expiry: YYYY-MM-DD HH:MM:SS.")
    parser.add_argument("--output", default="", help="Optional file to write the raw token.")
    parser.add_argument(
        "--print-token",
        action="store_true",
        help="Print the raw token even when --output is provided.",
    )
    args = parser.parse_args()

    scopes = sorted({scope.strip() for scope in args.scopes if scope.strip()})
    if not scopes:
        raise SystemExit("at least one --scope is required")
    token = "wd_live_" + secrets.token_urlsafe(32)
    token_prefix = token[:16]
    db_path = Path(args.db)
    conn = sqlite3.connect(str(db_path))
    try:
        ensure_tables(conn)
        cursor = conn.execute(
            """
            INSERT INTO api_tokens (
                name, token_prefix, token_hash, owner, scopes_json, enabled, expires_at
            )
            VALUES (?, ?, ?, ?, ?, 1, ?)
            """,
            (
                args.name,
                token_prefix,
                token_hash(token),
                args.owner,
                json.dumps(scopes, ensure_ascii=False, sort_keys=True),
                args.expires_at or None,
            ),
        )
        conn.commit()
        if args.output:
            Path(args.output).write_text(token + "\n", encoding="utf-8")
        result = {
            "id": int(cursor.lastrowid),
            "name": args.name,
            "owner": args.owner,
            "scopes": scopes,
            "token_prefix": token_prefix,
            "output": args.output,
            "token_written": bool(args.output),
        }
        if args.print_token or not args.output:
            result["token"] = token
        print(json.dumps(result, ensure_ascii=False, indent=2))
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
