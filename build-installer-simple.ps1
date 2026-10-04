$ErrorActionPreference = "Stop"

$PROJECT_ROOT = "C:\Users\yas\Downloads\مشاريع ثروت\tast tharwat"
$AGENT_PROJECT = "$PROJECT_ROOT\hardware-agent\src\YAS.HardwareAgent"
$PUBLISH_DIR = "$PROJECT_ROOT\hardware-agent\publish"
$INSTALLER_DIR = "$PROJECT_ROOT\installer"
$DOWNLOADS_DIR = "$PROJECT_ROOT\downloads"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "YAS Hardware Agent - Build Installer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Clean previous builds
if (Test-Path -Path $PUBLISH_DIR) {
    Remove-Item -Path $PUBLISH_DIR -Recurse -Force
}

# Publish the application
Write-Host "[i] Publishing YAS Hardware Agent..." -ForegroundColor Cyan
Push-Location $AGENT_PROJECT

$buildOutput = & dotnet publish -c Release -r win-x64 --self-contained -o "$PROJECT_ROOT\hardware-agent\publish" 2>&1
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Published successfully" -ForegroundColor Green

# Verify executable
$exePath = "$PUBLISH_DIR\YAS.HardwareAgent.exe"
if (-not (Test-Path -Path $exePath)) {
    Write-Host "[x] Executable not found!" -ForegroundColor Red
    exit 1
}

$exeSize = (Get-Item $exePath).Length / 1MB
Write-Host "[OK] Executable: $exePath ($('{0:N2}' -f $exeSize) MB)" -ForegroundColor Green

# Setup downloads directory
if (-not (Test-Path -Path $DOWNLOADS_DIR)) {
    New-Item -ItemType Directory -Path $DOWNLOADS_DIR -Force | Out-Null
}

# Create package directory
$packageDir = "$DOWNLOADS_DIR\YAS-Hardware-Agent-Setup"
if (Test-Path -Path $packageDir) {
    Remove-Item -Path $packageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

# Copy installer scripts
Copy-Item -Path "$INSTALLER_DIR\Install.bat" -Destination $packageDir -Force
Copy-Item -Path "$INSTALLER_DIR\Install-YASHardwareAgent.ps1" -Destination $packageDir -Force
Copy-Item -Path "$INSTALLER_DIR\setup-autostart.bat" -Destination $packageDir -Force
Copy-Item -Path "$INSTALLER_DIR\README.md" -Destination $packageDir -Force

Write-Host "[OK] Installer scripts copied" -ForegroundColor Green

# Copy application files
$appDestDir = "$packageDir\..\hardware-agent\publish"
New-Item -ItemType Directory -Path $appDestDir -Force | Out-Null
Copy-Item -Path "$PUBLISH_DIR\*" -Destination $appDestDir -Recurse -Force

Write-Host "[OK] Application files copied" -ForegroundColor Green

# Create version file
$versionInfo = @"
{
  "Version": "1.0.0",
  "BuildDate": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "Platform": "Windows x64",
  "Framework": ".NET 8.0",
  "SelfContained": true
}
"@
$versionInfo | Out-File -FilePath "$packageDir\VERSION.json" -Encoding UTF8 -Force

Write-Host "[OK] Version file created" -ForegroundColor Green

# Display summary
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "`nPackage Location:" -ForegroundColor Cyan
Write-Host "$packageDir`n" -ForegroundColor Yellow

Write-Host "Installation Methods:" -ForegroundColor Cyan
Write-Host "  1. Run Install.bat (requires Admin)" -ForegroundColor White
Write-Host "  2. Run in PowerShell:" -ForegroundColor White
Write-Host "     .\Install-YASHardwareAgent.ps1" -ForegroundColor Gray
Write-Host "`n"
