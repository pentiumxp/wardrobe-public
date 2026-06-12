function Get-BackupFileTimestamp {
  param(
    [Parameter(Mandatory = $true)][System.IO.FileInfo]$File,
    [Parameter(Mandatory = $true)][string]$Prefix,
    [Parameter(Mandatory = $true)][string]$Suffix
  )

  $escapedPrefix = [Regex]::Escape($Prefix)
  $escapedSuffix = [Regex]::Escape($Suffix)
  $match = [Regex]::Match($File.Name, "^${escapedPrefix}(?<stamp>\d{8}_\d{6})${escapedSuffix}$")
  if ($match.Success) {
    try {
      $parsed = [datetime]::ParseExact($match.Groups['stamp'].Value, 'yyyyMMdd_HHmmss', [System.Globalization.CultureInfo]::InvariantCulture)
      return $parsed
    }
    catch {
      return $File.LastWriteTime
    }
  }
  return $File.LastWriteTime
}

function Invoke-DailyBackupRetention {
  param(
    [Parameter(Mandatory = $true)][string]$Directory,
    [Parameter(Mandatory = $true)][string]$Prefix,
    [Parameter(Mandatory = $true)][string]$Suffix,
    [int]$KeepDays = 3
  )

  if ($KeepDays -lt 1) {
    throw "KeepDays must be >= 1."
  }
  if (-not (Test-Path -LiteralPath $Directory)) {
    throw "Directory not found: $Directory"
  }

  $cutoffDate = (Get-Date).Date.AddDays(-($KeepDays - 1))
  $candidates = Get-ChildItem -LiteralPath $Directory -File | Where-Object {
    $_.Name.StartsWith($Prefix) -and $_.Name.EndsWith($Suffix)
  } | ForEach-Object {
    [PSCustomObject]@{
      File = $_
      Timestamp = Get-BackupFileTimestamp -File $_ -Prefix $Prefix -Suffix $Suffix
    }
  }

  $keepMap = @{}
  foreach ($entry in $candidates | Sort-Object Timestamp -Descending) {
    $dateKey = $entry.Timestamp.Date.ToString('yyyy-MM-dd')
    if ($entry.Timestamp.Date -lt $cutoffDate) {
      continue
    }
    if (-not $keepMap.ContainsKey($dateKey)) {
      $keepMap[$dateKey] = $entry.File.FullName
    }
  }

  $deleted = New-Object System.Collections.Generic.List[string]
  foreach ($entry in $candidates) {
    $dateKey = $entry.Timestamp.Date.ToString('yyyy-MM-dd')
    $shouldKeep = $keepMap.ContainsKey($dateKey) -and $keepMap[$dateKey] -eq $entry.File.FullName
    if (-not $shouldKeep) {
      Remove-Item -LiteralPath $entry.File.FullName -Force
      $deleted.Add($entry.File.FullName)
    }
  }

  return [PSCustomObject]@{
    Directory = $Directory
    Prefix = $Prefix
    Suffix = $Suffix
    KeepDays = $KeepDays
    CutoffDate = $cutoffDate
    KeptFiles = @($keepMap.Values | Sort-Object)
    DeletedFiles = @($deleted)
  }
}
