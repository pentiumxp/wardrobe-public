from __future__ import annotations

import base64
import io
import json
import sqlite3
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path

from wardrobe_app import db, program_api_sync, server


class ProgramApiHelperTests(unittest.TestCase):
    def setUp(self) -> None:
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        db.init_db(self.conn)

    def tearDown(self) -> None:
        self.conn.close()

    def test_db_init_normalizes_existing_price_fields(self) -> None:
        self.conn.execute(
            """
            INSERT INTO items (code, owner, layer_role, section, brand, price_original, price_cny)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ("PRICE-MIGRATE-001", "OwnerA", "Outer", "Price Jacket", "Test Brand", "￥61,400.00", "RMB 59,900元"),
        )
        self.conn.commit()

        db.init_db(self.conn)

        row = self.conn.execute(
            "SELECT price_original, price_original_currency, price_cny FROM items WHERE code = ?",
            ("PRICE-MIGRATE-001",),
        ).fetchone()
        self.assertEqual(row["price_original"], "61400")
        self.assertEqual(row["price_original_currency"], "CNY")
        self.assertEqual(row["price_cny"], "59900")

    def test_native_ai_service_is_removed(self) -> None:
        payload = server._native_ai_removed_payload()

        self.assertEqual(payload["error"], "native_ai_removed")
        self.assertIn("Hermes Mobile MCP", payload["message"])
        self.assertEqual(server._ai_api_key(), "")
        with self.assertRaisesRegex(RuntimeError, "Hermes Mobile MCP"):
            server._execute_ai_request({})

    def _insert_token(self, token: str, owner: str, scopes: list[str]) -> None:
        self.conn.execute(
            """
            INSERT INTO api_tokens (
                name, token_prefix, token_hash, owner, scopes_json, enabled
            )
            VALUES (?, ?, ?, ?, ?, 1)
            """,
            (
                "test",
                token[:16],
                server._api_token_hash(token),
                owner,
                json.dumps(scopes, ensure_ascii=False),
            ),
        )
        self.conn.commit()

    def _set_token_last_used(self, token: str, value: str) -> None:
        self.conn.execute(
            "UPDATE api_tokens SET last_used_at = ? WHERE token_hash = ?",
            (value, server._api_token_hash(token)),
        )
        self.conn.commit()

    def _insert_item(self, code: str, owner: str, role: str = "Outer") -> int:
        cursor = self.conn.execute(
            """
            INSERT INTO items (code, owner, layer_role, section, brand, status)
            VALUES (?, ?, ?, ?, ?, 'Active')
            """,
            (code, owner, role, f"{code} section", "Test Brand"),
        )
        self.conn.commit()
        return int(cursor.lastrowid)

    def _insert_item_photo(self, code: str, file_name: str, sort_order: int) -> int:
        item = self.conn.execute("SELECT id FROM items WHERE code = ?", (code,)).fetchone()
        self.assertIsNotNone(item)
        cursor = self.conn.execute(
            """
            INSERT INTO photos (item_id, file_name, original_name, sort_order, source_tag, mime_type, data)
            VALUES (?, ?, ?, ?, 'api', 'image/jpeg', ?)
            """,
            (int(item["id"]), file_name, file_name, sort_order, b"\xff\xd8\xff\xd9"),
        )
        self.conn.commit()
        return int(cursor.lastrowid)

    def _insert_outfit(self, owner: str, item_id: int, wear_date: str = "2026-06-01") -> int:
        cursor = self.conn.execute(
            """
            INSERT INTO outfits (wear_date, owner, wear_mode, scene_tag)
            VALUES (?, ?, 'normal', 'test')
            """,
            (wear_date, owner),
        )
        outfit_id = int(cursor.lastrowid)
        self.conn.execute(
            "INSERT INTO outfit_items (outfit_id, item_id, role) VALUES (?, ?, 'Outer')",
            (outfit_id, item_id),
        )
        self.conn.execute(
            """
            INSERT INTO outfit_photos (outfit_id, file_name, original_name, sort_order, mime_type, data)
            VALUES (?, ?, ?, 1, 'image/jpeg', ?)
            """,
            (outfit_id, f"outfit_{outfit_id}.jpg", f"outfit_{outfit_id}.jpg", b"\xff\xd8\xff\xd9"),
        )
        self.conn.commit()
        return outfit_id

    def _insert_featured_look(self, owner: str, item_id: int, look_id: str) -> int:
        cursor = self.conn.execute(
            """
            INSERT INTO featured_looks (look_id, owner, status, use_case)
            VALUES (?, ?, 'Active', 'test')
            """,
            (look_id, owner),
        )
        look_pk = int(cursor.lastrowid)
        self.conn.execute(
            """
            INSERT INTO featured_look_items (featured_look_id, item_id, slot, display_order)
            VALUES (?, ?, 'outer', 1)
            """,
            (look_pk, item_id),
        )
        self.conn.execute(
            """
            INSERT INTO featured_look_photos (featured_look_id, file_name, original_name, sort_order, mime_type, data)
            VALUES (?, ?, ?, 1, 'image/jpeg', ?)
            """,
            (look_pk, f"look_{look_pk}.jpg", f"look_{look_pk}.jpg", b"\xff\xd8\xff\xd9"),
        )
        self.conn.commit()
        return look_pk

    def test_api_token_context_accepts_bearer_scope(self) -> None:
        token = "wd_live_" + "a" * 40
        self._insert_token(token, "OwnerA", ["items:read"])

        context, error_payload, status = server._api_token_context(
            self.conn,
            f"Bearer {token}",
            "items:read",
        )

        self.assertEqual(status, 200)
        self.assertIsNone(error_payload)
        self.assertIsNotNone(context)
        self.assertEqual(context["owner"], "OwnerA")
        self.assertIn("items:read", context["scopes"])

    def test_api_token_context_throttles_last_used_touch(self) -> None:
        token = "wd_live_" + "b" * 40
        self._insert_token(token, "OwnerA", ["items:read"])
        recent = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        self._set_token_last_used(token, recent)

        context, error_payload, status = server._api_token_context(
            self.conn,
            f"Bearer {token}",
            "items:read",
        )

        self.assertEqual(status, 200)
        self.assertIsNone(error_payload)
        self.assertIsNotNone(context)
        last_used = self.conn.execute(
            "SELECT last_used_at FROM api_tokens WHERE token_hash = ?",
            (server._api_token_hash(token),),
        ).fetchone()["last_used_at"]
        self.assertEqual(last_used, recent)

    def test_api_token_context_does_not_touch_read_only_scope(self) -> None:
        token = "wd_live_" + "r" * 40
        self._insert_token(token, "OwnerA", ["sync:read"])
        stale = "2000-01-01 00:00:00"
        self._set_token_last_used(token, stale)

        context, error_payload, status = server._api_token_context(
            self.conn,
            f"Bearer {token}",
            "sync:read",
        )

        self.assertEqual(status, 200)
        self.assertIsNone(error_payload)
        self.assertIsNotNone(context)
        last_used = self.conn.execute(
            "SELECT last_used_at FROM api_tokens WHERE token_hash = ?",
            (server._api_token_hash(token),),
        ).fetchone()["last_used_at"]
        self.assertEqual(last_used, stale)

    def test_session_username_throttles_last_seen_touch(self) -> None:
        session_id = "session-throttle"
        recent = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        self.conn.execute(
            """
            INSERT INTO auth_sessions (session_id, username, created_at, last_seen_at)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, "OwnerA", recent, recent),
        )
        self.conn.commit()

        username = server._session_username(self.conn, f"{server.AUTH_COOKIE_NAME}={session_id}")

        self.assertEqual(username, "OwnerA")
        last_seen = self.conn.execute(
            "SELECT last_seen_at FROM auth_sessions WHERE session_id = ?",
            (session_id,),
        ).fetchone()["last_seen_at"]
        self.assertEqual(last_seen, recent)

    def test_session_username_touches_stale_last_seen(self) -> None:
        session_id = "session-stale"
        now = datetime.utcnow()
        created_at = now.strftime("%Y-%m-%d %H:%M:%S")
        stale = (now - timedelta(seconds=server.AUTH_SESSION_TOUCH_INTERVAL_SECONDS + 5)).strftime("%Y-%m-%d %H:%M:%S")
        self.conn.execute(
            """
            INSERT INTO auth_sessions (session_id, username, created_at, last_seen_at)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, "OwnerA", created_at, stale),
        )
        self.conn.commit()

        username = server._session_username(self.conn, f"{server.AUTH_COOKIE_NAME}={session_id}")

        self.assertEqual(username, "OwnerA")
        last_seen = self.conn.execute(
            "SELECT last_seen_at FROM auth_sessions WHERE session_id = ?",
            (session_id,),
        ).fetchone()["last_seen_at"]
        self.assertNotEqual(last_seen, stale)

    def test_create_session_keeps_two_recent_sessions_per_user(self) -> None:
        old_limit = server.AUTH_MAX_SESSIONS_PER_USER
        server.AUTH_MAX_SESSIONS_PER_USER = 2
        try:
            first = server._create_session(self.conn, "OwnerA")
            second = server._create_session(self.conn, "OwnerA")

            rows = self.conn.execute(
                "SELECT session_id FROM auth_sessions WHERE username = ? ORDER BY rowid",
                ("OwnerA",),
            ).fetchall()
            self.assertEqual({row["session_id"] for row in rows}, {first, second})

            third = server._create_session(self.conn, "OwnerA")
            remaining = self.conn.execute(
                "SELECT session_id FROM auth_sessions WHERE username = ?",
                ("OwnerA",),
            ).fetchall()
            remaining_ids = {row["session_id"] for row in remaining}

            self.assertEqual(len(remaining_ids), 2)
            self.assertIn(second, remaining_ids)
            self.assertIn(third, remaining_ids)
            self.assertNotIn(first, remaining_ids)
        finally:
            server.AUTH_MAX_SESSIONS_PER_USER = old_limit

    def test_api_token_context_rejects_legacy_owner_token_for_sync_read(self) -> None:
        token = "wd_live_" + "c" * 40
        self._insert_token(token, "OwnerA", ["history:write", "items:read"])

        context, error_payload, status = server._api_token_context(
            self.conn,
            f"Bearer {token}",
            "sync:read",
        )

        self.assertEqual(status, 403)
        self.assertIsNone(context)
        self.assertEqual(error_payload["error"], "forbidden_scope")
        scopes_json = self.conn.execute(
            "SELECT scopes_json FROM api_tokens WHERE owner = ?",
            ("OwnerA",),
        ).fetchone()["scopes_json"]
        self.assertNotIn("sync:read", json.loads(scopes_json))
        self.assertNotIn("items:write", json.loads(scopes_json))

    def test_api_token_context_rejects_legacy_owner_token_for_items_write(self) -> None:
        token = "wd_live_" + "d" * 40
        self._insert_token(token, "OwnerA", ["history:write", "items:read"])

        context, error_payload, status = server._api_token_context(
            self.conn,
            f"Bearer {token}",
            "items:write",
        )

        self.assertEqual(status, 403)
        self.assertIsNone(context)
        self.assertEqual(error_payload["error"], "forbidden_scope")
        scopes_json = self.conn.execute(
            "SELECT scopes_json FROM api_tokens WHERE owner = ?",
            ("OwnerA",),
        ).fetchone()["scopes_json"]
        self.assertNotIn("items:write", json.loads(scopes_json))

    def test_history_write_any_can_only_use_target_owner_items(self) -> None:
        self._insert_item("TARGET-001", "TargetOwner")
        self._insert_item("OTHER-001", "OtherOwner")
        context = {
            "token_id": 1,
            "owner": "AdminOwner",
            "scopes": ["history:write:any"],
        }

        resolved = server._api_resolve_outfit_item_entries(
            self.conn,
            [{"code": "TARGET-001", "role": "Outer"}],
            context,
            "TargetOwner",
            "normal",
            "2026-05-07",
        )

        self.assertEqual(len(resolved), 1)
        self.assertEqual(resolved[0]["item"]["owner"], "TargetOwner")
        with self.assertRaises(PermissionError):
            server._api_resolve_outfit_item_entries(
                self.conn,
                [{"code": "OTHER-001", "role": "Outer"}],
                context,
                "TargetOwner",
                "normal",
                "2026-05-07",
            )

    def test_history_write_rejects_non_canonical_role_alias(self) -> None:
        self._insert_item("FOOT-001", "OwnerA", "Footwear")
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["history:write", "items:read"]}

        with self.assertRaisesRegex(ValueError, "invalid_outfit_role:FOOT-001"):
            server._api_resolve_outfit_item_entries(
                self.conn,
                [{"code": "FOOT-001", "role": "Shoes"}],
                context,
                "OwnerA",
                "normal",
                "2026-05-25",
            )

    def test_wearcount_new_file_import_snapshot_is_disabled(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "WearCount_new_2099-01-01.xlsx"
            path.write_bytes(b"placeholder")

            self.assertIsNone(server._pick_best_file(Path(temp_dir), "wearcount_new"))
            self.assertFalse(hasattr(server, "_auto_import_loop"))

    def test_sync_manifest_and_resources_are_resource_scoped(self) -> None:
        self._insert_item("OWNER-001", "OwnerA")
        photo_id = self._insert_item_photo("OWNER-001", "front.jpg", 1)

        manifest = server._api_sync_outfit_context_manifest(self.conn, "OwnerA")
        self.assertEqual(manifest["schema_version"], program_api_sync.SYNC_SCHEMA_VERSION)
        self.assertEqual(manifest["scope"], "outfit_context")
        self.assertEqual(manifest["owner"], "OwnerA")
        self.assertTrue(manifest["etag"].startswith("sha256:"))
        resources = {resource["name"]: resource for resource in manifest["resources"]}
        self.assertEqual(
            set(resources),
            {"items", "wear_counts", "featured_looks", "wear_history", "primary_photo_thumbnails", "rules"},
        )
        self.assertEqual(
            resources["items"]["endpoint"],
            "/api/v1/sync/outfit-context/resources/items",
        )

        items_resource = server._api_sync_outfit_context_resource(self.conn, "OwnerA", "items")
        self.assertEqual(items_resource["schema_version"], program_api_sync.SYNC_SCHEMA_VERSION)
        self.assertEqual(items_resource["resource"], "items")
        self.assertEqual(len(items_resource["items"]), 1)
        self.assertEqual(items_resource["items"][0]["name"], "OWNER-001 section")
        self.assertEqual(items_resource["items"][0]["display_name"], "Test Brand OWNER-001 section")
        self.assertNotIn("wear_total", items_resource["items"][0])
        self.assertEqual(items_resource["items"][0]["primary_photo"]["photo_id"], photo_id)
        self.assertTrue(items_resource["items"][0]["primary_photo"]["thumbnail_path"].endswith(f"/photos/{photo_id}/thumbnail"))

        wear_counts_resource = server._api_sync_outfit_context_resource(self.conn, "OwnerA", "wear_counts")
        self.assertEqual(wear_counts_resource["wear_counts"][0]["wear_total"], 0)
        self.assertIn("wear_counts", wear_counts_resource)
        thumbnails_resource = server._api_sync_outfit_context_resource(self.conn, "OwnerA", "primary_photo_thumbnails")
        self.assertEqual(len(thumbnails_resource["primary_photo_thumbnails"]), 1)
        self.assertEqual(thumbnails_resource["primary_photo_thumbnails"][0]["photo_id"], photo_id)
        self.assertEqual(thumbnails_resource["primary_photo_thumbnails"][0]["thumbnail_mime_type"], "image/jpeg")
        self.assertTrue(thumbnails_resource["primary_photo_thumbnails"][0]["cache_filename"].endswith(".jpg"))
        self.assertEqual(
            server._api_sync_outfit_context_manifest(self.conn, "OwnerA")["etag"],
            manifest["etag"],
        )

        self.conn.execute(
            """
            UPDATE items
            SET wear_total = 1, wear_year = 1, wear_maintenance = 1.5, last_worn_on = '2026-05-18'
            WHERE code = 'OWNER-001'
            """
        )
        self.conn.commit()
        wear_changed_manifest = server._api_sync_outfit_context_manifest(self.conn, "OwnerA")
        wear_changed_resources = {resource["name"]: resource for resource in wear_changed_manifest["resources"]}
        self.assertEqual(wear_changed_resources["items"]["checksum"], resources["items"]["checksum"])
        self.assertNotEqual(
            wear_changed_resources["wear_counts"]["checksum"],
            resources["wear_counts"]["checksum"],
        )

        self._insert_item("OWNER-002", "OwnerA")
        item_changed_manifest = server._api_sync_outfit_context_manifest(self.conn, "OwnerA")
        item_changed_resources = {resource["name"]: resource for resource in item_changed_manifest["resources"]}
        self.assertNotEqual(
            item_changed_resources["items"]["checksum"],
            wear_changed_resources["items"]["checksum"],
        )

    def test_sync_manifest_etag_matching_accepts_quoted_header(self) -> None:
        etag = "sha256:" + "a" * 64

        self.assertTrue(server._api_etag_matches(f'"{etag}"', etag))
        self.assertTrue(server._api_etag_matches(f'W/"{etag}"', etag))
        self.assertFalse(server._api_etag_matches('"sha256:other"', etag))

    def test_item_write_payload_aliases_owner_and_watch_kind(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}

        item_payload, photos = server._api_prepare_item_write_payload(
            context,
            {
                "item": {
                    "type": "watch",
                    "ref": "WATCH-REF-001",
                    "name": "Test Watch",
                    "brand": "Test Brand",
                }
            },
        )

        self.assertEqual(item_payload["owner"], "OwnerA")
        self.assertEqual(item_payload["kind"], "watch")
        self.assertEqual(item_payload["layer_role"], "Watch")
        self.assertEqual(item_payload["code"], "WATCH-REF-001")
        self.assertEqual(item_payload["section"], "Test Watch")
        self.assertEqual(photos, [])

        with self.assertRaises(PermissionError):
            server._api_prepare_item_write_payload(
                context,
                {"item": {"owner": "OtherOwner", "code": "X", "brand": "B"}},
            )

    def test_item_write_normalizes_watch_brand_without_rewriting_section(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        previous_export = server._run_item_export_tasks
        server._run_item_export_tasks = lambda conn, tasks: []
        section = "Overseas 纵横四海系列 四方之境 两地时间腕表－东方｜蓝色盘"
        try:
            response, status = server._api_write_item(
                self.conn,
                context,
                {
                    "mode": "create_only",
                    "item": {
                        "kind": "watch",
                        "code": "7930V/210T-H074",
                        "brand": "Vacheron Constantin 江诗丹顿",
                        "section": section,
                        "primary_color": "Grey",
                        "official_desc": "灰色金属外观，蓝色表盘/蓝色表带，橙色指针。",
                        "磨损阈值": 12,
                    },
                },
            )
        finally:
            server._run_item_export_tasks = previous_export

        self.assertEqual(status, 201)
        self.assertEqual(response["kind"], "watch")
        item = self.conn.execute(
            "SELECT brand, section, layer_role, source_sheet, wear_threshold FROM items WHERE code = ?",
            ("7930V/210T-H074",),
        ).fetchone()
        self.assertEqual(item["brand"], "Vacheron Constantin")
        self.assertEqual(item["section"], section)
        self.assertEqual(item["layer_role"], "Watch")
        self.assertEqual(item["source_sheet"], "腕表")
        self.assertEqual(item["wear_threshold"], 12)

    def test_watch_section_is_preserved_for_manual_normalization(self) -> None:
        payload = server._normalize_item_payload(
            {
                "kind": "watch",
                "code": "7930V/210T-H075",
                "brand": "江诗丹顿",
                "section": "江诗丹顿 Overseas 纵横四海 四方之境两地时间腕表｜西方｜钛金属｜绿色盘",
                "layer_role": "Watch",
                "primary_color": "Grey",
                "official_desc": "灰色金属外观。",
            }
        )

        self.assertEqual(payload["brand"], "Vacheron Constantin")
        self.assertEqual(
            payload["section"],
            "江诗丹顿 Overseas 纵横四海 四方之境两地时间腕表｜西方｜钛金属｜绿色盘",
        )

    def test_item_write_dry_run_accepts_new_wardrobe_item(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}

        response, status = server._api_item_write_preview(
            self.conn,
            context,
            {
                "mode": "create_only",
                "dry_run": True,
                "item": {
                    "kind": "wardrobe",
                    "code": "WARDROBE-001",
                    "brand": "Test Brand",
                    "section": "Test Jacket",
                    "layer_role": "Outer",
                    "temp_min": 12,
                    "temp_max": 22,
                },
            },
        )

        self.assertEqual(status, 200)
        self.assertFalse(response["saved"])
        self.assertEqual(response["action"], "created")
        self.assertEqual(response["owner"], "OwnerA")
        self.assertEqual(response["kind"], "wardrobe")
        self.assertIn("wardrobe_ai", response["export_tasks"])

    def test_item_write_normalizes_price_text_fields(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        previous_export = server._run_item_export_tasks
        server._run_item_export_tasks = lambda conn, tasks: []
        try:
            response, status = server._api_write_item(
                self.conn,
                context,
                {
                    "mode": "create_only",
                    "item": {
                        "kind": "wardrobe",
                        "code": "WARDROBE-PRICE-001",
                        "brand": "Test Brand",
                        "section": "Price Jacket",
                        "layer_role": "Outer",
                        "price_original": "EUR 61,400.00",
                        "price_cny": "RMB 59,900元",
                    },
                },
            )
        finally:
            server._run_item_export_tasks = previous_export

        self.assertEqual(status, 201)
        self.assertTrue(response["saved"])
        row = self.conn.execute(
            "SELECT price_original, price_original_currency, price_cny FROM items WHERE code = ?",
            ("WARDROBE-PRICE-001",),
        ).fetchone()
        self.assertEqual(row["price_original"], "61400")
        self.assertEqual(row["price_original_currency"], "EUR")
        self.assertEqual(row["price_cny"], "59900")

    def test_item_write_requires_currency_for_plain_original_price(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        with self.assertRaises(ValueError) as raised:
            server._api_write_item(
                self.conn,
                context,
                {
                    "mode": "create_only",
                    "item": {
                        "kind": "wardrobe",
                        "code": "WARDROBE-PRICE-002",
                        "brand": "Test Brand",
                        "section": "Price Jacket",
                        "layer_role": "Outer",
                        "price_original": "61400",
                    },
                },
            )
        self.assertEqual(str(raised.exception), "price_original_currency_required")

    def test_item_write_rejects_non_canonical_layer_role_alias(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}

        with self.assertRaisesRegex(ValueError, "invalid_layer_role"):
            server._api_item_write_preview(
                self.conn,
                context,
                {
                    "mode": "create_only",
                    "dry_run": True,
                    "item": {
                        "kind": "wardrobe",
                        "code": "WARDROBE-SHOES-001",
                        "brand": "Test Brand",
                        "section": "Test Sneakers",
                        "layer_role": "Shoes",
                    },
                },
            )

    def test_item_write_photo_payload_accepts_data_url(self) -> None:
        encoded = base64.b64encode(b"image-bytes").decode("ascii")

        photo = server._api_decode_item_photo(
            {
                "file_name": "front.jpg",
                "data_url": f"data:image/jpeg;base64,{encoded}",
            },
            1,
        )

        self.assertEqual(photo["filename"], "front.jpg")
        self.assertEqual(photo["content_type"], "image/jpeg")
        self.assertEqual(photo["content"], b"image-bytes")

    def test_item_write_multipart_payload_accepts_jpg_file_parts(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}

        payload = server.program_item_payload_from_multipart_parts(
            [
                {
                    "name": "payload",
                    "filename": None,
                    "content_type": "application/json",
                    "content": json.dumps(
                        {
                            "mode": "create_only",
                            "dry_run": True,
                            "item": {
                                "kind": "wardrobe",
                                "code": "WARDROBE-MP-001",
                                "brand": "Test Brand",
                                "section": "Multipart Jacket",
                                "layer_role": "Outer",
                            },
                        }
                    ).encode("utf-8"),
                },
                {
                    "name": "photos[]",
                    "filename": "front.jpg",
                    "content_type": "image/jpeg",
                    "content": b"\xff\xd8\xff\xd9",
                },
            ]
        )
        item_payload, photos = server._api_prepare_item_write_payload(context, payload)
        hashable = server.hashable_program_payload(payload)

        self.assertEqual(item_payload["code"], "WARDROBE-MP-001")
        self.assertEqual(len(photos), 1)
        self.assertEqual(photos[0]["filename"], "front.jpg")
        self.assertEqual(photos[0]["content"], b"\xff\xd8\xff\xd9")
        json.dumps(hashable, ensure_ascii=False, sort_keys=True)
        self.assertEqual(hashable[server.PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY][0]["size"], 4)

    def test_item_write_creates_item_and_photo_without_export_side_effects(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        encoded = base64.b64encode(b"image-bytes").decode("ascii")
        previous_export = server._run_item_export_tasks
        server._run_item_export_tasks = lambda conn, tasks: [{"kind": "test", "tasks": sorted(tasks)}]
        try:
            response, status = server._api_write_item(
                self.conn,
                context,
                {
                    "mode": "create_only",
                    "item": {
                        "kind": "wardrobe",
                        "code": "WARDROBE-API-001",
                        "brand": "Test Brand",
                        "section": "API Jacket",
                        "layer_role": "Outer",
                    },
                    "photos": [
                        {
                            "file_name": "front.jpg",
                            "content_type": "image/jpeg",
                            "data_base64": encoded,
                        }
                    ],
                },
            )
        finally:
            server._run_item_export_tasks = previous_export

        self.assertEqual(status, 201)
        self.assertTrue(response["saved"])
        self.assertEqual(response["action"], "created")
        self.assertEqual(response["photos_saved"], 1)
        item = self.conn.execute(
            "SELECT * FROM items WHERE code = ?",
            ("WARDROBE-API-001",),
        ).fetchone()
        self.assertIsNotNone(item)
        self.assertEqual(item["owner"], "OwnerA")
        photo_count = self.conn.execute(
            "SELECT COUNT(*) AS count FROM photos WHERE item_id = ?",
            (int(item["id"]),),
        ).fetchone()["count"]
        self.assertEqual(photo_count, 1)

    def test_item_photo_endpoint_helper_appends_multipart_jpg_to_existing_item(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        self._insert_item("OWNER-001", "OwnerA")

        payload = {
            server.PROGRAM_API_MULTIPART_FILE_PAYLOAD_KEY: [
                {
                    "name": "file",
                    "filename": "detail.jpeg",
                    "content_type": "image/jpeg",
                    "content": b"\xff\xd8detail\xff\xd9",
                }
            ]
        }
        response, status = server._api_write_item_photos(self.conn, context, "OWNER-001", payload)

        self.assertEqual(status, 200)
        self.assertTrue(response["saved"])
        self.assertEqual(response["action"], "photos_appended")
        self.assertEqual(response["photos_saved"], 1)
        photo = self.conn.execute(
            """
            SELECT photos.*
            FROM photos
            JOIN items ON items.id = photos.item_id
            WHERE items.code = ?
            """,
            ("OWNER-001",),
        ).fetchone()
        self.assertIsNotNone(photo)
        self.assertEqual(photo["original_name"], "detail.jpeg")
        self.assertEqual(photo["mime_type"], "image/jpeg")

    def test_item_photo_order_helper_can_set_primary_photo(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        self._insert_item("OWNER-ORDER-001", "OwnerA")
        first_id = self._insert_item_photo("OWNER-ORDER-001", "label.jpg", 1)
        second_id = self._insert_item_photo("OWNER-ORDER-001", "tag.jpg", 2)
        third_id = self._insert_item_photo("OWNER-ORDER-001", "front.jpg", 3)

        response, status = server._api_reorder_item_photos(
            self.conn,
            context,
            "OWNER-ORDER-001",
            {"primary_photo_id": third_id},
        )

        self.assertEqual(status, 200)
        self.assertTrue(response["saved"])
        self.assertEqual(response["primary_photo_id"], third_id)
        ordered_ids = [
            int(row["id"])
            for row in self.conn.execute(
                "SELECT id FROM photos WHERE item_id = (SELECT id FROM items WHERE code = ?) ORDER BY sort_order, id",
                ("OWNER-ORDER-001",),
            ).fetchall()
        ]
        self.assertEqual(ordered_ids, [third_id, first_id, second_id])
        self.assertEqual(response["item_detail"]["primary_photo"]["id"], third_id)
        self.assertTrue(response["item_detail"]["primary_photo"]["content_path"].endswith(f"/photos/{third_id}/content"))

    def test_item_photo_order_requires_all_photo_ids_for_full_reorder(self) -> None:
        context = {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]}
        self._insert_item("OWNER-ORDER-002", "OwnerA")
        first_id = self._insert_item_photo("OWNER-ORDER-002", "front.jpg", 1)
        self._insert_item_photo("OWNER-ORDER-002", "detail.jpg", 2)

        with self.assertRaises(ValueError):
            server._api_reorder_item_photos(
                self.conn,
                context,
                "OWNER-ORDER-002",
                {"photo_ids": [first_id]},
            )

    def test_sync_primary_photo_metadata_skips_missing_photo_source(self) -> None:
        self._insert_item("OWNER-PHOTO-MISSING", "OwnerA")
        item = self.conn.execute(
            "SELECT id FROM items WHERE code = ?",
            ("OWNER-PHOTO-MISSING",),
        ).fetchone()
        self.conn.execute(
            """
            INSERT INTO photos (item_id, file_name, original_name, sort_order, source_tag, mime_type, data)
            VALUES (?, 'missing.jpg', 'missing.jpg', 1, 'upload', 'image/jpeg', NULL)
            """,
            (int(item["id"]),),
        )
        good_id = self._insert_item_photo("OWNER-PHOTO-MISSING", "front.jpg", 2)

        payload = server._api_sync_item_payload_with_primary_photo(self.conn, self.conn.execute(
            """
            SELECT items.*,
                   (SELECT COUNT(*) FROM photos WHERE photos.item_id = items.id) AS photo_count
            FROM items
            WHERE code = ?
            """,
            ("OWNER-PHOTO-MISSING",),
        ).fetchone())

        self.assertEqual(payload["primary_photo"]["photo_id"], good_id)

    def test_sync_items_allow_items_without_photos(self) -> None:
        self._insert_item("OWNER-NO-PHOTO", "OwnerA")
        self.conn.execute(
            "UPDATE items SET price_original = '￥61,400.00', price_original_currency = 'cny', price_cny = 'CNY 59,900' WHERE code = ?",
            ("OWNER-NO-PHOTO",),
        )
        self.conn.commit()

        items_resource = server._api_sync_outfit_context_resource(self.conn, "OwnerA", "items")
        thumbnails_resource = server._api_sync_outfit_context_resource(
            self.conn,
            "OwnerA",
            "primary_photo_thumbnails",
        )

        self.assertEqual(items_resource["items"][0]["code"], "OWNER-NO-PHOTO")
        self.assertEqual(items_resource["items"][0]["photo_count"], 0)
        self.assertIsNone(items_resource["items"][0]["primary_photo"])
        self.assertEqual(items_resource["items"][0]["price_original"], "61400")
        self.assertEqual(items_resource["items"][0]["price_original_currency"], "CNY")
        self.assertEqual(items_resource["items"][0]["price_cny"], "59900")
        self.assertEqual(thumbnails_resource["count"], 0)
        self.assertEqual(thumbnails_resource["primary_photo_thumbnails"], [])

    def test_create_featured_look_from_outfit_keeps_footwear_slot(self) -> None:
        outer_id = self._insert_item("OUTER-001", "OwnerA", "Outer")
        foot_id = self._insert_item("FOOT-001", "OwnerA", "Footwear")
        outfit_cursor = self.conn.execute(
            """
            INSERT INTO outfits (wear_date, owner, city, wear_mode, scene_tag, notes)
            VALUES ('2026-05-25', 'OwnerA', 'Shanghai', 'normal', 'City', 'test outfit')
            """
        )
        outfit_id = int(outfit_cursor.lastrowid)
        self.conn.executemany(
            """
            INSERT INTO outfit_items (outfit_id, item_id, role)
            VALUES (?, ?, ?)
            """,
            [
                (outfit_id, outer_id, "Outer"),
                (outfit_id, foot_id, "Footwear"),
            ],
        )
        self.conn.commit()
        outfit = self.conn.execute("SELECT * FROM outfits WHERE id = ?", (outfit_id,)).fetchone()
        previous_export = server._export_featured_looks_workbooks
        server._export_featured_looks_workbooks = lambda conn: {}
        try:
            look = server._create_featured_look_from_outfit(self.conn, outfit, "OwnerA")
        finally:
            server._export_featured_looks_workbooks = previous_export

        footwear = self.conn.execute(
            """
            SELECT source_code
            FROM featured_look_items
            WHERE featured_look_id = ? AND slot = 'footwear'
            """,
            (int(look["id"]),),
        ).fetchone()
        self.assertIsNotNone(footwear)
        self.assertEqual(footwear["source_code"], "FOOT-001")

    def test_safe_primary_photo_thumbnail_is_jpeg(self) -> None:
        raw = io.BytesIO()
        server.Image.new("RGBA", (12, 8), (255, 0, 0, 128)).save(raw, format="PNG")

        thumbnail = server._safe_jpeg_thumbnail_bytes(raw.getvalue(), max_edge=8)

        self.assertIsNotNone(thumbnail)
        self.assertGreater(len(thumbnail or b""), 0)
        with server.Image.open(io.BytesIO(thumbnail)) as image:
            self.assertEqual(image.format, "JPEG")
            self.assertLessEqual(max(image.size), 8)

    def test_safe_primary_photo_thumbnail_restores_truncated_image_setting(self) -> None:
        previous = server.ImageFile.LOAD_TRUNCATED_IMAGES

        server._safe_jpeg_thumbnail_bytes(b"not-an-image", max_edge=8)

        self.assertEqual(server.ImageFile.LOAD_TRUNCATED_IMAGES, previous)

    def test_item_photo_request_accepts_raw_jpeg_body(self) -> None:
        handler = type(
            "FakeHandler",
            (),
            {
                "headers": {
                    "Content-Type": "image/jpeg",
                    "Content-Length": "4",
                    "X-Filename": "raw-front.jpg",
                },
                "rfile": io.BytesIO(b"\xff\xd8\xff\xd9"),
            },
        )()

        payload = server._api_parse_item_photo_request_payload(
            handler,
            {"dry_run": ["true"], "replace_photos": ["false"]},
        )
        item_payload, photos = server._api_prepare_item_write_payload(
            {"token_id": 1, "owner": "OwnerA", "scopes": ["items:write"]},
            payload,
        )

        self.assertEqual(item_payload["owner"], "OwnerA")
        self.assertEqual(payload["dry_run"], "true")
        self.assertEqual(len(photos), 1)
        self.assertEqual(photos[0]["filename"], "raw-front.jpg")
        self.assertEqual(photos[0]["content_type"], "image/jpeg")
        self.assertEqual(photos[0]["content"], b"\xff\xd8\xff\xd9")

    def test_existing_owner_access_key_missing_doc_scopes_fails_closed(self) -> None:
        token = "wd_live_" + "b" * 40
        self._insert_token(token, "OwnerA", ["history:write", "items:read"])
        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            server._api_access_key_secret_path("OwnerA").write_text(token + "\n", encoding="utf-8")
            try:
                with self.assertRaisesRegex(ValueError, "owner_api_access_key_missing_required_scope"):
                    server._ensure_owner_api_access_key(self.conn, "OwnerA")
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir

        scopes_json = self.conn.execute(
            "SELECT scopes_json FROM api_tokens WHERE owner = ?",
            ("OwnerA",),
        ).fetchone()["scopes_json"]
        self.assertNotIn("sync:read", json.loads(scopes_json))
        self.assertNotIn("items:write", json.loads(scopes_json))

    def test_hermes_plugin_manifest_declares_embed_and_registration(self) -> None:
        manifest = server._hermes_plugin_manifest_payload(
            "http://wardrobe.local:8765",
            frame_ancestors=["'self'", "https://hermes.example.com:8445"],
            requested_frame_ancestor="https://hermes.example.com:8445",
        )

        self.assertEqual(manifest["id"], "wardrobe")
        self.assertEqual(manifest["kind"], "embedded_app")
        self.assertEqual(manifest["entry"]["url"], "http://wardrobe.local:8765/?embed=hermes")
        self.assertEqual(
            manifest["embedding"]["registration_endpoint"],
            "/api/v1/hermes/plugin/frame-ancestors",
        )
        self.assertTrue(manifest["embedding"]["requested_frame_ancestor_allowed"])
        self.assertEqual(
            manifest["program_api"]["workspace_registration"],
            "/api/v1/hermes/plugin/workspaces",
        )
        self.assertEqual(manifest["program_api"]["plugin_launch"], "/api/v1/hermes/plugin/launch")
        self.assertFalse(manifest["owner_binding"]["raw_key_returned_by_wardrobe"])
        self.assertIn("wardrobe.sync", manifest["mcp"]["required_tools"])
        self.assertEqual(manifest["navigation"]["state_event"], "wardrobe.plugin.navigation")
        self.assertEqual(manifest["navigation"]["back_event"], "hermes.plugin.back")
        self.assertEqual(manifest["navigation"]["back_result_event"], "wardrobe.plugin.back_result")
        self.assertEqual(manifest["navigation"]["refresh_required_event"], "wardrobe.plugin.refresh_required")
        self.assertTrue(manifest["navigation"]["preserve_iframe_state"])
        self.assertEqual(manifest["appearance_sync"]["theme"], ["dark", "light"])
        self.assertEqual(
            manifest["appearance_sync"]["fontSize"],
            ["small", "default", "large", "xlarge", "xxlarge"],
        )
        self.assertEqual(manifest["appearance_sync"]["session_endpoint"], "/api/v1/hermes/plugin/session")

    def test_hermes_plugin_frame_ancestor_registration_is_generic_config(self) -> None:
        self.assertEqual(
            server.hermes_plugin.normalize_frame_ancestor("https://hermes.example.com:8445/"),
            "https://hermes.example.com:8445",
        )
        self.assertEqual(
            server.hermes_plugin.normalize_frame_ancestor("http://localhost:8080"),
            "http://localhost:8080",
        )
        with self.assertRaises(server.hermes_plugin.HermesPluginError) as raised:
            server.hermes_plugin.normalize_frame_ancestor("http://hermes.example.com")
        self.assertEqual(raised.exception.code, "invalid_frame_ancestor")

        response = server._api_register_hermes_plugin_frame_ancestors(
            self.conn,
            {"origin": "https://hermes.example.com:8445"},
        )
        self.assertTrue(response["registered"])
        self.assertIn("https://hermes.example.com:8445", response["frame_ancestors"])

        manifest = server._hermes_plugin_manifest_payload(
            "http://wardrobe.local:8765",
            frame_ancestors=server._hermes_plugin_frame_ancestors(self.conn),
            requested_frame_ancestor="https://hermes.example.com:8445",
        )
        self.assertTrue(manifest["embedding"]["requested_frame_ancestor_allowed"])
        manifest = server._hermes_plugin_manifest_payload(
            "http://wardrobe.local:8765",
            frame_ancestors=server._hermes_plugin_frame_ancestors(self.conn),
            requested_frame_ancestor="https://other.example.com",
        )
        self.assertFalse(manifest["embedding"]["requested_frame_ancestor_allowed"])

    def test_register_hermes_workspace_creates_owner_key_without_returning_secret(self) -> None:
        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        access_key = "wd_live_" + "h" * 40
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            try:
                response = server._api_register_hermes_plugin_workspace(
                    self.conn,
                    {
                        "owner": "OwnerB",
                        "workspace_id": "hermes-owner-b",
                        "display_name": "Owner B Wardrobe",
                        "api_base_url": "http://127.0.0.1:8765",
                        "access_key": access_key,
                        "frame_ancestor": "https://hermes-owner-b.example.com",
                    },
                )
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir

            self.assertTrue(response["registered"])
            self.assertEqual(response["owner"], "OwnerB")
            self.assertEqual(response["workspace_id"], "hermes-owner-b")
            self.assertEqual(response["token_prefix"], access_key[:16])
            self.assertNotIn("access_key", response)
            self.assertNotIn(access_key, json.dumps(response, ensure_ascii=False))
            self.assertTrue(Path(response["secret_path"]).exists())
            self.assertIn("https://hermes-owner-b.example.com", response["frame_ancestors"])

        token_row = self.conn.execute(
            "SELECT owner, scopes_json FROM api_tokens WHERE token_hash = ?",
            (server._api_token_hash(access_key),),
        ).fetchone()
        self.assertIsNotNone(token_row)
        self.assertEqual(token_row["owner"], "OwnerB")
        scopes = set(json.loads(token_row["scopes_json"]))
        self.assertTrue({"history:write", "items:read", "items:write", "sync:read"}.issubset(scopes))
        catalog_row = self.conn.execute(
            "SELECT value FROM option_catalogs WHERE option_type = 'owner' AND value = ?",
            ("OwnerB",),
        ).fetchone()
        self.assertIsNotNone(catalog_row)
        workspace_row = self.conn.execute(
            "SELECT owner, token_id FROM hermes_plugin_workspaces WHERE workspace_id = ?",
            ("hermes-owner-b",),
        ).fetchone()
        self.assertIsNotNone(workspace_row)
        self.assertEqual(workspace_row["owner"], "OwnerB")

    def test_hermes_plugin_launch_token_is_one_time_owner_session_bridge(self) -> None:
        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        access_key = "wd_live_" + "l" * 40
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            try:
                registration = server._api_register_hermes_plugin_workspace(
                    self.conn,
                    {
                        "owner": "OwnerLaunch",
                        "workspace_id": "hermes-owner-launch",
                        "access_key": access_key,
                    },
                )
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir

        context = {
            "token_id": registration["token_id"],
            "owner": "OwnerLaunch",
            "scopes": ["history:write", "items:read", "items:write", "sync:read"],
        }
        launch = server._api_create_hermes_plugin_launch_token(
            self.conn,
            {
                "workspaceId": "hermes-owner-launch",
                "appearance": {"theme": "dark", "fontSize": "large"},
            },
            context,
        )
        self.assertEqual(launch["owner"], "OwnerLaunch")
        self.assertEqual(launch["workspace_id"], "hermes-owner-launch")
        self.assertEqual(launch["appearance"], {"theme": "dark", "fontSize": "large"})
        self.assertIn("launch=", launch["entry_path"])
        self.assertIn("pluginTheme=dark", launch["entry_path"])
        self.assertIn("pluginFontSize=large", launch["entry_path"])
        consumed = server._consume_hermes_plugin_launch(self.conn, launch["launch_token"])
        self.assertEqual(consumed["owner"], "OwnerLaunch")
        self.assertEqual(consumed["appearance"], {"theme": "dark", "fontSize": "large"})
        session_id = server._create_session(self.conn, consumed["owner"])
        session_appearance = server.hermes_plugin.bind_session_appearance(self.conn, session_id, consumed)
        self.assertEqual(session_appearance, {"theme": "dark", "fontSize": "large"})
        self.assertEqual(
            server._api_hermes_plugin_session(self.conn, session_id)["appearance"],
            {"theme": "dark", "fontSize": "large"},
        )
        self.assertEqual(server._session_username_by_id(self.conn, session_id), "OwnerLaunch")
        with self.assertRaises(server.hermes_plugin.HermesPluginError) as raised:
            server._consume_hermes_plugin_launch(self.conn, launch["launch_token"])
        self.assertEqual(raised.exception.code, "invalid_launch_token")

    def test_hermes_plugin_session_owner_scopes_stateful_reads(self) -> None:
        owner_item_id = self._insert_item("OWNER-ITEM", "OwnerAdmin")
        test_item_id = self._insert_item("TEST-ITEM", "weixin_test_1")
        owner_photo_id = self._insert_item_photo("OWNER-ITEM", "owner.jpg", 1)
        test_photo_id = self._insert_item_photo("TEST-ITEM", "test.jpg", 1)
        owner_outfit_id = self._insert_outfit("OwnerAdmin", owner_item_id, "2026-06-01")
        test_outfit_id = self._insert_outfit("weixin_test_1", test_item_id, "2026-06-02")
        owner_look_id = self._insert_featured_look("OwnerAdmin", owner_item_id, "owner-look")
        test_look_id = self._insert_featured_look("weixin_test_1", test_item_id, "test-look")

        access_key = "wd_live_" + "t" * 40
        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            try:
                registration = server._api_register_hermes_plugin_workspace(
                    self.conn,
                    {
                        "owner": "weixin_test_1",
                        "workspace_id": "wardrobe:weixin_test_1",
                        "access_key": access_key,
                    },
                )
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir

        launch = server._api_create_hermes_plugin_launch_token(
            self.conn,
            {"workspace_id": "wardrobe:weixin_test_1"},
            {
                "token_id": registration["token_id"],
                "owner": "weixin_test_1",
                "scopes": ["history:write", "items:read", "items:write", "sync:read"],
            },
        )
        consumed = server._consume_hermes_plugin_launch(self.conn, launch["launch_token"])
        session_id = server._create_session(self.conn, consumed["owner"])
        server.hermes_plugin.bind_session_appearance(self.conn, session_id, consumed)
        session_payload = server._api_hermes_plugin_session(self.conn, session_id)
        self.assertEqual(session_payload["owner"], "weixin_test_1")
        self.assertEqual(session_payload["workspace_id"], "wardrobe:weixin_test_1")

        username = server._session_username_by_id(self.conn, session_id)
        self.assertEqual(username, "weixin_test_1")

        item_where, item_params = server._item_owner_scope_where(username)
        item_codes = [
            row["code"]
            for row in self.conn.execute(
                f"SELECT code FROM items WHERE {item_where} ORDER BY code",
                item_params,
            ).fetchall()
        ]
        self.assertEqual(item_codes, ["TEST-ITEM"])

        outfit_where, outfit_params = server._owner_read_sql("owner", username)
        outfit_ids = [
            int(row["id"])
            for row in self.conn.execute(
                f"SELECT id FROM outfits WHERE {outfit_where} ORDER BY id",
                outfit_params,
            ).fetchall()
        ]
        self.assertEqual(outfit_ids, [test_outfit_id])

        look_where, look_params = server._owner_read_sql("owner", username)
        look_ids = [
            int(row["id"])
            for row in self.conn.execute(
                f"SELECT id FROM featured_looks WHERE {look_where} ORDER BY id",
                look_params,
            ).fetchall()
        ]
        self.assertEqual(look_ids, [test_look_id])

        owner_item = self.conn.execute("SELECT * FROM items WHERE id = ?", (owner_item_id,)).fetchone()
        test_item = self.conn.execute("SELECT * FROM items WHERE id = ?", (test_item_id,)).fetchone()
        self.assertFalse(server._item_row_viewable(owner_item, username))
        self.assertTrue(server._item_row_viewable(test_item, username))
        with self.assertRaises(PermissionError):
            server._item_related_outfits(self.conn, owner_item_id, username)
        with self.assertRaises(PermissionError):
            server._item_related_featured_looks(self.conn, owner_item_id, username)
        self.assertEqual(
            [row["id"] for row in server._item_related_outfits(self.conn, test_item_id, username, summary_only=True)],
            [test_outfit_id],
        )
        self.assertEqual(
            [row["id"] for row in server._item_related_featured_looks(self.conn, test_item_id, username)],
            [test_look_id],
        )

        self.assertFalse(server._photo_item_viewable(self.conn, owner_photo_id, username))
        self.assertTrue(server._photo_item_viewable(self.conn, test_photo_id, username))
        owner_outfit = self.conn.execute("SELECT * FROM outfits WHERE id = ?", (owner_outfit_id,)).fetchone()
        owner_look = self.conn.execute("SELECT * FROM featured_looks WHERE id = ?", (owner_look_id,)).fetchone()
        self.assertFalse(server._outfit_row_viewable(owner_outfit, username))
        self.assertFalse(server._featured_look_row_viewable(owner_look, username))

    def test_owner_read_helpers_keep_admin_full_access(self) -> None:
        admin_username = "AdminHarness"
        server.AUTH_ADMIN_USERS.add(admin_username)
        try:
            self._insert_item("OWNER-ITEM", "OwnerAdmin")
            self._insert_item("TEST-ITEM", "weixin_test_1")
            where_sql, params = server._item_owner_scope_where(admin_username)
            rows = self.conn.execute(
                f"SELECT code FROM items WHERE {where_sql} ORDER BY code",
                params,
            ).fetchall()
            self.assertEqual([row["code"] for row in rows], ["OWNER-ITEM", "TEST-ITEM"])
            self.assertTrue(server._owner_value_viewable("OwnerAdmin", admin_username))
            self.assertTrue(server._owner_value_viewable("weixin_test_1", admin_username))
        finally:
            server.AUTH_ADMIN_USERS.discard(admin_username)

    def test_featured_look_serialization_filters_cross_owner_items_for_session(self) -> None:
        owner_item_id = self._insert_item("OWNER-ITEM", "OwnerAdmin")
        look_id = self._insert_featured_look("weixin_test_1", owner_item_id, "mixed-owner-look")
        look = self.conn.execute("SELECT * FROM featured_looks WHERE id = ?", (look_id,)).fetchone()

        payload = server._serialize_featured_look(self.conn, look, username="weixin_test_1")

        self.assertEqual(payload["owner"], "weixin_test_1")
        self.assertEqual(payload["items"], [])

    def test_hermes_plugin_launch_rejects_workspace_token_mismatch(self) -> None:
        access_key = "wd_live_" + "m" * 40
        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            try:
                server._api_register_hermes_plugin_workspace(
                    self.conn,
                    {
                        "owner": "OwnerMismatch",
                        "workspace_id": "hermes-owner-mismatch",
                        "access_key": access_key,
                    },
                )
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir
        with self.assertRaises(server.hermes_plugin.HermesPluginError) as raised:
            server._api_create_hermes_plugin_launch_token(
                self.conn,
                {"workspace_id": "hermes-owner-mismatch"},
                {"token_id": 99999, "owner": "OwnerMismatch", "scopes": ["sync:read"]},
            )
        self.assertEqual(raised.exception.code, "workspace_token_mismatch")

    def test_register_hermes_workspace_rejects_duplicate_owner_key_without_replace(self) -> None:
        existing_key = "wd_live_" + "e" * 40
        self._insert_token(existing_key, "OwnerC", ["items:read"])

        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            try:
                with self.assertRaises(server.hermes_plugin.HermesPluginError) as raised:
                    server._api_register_hermes_plugin_workspace(
                        self.conn,
                        {
                            "owner": "OwnerC",
                            "workspace_id": "hermes-owner-c",
                            "access_key": "wd_live_" + "f" * 40,
                        },
                    )
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir
        self.assertEqual(raised.exception.code, "owner_key_exists")

    def test_rules_doc_references_separate_program_api_doc(self) -> None:
        previous_secret_dir = server.API_TOKEN_SECRET_DIR
        with tempfile.TemporaryDirectory() as temp_dir:
            server.API_TOKEN_SECRET_DIR = Path(temp_dir)
            try:
                markdown = server._render_wardrobe_chatgpt_rules_markdown(self.conn, "OwnerA")
            finally:
                server.API_TOKEN_SECRET_DIR = previous_secret_dir

        self.assertIn(server.WARDROBE_PROGRAM_API_DOC_FILE, markdown)
        self.assertIn("WearCount_new*.xlsx` 文件导入已禁用", markdown)
        self.assertNotIn("/api/v1/history/outfits", markdown)
        self.assertNotIn("/api/v1/sync/outfit-context/manifest", markdown)
        self.assertNotRegex(markdown, r"wd_live_[A-Za-z0-9]+")
        self.assertNotIn("sync:read", markdown)
        self.assertIn("WearCount_new*.xlsx` 文件导入已禁用", markdown)
        self.assertNotIn("仍然是唯一保留的增量导入源", markdown)


if __name__ == "__main__":
    unittest.main()
