param(
  [string]$BackupRoot = "",
  [string]$LocalProject = "",
  [string]$NasCode = "\\DS2419plus\Wardrobe\wardrobe-app",
  [string]$NasAppData = "\\DS2419plus\Wardrobe\appdata",
  [string]$NasCloset = "\\DS2419plus\Wardrobe\closet-sync",
  [string]$NasWatch = "\\DS2419plus\Wardrobe\watch-sync",
  [string]$TempRoot = "",
  [string[]]$LocalProjectExcludeDirs = @("data", "baseline_exports", "media", "__pycache__", ".pytest_cache"),
  [string[]]$LocalProjectExcludeFiles = @("tmp_server_out.log", "tmp_server_err.log", "*.pyc", "*.pyo"),
  [string[]]$NasAppDataExcludeDirs = @("data\\edge-headless-debug", "data\\edge-headless"),
  [string[]]$NasAppDataExcludeFiles = @(),
  [string]$NasHost = "",
  [string]$NasUser = "",
  [string]$NasPassword = "",
  [string]$ContainerName = "wardrobe-app"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "backup-utils.ps1")

function Get-CodexBackupRoot {
  $backupFolder = ([char]0x5907) + ([char]0x4EFD)
  return "\\DS2419plus\$backupFolder\codex"
}

if (-not $LocalProject) {
  $LocalProject = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

if (-not $BackupRoot) {
  $BackupRoot = Get-CodexBackupRoot
}

if (-not $TempRoot) {
  $TempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "wardrobe-full-backup"
}

function Invoke-NasSshCommand {
  param(
    [Parameter(Mandatory = $true)][string]$Command
  )

  if (-not $NasHost -or -not $NasUser -or -not $NasPassword) {
    throw "NAS SSH parameters are incomplete."
  }

  $py = @"
import paramiko
host = r'''$NasHost'''
user = r'''$NasUser'''
password = r'''$NasPassword'''
command = r'''$Command'''
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=20)
stdin, stdout, stderr = client.exec_command(command, timeout=3600)
print(stdout.read().decode('utf-8', 'replace'))
err = stderr.read().decode('utf-8', 'replace')
if err:
    print(err)
client.close()
"@
  $py | python -
}

function Assert-PathExists {
  param(
    [Parameter(Mandatory = $true)][string]$PathValue
  )
  if (-not (Test-Path -LiteralPath $PathValue)) {
    throw "Path not found: $PathValue"
  }
}

function New-FilteredSnapshot {
  param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$DestinationPath,
    [string[]]$ExcludeDirs = @(),
    [string[]]$ExcludeFiles = @()
  )

  if (Test-Path -LiteralPath $DestinationPath) {
    Remove-Item -LiteralPath $DestinationPath -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $DestinationPath | Out-Null

  $robocopyArgs = @(
    $SourcePath,
    $DestinationPath,
    "/E",
    "/R:1",
    "/W:1",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP"
  )

  $excludedDirPaths = @()
  foreach ($name in $ExcludeDirs) {
    if (-not $name) {
      continue
    }
    $excludedDirPaths += (Join-Path $SourcePath $name)
  }
  if ($excludedDirPaths.Count -gt 0) {
    $robocopyArgs += "/XD"
    $robocopyArgs += $excludedDirPaths
  }

  if ($ExcludeFiles.Count -gt 0) {
    $robocopyArgs += "/XF"
    $robocopyArgs += $ExcludeFiles
  }

  & robocopy @robocopyArgs | Out-Null
  if ($LASTEXITCODE -gt 7) {
    throw "robocopy failed with exit code $LASTEXITCODE"
  }

  foreach ($name in $ExcludeDirs) {
    if (-not $name) {
      continue
    }
    $targetPath = Join-Path $DestinationPath $name
    if (Test-Path -LiteralPath $targetPath) {
      Remove-Item -LiteralPath $targetPath -Recurse -Force
    }
  }

  foreach ($pattern in $ExcludeFiles) {
    if (-not $pattern) {
      continue
    }
    $joined = Join-Path $DestinationPath $pattern
    $usesWildcard = ($pattern.IndexOf('*') -ge 0) -or ($pattern.IndexOf('?') -ge 0)
    if ($usesWildcard) {
      Get-ChildItem -Path $joined -Recurse -File -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
      continue
    }
    if (Test-Path -LiteralPath $joined) {
      Remove-Item -LiteralPath $joined -Force
      continue
    }
    Get-ChildItem -LiteralPath $DestinationPath -Recurse -File -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -eq $pattern } |
      Remove-Item -Force -ErrorAction SilentlyContinue
  }
}

Assert-PathExists -PathValue $LocalProject
Assert-PathExists -PathValue $NasCode
Assert-PathExists -PathValue $NasAppData
Assert-PathExists -PathValue $NasCloset
Assert-PathExists -PathValue $NasWatch

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
New-Item -ItemType Directory -Force -Path $TempRoot | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "wardrobe_full_backup_{0}.zip" -f $timestamp
$zipPath = Join-Path $BackupRoot $zipName
$stagingZipPath = Join-Path $TempRoot $zipName
$localProjectStageRoot = Join-Path $TempRoot ("local-project-snapshot_{0}" -f $timestamp)
$localProjectStage = Join-Path $localProjectStageRoot (Split-Path $LocalProject -Leaf)
$nasAppDataStageRoot = Join-Path $TempRoot ("nas-appdata-snapshot_{0}" -f $timestamp)
$nasAppDataStage = Join-Path $nasAppDataStageRoot (Split-Path $NasAppData -Leaf)
$manifestPath = Join-Path ([System.IO.Path]::GetTempPath()) ("wardrobe-backup-manifest_{0}.txt" -f $timestamp)
$localExcludeSummary = @()
if ($LocalProjectExcludeDirs.Count -gt 0) {
  $localExcludeSummary += ("Excluded local dirs: " + ($LocalProjectExcludeDirs -join ", "))
}
if ($LocalProjectExcludeFiles.Count -gt 0) {
  $localExcludeSummary += ("Excluded local files: " + ($LocalProjectExcludeFiles -join ", "))
}
$nasAppDataExcludeSummary = @()
if ($NasAppDataExcludeDirs.Count -gt 0) {
  $nasAppDataExcludeSummary += ("Excluded NAS appdata dirs: " + ($NasAppDataExcludeDirs -join ", "))
}
if ($NasAppDataExcludeFiles.Count -gt 0) {
  $nasAppDataExcludeSummary += ("Excluded NAS appdata files: " + ($NasAppDataExcludeFiles -join ", "))
}

$manifest = @(
  "Wardrobe full backup",
  "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "Included paths:",
  "1. Local latest code snapshot: $LocalProject",
  "2. NAS deployed code: $NasCode",
  "3. NAS production data: $NasAppData",
  "4. NAS closet sync dir: $NasCloset",
  "5. NAS watch sync dir: $NasWatch"
)
$manifest += $localExcludeSummary
$manifest += $nasAppDataExcludeSummary
Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

$stopped = $false
try {
  if ($NasHost -and $NasUser -and $NasPassword) {
    Invoke-NasSshCommand -Command "printf '%s\n' '$NasPassword' | sudo -S -k /usr/local/bin/docker stop $ContainerName"
    $stopped = $true
  }

  if (Test-Path -LiteralPath $stagingZipPath) {
    Remove-Item -LiteralPath $stagingZipPath -Force
  }

  if (Test-Path -LiteralPath $localProjectStageRoot) {
    Remove-Item -LiteralPath $localProjectStageRoot -Recurse -Force
  }
  if (Test-Path -LiteralPath $nasAppDataStageRoot) {
    Remove-Item -LiteralPath $nasAppDataStageRoot -Recurse -Force
  }

  New-FilteredSnapshot -SourcePath $LocalProject -DestinationPath $localProjectStage -ExcludeDirs $LocalProjectExcludeDirs -ExcludeFiles $LocalProjectExcludeFiles
  New-FilteredSnapshot -SourcePath $NasAppData -DestinationPath $nasAppDataStage -ExcludeDirs $NasAppDataExcludeDirs -ExcludeFiles $NasAppDataExcludeFiles

  $archiveInputs = @($localProjectStage, $NasCode, $nasAppDataStage, $NasCloset, $NasWatch, $manifestPath)
  Compress-Archive -LiteralPath $archiveInputs -DestinationPath $stagingZipPath -CompressionLevel Optimal -Force
  Move-Item -LiteralPath $stagingZipPath -Destination $zipPath -Force
  $retentionResult = Invoke-DailyBackupRetention -Directory $BackupRoot -Prefix "wardrobe_full_backup_" -Suffix ".zip" -KeepDays 3
}
finally {
  if (Test-Path -LiteralPath $manifestPath) {
    Remove-Item -LiteralPath $manifestPath -Force
  }
  if (Test-Path -LiteralPath $stagingZipPath) {
    Remove-Item -LiteralPath $stagingZipPath -Force
  }
  if (Test-Path -LiteralPath $localProjectStageRoot) {
    Remove-Item -LiteralPath $localProjectStageRoot -Recurse -Force
  }
  if (Test-Path -LiteralPath $nasAppDataStageRoot) {
    Remove-Item -LiteralPath $nasAppDataStageRoot -Recurse -Force
  }
  if ($stopped) {
    Invoke-NasSshCommand -Command "printf '%s\n' '$NasPassword' | sudo -S -k /usr/local/bin/docker start $ContainerName"
  }
}

[PSCustomObject]@{
  Backup = Get-Item -LiteralPath $zipPath | Select-Object FullName, Length, LastWriteTime
  Retention = $retentionResult
}
