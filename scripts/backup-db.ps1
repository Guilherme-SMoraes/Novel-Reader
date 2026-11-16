param (
    [string]$RemoteName = "gdrive",
    [string]$RemoteFolder = "Backups/NovelReader",
    [int]$MaxBackups = 3,
    [string]$ContainerName = "novelreader-db",
    [string]$DbName = "novelreader",
    [string]$DbUser = "postgres"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$rcloneExe = Join-Path $projectRoot "tools\rclone\rclone.exe"

if (!(Test-Path $rcloneExe)) {
    Write-Error "Rclone executable not found at '$rcloneExe'."
    exit 1
}

# 1. Verify container is running
Write-Host "[1/4] Checking PostgreSQL container '$ContainerName'..."
$running = docker ps --filter "name=$ContainerName" --filter "status=running" -q
if (!$running) {
    Write-Error "PostgreSQL container '$ContainerName' is not running. Please start it with 'docker compose up -d'."
    exit 1
}

# 2. Generate dump inside Docker container
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$fileName = "novelreader_backup_${timestamp}.dump"
$tempDir = [System.IO.Path]::GetTempPath()
$tempLocalPath = Join-Path $tempDir $fileName

Write-Host "[2/4] Creating database dump ($fileName)..."
docker exec $ContainerName pg_dump -U $DbUser -d $DbName -F c -b -f /tmp/backup.dump
if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed."
    exit 1
}

docker cp "${ContainerName}:/tmp/backup.dump" $tempLocalPath
docker exec $ContainerName rm -f /tmp/backup.dump

# 3. Upload to Google Drive via Rclone
Write-Host "[3/4] Uploading dump to Google Drive (${RemoteName}:${RemoteFolder})..."
& $rcloneExe copy $tempLocalPath "${RemoteName}:${RemoteFolder}"
if ($LASTEXITCODE -ne 0) {
    Remove-Item $tempLocalPath -Force -ErrorAction SilentlyContinue
    Write-Error "Rclone upload failed. Verify remote authorization with: $rcloneExe config"
    exit 1
}

Remove-Item $tempLocalPath -Force -ErrorAction SilentlyContinue

# 4. Enforce retention (keep only the latest $MaxBackups)
Write-Host "[4/4] Checking backup retention (max $MaxBackups)..."
$remoteFiles = & $rcloneExe lsf --files-only "${RemoteName}:${RemoteFolder}"
if ($remoteFiles) {
    # Sort files chronologically by filename (which uses yyyy-MM-dd_HH-mm-ss)
    $sortedFiles = $remoteFiles | Where-Object { $_ -like "novelreader_backup_*.dump" } | Sort-Object
    if ($sortedFiles.Count -gt $MaxBackups) {
        $deleteCount = $sortedFiles.Count - $MaxBackups
        $filesToDelete = $sortedFiles | Select-Object -First $deleteCount
        foreach ($oldFile in $filesToDelete) {
            Write-Host "Removing old backup: $oldFile"
            & $rcloneExe delete "${RemoteName}:${RemoteFolder}/$oldFile"
        }
    }
}

Write-Host "Backup completed successfully! Current backups in ${RemoteName}:${RemoteFolder}:"
& $rcloneExe lsf --files-only "${RemoteName}:${RemoteFolder}"
