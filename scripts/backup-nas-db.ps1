param(
  [string]$SourceDb = "\\DS2419plus\Wardrobe\appdata\data\wardrobe.db",
  [string]$BackupRoot = "",
  [int]$KeepDays = 3
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "backup-utils.ps1")

function Get-CodexBackupRoot {
  $backupFolder = ([char]0x5907) + ([char]0x4EFD)
  return "\\DS2419plus\$backupFolder\codex"
}

if (-not $BackupRoot) {
  $BackupRoot = Join-Path (Get-CodexBackupRoot) "nas-db-backups"
}

if (-not (Test-Path -LiteralPath $SourceDb)) {
  throw "Source DB not found: $SourceDb"
}

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$now = Get-Date
$latestTimestamp = Get-ChildItem -LiteralPath $BackupRoot -File | Where-Object {
  $_.Name.StartsWith("wardrobe.db_") -and $_.Name.EndsWith(".bak")
} | ForEach-Object {
  Get-BackupFileTimestamp -File $_ -Prefix "wardrobe.db_" -Suffix ".bak"
} | Sort-Object -Descending | Select-Object -First 1

$backupTime = $now
if ($latestTimestamp -and $latestTimestamp -ge $backupTime) {
  $backupTime = $latestTimestamp.AddSeconds(1)
}
$timestamp = $backupTime.ToString("yyyyMMdd_HHmmss")
$backupPath = Join-Path $BackupRoot ("wardrobe.db_{0}.bak" -f $timestamp)
Copy-Item -LiteralPath $SourceDb -Destination $backupPath -Force
$backupItem = Get-Item -LiteralPath $backupPath
$retentionResult = Invoke-DailyBackupRetention -Directory $BackupRoot -Prefix "wardrobe.db_" -Suffix ".bak" -KeepDays $KeepDays

[PSCustomObject]@{
  Backup = $backupItem | Select-Object FullName, Length, LastWriteTime
  Retention = $retentionResult
}
