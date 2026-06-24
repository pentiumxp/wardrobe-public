from __future__ import annotations

import json
import io
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any

from wardrobe_app.wardrobe_mcp import (
    ApiResult,
    McpStdioServer,
    WardrobeMcpError,
    WardrobeMcpService,
    build_arg_parser,
)
from wardrobe_app import program_api_sync


JPEG_BYTES = b"\xff\xd8test-jpeg\xff\xd9"


class FakeWardrobeApiClient:
    def __init__(
        self,
        runtime: Any,
        *,
        json_responses: dict[tuple[str, str], ApiResult],
        binary_responses: dict[tuple[str, str], ApiResult] | None = None,
    ) -> None:
        self.runtime = runtime
        self.json_responses = json_responses
        self.binary_responses = binary_responses or {}
        self.json_calls: list[dict[str, Any]] = []
        self.binary_calls: list[dict[str, Any]] = []

    def request_json(self, method: str, path: str, **kwargs: Any) -> ApiResult:
        self.json_calls.append({"method": method, "path": path, **kwargs})
        response = self.json_responses.get((method, path))
        if response is None:
            raise AssertionError(f"unexpected_json_request:{method}:{path}")
        return response

    def request_binary(self, method: str, path: str, **kwargs: Any) -> ApiResult:
        self.binary_calls.append({"method": method, "path": path, **kwargs})
        response = self.binary_responses.get((method, path))
        if response is None:
            raise AssertionError(f"unexpected_binary_request:{method}:{path}")
        return response


class WardrobeMcpTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp_dir.name)
        (self.workspace / ".hermes-wardrobe").mkdir()
        (self.workspace / ".hermes-cache" / "resources").mkdir(parents=True)
        (self.workspace / ".hermes-cache" / "photos").mkdir(parents=True)
        (self.workspace / ".hermes-wardrobe" / "access-key.txt").write_text("wd_live_test\n", encoding="utf-8")
        (self.workspace / ".hermes-wardrobe" / "config.json").write_text(
            json.dumps(
                {
                    "schema_version": 1,
                    "api_base_url": "http://wardrobe.test",
                    "access_key_file": ".hermes-wardrobe/access-key.txt",
                    "cache_dir": ".hermes-cache",
                    "manifest_path": ".hermes-cache/outfit-context-manifest.json",
                    "resource_cache_dir": ".hermes-cache/resources",
                    "photo_cache_dir": ".hermes-cache/photos",
                },
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def _service_with_client(self, fake_client: FakeWardrobeApiClient) -> WardrobeMcpService:
        return WardrobeMcpService(
            default_workspace=str(self.workspace),
            client_factory=lambda runtime: fake_client,
        )

    @staticmethod
    def _manifest(resources: list[dict[str, Any]], etag: str = "sha256:manifest") -> dict[str, Any]:
        return {
            "owner": "OwnerA",
            "scope": "outfit_context",
            "schema_version": program_api_sync.SYNC_SCHEMA_VERSION,
            "etag": etag,
            "data_version": f"v{program_api_sync.SYNC_SCHEMA_VERSION}-test",
            "resources": resources,
        }

    @staticmethod
    def _resource(name: str, checksum: str, data: Any) -> dict[str, Any]:
        return {
            "owner": "OwnerA",
            "scope": "outfit_context",
            "schema_version": program_api_sync.SYNC_SCHEMA_VERSION,
            "resource": name,
            "checksum": checksum,
            "count": len(data) if isinstance(data, list) else 1,
            "data": data,
            name: data,
        }

    def test_tools_list_includes_core_contract(self) -> None:
        service = WardrobeMcpService(default_workspace=str(self.workspace))
        tool_names = {tool["name"] for tool in service.tools()}

        self.assertIn("wardrobe.sync", tool_names)
        self.assertIn("wardrobe.get_item", tool_names)
        self.assertIn("wardrobe.get_primary_thumbnail", tool_names)
        self.assertIn("wardrobe.set_primary_photo", tool_names)
        self.assertIn("wardrobe.write_history", tool_names)
        self.assertIn("wardrobe.stats_inventory", tool_names)
        self.assertIn("wardrobe.stats_data_quality", tool_names)
        search_tool = next(tool for tool in service.tools() if tool["name"] == "wardrobe.search_items")
        role_schema = search_tool["inputSchema"]["properties"]["layer_role"]
        self.assertIn("Footwear", role_schema["enum"])
        self.assertNotIn("Shoes", role_schema["enum"])
        write_item_tool = next(tool for tool in service.tools() if tool["name"] == "wardrobe.write_item")
        self.assertIn("mode", write_item_tool["inputSchema"]["properties"])
        self.assertIn("Footwear", write_item_tool["inputSchema"]["properties"]["payload"]["description"])

    def test_stats_inventory_groups_cached_items_without_live_item_loop(self) -> None:
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(
                self._resource(
                    "items",
                    "sha256:items",
                    [
                        {"code": "A", "brand": "Zegna", "layer_role": "Outer", "price_cny": "¥100"},
                        {"code": "B", "brand": "Zegna", "layer_role": "Inner", "price_cny": 50},
                        {"code": "W", "brand": "Vacheron Constantin", "kind": "watch", "layer_role": "Watch", "price_cny": 1000},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        fake = FakeWardrobeApiClient(None, json_responses={})

        result = self._service_with_client(fake).call_tool(
            "wardrobe.stats_inventory",
            {"refresh": False, "group_by": "brand", "metric": "amount"},
        )
        payload = result["structuredContent"]

        self.assertFalse(result["isError"])
        self.assertEqual(payload["totals"]["count"], 2)
        self.assertEqual(payload["totals"]["amount"], 150)
        self.assertEqual(payload["groups"][0]["key"], "Zegna")
        self.assertEqual(payload["groups"][0]["amount"], 150)
        self.assertEqual(fake.json_calls, [])

    def test_stats_watch_uses_price_original_when_price_cny_missing(self) -> None:
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(
                self._resource(
                    "items",
                    "sha256:items",
                    [
                        {
                            "code": "PAM00498",
                            "brand": "Panerai",
                            "kind": "watch",
                            "layer_role": "Watch",
                            "price_cny": "",
                            "price_original": "￥61,400.00",
                            "price_original_currency": "",
                        },
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "wear_counts.json").write_text(
            json.dumps(self._resource("wear_counts", "sha256:wear", []), ensure_ascii=False),
            encoding="utf-8",
        )
        fake = FakeWardrobeApiClient(None, json_responses={})

        result = self._service_with_client(fake).call_tool(
            "wardrobe.stats_watch",
            {"refresh": False, "group_by": "brand", "metric": "amount", "include_items": True},
        )
        payload = result["structuredContent"]

        self.assertEqual(payload["totals"]["count"], 1)
        self.assertEqual(payload["totals"]["amount"], 61400)
        self.assertEqual(payload["groups"][0]["amount"], 61400)
        self.assertEqual(payload["items"][0]["price_original"], "61400")
        self.assertEqual(payload["items"][0]["price_original_currency"], "CNY")
        self.assertEqual(fake.json_calls, [])

    def test_stats_wear_uses_wear_counts_resource(self) -> None:
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(
                self._resource(
                    "items",
                    "sha256:items",
                    [
                        {"code": "A", "brand": "Zegna", "layer_role": "Outer"},
                        {"code": "B", "brand": "LP", "layer_role": "Inner"},
                        {"code": "W", "brand": "VC", "kind": "watch", "layer_role": "Watch"},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "wear_counts.json").write_text(
            json.dumps(
                self._resource(
                    "wear_counts",
                    "sha256:wear",
                    [
                        {"code": "A", "wear_total": 5, "wear_year": 2, "last_worn_on": "2026-05-01"},
                        {"code": "B", "wear_total": 0, "wear_year": 0},
                        {"code": "W", "wear_total": 10, "wear_year": 3},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        fake = FakeWardrobeApiClient(None, json_responses={})

        result = self._service_with_client(fake).call_tool(
            "wardrobe.stats_wear",
            {"refresh": False, "category": "wardrobe", "group_by": "role", "period": "total"},
        )
        payload = result["structuredContent"]

        self.assertEqual(payload["total_wear"], 5)
        self.assertEqual(payload["item_count"], 2)
        self.assertEqual(payload["never_worn_count"], 1)
        self.assertEqual(payload["top_items"][0]["code"], "A")
        self.assertEqual(fake.json_calls, [])

    def test_stats_wear_year_filters_by_wear_date_not_acquired_at(self) -> None:
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(
                self._resource(
                    "items",
                    "sha256:items",
                    [
                        {
                            "code": "222",
                            "brand": "VC",
                            "kind": "watch",
                            "layer_role": "Watch",
                            "acquired_at": "2025-03-01",
                        },
                        {
                            "code": "444",
                            "brand": "Cartier",
                            "kind": "watch",
                            "layer_role": "Watch",
                            "acquired_at": "2024-01-01",
                        },
                        {
                            "code": "999",
                            "brand": "Rolex",
                            "kind": "watch",
                            "layer_role": "Watch",
                            "acquired_at": "2026-01-01",
                        },
                        {
                            "code": "CLOTH",
                            "brand": "Zegna",
                            "layer_role": "Outer",
                            "acquired_at": "2025-01-01",
                        },
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "wear_counts.json").write_text(
            json.dumps(
                self._resource(
                    "wear_counts",
                    "sha256:wear",
                    [
                        {"code": "222", "wear_total": 3, "wear_year": 1, "last_worn_on": "2026-02-01"},
                        {"code": "444", "wear_total": 2, "wear_year": 2, "last_worn_on": "2026-03-01"},
                        {"code": "999", "wear_total": 5, "wear_year": 0, "last_worn_on": "2025-12-01"},
                        {"code": "CLOTH", "wear_total": 4, "wear_year": 4, "last_worn_on": "2026-02-01"},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "wear_history.json").write_text(
            json.dumps(
                self._resource(
                    "wear_history",
                    "sha256:history",
                    [
                        {
                            "wear_date": "2026-02-01",
                            "items": [
                                {"code": "222", "layer_role": "Watch"},
                                {"code": "CLOTH", "layer_role": "Outer"},
                            ],
                        },
                        {"wear_date": "2025-12-01", "items": [{"code": "999", "layer_role": "Watch"}]},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        fake = FakeWardrobeApiClient(None, json_responses={})

        result = self._service_with_client(fake).call_tool(
            "wardrobe.stats_wear",
            {"refresh": False, "kind": "watch", "period": "year", "year": 2026, "group_by": "brand"},
        )
        payload = result["structuredContent"]

        returned_codes = {item["code"] for item in payload["top_items"]}
        self.assertEqual(payload["date_basis"], "wear_date")
        self.assertEqual(payload["metric"], "wear_effective")
        self.assertEqual(payload["year"], 2026)
        self.assertEqual(payload["total_wear"], 3)
        self.assertEqual(payload["wear_history_count"], 1)
        self.assertEqual(payload["wear_year_field_sum"], 3)
        self.assertEqual(payload["item_count"], 2)
        self.assertIn("222", returned_codes)
        self.assertIn("444", returned_codes)
        self.assertNotIn("999", returned_codes)
        self.assertNotIn("CLOTH", returned_codes)
        self.assertIn("wear_year_history_mismatch", {warning.get("code") for warning in payload["warnings"]})
        self.assertEqual(fake.json_calls, [])

    def test_stats_maintenance_matches_frontend_levels(self) -> None:
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(
                self._resource(
                    "items",
                    "sha256:items",
                    [
                        {"code": "IN", "wear_threshold": 10, "wear_maintenance": 1, "maintenance_state": 1},
                        {"code": "EX", "wear_threshold": 10, "wear_maintenance": 10},
                        {"code": "RD", "wear_threshold": 10, "wear_maintenance": 9},
                        {"code": "OR", "wear_threshold": 10, "wear_maintenance": 7},
                        {"code": "GR", "wear_threshold": 10, "wear_maintenance": 2},
                        {"code": "UN", "wear_maintenance": 2},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "wear_counts.json").write_text(
            json.dumps(self._resource("wear_counts", "sha256:wear", []), ensure_ascii=False),
            encoding="utf-8",
        )
        fake = FakeWardrobeApiClient(None, json_responses={})

        result = self._service_with_client(fake).call_tool(
            "wardrobe.stats_maintenance",
            {"refresh": False, "group_by": "level"},
        )
        counts = result["structuredContent"]["level_counts"]

        self.assertEqual(counts["in_progress"], 1)
        self.assertEqual(counts["expired"], 1)
        self.assertEqual(counts["red"], 1)
        self.assertEqual(counts["orange"], 1)
        self.assertEqual(counts["green"], 1)
        self.assertEqual(counts["unset"], 1)

    def test_stats_photos_allows_no_photo_and_reports_cache_health(self) -> None:
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(
                self._resource(
                    "items",
                    "sha256:items",
                    [
                        {"code": "NO", "photo_count": 0, "primary_photo": None},
                        {"code": "HAS", "photo_count": 1, "primary_photo": {"photo_id": 1}},
                    ],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "primary_photo_thumbnails.json").write_text(
            json.dumps(
                self._resource(
                    "primary_photo_thumbnails",
                    "sha256:thumb",
                    [{"code": "HAS", "photo_id": 1, "cache_filename": "HAS_1_thumb.jpg"}],
                ),
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "photos" / "HAS_1_thumb.jpg").write_bytes(JPEG_BYTES)
        (self.workspace / ".hermes-cache" / "photos" / "STALE_9_old.jpg").write_bytes(JPEG_BYTES)
        fake = FakeWardrobeApiClient(None, json_responses={})

        result = self._service_with_client(fake).call_tool(
            "wardrobe.stats_photos",
            {"refresh": False},
        )
        payload = result["structuredContent"]

        self.assertEqual(payload["items"]["no_photo"], 1)
        self.assertEqual(payload["items"]["with_photo"], 1)
        self.assertEqual(payload["thumbnails"]["cached_valid"], 1)
        self.assertEqual(payload["thumbnails"]["stale_local_files"], 1)

    def test_sync_downloads_only_changed_resources_and_thumbnail(self) -> None:
        old_manifest = self._manifest(
            [
                {
                    "name": "items",
                    "count": 1,
                    "checksum": "sha256:items",
                    "endpoint": "/api/v1/sync/outfit-context/resources/items",
                },
                {
                    "name": "wear_counts",
                    "count": 1,
                    "checksum": "sha256:oldwear",
                    "endpoint": "/api/v1/sync/outfit-context/resources/wear_counts",
                },
                {
                    "name": "primary_photo_thumbnails",
                    "count": 1,
                    "checksum": "sha256:oldthumb",
                    "endpoint": "/api/v1/sync/outfit-context/resources/primary_photo_thumbnails",
                },
            ],
            etag="sha256:oldmanifest",
        )
        new_manifest = self._manifest(
            [
                {
                    "name": "items",
                    "count": 1,
                    "checksum": "sha256:items",
                    "endpoint": "/api/v1/sync/outfit-context/resources/items",
                },
                {
                    "name": "wear_counts",
                    "count": 1,
                    "checksum": "sha256:newwear",
                    "endpoint": "/api/v1/sync/outfit-context/resources/wear_counts",
                },
                {
                    "name": "primary_photo_thumbnails",
                    "count": 1,
                    "checksum": "sha256:newthumb",
                    "endpoint": "/api/v1/sync/outfit-context/resources/primary_photo_thumbnails",
                },
            ]
        )
        (self.workspace / ".hermes-cache" / "outfit-context-manifest.json").write_text(
            json.dumps(old_manifest, ensure_ascii=False),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(self._resource("items", "sha256:items", [{"code": "A"}]), ensure_ascii=False),
            encoding="utf-8",
        )
        thumbnail_resource = self._resource(
            "primary_photo_thumbnails",
            "sha256:newthumb",
            [
                {
                    "code": "A",
                    "photo_id": 1,
                    "checksum": "sha256:photo",
                    "thumbnail_path": "/api/v1/items/A/photos/primary/thumbnail",
                    "cache_filename": "A_1_photo.jpg",
                }
            ],
        )
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("GET", "/api/v1/sync/outfit-context/manifest"): ApiResult(200, {}, new_manifest),
                ("GET", "/api/v1/sync/outfit-context/resources/wear_counts"): ApiResult(
                    200,
                    {},
                    self._resource("wear_counts", "sha256:newwear", [{"code": "A", "wear_total": 1}]),
                ),
                ("GET", "/api/v1/sync/outfit-context/resources/primary_photo_thumbnails"): ApiResult(
                    200,
                    {},
                    thumbnail_resource,
                ),
            },
            binary_responses={
                ("GET", "/api/v1/items/A/photos/primary/thumbnail"): ApiResult(200, {}, None, JPEG_BYTES),
            },
        )

        result = self._service_with_client(fake).sync({"refresh_thumbnails": True})

        requested_paths = [call["path"] for call in fake.json_calls]
        self.assertNotIn("/api/v1/sync/outfit-context/resources/items", requested_paths)
        self.assertIn("/api/v1/sync/outfit-context/resources/wear_counts", requested_paths)
        self.assertIn("/api/v1/sync/outfit-context/resources/primary_photo_thumbnails", requested_paths)
        self.assertEqual(result["changed_resources"], ["wear_counts", "primary_photo_thumbnails"])
        self.assertEqual(result["thumbnail_summary"]["downloaded"], 1)
        self.assertTrue((self.workspace / ".hermes-cache" / "photos" / "A_1_photo.jpg").exists())

    def test_sync_does_not_send_resource_etag_for_schema_mismatch(self) -> None:
        manifest = self._manifest(
            [
                {
                    "name": "items",
                    "count": 1,
                    "checksum": "sha256:newitems",
                    "endpoint": "/api/v1/sync/outfit-context/resources/items",
                },
            ]
        )
        stale_resource = self._resource("items", "sha256:olditems", [{"code": "A"}])
        stale_resource["schema_version"] = program_api_sync.SYNC_SCHEMA_VERSION - 1
        (self.workspace / ".hermes-cache" / "outfit-context-manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False),
            encoding="utf-8",
        )
        (self.workspace / ".hermes-cache" / "resources" / "items.json").write_text(
            json.dumps(stale_resource, ensure_ascii=False),
            encoding="utf-8",
        )
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("GET", "/api/v1/sync/outfit-context/manifest"): ApiResult(200, {}, manifest),
                ("GET", "/api/v1/sync/outfit-context/resources/items"): ApiResult(
                    200,
                    {},
                    self._resource("items", "sha256:newitems", [{"code": "A", "price_original": "61400"}]),
                ),
            },
        )

        result = self._service_with_client(fake).sync({"resources": ["items"], "refresh_thumbnails": False})

        resource_call = next(call for call in fake.json_calls if call["path"].endswith("/resources/items"))
        self.assertIsNone(resource_call["if_none_match"])
        self.assertEqual(result["changed_resources"], ["items"])

    def test_get_primary_thumbnail_allows_no_photo_item(self) -> None:
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("GET", "/api/v1/items/NO-PHOTO"): ApiResult(
                    200,
                    {},
                    {"item": {"code": "NO-PHOTO", "primary_photo": None, "photo_count": 0}},
                )
            },
        )

        result = self._service_with_client(fake).get_primary_thumbnail({"code": "NO-PHOTO"})

        self.assertFalse(result["has_photo"])
        self.assertEqual(result["reason"], "primary_photo_null")
        self.assertEqual(fake.binary_calls, [])

    def test_partial_sync_does_not_replace_main_manifest(self) -> None:
        old_manifest = self._manifest(
            [
                {
                    "name": "wear_counts",
                    "count": 1,
                    "checksum": "sha256:oldwear",
                    "endpoint": "/api/v1/sync/outfit-context/resources/wear_counts",
                },
                {
                    "name": "items",
                    "count": 1,
                    "checksum": "sha256:olditems",
                    "endpoint": "/api/v1/sync/outfit-context/resources/items",
                },
            ],
            etag="sha256:oldmanifest",
        )
        new_manifest = self._manifest(
            [
                {
                    "name": "wear_counts",
                    "count": 1,
                    "checksum": "sha256:newwear",
                    "endpoint": "/api/v1/sync/outfit-context/resources/wear_counts",
                },
                {
                    "name": "items",
                    "count": 1,
                    "checksum": "sha256:newitems",
                    "endpoint": "/api/v1/sync/outfit-context/resources/items",
                },
            ],
            etag="sha256:newmanifest",
        )
        manifest_path = self.workspace / ".hermes-cache" / "outfit-context-manifest.json"
        manifest_path.write_text(json.dumps(old_manifest, ensure_ascii=False), encoding="utf-8")
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("GET", "/api/v1/sync/outfit-context/manifest"): ApiResult(200, {}, new_manifest),
                ("GET", "/api/v1/sync/outfit-context/resources/wear_counts"): ApiResult(
                    200,
                    {},
                    self._resource("wear_counts", "sha256:newwear", [{"code": "A", "wear_total": 2}]),
                ),
            },
        )

        result = self._service_with_client(fake).sync(
            {"resources": ["wear_counts"], "refresh_thumbnails": False}
        )

        saved_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        requested_paths = [call["path"] for call in fake.json_calls]
        self.assertEqual(saved_manifest["etag"], "sha256:oldmanifest")
        self.assertTrue(result["partial_sync"])
        self.assertFalse(result["manifest_cache_updated"])
        self.assertNotIn("/api/v1/sync/outfit-context/resources/items", requested_paths)

    def test_set_primary_photo_defaults_to_dry_run(self) -> None:
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("POST", "/api/v1/items/CODE-1/photos/order"): ApiResult(
                    200,
                    {},
                    {"saved": False, "primary_photo_id": 7},
                )
            },
        )

        result = self._service_with_client(fake).set_primary_photo({"code": "CODE-1", "photo_id": 7})

        self.assertFalse(result["saved"])
        self.assertEqual(fake.json_calls[0]["body"], {"primary_photo_id": 7, "dry_run": True})

    def test_write_item_accepts_top_level_mode(self) -> None:
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("POST", "/api/v1/items"): ApiResult(
                    200,
                    {},
                    {"saved": False, "action": "updated"},
                )
            },
        )

        result = self._service_with_client(fake).write_item(
            {
                "payload": {"mode": "create_only", "item": {"code": "CODE-1"}},
                "mode": "upsert",
            }
        )

        self.assertEqual(result["action"], "updated")
        self.assertEqual(fake.json_calls[0]["body"]["mode"], "upsert")
        self.assertTrue(fake.json_calls[0]["body"]["dry_run"])

    def test_write_item_duplicate_code_returns_mcp_retry_hint(self) -> None:
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("POST", "/api/v1/items"): ApiResult(
                    409,
                    {},
                    {"error": "duplicate_code", "message": "duplicate_code"},
                )
            },
        )

        result = self._service_with_client(fake).write_item({"payload": {"item": {"code": "CODE-1"}}})

        self.assertEqual(result["error"], "duplicate_code")
        self.assertEqual(result["mcp_retry"]["tool"], "wardrobe.write_item")
        self.assertEqual(result["mcp_retry"]["mode"], "upsert")
        self.assertEqual(result["mcp_retry"]["code"], "CODE-1")
        self.assertIn("Do not request direct HTTP", result["mcp_retry"]["message"])

    def test_write_item_rejects_invalid_top_level_mode(self) -> None:
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("POST", "/api/v1/items"): ApiResult(200, {}, {"saved": False}),
            },
        )

        with self.assertRaises(WardrobeMcpError):
            self._service_with_client(fake).write_item(
                {"payload": {"item": {"code": "CODE-1"}}, "mode": "merge"}
            )
        self.assertEqual(fake.json_calls, [])

    def test_mcp_initialize_and_tools_list(self) -> None:
        server = McpStdioServer(WardrobeMcpService(default_workspace=str(self.workspace)))

        init_response = server.handle_message(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {"protocolVersion": "2025-06-18"},
            }
        )
        list_response = server.handle_message({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})

        self.assertEqual(init_response["result"]["capabilities"]["tools"]["listChanged"], False)
        self.assertGreaterEqual(len(list_response["result"]["tools"]), 5)

    def test_mcp_stdio_supports_content_length_framing(self) -> None:
        class BinaryStdin:
            def __init__(self, raw: bytes) -> None:
                self.buffer = io.BytesIO(raw)

        class BinaryStdout:
            def __init__(self) -> None:
                self.buffer = io.BytesIO()

            def flush(self) -> None:
                return None

        server = McpStdioServer(WardrobeMcpService(default_workspace=str(self.workspace)))
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {"protocolVersion": "2025-06-18"},
        }
        stdin = BinaryStdin(McpStdioServer._encode_message(request, "content-length"))
        stdout = BinaryStdout()
        original_stdin = sys.stdin
        original_stdout = sys.stdout
        try:
            sys.stdin = stdin  # type: ignore[assignment]
            sys.stdout = stdout  # type: ignore[assignment]
            server.serve()
        finally:
            sys.stdin = original_stdin
            sys.stdout = original_stdout

        raw = stdout.buffer.getvalue()
        header, body = raw.split(b"\r\n\r\n", 1)
        self.assertIn(b"Content-Length:", header)
        response = json.loads(body.decode("utf-8"))
        self.assertEqual(response["id"], 1)
        self.assertEqual(response["result"]["serverInfo"]["name"], "wardrobe-mcp")

    def test_scoped_server_rejects_workspace_override(self) -> None:
        service = WardrobeMcpService(
            default_workspace=str(self.workspace),
        )

        result = service.call_tool(
            "wardrobe.get_item",
            {"workspace": str(self.workspace / "other-owner"), "code": "CODE-1"},
        )

        self.assertTrue(result["isError"])
        self.assertEqual(
            result["structuredContent"]["message"],
            "workspace_override_not_allowed",
        )

    def test_workspace_override_requires_explicit_opt_in(self) -> None:
        fake = FakeWardrobeApiClient(
            None,
            json_responses={
                ("GET", "/api/v1/items/CODE-1"): ApiResult(200, {}, {"item": {"code": "CODE-1"}}),
            },
        )
        service = WardrobeMcpService(
            default_workspace=str(self.workspace),
            client_factory=lambda runtime: fake,
            allow_workspace_override=True,
        )

        result = service.call_tool(
            "wardrobe.get_item",
            {"workspace": str(self.workspace), "code": "CODE-1"},
        )

        self.assertFalse(result["isError"])
        self.assertEqual(result["structuredContent"]["item"]["code"], "CODE-1")

    def test_cli_workspace_override_default_is_fail_closed(self) -> None:
        parser = build_arg_parser()

        scoped = parser.parse_args(["--workspace", str(self.workspace)])
        diagnostic = parser.parse_args([
            "--workspace",
            str(self.workspace),
            "--allow-workspace-override",
        ])

        self.assertFalse(scoped.allow_workspace_override)
        self.assertTrue(diagnostic.allow_workspace_override)


if __name__ == "__main__":
    unittest.main()
