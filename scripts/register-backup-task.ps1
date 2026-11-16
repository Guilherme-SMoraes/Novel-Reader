param (
    [string]$Time = "23:00",
    [switch]$Unregister
)

$taskName = "NovelReader-Database-Backup"

if ($Unregister) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Scheduled task '$taskName' successfully removed."
    return
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupScript = Join-Path $scriptDir "backup-db.ps1"

if (!(Test-Path $backupScript)) {
    Write-Error "Backup script not found at '$backupScript'."
    exit 1
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$backupScript`""

$trigger = New-ScheduledTaskTrigger -Daily -At $Time

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Automated daily backup of NovelReader PostgreSQL database to Google Drive via Rclone." `
    -Force | Out-Null

Write-Host "Scheduled task '$taskName' registered successfully!"
Write-Host "Schedule: Daily at $Time"
Write-Host "Action: Runs $backupScript silently in background"
