$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$localDataDir = Join-Path $projectRoot "data"
$localDb = Join-Path $localDataDir "wardrobe.db"
$backupDir = Join-Path $localDataDir "local-db-backups"
$nasDb = "\\DS2419plus\Wardrobe\appdata\data\wardrobe.db"

if (-not (Test-Path -LiteralPath $nasDb)) {
    throw "NAS production DB not found: $nasDb"
}

New-Item -ItemType Directory -Force -Path $localDataDir | Out-Null
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

if (Test-Path -LiteralPath $localDb) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = Join-Path $backupDir "wardrobe_$timestamp.db"
    Copy-Item -LiteralPath $localDb -Destination $backupPath -Force
    Write-Output "BACKUP=$backupPath"
}

Copy-Item -LiteralPath $nasDb -Destination $localDb -Force
Write-Output "SYNCED=$localDb"
