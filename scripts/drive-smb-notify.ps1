$Once = $false
if ($args -contains "-Once") {
    $Once = $true
}

$ErrorActionPreference = "Stop"

$queueDir = "\\DS2419plus\Wardrobe\appdata\data\drive-notify-queue"
$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot "data"
$logPath = Join-Path $logDir "drive-smb-notify.log"
$pidPath = Join-Path $logDir "drive-smb-notify.pid"
$lastTouched = @{}
$watchPairs = @(
    @{
        Name = "WearCount"
        Remote = "\\DS2419plus\Wardrobe\closet-sync\WearCount.xlsx"
        Local = "C:\Users\xuxin\SynologyDrive\ChatGPT-Drive\徐欣\奢侈品\衣橱\WearCount.xlsx"
    },
    @{
        Name = "Wardrobe"
        Remote = "\\DS2419plus\Wardrobe\closet-sync\衣橱.xlsx"
        Local = "C:\Users\xuxin\SynologyDrive\ChatGPT-Drive\徐欣\奢侈品\衣橱\衣橱.xlsx"
    },
    @{
        Name = "Looks"
        Remote = "\\DS2419plus\Wardrobe\closet-sync\套装.xlsx"
        Local = "C:\Users\xuxin\SynologyDrive\ChatGPT-Drive\徐欣\奢侈品\衣橱\套装.xlsx"
    },
    @{
        Name = "Watch"
        Remote = "\\DS2419plus\Wardrobe\watch-sync\腕表.xlsx"
        Local = "C:\Users\xuxin\SynologyDrive\ChatGPT-Drive\徐欣\奢侈品\腕表\腕表.xlsx"
    }
)

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Set-Content -LiteralPath $pidPath -Value $PID -Encoding UTF8

function Write-Log {
    param([string]$Message)
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    Add-Content -LiteralPath $logPath -Value $line
}

function Convert-NasPathToUnc {
    param([string]$PathText)
    if ($null -eq $PathText) {
        $trimmed = ""
    } else {
        $trimmed = $PathText.Trim()
    }
    if (-not $trimmed) {
        return $null
    }
    $normalized = $trimmed -replace '/', '\'
    if ($normalized -like '\\DS2419plus\*') {
        return $normalized
    }
    if ($normalized -like '\volume1\homes\*') {
        return ('\\DS2419plus' + $normalized.Substring('\volume1'.Length))
    }
    if ($normalized -like '\volume1\Wardrobe\*') {
        return ('\\DS2419plus' + $normalized.Substring('\volume1'.Length))
    }
    return $null
}

function Touch-DriveFile {
    param([string]$UncPath)
    if (-not (Test-Path -LiteralPath $UncPath)) {
        throw "target_missing:$UncPath"
    }
    $parent = [System.IO.Path]::GetDirectoryName($UncPath)
    $leaf = [System.IO.Path]::GetFileName($UncPath)
    $name = [System.IO.Path]::GetFileNameWithoutExtension($leaf)
    $ext = [System.IO.Path]::GetExtension($leaf)
    $temp = Join-Path $parent ($name + ".__smbsync__" + [guid]::NewGuid().ToString("N") + $ext)

    Move-Item -LiteralPath $UncPath -Destination $temp -Force
    Start-Sleep -Milliseconds 500
    Move-Item -LiteralPath $temp -Destination $UncPath -Force
    (Get-Item -LiteralPath $UncPath).LastWriteTime = Get-Date
}

function Sync-NewerRemoteExports {
    foreach ($pair in $watchPairs) {
        $remotePath = $pair.Remote
        $localPath = $pair.Local
        if (-not (Test-Path -LiteralPath $remotePath)) {
            continue
        }
        $remoteItem = Get-Item -LiteralPath $remotePath
        $localItem = $null
        if (Test-Path -LiteralPath $localPath) {
            $localItem = Get-Item -LiteralPath $localPath
        }
        $needsTouch = $null -eq $localItem
        if (-not $needsTouch) {
            $remoteTs = $remoteItem.LastWriteTimeUtc
            $localTs = $localItem.LastWriteTimeUtc
            if ($remoteTs -gt $localTs.AddSeconds(1) -or $remoteItem.Length -ne $localItem.Length) {
                $needsTouch = $true
            }
        }
        if (-not $needsTouch) {
            continue
        }
        $lastKey = $pair.Name
        if ($lastTouched.ContainsKey($lastKey)) {
            if (((Get-Date) - $lastTouched[$lastKey]).TotalSeconds -lt 20) {
                continue
            }
        }
        Touch-DriveFile $remotePath
        $lastTouched[$lastKey] = Get-Date
        Write-Log ("smb_touch {0}" -f $pair.Name)
    }
}

Write-Log "started"

while ($true) {
    try {
        $requests = @(Get-ChildItem -LiteralPath $queueDir -Filter *.req -Force | Sort-Object LastWriteTime)
        foreach ($request in $requests) {
            try {
                $rawPath = Get-Content -LiteralPath $request.FullName -First 1 -ErrorAction Stop
                $uncPath = Convert-NasPathToUnc $rawPath
                if (-not $uncPath) {
                    throw "unsupported_path:$rawPath"
                }
                Touch-DriveFile $uncPath
                Write-Log ("processed {0}" -f $uncPath)
            } catch {
                Write-Log ("failed {0}: {1}" -f $request.FullName, $_.Exception.Message)
            } finally {
                Remove-Item -LiteralPath $request.FullName -Force -ErrorAction SilentlyContinue
            }
        }
        Sync-NewerRemoteExports
    } catch {
        Write-Log ("loop_error: {0}" -f $_.Exception.Message)
    }
    if ($Once) {
        break
    }
    Start-Sleep -Seconds 2
}
