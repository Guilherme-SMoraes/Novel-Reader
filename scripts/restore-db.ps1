param (
    [string]$RemoteName = "gdrive",
    [string]$RemoteFolder = "Backups/NovelReader",
    [string]$BackupFileName = "",
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

# 2. Identify backup to restore
if ([string]::IsNullOrWhiteSpace($BackupFileName)) {
    Write-Host "[2/4] Finding most recent backup on Google Drive..."
    $remoteFiles = & $rcloneExe lsf --files-only "${RemoteName}:${RemoteFolder}"
    $sortedFiles = $remoteFiles | Where-Object { $_ -like "novelreader_backup_*.dump" } | Sort-Object
    if (!$sortedFiles -or $sortedFiles.Count -eq 0) {
        Write-Error "No backups found in '${RemoteName}:${RemoteFolder}'."
        exit 1
    }
    $targetFile = $sortedFiles[-1]
    Write-Host "Selected latest backup: $targetFile"
} else {
    $targetFile = $BackupFileName
}

# 3. Download backup from Google Drive
$tempDir = [System.IO.Path]::GetTempPath()
$tempLocalPath = Join-Path $tempDir $targetFile

Write-Host "[3/4] Downloading $targetFile from Google Drive..."
& $rcloneExe copy "${RemoteName}:${RemoteFolder}/$targetFile" $tempDir
if (!(Test-Path $tempLocalPath)) {
    Write-Error "Failed to download $targetFile."
    exit 1
}

# 4. Restore inside PostgreSQL container
Write-Host "[4/4] Restoring database from $targetFile..."
docker cp $tempLocalPath "${ContainerName}:/tmp/restore.dump"
Remove-Item $tempLocalPath -Force -ErrorAction SilentlyContinue

# Terminate active client connections to allow clean restore
docker exec -i $ContainerName psql -U $DbUser -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DbName' AND pid <> pg_backend_pid();"

# Run pg_restore
docker exec -i $ContainerName pg_restore -U $DbUser -d $DbName --clean --if-exists /tmp/restore.dump
docker exec $ContainerName rm -f /tmp/restore.dump

Write-Host "Database restore completed successfully from $targetFile!"
