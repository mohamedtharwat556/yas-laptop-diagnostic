<#
.SYNOPSIS
    Build script for YAS Hardware Agent Installer
    
.DESCRIPTION
    Publishes the .NET agent and creates installer files
    
.EXAMPLE
    .\build-installer.ps1
#>

param(
    [switch]$BuildExe = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ROOT = Split-Path -Parent $PSCommandPath
$AGENT_PROJECT = "$PROJECT_ROOT\hardware-agent\src\YAS.HardwareAgent"
$PUBLISH_DIR = "$PROJECT_ROOT\hardware-agent\publish"
$INSTALLER_DIR = "$PROJECT_ROOT\installer"
$DOWNLOADS_DIR = "$PROJECT_ROOT\downloads"

# Colors
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Header {
    Write-Host "`n" + ("="*60) -ForegroundColor $InfoColor
    Write-Host $args[0] -ForegroundColor $InfoColor
    Write-Host ("="*60) -ForegroundColor $InfoColor
}

function Write-Success {
    Write-Host "[✓] $($args -join ' ')" -ForegroundColor $SuccessColor
}

function Write-Info {
    Write-Host "[i] $($args -join ' ')" -ForegroundColor $InfoColor
}

function Write-Warning-Custom {
    Write-Host "[!] $($args -join ' ')" -ForegroundColor $WarningColor
}

function Write-Error-Custom {
    Write-Host "[✗] $($args -join ' ')" -ForegroundColor $ErrorColor
}

# Main build logic
function Build-Installer {
    Write-Header "YAS Hardware Agent - Build Installer"
    
    # Check if project exists
    Write-Info "Checking project structure..."
    if (-not (Test-Path -Path $AGENT_PROJECT)) {
        Write-Error-Custom "Hardware agent project not found: $AGENT_PROJECT"
        return 1
    }
    Write-Success "Project found: $AGENT_PROJECT"
    
    # Clean previous builds
    Write-Info "Cleaning previous builds..."
    if (Test-Path -Path $PUBLISH_DIR) {
        Remove-Item -Path $PUBLISH_DIR -Recurse -Force
        Write-Success "Cleaned: $PUBLISH_DIR"
    }
    
    # Publish the application
    Write-Info "Publishing YAS Hardware Agent (.NET Release)..."
    Push-Location $AGENT_PROJECT
    
    try {
        # Build for Windows x64
        $buildOutput = dotnet publish -c Release -r win-x64 --self-contained -o "$PROJECT_ROOT\hardware-agent\publish" 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Build failed!"
            Write-Error-Custom $buildOutput
            return 1
        }
        
        Write-Success "Published successfully to: $PUBLISH_DIR"
    }
    finally {
        Pop-Location
    }
    
    # Verify executable
    $exePath = "$PUBLISH_DIR\YAS.HardwareAgent.exe"
    if (-not (Test-Path -Path $exePath)) {
        Write-Error-Custom "Published executable not found: $exePath"
        return 1
    }
    
    $exeSize = (Get-Item $exePath).Length / 1MB
    Write-Success "Executable created: $exePath ($([Math]::Round($exeSize, 2)) MB)"
    
    # Create downloads directory
    Write-Info "Setting up downloads directory..."
    if (-not (Test-Path -Path $DOWNLOADS_DIR)) {
        New-Item -ItemType Directory -Path $DOWNLOADS_DIR -Force | Out-Null
        Write-Success "Created: $DOWNLOADS_DIR"
    }
    
    # Copy installer files to downloads
    Write-Info "Preparing installer package..."
    
    # Create a distribution package
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
    
    Write-Success "Installer scripts copied"
    
    # Copy published application
    Write-Info "Copying application files to package..."
    $appDestDir = "$packageDir\..\hardware-agent\publish"
    New-Item -ItemType Directory -Path $appDestDir -Force | Out-Null
    Copy-Item -Path "$PUBLISH_DIR\*" -Destination $appDestDir -Recurse -Force
    Write-Success "Application files copied"
    
    # Create version file
    $versionFile = @"
{
  "Version": "1.0.0",
  "BuildDate": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "Platform": "Windows x64",
  "Framework": ".NET 8.0",
  "SelfContained": true,
  "RequiresAdministrator": false
}
"@
    $versionFile | Out-File -FilePath "$packageDir\VERSION.json" -Encoding UTF8 -Force
    Write-Success "Version file created"
    
    # Create checksum file
    Write-Info "Creating checksums..."
    $checksums = @()
    $checksums += "# YAS Hardware Agent Build Checksums"
    $checksums += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $checksums += ""
    
    Get-ChildItem -Path $packageDir -Recurse -File | ForEach-Object {
        $hash = (Get-FileHash -Path $_.FullName -Algorithm SHA256).Hash
        $checksums += "$($hash)  $($_.Name)"
    }
    
    $checksums | Out-File -FilePath "$packageDir\CHECKSUMS.txt" -Encoding UTF8 -Force
    Write-Success "Checksums generated"
    
    # Create portable installer script
    Write-Info "Creating portable installer..."
    $portableScript = @"
@echo off
REM Simple portable launcher for YAS Hardware Agent
REM This allows running the agent without full installation

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "EXECUTABLE=!SCRIPT_DIR!..\..\hardware-agent\publish\YAS.HardwareAgent.exe"

if not exist "!EXECUTABLE!" (
    echo Error: YAS.HardwareAgent.exe not found
    exit /b 1
)

echo Starting YAS Hardware Agent...
echo.
echo Agent will run on: http://127.0.0.1:5275
echo Press Ctrl+C to stop
echo.

start "YAS Hardware Agent" "!EXECUTABLE!"
"@
    $portableScript | Out-File -FilePath "$packageDir\Run-Agent.bat" -Encoding ASCII -Force
    Write-Success "Portable launcher created"
    
    # Display summary
    Write-Header "Build Complete!"
    Write-Host "`nPackage Location: $packageDir`n" -ForegroundColor $SuccessColor
    
    Write-Host "Package Contents:" -ForegroundColor $InfoColor
    Get-ChildItem -Path $packageDir -Recurse | ForEach-Object {
        $indent = "  " * ($_.FullName.Split([io.path]::DirectorySeparatorChar).Count - $packageDir.Split([io.path]::DirectorySeparatorChar).Count)
        if ($_.PSIsContainer) {
            Write-Host "$indent📁 $($_.Name)/"
        }
        else {
            $size = if ($_.Length -gt 1MB) {
                "$([Math]::Round($_.Length / 1MB, 2)) MB"
            }
            elseif ($_.Length -gt 1KB) {
                "$([Math]::Round($_.Length / 1KB, 1)) KB"
            }
            else {
                "$($_.Length) B"
            }
            Write-Host "$indent📄 $($_.Name) ($size)"
        }
    }
    
    Write-Host "`nNext Steps:" -ForegroundColor $InfoColor
    Write-Host "  1. Copy the entire folder to distribution media"
    Write-Host "  2. Users run: Install.bat (requires Admin)"
    Write-Host "  3. Or manually run: Run-Agent.bat (portable mode)"
    
    Write-Host "`nInstaller Ready at: $packageDir`n" -ForegroundColor $SuccessColor
    
    return 0
}

# Entry point
try {
    $result = Build-Installer
    exit $result
}
catch {
    Write-Error-Custom "Build failed: $_"
    exit 1
}
