param(
    [Parameter(Mandatory = $true, Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Paths
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$nasShareRoot = "\\DS2419plus\Wardrobe\wardrobe-app"
$ssh = "C:\Windows\System32\OpenSSH\ssh.exe"
$keyPath = "C:\Users\xuxin\.ssh\synology_ed25519"
$hostKey = "ssh-ed25519 255 SHA256:k7VyfiXVeAuL64MH89hsP04usWfO75SM2e1F1Wuluz8"
$target = "xuxinxp@192.168.10.99"
$targetPort = 2222

function Copy-FileToNasAtomically {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourcePath,
        [Parameter(Mandatory = $true)]
        [string]$DestinationPath
    )

    $destinationDir = Split-Path -Parent $DestinationPath
    if (-not (Test-Path -LiteralPath $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }

    $tempPath = "$DestinationPath.__incoming__"
    $backupPath = "$DestinationPath.__pre_replace__"

    if (Test-Path -LiteralPath $tempPath) {
        Remove-Item -LiteralPath $tempPath -Force
    }
    if (Test-Path -LiteralPath $backupPath) {
        Remove-Item -LiteralPath $backupPath -Force
    }

    $sourceStream = [System.IO.File]::Open($SourcePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
    try {
        $destinationStream = [System.IO.File]::Open($tempPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
        try {
            $sourceStream.CopyTo($destinationStream)
            $destinationStream.Flush()
        }
        finally {
            $destinationStream.Dispose()
        }
    }
    finally {
        $sourceStream.Dispose()
    }

    if (Test-Path -LiteralPath $DestinationPath) {
        Rename-Item -LiteralPath $DestinationPath -NewName ([System.IO.Path]::GetFileName($backupPath)) -Force
    }
    Rename-Item -LiteralPath $tempPath -NewName ([System.IO.Path]::GetFileName($DestinationPath)) -Force
    if (Test-Path -LiteralPath $backupPath) {
        Remove-Item -LiteralPath $backupPath -Force
    }
}

if (-not (Test-Path -LiteralPath $ssh)) {
    throw "ssh not found: $ssh"
}

if (-not (Test-Path -LiteralPath $keyPath)) {
    throw "ssh key not found: $keyPath"
}

if (-not (Test-Path -LiteralPath $nasShareRoot)) {
    throw "NAS share root not found: $nasShareRoot"
}

$normalizedPaths = @()
foreach ($path in $Paths) {
    if ([string]::IsNullOrWhiteSpace($path) -or $path -match '(^/)|(\.\.)') {
        throw "invalid relative path: $path"
    }
    $normalizedPaths += ($path -replace '/', '\').TrimStart('\')
}

foreach ($relativePath in $normalizedPaths) {
    $localPath = Join-Path $repoRoot $relativePath
    $nasPath = Join-Path $nasShareRoot $relativePath
    if (-not (Test-Path -LiteralPath $localPath -PathType Leaf)) {
        throw "local source file missing: $localPath"
    }

    Copy-FileToNasAtomically -SourcePath $localPath -DestinationPath $nasPath

    $localHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $localPath).Hash
    $nasHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $nasPath).Hash
    if ($localHash -ne $nasHash) {
        throw "nas sync verification failed for $relativePath"
    }
}

$quoted = $normalizedPaths | ForEach-Object {
    $linuxPath = $_ -replace '\\', '/'
    "'" + ($linuxPath -replace "'", "'\\''") + "'"
}

$remoteCommand = "sudo -n /usr/local/bin/wardrobe-hot-deploy.sh " + ($quoted -join " ")

& $ssh `
    -p $targetPort `
    -o BatchMode=yes `
    -o StrictHostKeyChecking=yes `
    -o HostKeyAlgorithms=ssh-ed25519 `
    -o HostKeyAlias=192.168.10.99 `
    -i $keyPath `
    $target `
    $remoteCommand
