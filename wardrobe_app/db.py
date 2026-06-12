from __future__ import annotations

import os
import sqlite3
from pathlib import Path

from wardrobe_app.item_normalization import normalize_price_currency, normalize_price_text
from wardrobe_app import hermes_plugin


ROOT_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = Path(os.environ.get("WARDROBE_STORAGE_DIR", str(ROOT_DIR)))
DATA_DIR = STORAGE_DIR / "data"
MEDIA_DIR = STORAGE_DIR / "media"
WEB_DIR = ROOT_DIR / "web"
DB_PATH = DATA_DIR / "wardrobe.db"
SQLITE_BUSY_TIMEOUT_MS = int(os.environ.get("WARDROBE_SQLITE_BUSY_TIMEOUT_MS", "30000"))


def ensure_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def connect() -> sqlite3.Connection:
    ensure_directories()
    conn = sqlite3.connect(DB_PATH, timeout=max(1.0, SQLITE_BUSY_TIMEOUT_MS / 1000.0))
    conn.row_factory = sqlite3.Row
    conn.execute(f"PRAGMA busy_timeout = {SQLITE_BUSY_TIMEOUT_MS}")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    try:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA synchronous = NORMAL")
    except sqlite3.DatabaseError:
        pass
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            brand TEXT,
            section TEXT,
            loc TEXT,
            maintenance_state INTEGER DEFAULT 0,
            maintenance_prev_loc TEXT,
            owner TEXT DEFAULT '徐欣',
            layer_role TEXT,
            outer_type TEXT,
            scene_tag TEXT,
            relax_index REAL,
            temp_min REAL,
            temp_max REAL,
            standalone_min REAL,
            standalone_max REAL,
            primary_color TEXT,
            secondary_color TEXT,
            official_desc TEXT,
            price_original TEXT,
            price_original_currency TEXT,
            price_cny TEXT,
            series TEXT,
            size TEXT,
            acquired_at TEXT,
            official_color_code TEXT,
            material TEXT,
            care TEXT,
            notes TEXT,
            status TEXT DEFAULT 'Active',
            source_sheet TEXT,
            wear_total INTEGER DEFAULT 0,
            wear_maintenance REAL DEFAULT 0,
            wear_year INTEGER DEFAULT 0,
            maint_count INTEGER DEFAULT 0,
            wear_threshold REAL DEFAULT 0,
            last_worn_on TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            original_name TEXT,
            sort_order INTEGER DEFAULT 1,
            view_tag TEXT,
            source_tag TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS outfits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wear_date TEXT NOT NULL,
            city TEXT,
            inventory_loc TEXT,
            owner TEXT DEFAULT '徐欣',
            wear_mode TEXT DEFAULT 'normal',
            scene_tag TEXT,
            temp_value REAL,
            temp_low REAL,
            temp_high REAL,
            avg_relax REAL,
            avg_temp_label TEXT,
            notes TEXT,
            ai_analysis TEXT,
            ai_analysis_status TEXT DEFAULT '',
            ai_analysis_error TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (wear_date, owner)
        );

        CREATE TABLE IF NOT EXISTS outfit_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            outfit_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            role TEXT,
            FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
            UNIQUE (outfit_id, item_id)
        );

        CREATE TABLE IF NOT EXISTS outfit_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            outfit_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            original_name TEXT,
            sort_order INTEGER DEFAULT 1,
            source_tag TEXT,
            mime_type TEXT,
            data BLOB,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS imports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            import_type TEXT NOT NULL,
            source_path TEXT,
            summary_json TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS wearcount_daily_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wear_date TEXT NOT NULL,
            city TEXT,
            wear_mode TEXT,
            notes TEXT,
            source_path TEXT,
            payload_hash TEXT,
            owner TEXT DEFAULT '寰愭',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (wear_date, owner)
        );

        CREATE TABLE IF NOT EXISTS wearcount_daily_update_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_update_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            code TEXT NOT NULL,
            role TEXT,
            has_base_layer INTEGER DEFAULT 0,
            wear_delta REAL DEFAULT 0,
            total_delta INTEGER DEFAULT 1,
            year_delta INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (daily_update_id) REFERENCES wearcount_daily_updates(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
            UNIQUE (daily_update_id, item_id)
        );

        CREATE TABLE IF NOT EXISTS auth_attempts (
            username TEXT PRIMARY KEY,
            failed_attempts INTEGER DEFAULT 0,
            locked INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS auth_users (
            username TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS auth_sessions (
            session_id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

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

        CREATE TABLE IF NOT EXISTS hermes_plugin_launch_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token_hash TEXT NOT NULL UNIQUE,
            workspace_id TEXT NOT NULL,
            owner TEXT NOT NULL,
            token_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT NOT NULL,
            consumed_at TEXT,
            FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS featured_looks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            look_id TEXT NOT NULL UNIQUE,
            anchor_type TEXT,
            anchor_code TEXT,
            anchor_section TEXT,
            use_case TEXT,
            priority TEXT,
            status TEXT,
            owner TEXT DEFAULT '徐欣',
            temp_min REAL,
            temp_max REAL,
            scene_tag_target TEXT,
            relax_center REAL,
            relax_span REAL,
            material_line TEXT,
            notes TEXT,
            ai_analysis TEXT,
            ai_analysis_status TEXT DEFAULT '',
            ai_analysis_error TEXT,
            source_sheet TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS featured_look_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            featured_look_id INTEGER NOT NULL,
            item_id INTEGER,
            slot TEXT NOT NULL,
            source_code TEXT,
            source_section TEXT,
            display_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (featured_look_id) REFERENCES featured_looks(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
            UNIQUE (featured_look_id, slot)
        );

        CREATE TABLE IF NOT EXISTS featured_look_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            featured_look_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            original_name TEXT,
            sort_order INTEGER DEFAULT 1,
            source_tag TEXT,
            mime_type TEXT,
            data BLOB,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (featured_look_id) REFERENCES featured_looks(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS option_catalogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            option_type TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (option_type, value)
        );

        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_items_owner_loc ON items(owner, loc);
        CREATE INDEX IF NOT EXISTS idx_items_layer_role ON items(layer_role);
        CREATE INDEX IF NOT EXISTS idx_outfits_wear_date ON outfits(wear_date);
        CREATE INDEX IF NOT EXISTS idx_outfit_photos_outfit ON outfit_photos(outfit_id, sort_order);
        CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_order ON outfit_items(outfit_id, id, item_id, role);
        CREATE INDEX IF NOT EXISTS idx_wearcount_daily_updates_date ON wearcount_daily_updates(wear_date);
        CREATE INDEX IF NOT EXISTS idx_wearcount_daily_update_items_update ON wearcount_daily_update_items(daily_update_id);
        CREATE INDEX IF NOT EXISTS idx_wearcount_daily_update_items_item ON wearcount_daily_update_items(item_id);
        CREATE INDEX IF NOT EXISTS idx_auth_sessions_username ON auth_sessions(username);
        CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);
        CREATE INDEX IF NOT EXISTS idx_api_tokens_owner ON api_tokens(owner);
        CREATE INDEX IF NOT EXISTS idx_hermes_plugin_workspaces_owner ON hermes_plugin_workspaces(owner);
        CREATE INDEX IF NOT EXISTS idx_hermes_plugin_launch_tokens_hash ON hermes_plugin_launch_tokens(token_hash);
        CREATE INDEX IF NOT EXISTS idx_hermes_plugin_launch_tokens_workspace ON hermes_plugin_launch_tokens(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_featured_looks_status ON featured_looks(status);
        CREATE INDEX IF NOT EXISTS idx_featured_look_items_look ON featured_look_items(featured_look_id, display_order);
        CREATE INDEX IF NOT EXISTS idx_featured_look_photos_look ON featured_look_photos(featured_look_id, sort_order);
        CREATE INDEX IF NOT EXISTS idx_option_catalogs_type_value ON option_catalogs(option_type, value);
        """
    )
    _ensure_photo_columns(conn)
    _ensure_outfit_photo_geo_columns(conn)
    _ensure_outfit_photo_thumbnail_columns(conn)
    _ensure_featured_look_columns(conn)
    _ensure_item_maintenance_columns(conn)
    _ensure_item_price_columns(conn)
    _ensure_owner_scoped_outfit_tables(conn)
    _ensure_option_catalogs(conn)
    _ensure_photo_performance_indexes(conn)
    hermes_plugin.ensure_tables(conn)


def _ensure_photo_performance_indexes(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_photos_item_sort_meta
        ON photos(item_id, sort_order, id, file_name, original_name, view_tag, source_tag, created_at, mime_type)
        """
    )
    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_featured_look_photos_look_meta
        ON featured_look_photos(featured_look_id, sort_order, id, file_name, original_name, source_tag, created_at, mime_type)
        """
    )
    conn.commit()


def _ensure_photo_columns(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(photos)").fetchall()}
    if "mime_type" not in existing:
        conn.execute("ALTER TABLE photos ADD COLUMN mime_type TEXT")
    if "data" not in existing:
        conn.execute("ALTER TABLE photos ADD COLUMN data BLOB")
    conn.commit()


def _ensure_outfit_photo_geo_columns(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(outfit_photos)").fetchall()}
    if "gps_lat" not in existing:
        conn.execute("ALTER TABLE outfit_photos ADD COLUMN gps_lat REAL")
    if "gps_lng" not in existing:
        conn.execute("ALTER TABLE outfit_photos ADD COLUMN gps_lng REAL")
    if "gps_checked" not in existing:
        conn.execute("ALTER TABLE outfit_photos ADD COLUMN gps_checked INTEGER DEFAULT 0")
    conn.commit()


def _ensure_outfit_photo_thumbnail_columns(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(outfit_photos)").fetchall()}
    if "thumb_mime_type" not in existing:
        conn.execute("ALTER TABLE outfit_photos ADD COLUMN thumb_mime_type TEXT")
    if "thumb_data" not in existing:
        conn.execute("ALTER TABLE outfit_photos ADD COLUMN thumb_data BLOB")
    conn.commit()


def _ensure_featured_look_columns(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(featured_looks)").fetchall()}
    if "owner" not in existing:
        conn.execute("ALTER TABLE featured_looks ADD COLUMN owner TEXT DEFAULT '徐欣'")
    if "ai_analysis" not in existing:
        conn.execute("ALTER TABLE featured_looks ADD COLUMN ai_analysis TEXT")
    if "ai_analysis_status" not in existing:
        conn.execute("ALTER TABLE featured_looks ADD COLUMN ai_analysis_status TEXT DEFAULT ''")
    if "ai_analysis_error" not in existing:
        conn.execute("ALTER TABLE featured_looks ADD COLUMN ai_analysis_error TEXT")
    existing_outfits = {row["name"] for row in conn.execute("PRAGMA table_info(outfits)").fetchall()}
    if "ai_analysis" not in existing_outfits:
        conn.execute("ALTER TABLE outfits ADD COLUMN ai_analysis TEXT")
    if "ai_analysis_status" not in existing_outfits:
        conn.execute("ALTER TABLE outfits ADD COLUMN ai_analysis_status TEXT DEFAULT ''")
    if "ai_analysis_error" not in existing_outfits:
        conn.execute("ALTER TABLE outfits ADD COLUMN ai_analysis_error TEXT")
    conn.execute("UPDATE featured_looks SET owner = '徐欣' WHERE COALESCE(owner, '') = ''")
    conn.commit()


def _ensure_item_maintenance_columns(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(items)").fetchall()}
    if "maintenance_state" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN maintenance_state INTEGER DEFAULT 0")
    if "maintenance_prev_loc" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN maintenance_prev_loc TEXT")
    conn.execute(
        """
        UPDATE items
        SET maintenance_state = 1,
            maintenance_prev_loc = COALESCE(NULLIF(maintenance_prev_loc, ''), ''),
            loc = CASE
                WHEN UPPER(COALESCE(loc, '')) = 'MT' THEN ''
                ELSE loc
            END
        WHERE UPPER(COALESCE(loc, '')) = 'MT'
           OR COALESCE(maintenance_state, 0) = 1
        """
    )
    conn.commit()


def _ensure_item_price_columns(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(items)").fetchall()}
    if "price_original_currency" not in existing:
        conn.execute("ALTER TABLE items ADD COLUMN price_original_currency TEXT")
    rows = conn.execute(
        """
        SELECT id, price_original, price_original_currency, price_cny
        FROM items
        """
    ).fetchall()
    for row in rows:
        price_original = normalize_price_text(row["price_original"])
        price_cny = normalize_price_text(row["price_cny"])
        currency = normalize_price_currency(row["price_original_currency"], row["price_original"])
        if price_original and not currency:
            currency = "CNY"
        if not price_original:
            currency = ""
        if (
            (row["price_original"] or "") == price_original
            and (row["price_cny"] or "") == price_cny
            and (row["price_original_currency"] or "") == currency
        ):
            continue
        conn.execute(
            """
            UPDATE items
            SET price_original = ?,
                price_original_currency = ?,
                price_cny = ?
            WHERE id = ?
            """,
            (price_original, currency, price_cny, int(row["id"])),
        )
    conn.commit()


def _table_create_sql(conn: sqlite3.Connection, table_name: str) -> str:
    row = conn.execute(
        "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    if row is None:
        return ""
    return str(row["sql"] or "")


def _has_owner_scoped_unique_key(table_sql: str) -> bool:
    normalized = " ".join(str(table_sql or "").replace("\n", " ").split()).upper()
    return "UNIQUE (WEAR_DATE, OWNER)" in normalized or "UNIQUE(WEAR_DATE, OWNER)" in normalized


def _rebuild_wearcount_daily_updates_with_owner(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(wearcount_daily_updates)").fetchall()}
    owner_expr = (
        "COALESCE(owner, COALESCE((SELECT owner FROM outfits WHERE outfits.wear_date = wearcount_daily_updates.wear_date ORDER BY id DESC LIMIT 1), '徐欣'))"
        if "owner" in existing
        else "COALESCE((SELECT owner FROM outfits WHERE outfits.wear_date = wearcount_daily_updates.wear_date ORDER BY id DESC LIMIT 1), '徐欣')"
    )
    conn.executescript(
        """
        CREATE TABLE wearcount_daily_updates_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wear_date TEXT NOT NULL,
            city TEXT,
            wear_mode TEXT,
            notes TEXT,
            source_path TEXT,
            payload_hash TEXT,
            owner TEXT DEFAULT '徐欣',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (wear_date, owner)
        );
        """
    )
    conn.execute(
        f"""
        INSERT INTO wearcount_daily_updates_new (
            id, wear_date, city, wear_mode, notes, source_path, payload_hash, owner, created_at, updated_at
        )
        SELECT
            id,
            wear_date,
            city,
            wear_mode,
            notes,
            source_path,
            payload_hash,
            {owner_expr},
            created_at,
            updated_at
        FROM wearcount_daily_updates
        ORDER BY id ASC
        """
    )
    conn.execute("DROP TABLE wearcount_daily_updates")
    conn.execute("ALTER TABLE wearcount_daily_updates_new RENAME TO wearcount_daily_updates")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_wearcount_daily_updates_date ON wearcount_daily_updates(wear_date)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_wearcount_daily_updates_owner_date ON wearcount_daily_updates(owner, wear_date)")


def _rebuild_outfits_with_owner_scope(conn: sqlite3.Connection) -> None:
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(outfits)").fetchall()}
    ai_analysis_expr = "COALESCE(ai_analysis, '')" if "ai_analysis" in existing else "''"
    ai_analysis_status_expr = "COALESCE(ai_analysis_status, '')" if "ai_analysis_status" in existing else "''"
    ai_analysis_error_expr = "COALESCE(ai_analysis_error, '')" if "ai_analysis_error" in existing else "''"
    owner_expr = "COALESCE(owner, '徐欣')" if "owner" in existing else "'徐欣'"
    conn.executescript(
        """
        CREATE TABLE outfits_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wear_date TEXT NOT NULL,
            city TEXT,
            inventory_loc TEXT,
            owner TEXT DEFAULT '徐欣',
            wear_mode TEXT DEFAULT 'normal',
            scene_tag TEXT,
            temp_value REAL,
            temp_low REAL,
            temp_high REAL,
            avg_relax REAL,
            avg_temp_label TEXT,
            notes TEXT,
            ai_analysis TEXT,
            ai_analysis_status TEXT DEFAULT '',
            ai_analysis_error TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (wear_date, owner)
        );
        """
    )
    conn.execute(
        f"""
        INSERT INTO outfits_new (
            id, wear_date, city, inventory_loc, owner, wear_mode, scene_tag,
            temp_value, temp_low, temp_high, avg_relax, avg_temp_label, notes, ai_analysis, ai_analysis_status, ai_analysis_error, created_at, updated_at
        )
        SELECT
            id,
            wear_date,
            city,
            inventory_loc,
            {owner_expr},
            wear_mode,
            scene_tag,
            temp_value,
            temp_low,
            temp_high,
            avg_relax,
            avg_temp_label,
            notes,
            {ai_analysis_expr},
            {ai_analysis_status_expr},
            {ai_analysis_error_expr},
            created_at,
            updated_at
        FROM outfits
        ORDER BY id ASC
        """
    )
    conn.execute("DROP TABLE outfits")
    conn.execute("ALTER TABLE outfits_new RENAME TO outfits")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_outfits_wear_date ON outfits(wear_date)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_outfits_owner_wear_date ON outfits(owner, wear_date)")


def _ensure_owner_scoped_outfit_tables(conn: sqlite3.Connection) -> None:
    outfit_sql = _table_create_sql(conn, "outfits")
    daily_sql = _table_create_sql(conn, "wearcount_daily_updates")
    needs_outfit_rebuild = bool(outfit_sql) and not _has_owner_scoped_unique_key(outfit_sql)
    needs_daily_rebuild = bool(daily_sql) and not _has_owner_scoped_unique_key(daily_sql)
    if not needs_outfit_rebuild and not needs_daily_rebuild:
        conn.execute("CREATE INDEX IF NOT EXISTS idx_outfits_owner_wear_date ON outfits(owner, wear_date)")
        daily_columns = {row["name"] for row in conn.execute("PRAGMA table_info(wearcount_daily_updates)").fetchall()}
        if "owner" in daily_columns:
            conn.execute("CREATE INDEX IF NOT EXISTS idx_wearcount_daily_updates_owner_date ON wearcount_daily_updates(owner, wear_date)")
        conn.commit()
        return
    conn.execute("PRAGMA foreign_keys = OFF")
    try:
        if needs_daily_rebuild:
            _rebuild_wearcount_daily_updates_with_owner(conn)
        if needs_outfit_rebuild:
            _rebuild_outfits_with_owner_scope(conn)
        conn.commit()
    finally:
        conn.execute("PRAGMA foreign_keys = ON")


def _seed_option_catalog(conn: sqlite3.Connection, option_type: str, values: list[str]) -> None:
    normalized = sorted({str(value or "").strip() for value in values if str(value or "").strip()})
    if not normalized:
        return
    conn.executemany(
        "INSERT OR IGNORE INTO option_catalogs(option_type, value) VALUES(?, ?)",
        [(option_type, value) for value in normalized],
    )


def _ensure_option_catalogs(conn: sqlite3.Connection) -> None:
    owner_values = [
        *(row[0] for row in conn.execute("SELECT DISTINCT owner FROM items WHERE COALESCE(owner, '') <> ''")),
        *(row[0] for row in conn.execute("SELECT DISTINCT owner FROM outfits WHERE COALESCE(owner, '') <> ''")),
        *(row[0] for row in conn.execute("SELECT DISTINCT owner FROM featured_looks WHERE COALESCE(owner, '') <> ''")),
        *(row[0] for row in conn.execute("SELECT DISTINCT username FROM auth_users WHERE COALESCE(enabled, 1) = 1")),
    ]
    clothing_brand_values = [
        row[0]
        for row in conn.execute(
            """
            SELECT DISTINCT brand
            FROM items
            WHERE COALESCE(brand, '') <> ''
              AND COALESCE(layer_role, '') <> 'Watch'
            """
        )
    ]
    watch_brand_values = [
        row[0]
        for row in conn.execute(
            """
            SELECT DISTINCT brand
            FROM items
            WHERE COALESCE(brand, '') <> ''
              AND COALESCE(layer_role, '') = 'Watch'
            """
        )
    ]
    _seed_option_catalog(conn, "owner", owner_values)
    _seed_option_catalog(conn, "wardrobe_brand", clothing_brand_values)
    _seed_option_catalog(conn, "watch_brand", watch_brand_values)
    conn.commit()


def as_dict(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    return dict(row)
