param(
    [string]$TaskName = "Wardrobe Local Dev Service",
    [string]$WatchdogTaskName = "Wardrobe Local Dev Watchdog",
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$HostName = "0.0.0.0",
    [int]$Port = 8765,
    [switch]$Start
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$supervisor = Join-Path $ProjectRoot "scripts\start-local-dev-supervisor.ps1"
if (-not (Test-Path -LiteralPath $supervisor -PathType Leaf)) {
    throw "supervisor script not found: $supervisor"
}
$watchdog = Join-Path $ProjectRoot "scripts\watchdog-local-dev-service.ps1"
if (-not (Test-Path -LiteralPath $watchdog -PathType Leaf)) {
    throw "watchdog script not found: $watchdog"
}

$userId = "{0}\{1}" -f $env:USERDOMAIN, $env:USERNAME
$argument = "-WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File `"$supervisor`" -ProjectRoot `"$ProjectRoot`" -HostName `"$HostName`" -Port $Port"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argument -WorkingDirectory $ProjectRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $userId
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable `
    -ExecutionTimeLimit ([TimeSpan]::Zero)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Runs the Wardrobe local development server under the current xuxin user with supervisor restart." -Force | Out-Null

$watchdogArgument = "-WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File `"$watchdog`" -TaskName `"$TaskName`" -Port $Port"
$watchdogAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $watchdogArgument -WorkingDirectory $ProjectRoot
$watchdogTriggers = @(
    (New-ScheduledTaskTrigger -AtLogOn -User $userId),
    (New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650))
)
$watchdogSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName $WatchdogTaskName -Action $watchdogAction -Trigger $watchdogTriggers -Principal $principal -Settings $watchdogSettings -Description "Restarts the Wardrobe local development server when port $Port is not healthy." -Force | Out-Null

if ($Start) {
    Start-ScheduledTask -TaskName $TaskName
}

Get-ScheduledTask -TaskName $TaskName, $WatchdogTaskName | Select-Object TaskName, TaskPath, State
