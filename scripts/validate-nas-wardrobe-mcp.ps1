param(
    [string]$NasHost = "192.168.10.99",
    [int]$NasPort = 2222,
    [string]$NasUser = "xuxinxp",
    [string]$SshKeyPath = "C:\Users\xuxin\.ssh\synology_ed25519",
    [string]$AgentConfigPath = "/var/services/homes/xuxinxp/.hermes/config.yaml",
    [string]$AgentPython = "/volume1/docker/hermes-agent/current/venv/bin/python3",
    [string]$HermesAgentRoot = "/volume1/docker/hermes-agent/current",
    [string]$McpScriptPath = "/volume1/docker/wardrobe-mcp/scripts/wardrobe-mcp.py",
    [string]$WorkspacePath = "/volume1/docker/hermes-mobile/data/drive/users/owner",
    [string]$HealthUrl = "http://127.0.0.1:8642/health"
)

$ErrorActionPreference = "Stop"

$ssh = "C:\Windows\System32\OpenSSH\ssh.exe"
$scp = "C:\Windows\System32\OpenSSH\scp.exe"
if (-not (Test-Path -LiteralPath $ssh)) {
    throw "ssh not found: $ssh"
}
if (-not (Test-Path -LiteralPath $scp)) {
    throw "scp not found: $scp"
}
if (-not (Test-Path -LiteralPath $SshKeyPath)) {
    throw "ssh key not found: $SshKeyPath"
}

function ShellQuote {
    param([string]$Value)
    return "'" + ($Value -replace "'", "'\''") + "'"
}

$target = "$NasUser@$NasHost"
$remoteScript = @"
set -eu
CONFIG_PATH=$(ShellQuote $AgentConfigPath)
AGENT_PYTHON=$(ShellQuote $AgentPython)
HERMES_ROOT=$(ShellQuote $HermesAgentRoot)
MCP_SCRIPT=$(ShellQuote $McpScriptPath)
WORKSPACE_PATH=$(ShellQuote $WorkspacePath)
HEALTH_URL=$(ShellQuote $HealthUrl)

test -f "`$CONFIG_PATH"
test -x "`$AGENT_PYTHON"
test -x "`$MCP_SCRIPT"
test -f "`$WORKSPACE_PATH/.hermes-wardrobe/config.json"
test -f "`$WORKSPACE_PATH/.hermes-wardrobe/access-key.txt"

"`$AGENT_PYTHON" - <<'PY'
from pathlib import Path
import sys
import yaml

config_path = Path('$AgentConfigPath')
data = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
errors = []
if "wardrobe" not in (data.get("toolsets") or []):
    errors.append("toolsets_missing_wardrobe")
api_toolsets = ((data.get("platform_toolsets") or {}).get("api_server") or [])
if "wardrobe" not in api_toolsets:
    errors.append("api_server_toolsets_missing_wardrobe")
server = (data.get("mcp_servers") or {}).get("wardrobe") or {}
if server.get("command") != '$AgentPython':
    errors.append("wardrobe_command_mismatch")
args = [str(v) for v in (server.get("args") or [])]
for required in ('$McpScriptPath', "--workspace", '$WorkspacePath', "--no-workspace-override"):
    if required not in args:
        errors.append("wardrobe_args_missing:" + required)
if errors:
    print("CONFIG_OK=False")
    print("CONFIG_ERRORS=" + ",".join(errors))
    sys.exit(2)
print("CONFIG_OK=True")
PY

python3 - <<PY
import urllib.request
data = urllib.request.urlopen("$HealthUrl", timeout=5).read().decode("utf-8", "replace")
print("HEALTH_OK=" + str('"status": "ok"' in data or '"status":"ok"' in data))
PY

"`$AGENT_PYTHON" - <<'PY'
import json, os, subprocess, sys
cmd = [
    "$AgentPython",
    "$McpScriptPath",
    "--workspace",
    "$WorkspacePath",
    "--no-workspace-override",
]
env = dict(os.environ)
env["HERMES_HOME"] = str(Path("$AgentConfigPath").parent) if False else "/var/services/homes/xuxinxp/.hermes"
messages = "\n".join([
    json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-06-18"}}),
    json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}),
]) + "\n"
proc = subprocess.run(cmd, input=messages, text=True, capture_output=True, env=env, timeout=30)
text = proc.stdout
print("MCP_STDIO_EXIT=" + str(proc.returncode))
print("MCP_STDIO_HAS_WARDROBE_SYNC=" + str("wardrobe.sync" in text))
if proc.returncode != 0 or "wardrobe.sync" not in text:
    sys.exit(3)
PY

cd "`$HERMES_ROOT"
HERMES_HOME=/var/services/homes/xuxinxp/.hermes "`$AGENT_PYTHON" - <<'PY'
from tools.mcp_tool import discover_mcp_tools, shutdown_mcp_servers
from gateway.run import _load_gateway_config, _resolve_gateway_model, _resolve_runtime_agent_kwargs
from hermes_cli.tools_config import _get_platform_tools
from run_agent import AIAgent

def name_of(tool):
    if isinstance(tool, str):
        return tool
    if isinstance(tool, dict):
        return (tool.get("function") or {}).get("name") or tool.get("name") or ""
    return ""

agent = None
try:
    mcp_tools = discover_mcp_tools()
    mcp_names = [name_of(tool) for tool in (mcp_tools or [])]
    print("DISCOVERED_MCP_TOOL_COUNT=" + str(len(mcp_names)))
    print("DISCOVERED_HAS_WARDROBE_SYNC=" + str(any(name.endswith("wardrobe_sync") or name == "wardrobe.sync" for name in mcp_names)))
    cfg = _load_gateway_config()
    enabled_toolsets = sorted(_get_platform_tools(cfg, "api_server"))
    print("AGENT_HAS_WARDROBE_TOOLSET=" + str("wardrobe" in enabled_toolsets))
    agent = AIAgent(
        model=_resolve_gateway_model(),
        **_resolve_runtime_agent_kwargs(),
        quiet_mode=True,
        enabled_toolsets=enabled_toolsets,
        max_iterations=1,
    )
    names = [name_of(tool) for tool in (agent.tools or [])]
    wardrobe_names = [name for name in names if "wardrobe" in name]
    has_sync = any(name.endswith("wardrobe_sync") for name in wardrobe_names)
    print("AGENT_WARDROBE_TOOL_COUNT=" + str(len(wardrobe_names)))
    print("AGENT_HAS_MCP_WARDROBE_SYNC=" + str(has_sync))
    if not has_sync:
        raise SystemExit(4)
finally:
    if agent is not None:
        agent.close()
    shutdown_mcp_servers()
PY
"@

$tempScript = Join-Path $env:TEMP ("wardrobe-nas-mcp-harness-{0}.sh" -f ([Guid]::NewGuid().ToString("N")))
$remoteScript = $remoteScript -replace "`r`n", "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($tempScript, $remoteScript, $utf8NoBom)
try {
    $remoteTemp = "/tmp/wardrobe-nas-mcp-harness-$([Guid]::NewGuid().ToString("N")).sh"
    & $scp `
        -O `
        -P $NasPort `
        -o BatchMode=yes `
        -o StrictHostKeyChecking=yes `
        -o HostKeyAlgorithms=ssh-ed25519 `
        -o HostKeyAlias=$NasHost `
        -i $SshKeyPath `
        $tempScript `
        "${target}:$remoteTemp"
    if ($LASTEXITCODE -ne 0) { throw "failed to upload NAS MCP harness script" }
    & $ssh `
        -p $NasPort `
        -o BatchMode=yes `
        -o StrictHostKeyChecking=yes `
        -o HostKeyAlgorithms=ssh-ed25519 `
        -o HostKeyAlias=$NasHost `
        -i $SshKeyPath `
        $target `
        "bash '$remoteTemp'; status=`$?; rm -f '$remoteTemp'; exit `$status"
} finally {
    Remove-Item -LiteralPath $tempScript -Force -ErrorAction SilentlyContinue
}
