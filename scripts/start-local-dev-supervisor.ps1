param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$HostName = "0.0.0.0",
    [int]$Port = 8765,
    [string]$PythonExe = "python",
    [int]$RestartDelaySeconds = 5
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$logDir = Join-Path $ProjectRoot "data\local-dev-service\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$env:WARDROBE_HOST = $HostName
$env:WARDROBE_PORT = [string]$Port
$env:WARDROBE_LOCAL_DEV_SERVICE = "1"

Set-Location -LiteralPath $ProjectRoot

while ($true) {
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $logPath = Join-Path $logDir ("wardrobe-local-dev_{0}.log" -f $stamp)
    $startLine = "[{0}] starting wardrobe local dev service on {1}:{2}" -f (Get-Date -Format o), $HostName, $Port
    $startLine | Out-File -FilePath $logPath -Encoding utf8 -Append

    try {
        & $PythonExe "app.py" *>> $logPath
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
        "[{0}] process exited with code {1}" -f (Get-Date -Format o), $exitCode | Out-File -FilePath $logPath -Encoding utf8 -Append
    } catch {
        "[{0}] process failed: {1}" -f (Get-Date -Format o), $_.Exception.Message | Out-File -FilePath $logPath -Encoding utf8 -Append
    }

    Start-Sleep -Seconds ([Math]::Max(1, $RestartDelaySeconds))
}
