param(
    [string]$TaskName = "Wardrobe Local Dev Service",
    [int]$Port = 8765,
    [string]$ProbeUrl = "http://127.0.0.1:8765/api/app-version",
    [int]$ProbeTimeoutSeconds = 5
)

$ErrorActionPreference = "Stop"

function Test-WardrobeLocalDevListening {
    $listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $Port }
    if (-not $listeners) {
        return $false
    }

    try {
        $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec $ProbeTimeoutSeconds -Uri $ProbeUrl
        return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
    } catch {
        return $false
    }
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -eq $task) {
    throw "scheduled task not found: $TaskName"
}

if (Test-WardrobeLocalDevListening) {
    exit 0
}

if ($task.State -eq "Running") {
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Start-ScheduledTask -TaskName $TaskName
