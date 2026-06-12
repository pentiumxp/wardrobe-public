from __future__ import annotations

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
HARNESS = ROOT / "scripts" / "validate-nas-wardrobe-mcp.ps1"
MCP_DOC = ROOT / "WARDROBE_MCP.md"


class NasWardrobeMcpHarnessTests(unittest.TestCase):
    def test_harness_checks_active_agent_registration(self) -> None:
        text = HARNESS.read_text(encoding="utf-8")
        required = [
            "/var/services/homes/xuxinxp/.hermes/config.yaml",
            "/volume1/docker/hermes-agent/current/venv/bin/python3",
            "/volume1/docker/wardrobe-mcp/scripts/wardrobe-mcp.py",
            "/volume1/docker/hermes-mobile/data/drive/users/owner",
            "toolsets_missing_wardrobe",
            "api_server_toolsets_missing_wardrobe",
            "mcp_servers",
            "MCP_STDIO_HAS_WARDROBE_SYNC",
            "DISCOVERED_HAS_WARDROBE_SYNC",
            "AGENT_HAS_MCP_WARDROBE_SYNC",
        ]
        for marker in required:
            with self.subTest(marker=marker):
                self.assertIn(marker, text)

    def test_mcp_docs_require_nas_active_agent_harness(self) -> None:
        text = MCP_DOC.read_text(encoding="utf-8")
        required = [
            "NAS Active Agent Registration",
            "nas-local-codex",
            "127.0.0.1:8642",
            "scripts\\validate-nas-wardrobe-mcp.ps1",
            "active Hermes Agent/Gateway profile",
        ]
        for marker in required:
            with self.subTest(marker=marker):
                self.assertIn(marker, text)


if __name__ == "__main__":
    unittest.main()
