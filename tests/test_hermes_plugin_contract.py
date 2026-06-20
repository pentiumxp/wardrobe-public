from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

from wardrobe_app import hermes_plugin


ROOT = Path(__file__).resolve().parents[1]
SECRET_PATTERNS = (
    re.compile(r"wd_live_[A-Za-z0-9]+"),
    re.compile(r"wpl_[A-Za-z0-9]+"),
    re.compile(r"wardrobe_session=[^\\s`]+"),
    re.compile(r"plugin_session=[A-Za-z0-9_-]{16,}"),
)
PRIVATE_DEPLOYMENT_PATTERNS = (
    re.compile(r"hermes-xuxin\\.synology\\.me", re.IGNORECASE),
    re.compile(r"wardrobe-xuxin\\.synology\\.me", re.IGNORECASE),
    re.compile(r"192\\.168\\.10\\.(99|108)"),
)


class HermesPluginContractHarnessTests(unittest.TestCase):
    def test_required_docs_exist(self) -> None:
        required = [
            ROOT / "docs" / "README.md",
            ROOT / "docs" / "ARCHITECTURE.md",
            ROOT / "docs" / "MODULES" / "hermes-plugin.md",
            ROOT / "docs" / "TEST_MATRIX.md",
            ROOT / "docs" / "RUNBOOKS" / "hermes-plugin-debug.md",
            ROOT / "WARDROBE_HERMES_PLUGIN.md",
            ROOT / "WARDROBE_MCP.md",
            ROOT / "hermes-plugin" / "manifest.json",
        ]

        missing = [str(path.relative_to(ROOT)) for path in required if not path.exists()]

        self.assertEqual(missing, [])

    def test_contract_docs_do_not_contain_raw_secrets(self) -> None:
        docs = [
            ROOT / "docs" / "README.md",
            ROOT / "docs" / "ARCHITECTURE.md",
            ROOT / "docs" / "MODULES" / "hermes-plugin.md",
            ROOT / "docs" / "TEST_MATRIX.md",
            ROOT / "docs" / "RUNBOOKS" / "hermes-plugin-debug.md",
            ROOT / "WARDROBE_HERMES_PLUGIN.md",
            ROOT / "WARDROBE_MCP.md",
            ROOT / "hermes-plugin" / "manifest.json",
        ]

        violations: list[str] = []
        for path in docs:
            text = path.read_text(encoding="utf-8")
            for pattern in SECRET_PATTERNS:
                if pattern.search(text):
                    violations.append(f"{path.relative_to(ROOT)}:{pattern.pattern}")

        self.assertEqual(violations, [])

    def test_contract_docs_do_not_hardcode_private_deployments(self) -> None:
        docs = [
            ROOT / "docs" / "README.md",
            ROOT / "docs" / "ARCHITECTURE.md",
            ROOT / "docs" / "MODULES" / "hermes-plugin.md",
            ROOT / "docs" / "TEST_MATRIX.md",
            ROOT / "docs" / "RUNBOOKS" / "hermes-plugin-debug.md",
            ROOT / "WARDROBE_HERMES_PLUGIN.md",
            ROOT / "hermes-plugin" / "manifest.json",
        ]
        violations: list[str] = []
        for path in docs:
            text = path.read_text(encoding="utf-8")
            for pattern in PRIVATE_DEPLOYMENT_PATTERNS:
                if pattern.search(text):
                    violations.append(f"{path.relative_to(ROOT)}:{pattern.pattern}")

        self.assertEqual(violations, [])

    def test_manifest_shape_is_complete_and_secret_free(self) -> None:
        manifest = hermes_plugin.build_plugin_manifest(
            base_url="https://wardrobe.example.com",
            app_version="test-version",
            mcp_version="0.0.test",
            sync_schema_version=99,
            resource_names=["items", "wear_counts", "primary_photo_thumbnails"],
            frame_ancestors=["'self'", "https://hermes.example.com"],
            requested_frame_ancestor="https://hermes.example.com",
        )
        manifest_text = json.dumps(manifest, ensure_ascii=False, sort_keys=True)

        self.assertEqual(manifest["id"], "wardrobe")
        self.assertEqual(manifest["kind"], "embedded_app")
        self.assertEqual(manifest["entry"]["url"], "https://wardrobe.example.com/?embed=hermes")
        self.assertEqual(manifest["program_api"]["plugin_manifest"], "/api/v1/hermes/plugin/manifest")
        self.assertEqual(manifest["program_api"]["plugin_launch"], "/api/v1/hermes/plugin/launch")
        self.assertEqual(manifest["embedding"]["registration_endpoint"], "/api/v1/hermes/plugin/frame-ancestors")
        self.assertTrue(manifest["embedding"]["requested_frame_ancestor_allowed"])
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
        self.assertEqual(manifest["actions"][0]["id"], "style")
        self.assertEqual(manifest["actions"][0]["placement"], ["plugin_drawer_frequent", "dock_long_press", "search"])
        self.assertEqual(manifest["actions"][0]["entry"], {"type": "plugin_route", "pluginRoute": "style"})
        self.assertFalse(manifest["owner_binding"]["raw_key_returned_by_wardrobe"])
        self.assertIn("wardrobe.sync", manifest["mcp"]["required_tools"])
        self.assertIn("wardrobe.set_primary_photo", manifest["mcp"]["required_tools"])
        for pattern in SECRET_PATTERNS:
            self.assertIsNone(pattern.search(manifest_text), pattern.pattern)

    def test_static_install_pointer_uses_current_message_names(self) -> None:
        pointer = json.loads((ROOT / "hermes-plugin" / "manifest.json").read_text(encoding="utf-8"))

        self.assertEqual(pointer["id"], "wardrobe")
        self.assertEqual(pointer["manifest_url"], "/api/v1/hermes/plugin/manifest")
        self.assertEqual(pointer["entry_url"], "/?embed=hermes")
        self.assertEqual(pointer["navigation"]["back_result_event"], "wardrobe.plugin.back_result")
        self.assertEqual(pointer["navigation"]["refresh_required_event"], "wardrobe.plugin.refresh_required")
        self.assertEqual(pointer["appearance_sync"]["launch_field"], "appearance")
        self.assertEqual(pointer["appearance_sync"]["entry_query"]["theme"], "pluginTheme")
        self.assertEqual(pointer["appearance_sync"]["entry_query"]["fontSize"], "pluginFontSize")
        self.assertEqual(pointer["deployment"]["production_base_url"], "configured by deployment")

    def test_frontend_embedded_contract_messages_are_declared(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn('params.get("pluginRoute")', app_js)
        self.assertIn('params.get("pluginActionId")', app_js)
        self.assertIn("PLUGIN_ACTION_ROUTE_HASH", app_js)
        self.assertIn("applyInitialPluginActionHash", app_js)
        self.assertIn("applyInitialPluginActionAfterBootstrap", app_js)
        self.assertIn('initialPluginActionRoute === "add_item"', app_js)
        self.assertIn("openCreateItemPanel()", app_js)
        self.assertIn('"wardrobe.plugin.navigation"', app_js)
        self.assertIn('"hermes.plugin.back"', app_js)
        self.assertIn('"wardrobe.plugin.back_result"', app_js)
        self.assertIn('"wardrobe.plugin.refresh_required"', app_js)
        self.assertIn('"hermes.plugin.viewport"', app_js)
        self.assertIn("PLUGIN_REFRESH_REQUIRED_MIN_INTERVAL_MS", app_js)
        self.assertIn("PLUGIN_VIEWPORT_MESSAGE_TTL_MS", app_js)
        self.assertIn("boundedPluginRouteHint", app_js)
        self.assertIn("currentPluginRouteSummary", app_js)
        self.assertIn("handlePluginViewportMessage", app_js)
        self.assertIn("applyPluginViewportState", app_js)
        self.assertIn("scrollFocusedControlIntoPluginViewport", app_js)
        self.assertIn("hermesHostViewport", app_js)
        self.assertIn("keyboard-viewport-active", app_js)
        self.assertIn("--wardrobe-plugin-visible-height", app_js)
        self.assertIn("--wardrobe-plugin-keyboard-bottom", app_js)
        self.assertNotIn('"wardrobe.plugin.backResult"', app_js)
        self.assertIn('"plugin_launch_required"', app_js)
        self.assertIn("当前嵌入页没有有效的 Hermes 启动会话", app_js)
        self.assertIn("PLUGIN_RECONNECT_MAX_ATTEMPTS", app_js)
        self.assertIn("schedulePluginReconnectRetry", app_js)
        self.assertIn("retryHermesPluginReconnect", app_js)
        self.assertIn("pluginReconnectBootstrapping", app_js)
        self.assertIn("await bootstrapAuthenticatedApp()", app_js)

    def test_frontend_appearance_sync_is_session_scoped(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        index_html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        styles_css = (ROOT / "web" / "styles.css").read_text(encoding="utf-8")

        self.assertIn("PLUGIN_APPEARANCE_STORAGE_KEY", app_js)
        self.assertIn("PLUGIN_THEME_OPTIONS", app_js)
        self.assertIn('params.get("pluginTheme")', app_js)
        self.assertIn('params.get("pluginFontSize")', app_js)
        self.assertIn('params.delete("pluginTheme")', app_js)
        self.assertIn('params.delete("pluginFontSize")', app_js)
        self.assertIn('fetch("/api/v1/hermes/plugin/session"', app_js)
        self.assertIn("readPluginAppearance", app_js)
        self.assertIn("hermesParentEffectiveTheme", app_js)
        self.assertIn("reapplyPluginAppearance", app_js)
        self.assertIn("syncPluginHostAppearance", app_js)
        self.assertIn("window.setInterval(syncPluginHostAppearance", app_js)
        self.assertIn('window.addEventListener("pageshow"', app_js)
        self.assertIn('window.addEventListener("focus"', app_js)
        self.assertIn('document.addEventListener("visibilitychange"', app_js)
        self.assertNotIn('!pluginSessionToken()) return', app_js)
        self.assertIn('getAttribute("data-effective-theme")', app_js)
        self.assertIn('getAttribute("data-plugin-theme")', app_js)
        self.assertIn('document.documentElement.setAttribute("data-font-size"', app_js)
        self.assertIn('queryValue("pluginTheme")', index_html)
        self.assertIn('queryValue("pluginFontSize")', index_html)
        self.assertIn("parentEffectiveTheme", index_html)
        self.assertIn('getAttribute("data-effective-theme")', index_html)
        self.assertIn('getAttribute("data-plugin-theme")', index_html)
        self.assertIn('document.documentElement.setAttribute("data-font-size"', index_html)
        self.assertIn(':root[data-font-size="large"]', styles_css)
        self.assertIn("font-size: var(--app-font-size)", styles_css)

    def test_frontend_root_back_contract_is_explicit(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn(': "home";', app_js)
        self.assertIn("if (!current.canGoBack)", app_js)
        self.assertIn("return false;", app_js)
        self.assertIn("handled: Boolean(handled)", app_js)
        self.assertIn("route: currentPluginRouteSummary()", app_js)
        self.assertIn("syncRouteChrome", app_js)
        self.assertIn("secondary-route", app_js)

    def test_frontend_root_allows_host_edge_swipe(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn("PLUGIN_HOST_EDGE_SWIPE_WIDTH_PX", app_js)
        self.assertIn("function shouldAllowHostEdgeSwipe(event)", app_js)
        self.assertIn("if (pluginNavigationState().canGoBack) return false;", app_js)
        self.assertIn("<= PLUGIN_HOST_EDGE_SWIPE_WIDTH_PX", app_js)
        self.assertIn("if (shouldAllowHostEdgeSwipe(event)) return;", app_js)

    def test_frontend_main_tabs_are_bottom_navigation(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        index_html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        styles_css = (ROOT / "web" / "styles.css").read_text(encoding="utf-8")

        self.assertIn('class="tabs bottom-tabs"', index_html)
        self.assertIn('aria-label="主页面导航"', index_html)
        self.assertIn("styles.css?v=20260620appdialog", index_html)
        self.assertIn("app.js?v=20260620appdialog", index_html)
        self.assertIn('CLIENT_BUILD_VERSION = "20260608hostviewport"', app_js)
        self.assertIn(".bottom-tabs", styles_css)
        self.assertIn("body.secondary-route .bottom-tabs", styles_css)
        self.assertIn("--bottom-tabs-height", styles_css)
        self.assertIn("--bottom-tabs-area", styles_css)
        self.assertIn("--bottom-tabs-bottom: 6px", styles_css)
        self.assertIn("width: min(520px, calc(100vw - 72px))", styles_css)
        self.assertIn("min-height: 30px", styles_css)
        self.assertIn("border-radius: 16px", styles_css)
        self.assertIn("--bottom-tabs-bg: rgba(255, 255, 255, 0.94)", styles_css)
        self.assertIn("--bottom-tabs-chrome-bg: #f2f2f5", styles_css)
        self.assertIn("--bottom-tab-active-bg: #f5f1e7", styles_css)
        self.assertIn(':root[data-effective-theme="dark"]', styles_css)
        self.assertIn(':root[data-theme="system"][data-effective-theme="dark"]', styles_css)
        self.assertIn("--bottom-tabs-bg: rgba(29, 30, 35, 0.92)", styles_css)
        self.assertIn("--bottom-tabs-chrome-bg: #08090b", styles_css)
        self.assertIn("--bottom-tab-active-bg: #30333c", styles_css)
        self.assertIn("body.mobile:not(.secondary-route)::after", styles_css)
        self.assertIn("--bottom-tabs-backing-width: min(522px, calc(100vw - 70px))", styles_css)
        self.assertIn("--bottom-tabs-backing-height: 40px", styles_css)
        self.assertIn("--bottom-tabs-backing-bottom: 5px", styles_css)
        self.assertIn("width: var(--bottom-tabs-backing-width)", styles_css)
        self.assertIn("height: var(--bottom-tabs-backing-height)", styles_css)
        self.assertIn("bottom: var(--bottom-tabs-backing-bottom)", styles_css)
        self.assertIn("border-radius: var(--bottom-tabs-backing-radius)", styles_css)
        self.assertIn("background: var(--bottom-tabs-chrome-bg)", styles_css)
        self.assertIn("body.mobile:not(.secondary-route) .content", styles_css)
        self.assertIn("padding: 12px 10px 74px", styles_css)
        self.assertIn("padding-bottom: 74px", styles_css)
        self.assertIn("min-height: 100dvh", styles_css)
        self.assertIn("--wardrobe-plugin-visible-height: 100dvh", styles_css)
        self.assertIn("--wardrobe-plugin-keyboard-bottom: 0px", styles_css)
        self.assertIn("body.hermes-plugin-embed.mobile.keyboard-viewport-active", styles_css)
        self.assertIn("height: var(--wardrobe-plugin-visible-height)", styles_css)
        self.assertIn("padding-bottom: max(24px, calc(16px + var(--wardrobe-plugin-keyboard-bottom)))", styles_css)
        self.assertIn('document.querySelectorAll(".tab")', app_js)

    def test_frontend_dots_open_action_menu_not_sidebar_page(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        index_html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        styles_css = (ROOT / "web" / "styles.css").read_text(encoding="utf-8")

        self.assertIn('id="page-action-menu"', index_html)
        self.assertIn('aria-haspopup="menu"', index_html)
        self.assertIn('id="page-menu-refresh-btn"', index_html)
        self.assertIn('data-tab="dashboard"', index_html)
        self.assertIn("setPageActionMenuOpen", app_js)
        self.assertIn("togglePageActionMenu", app_js)
        self.assertIn('closest("#page-action-menu, #nav-toggle-btn")', app_js)
        self.assertNotIn('$("nav-toggle-btn").addEventListener("click", toggleSidebar)', app_js)
        self.assertIn(".page-action-menu", styles_css)
        self.assertIn(".page-action-menu-item", styles_css)
        self.assertIn(".page-action-menu .page-action-menu-item.active", styles_css)
        self.assertIn("background: transparent", styles_css)

    def test_frontend_resource_url_rules_are_structured(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn("function authenticatedResourceUrl(raw)", app_js)
        self.assertIn('url.pathname.startsWith("/api/")', app_js)
        self.assertIn('url.searchParams.set("plugin_session", sessionToken)', app_js)
        self.assertIn("function photoUrl(photo", app_js)
        self.assertIn("photo.content_path", app_js)
        self.assertIn('`/api/photos/${photo.id}/content${suffix}`', app_js)
        self.assertIn('return `/media/${photo.file_name}`;', app_js)

    def test_frontend_native_ai_entrypoints_are_removed(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        index_html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")

        self.assertNotIn("/api/ai/outfit-review", app_js)
        self.assertNotIn("/api/ai-prompts", app_js)
        self.assertNotIn("/ai-review", app_js)
        self.assertNotIn("/ai-analysis", app_js)
        self.assertIn("20260620appdialog", index_html)

    def test_frontend_uses_in_app_dialogs_not_browser_popups(self) -> None:
        app_js = (ROOT / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn("function showAppAlert", app_js)
        self.assertIn("function showAppConfirm", app_js)
        self.assertNotIn("window.alert", app_js)
        self.assertNotIn("window.confirm", app_js)
        self.assertNotIn("window.prompt", app_js)
        self.assertNotRegex(app_js, r"(?<![A-Za-z0-9_$])alert\s*\(")
        self.assertNotRegex(app_js, r"(?<![A-Za-z0-9_$])confirm\s*\(")
        self.assertIn("promptEvent.prompt()", app_js)

    def test_index_disables_machine_translation_for_embedded_chinese_ui(self) -> None:
        index_html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")

        self.assertIn('<html lang="zh-CN" translate="no">', index_html)
        self.assertIn('<meta name="google" content="notranslate">', index_html)


if __name__ == "__main__":
    unittest.main()
