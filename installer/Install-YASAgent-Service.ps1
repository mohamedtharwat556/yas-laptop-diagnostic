#Requires -RunAsAdministrator
<#
.SYNOPSIS
    YAS Hardware Agent - Windows Service Installer
    
.DESCRIPTION
    Installs YAS Hardware Agent as a proper Windows Service (not scheduled task).
    The service will start automatically with Windows and restart on failure.
    
.EXAMPLE
    .\Install-YASAgent-Service.ps1
    
.NOTES
    Requires Administrator privileges
    Version: 1.0.0
#>

param(
    [switch]$Uninstall = $false,
    [string]$InstallPath = "C:\Program Files\YAS Hardware Agent"
)

# Configuration
$APP_NAME = "YAS Hardware Agent"
$APP_VERSION = "1.0.0"
$SERVICE_NAME = "YASHardwareAgent"
$DISPLAY_NAME = "YAS Hardware Agent"
$APP_EXECUTABLE = "YAS.HardwareAgent.exe"
$AGENT_URL = "http://127.0.0.1:5275/api/health"
$AGENT_PORT = 5275

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Header {
    param([string]$Message)
    Write-Host "`n" + ("="*70) -ForegroundColor $InfoColor
    Write-Host $Message -ForegroundColor $InfoColor
    Write-Host ("="*70) -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor $SuccessColor
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor $ErrorColor
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor $InfoColor
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor $WarningColor
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal $currentUser
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Uninstall-Service {
    Write-Header "Uninstalling $APP_NAME Service"
    
    # Check if service exists
    $service = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    
    if ($service) {
        Write-Info "Found service: $SERVICE_NAME"
        
        # Stop service
        Write-Info "Stopping service..."
        try {
            Stop-Service -Name $SERVICE_NAME -Force -ErrorAction Stop
            Write-Success "Service stopped"
        }
        catch {
            Write-Warning-Custom "Could not stop service: $_"
        }
        
        # Remove service
        Write-Info "Removing service..."
        try {
            sc.exe delete $SERVICE_NAME | Out-Null
            Start-Sleep -Seconds 2
            Write-Success "Service removed from Windows"
        }
        catch {
            Write-Error-Custom "Failed to remove service: $_"
            return 1
        }
    }
    else {
        Write-Info "Service not found"
    }
    
    # Remove installation directory
    if (Test-Path $InstallPath) {
        Write-Info "Removing installation directory..."
        try {
            Remove-Item -Path $InstallPath -Recurse -Force -ErrorAction Stop
            Write-Success "Installation directory removed"
        }
        catch {
            Write-Warning-Custom "Could not remove directory: $_"
        }
    }
    
    # Remove registry entries
    Write-Info "Cleaning registry..."
    $regPaths = @(
        "HKCU:\Software\YAS\HardwareAgent",
        "HKLM:\SYSTEM\CurrentControlSet\Services\$SERVICE_NAME"
    )
    
    foreach ($regPath in $regPaths) {
        if (Test-Path $regPath) {
            try {
                Remove-Item -Path $regPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Success "Registry cleaned: $regPath"
            }
            catch {
                Write-Warning-Custom "Could not clean: $regPath"
            }
        }
    }
    
    Write-Header "Uninstallation Complete"
    return 0
}

function Install-Service {
    Write-Header "$APP_NAME Service Installer v$APP_VERSION"
    
    # Verify administrator
    if (-not (Test-Administrator)) {
        Write-Error-Custom "This script requires Administrator privileges!"
        Write-Info "Please run PowerShell as Administrator"
        exit 1
    }
    Write-Success "Running with Administrator privileges"
    
    # Determine source directory
    Write-Info "Locating executable files..."
    
    $possiblePaths = @(
        "$PSScriptRoot\..\downloads\YAS-Hardware-Agent-Setup",
        "$PSScriptRoot\..\hardware-agent\publish",
        (Split-Path -Parent $PSScriptRoot) + "\hardware-agent\publish",
        $PSScriptRoot
    )
    
    $sourceDir = $null
    foreach ($path in $possiblePaths) {
        if ((Test-Path $path) -and (Test-Path "$path\$APP_EXECUTABLE")) {
            $sourceDir = $path
            break
        }
    }
    
    if (-not $sourceDir) {
        Write-Error-Custom "Executable not found in any expected location!"
        Write-Info "Searched paths:"
        $possiblePaths | ForEach-Object { Write-Info "  - $_" }
        exit 1
    }
    
    Write-Success "Found executable in: $sourceDir"
    
    # Create installation directory
    Write-Info "Creating installation directory: $InstallPath"
    if (Test-Path $InstallPath) {
        Write-Warning-Custom "Directory already exists"
        $backupPath = "$InstallPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Write-Info "Backing up to: $backupPath"
        Rename-Item -Path $InstallPath -NewName $backupPath -Force -ErrorAction SilentlyContinue
    }
    
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Success "Directory created"
    
    # Copy files
    Write-Info "Copying application files..."
    Copy-Item -Path "$sourceDir\*" -Destination $InstallPath -Recurse -Force -ErrorAction Stop
    Write-Success "Files copied"
    
    # Verify executable exists
    if (-not (Test-Path "$InstallPath\$APP_EXECUTABLE")) {
        Write-Error-Custom "Executable not found after copy: $InstallPath\$APP_EXECUTABLE"
        exit 1
    }
    Write-Success "Executable verified: $InstallPath\$APP_EXECUTABLE"
    
    # Register registry entries
    Write-Info "Setting up registry entries..."
    $regPath = "HKCU:\Software\YAS\HardwareAgent"
    
    if (-not (Test-Path "HKCU:\Software\YAS")) {
        New-Item -Path "HKCU:\Software" -Name "YAS" -Force | Out-Null
    }
    
    if (-not (Test-Path $regPath)) {
        New-Item -Path "HKCU:\Software\YAS" -Name "HardwareAgent" -Force | Out-Null
    }
    
    New-ItemProperty -Path $regPath -Name "InstallLocation" -Value $InstallPath -PropertyType String -Force | Out-Null
    New-ItemProperty -Path $regPath -Name "Version" -Value $APP_VERSION -PropertyType String -Force | Out-Null
    New-ItemProperty -Path $regPath -Name "Path" -Value "$InstallPath\$APP_EXECUTABLE" -PropertyType String -Force | Out-Null
    Write-Success "Registry entries created"
    
    # Remove existing service if it exists
    Write-Info "Checking for existing service..."
    $existingService = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Warning-Custom "Existing service found"
        Write-Info "Stopping service..."
        Stop-Service -Name $SERVICE_NAME -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-Info "Removing existing service..."
        sc.exe delete $SERVICE_NAME | Out-Null
        Start-Sleep -Seconds 2
        Write-Success "Existing service removed"
    }
    
    # Create Windows Service
    Write-Header "Creating Windows Service"
    
    $exePath = "$InstallPath\$APP_EXECUTABLE"
    Write-Info "Service Name: $SERVICE_NAME"
    Write-Info "Display Name: $DISPLAY_NAME"
    Write-Info "Executable: $exePath"
    Write-Info "Startup Type: Automatic"
    Write-Info "Recovery: Automatic restart on failure"
    
    try {
        # Create service using sc.exe
        $scOutput = & sc.exe create $SERVICE_NAME `
            binPath= "`"$exePath`"" `
            DisplayName= "$DISPLAY_NAME" `
            start= auto `
            type= own 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to create service: $scOutput"
            exit 1
        }
        Write-Success "Service created successfully"
    }
    catch {
        Write-Error-Custom "Exception creating service: $_"
        exit 1
    }
    
    # Configure service recovery (auto-restart on failure)
    Write-Info "Configuring automatic restart on failure..."
    try {
        # Set recovery actions: Restart after 5 seconds, restart program
        sc.exe failure $SERVICE_NAME reset= 300 actions= restart/5000/restart/5000/restart/5000 | Out-Null
        Write-Success "Recovery configured"
    }
    catch {
        Write-Warning-Custom "Could not configure recovery: $_"
    }
    
    # Start service
    Write-Info "Starting service..."
    try {
        Start-Service -Name $SERVICE_NAME -ErrorAction Stop
        Write-Success "Service started"
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Warning-Custom "Could not start service: $_"
        Write-Info "This may be normal if service needs time to initialize"
    }
    
    # Verify service
    Write-Header "Verifying Service Installation"
    
    $service = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    if ($service) {
        Write-Success "Service found: $($service.DisplayName)"
        Write-Success "Status: $($service.Status)"
        Write-Success "Startup Type: $($service.StartType)"
    }
    else {
        Write-Error-Custom "Service not found after creation"
        exit 1
    }
    
    # Test port
    Write-Info "Testing port $AGENT_PORT (waiting 5 seconds)..."
    Start-Sleep -Seconds 5
    
    $portOpen = $false
    for ($i = 0; $i -lt 3; $i++) {
        try {
            $connection = Test-NetConnection -ComputerName 127.0.0.1 -Port $AGENT_PORT -WarningAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                $portOpen = $true
                Write-Success "Port $AGENT_PORT is listening"
                break
            }
        }
        catch {
            Write-Info "Port check attempt $($i+1)/3 failed, retrying..."
            Start-Sleep -Seconds 2
        }
    }
    
    if (-not $portOpen) {
        Write-Warning-Custom "Port $AGENT_PORT is not responding"
        Write-Info "This may indicate the service is still starting up"
    }
    
    # Test API endpoint
    Write-Info "Testing API endpoint (waiting 5 seconds)..."
    Start-Sleep -Seconds 5
    
    $apiWorking = $false
    for ($i = 0; $i -lt 3; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $AGENT_URL -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $apiWorking = $true
                Write-Success "API endpoint responding: $AGENT_URL"
                break
            }
        }
        catch {
            Write-Info "API check attempt $($i+1)/3 failed, retrying..."
            Start-Sleep -Seconds 2
        }
    }
    
    if (-not $apiWorking) {
        Write-Warning-Custom "API endpoint not responding"
        Write-Info "Service may still be initializing"
    }
    
    # Summary
    Write-Header "Installation Complete!"
    Write-Host "`n$APP_NAME has been installed as a Windows Service!`n" -ForegroundColor $SuccessColor
    
    Write-Host "Service Details:" -ForegroundColor $InfoColor
    Write-Host "  Service Name:    $SERVICE_NAME"
    Write-Host "  Display Name:    $DISPLAY_NAME"
    Write-Host "  Location:        $InstallPath"
    Write-Host "  Version:         $APP_VERSION"
    Write-Host "  Status:          $($service.Status)"
    Write-Host "  Startup Type:    $($service.StartType)"
    Write-Host "  Agent URL:       $AGENT_URL"
    Write-Host ""
    
    Write-Host "Next Steps:" -ForegroundColor $InfoColor
    Write-Host "  1. Service will start automatically with Windows"
    Write-Host "  2. Service will auto-restart if it crashes"
    Write-Host "  3. Open browser: https://yas-laptop-diagnostic.vercel.app"
    Write-Host "  4. Agent will auto-detect and connect"
    Write-Host ""
    
    Write-Host "Troubleshooting:" -ForegroundColor $InfoColor
    Write-Host "  View service status:"
    Write-Host "    Get-Service $SERVICE_NAME"
    Write-Host ""
    Write-Host "  View service logs:"
    Write-Host "    Get-EventLog -LogName Application -Source '$DISPLAY_NAME' -Newest 10"
    Write-Host ""
    Write-Host "  Restart service:"
    Write-Host "    Restart-Service $SERVICE_NAME"
    Write-Host ""
    Write-Host "  Uninstall service:"
    Write-Host "    $PSCommandPath -Uninstall"
    Write-Host ""
    
    return 0
}

# Main execution
try {
    if ($Uninstall) {
        $result = Uninstall-Service
    }
    else {
        $result = Install-Service
    }
    exit $result
}
catch {
    Write-Error-Custom "Fatal error: $_"
    exit 1
}
