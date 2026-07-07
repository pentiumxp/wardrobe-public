# Home AI Platform Contract Pointer

Last updated: 2026-07-07.
Home AI platform contract version: `20260707-v7`.

## Scope

Wardrobe is a standard inserted Home AI plugin. This file records only
Wardrobe-local facts and points back to the canonical Home AI platform
contract. Historical NAS notes in this repository are provenance only; current
Home AI production is Mac Studio.

## Canonical Home AI Docs

Read these Home AI docs before changing deployment, MCP tools, mobile visual
behavior, or cross-plugin reference behavior:

- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/plugin-workspace-platform-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/plugin-mobile-ui-visual-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/macos-dev-to-production-deployment-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/root-cause-architecture-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/fallback-governance-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/autonomous-delivery-loop-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/worker-pool-lifecycle-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/PLATFORM_CONTRACTS/github-shared-source-account-contract.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/IMPLEMENTATION_NOTES/fallback-registry.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/RUNBOOKS/github-shared-source-account.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/RUNBOOKS/macos-production-access.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/RUNBOOKS/mcp-tool-upgrade-closure.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/RUNBOOKS/macos-ios-simulator-appium.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/MODULES/ai-operations-control-plane.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/IMPLEMENTATION_NOTES/ai-operations-control-plane.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/IMPLEMENTATION_NOTES/reference-memory-graph-v1.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/IMPLEMENTATION_NOTES/reference-memory-graph-harness-plan.md`
- `/Users/hermes-dev/HermesMobileDev/app/docs/IMPLEMENTATION_NOTES/plugin-topic-directory-claims.md`

For non-trivial plugin bugfix, deployment, MCP, schema, or provisioning work,
follow the central root-cause architecture contract before fixing. Any fallback
must follow the central fallback governance contract and be recorded or linked
through the central fallback registry when it is more than a one-off diagnostic
mitigation.

## Plugin-Local Facts

| Field | Value |
| --- | --- |
| `plugin_id` | `wardrobe` |
| `workspace_path_windows` | `C:\Users\xuxin\Documents\男装衣橱` |
| `current_branch_snapshot` | `codex/program-api-item-uploads` at `3bec104` when this pointer was added |
| `production_source_path_macos` | `/Users/hermes-host/HermesMobile/plugins/wardrobe` |
| `production_data_root_macos` | `/Users/hermes-host/HermesMobile/plugins/wardrobe/data` |
| `windows_dev_base_url` | `http://127.0.0.1:8765` |
| `macos_production_base_url` | `http://127.0.0.1:8765` |
| `launchd_label` | `system/com.hermesmobile.plugin.wardrobe` |
| `manifest_url` | `http://127.0.0.1:8765/api/v1/hermes/plugin/manifest` |
| `mcp_command` | `python wardrobe_app/wardrobe_mcp.py` or `python scripts/wardrobe-mcp.py`; verify the Gateway profile runtime path before production changes |
| `mcp_schema_endpoint` | MCP `tools/list` through the stdio wrapper; Program API manifest at `/api/v1/hermes/plugin/manifest` |
| `dev_runtime_prerequisites` | Mac DEV must expose Python through `/Users/xuxin/Developer/HomeAIDev/bin/python` and `/Users/hermes-dev/HermesMobileDev/runtime/python-current`; run `python --version` before classifying MCP wrapper failures. |
| `deploy_command` | Use the Home AI Mac access runbook; do not use historical NAS deploy commands for production. |
| `credential_locations` | Workspace-local Program API config/key files only by reference. Do not record raw keys or tokens here. |
| `reference_contract_status` | `planned`; Wardrobe is a structured fact source and should later expose Reference Contract methods for items, outfits, wear history, and featured looks. |
| `mobile_visual_harness_status` | Embedded UI exists; use Home AI Appium/iOS Simulator evidence when embedded shell, bottom layout, long-press, or plugin iframe behavior changes. |
| `ai_ops_control_plane_command` | `cd /Users/hermes-dev/HermesMobileDev/app && node scripts/ai-ops-control-plane.js intake --task "<task>" --json` |
| `ai_ops_required_flow` | `intake -> required-checks -> lane allocate if visual -> evidence append -> production smoke -> handoff` |
| `ai_ops_evidence_ledger` | `$HOME/.homeai-qa/wardrobe-evidence-ledger.jsonl` |
| `ios_live_debug_available` | `yes`; use Home AI `npm run ios:pwa:debug` for interactive embedded iOS PWA reproduction, with one Simulator/live-debug-port/WDA-port/MJPEG-port lane per concurrent plugin debug session. |
| `ios_visual_harness_command` | `cd /Users/hermes-dev/HermesMobileDev/app && npm run ios:pwa:visual -- --scenario embedded-plugin-shell --plugin-id wardrobe --debug-url http://127.0.0.1:19073/` |
| `plugin_manifest_actions_status` | `declared`; Wardrobe exposes manifest `actions` for host Dock `常用`, long-press menus, and search. |
| `github_shared_source_account_status` | `adopted`; writable source remote `origin` uses SSH alias `github.com-homeai-ssa` for `pentiumxp/wardrob.git`; private key remains a local operator secret outside this repo. |
| `github_shared_source_account_helper` | `/Users/hermes-dev/HermesMobileDev/app/scripts/github-shared-source-account.js` |
| `plugin_main_preflight_command` | `node /Users/hermes-dev/HermesMobileDev/app/scripts/main-thread-routing-preflight.js --source-thread-role plugin_main --task "<task>" --changed-file <path> --mode classify` |
| `plugin_worker_dispatch_policy` | If preflight returns `classification=plugin_worker`, create a bounded `plugin_worker` card with terminal return, privacy boundary, conflict rule, and expected validation, or return `blocked` with the missing lane. Forbidden Worker targets: Task Intake, deploy lane, audit lane, Loop lane, current thread, source thread. |

## Required Local Validation

Run the smallest focused set for the changed surface:

```powershell
python -m py_compile wardrobe_app\wardrobe_mcp.py scripts\wardrobe-mcp.py
python -m unittest tests.test_wardrobe_mcp
```

For Program API or embedded plugin changes, also run the relevant focused
tests/harnesses already present in this repository and verify the local service
on `http://127.0.0.1:8765`.

From the Home AI main workspace, run the cross-workspace platform contract
checker after changing this pointer or any Wardrobe deployment/MCP/mobile
contract:

```powershell
node scripts\plugin-workspace-platform-contract-check.js --plugin wardrobe --json
```

## Required Production Validation

Use the Home AI Mac access runbook. Do not print passwords, keys, cookies,
workspace tokens, private clothing data, raw image payloads, or long logs.

Minimum closure for Wardrobe production changes:

1. verify Mac launchd `system/com.hermesmobile.plugin.wardrobe` is running;
2. verify Mac loopback `/api/v1/hermes/plugin/manifest`;
3. verify direct MCP `tools/list` includes expected `wardrobe.*` tools;
4. when MCP tools changed, run the Home AI MCP tool upgrade closure harness so
   the selected Gateway profile and selected worker expose the callable
   `mcp_wardrobe_*` tool names;
5. for write features, perform a bounded readback smoke against the changed
   item/outfit/history object without dumping private wardrobe contents.

## Open Gaps

- Implement the Reference Contract V1 methods for stable Wardrobe object refs.
- Add or adopt a Wardrobe-specific Home AI Appium/iOS Simulator harness for
  embedded UI and long-press/menu behavior.
- Keep Mac-local route validation mandatory so old remote or LAN defaults do not
  reappear in user workspace configs.
