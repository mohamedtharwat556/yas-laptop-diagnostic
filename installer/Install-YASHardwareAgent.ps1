#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installer for YAS Hardware Agent
    
.DESCRIPTION
    This script installs YAS Hardware Agent, sets up auto-start,
    and verifies the installation.
    
.EXAMPLE
    .\Install-YASHardwareAgent.ps1
    
.NOTES
    Requires Administrator privileges
    Version: 1.0.0
#>

param(
    [switch]$Silent = $false,
    [string]$InstallPath = "C:\Program Files\YAS Hardware Agent"
)

# Configuration
$APP_NAME = "YAS Hardware Agent"
$APP_VERSION = "1.0.0"
$APP_EXECUTABLE = "YAS.HardwareAgent.exe"
$AGENT_URL = "http://127.0.0.1:5275/api/health"
$AGENT_PORT = 5275
$TASK_NAME = "YAS Hardware Agent"
$SOURCE_DIR = "$PSScriptRoot\..\hardware-agent\publish"

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Header {
    param([string]$Message)
    Write-Host "`n" + ("="*60) -ForegroundColor $InfoColor
    Write-Host $Message -ForegroundColor $InfoColor
    Write-Host ("="*60) -ForegroundColor $InfoColor
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

# Main installation logic
function Install-HardwareAgent {
    Write-Header "$APP_NAME Installation Script v$APP_VERSION"
    
    # Check if already running as administrator
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal $currentUser
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Error-Custom "This script requires Administrator privileges!"
        Write-Info "Please run PowerShell as Administrator and try again."
        exit 1
    }
    
    Write-Success "Running with Administrator privileges"
    
    # Verify source files exist
    Write-Info "Verifying installation files..."
    if (-not (Test-Path -Path $SOURCE_DIR)) {
        Write-Error-Custom "Source directory not found: $SOURCE_DIR"
        exit 1
    }
    
    if (-not (Test-Path -Path "$SOURCE_DIR\$APP_EXECUTABLE")) {
        Write-Error-Custom "Application executable not found: $SOURCE_DIR\$APP_EXECUTABLE"
        exit 1
    }
    
    Write-Success "Installation files found"
    
    # Create installation directory
    Write-Info "Creating installation directory: $InstallPath"
    if (Test-Path -Path $InstallPath) {
        Write-Warning-Custom "Installation directory already exists. Backing up..."
        $backupPath = "$InstallPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Rename-Item -Path $InstallPath -NewName $backupPath -Force
        Write-Info "Backed up to: $backupPath"
    }
    
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Success "Installation directory created"
    
    # Copy application files
    Write-Info "Copying application files..."
    Copy-Item -Path "$SOURCE_DIR\*" -Destination $InstallPath -Recurse -Force
    Write-Success "Application files copied"
    
    # Copy setup batch file
    Write-Info "Copying setup utilities..."
    $setupBatch = "$PSScriptRoot\setup-autostart.bat"
    if (Test-Path -Path $setupBatch) {
        Copy-Item -Path $setupBatch -Destination $InstallPath -Force
        Write-Success "Setup utilities copied"
    }
    
    # Create uninstaller script
    Write-Info "Creating uninstaller..."
    $uninstallerPath = "$InstallPath\Uninstall.ps1"
    @"
#Requires -RunAsAdministrator
<#
    Uninstaller for YAS Hardware Agent
#>

# Configuration
`$INSTALL_PATH = "$InstallPath"
`$TASK_NAME = "YAS Hardware Agent"
`$APP_EXECUTABLE = "$APP_EXECUTABLE"

# Stop running instance
Write-Host "Stopping $APP_EXECUTABLE..."
Get-Process $APP_EXECUTABLE -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove scheduled task
Write-Host "Removing scheduled task..."
schtasks /delete /tn "`$TASK_NAME" /f 2>nul

# Remove from Registry Run key
Write-Host "Removing from Registry Run key..."
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "`$TASK_NAME" /f 2>nul

# Remove installation directory
Write-Host "Removing installation directory..."
Remove-Item -Path `$INSTALL_PATH -Recurse -Force -ErrorAction SilentlyContinue

# Remove registry entries
Write-Host "Removing registry entries..."
Remove-Item -Path "HKCU:\Software\YAS\HardwareAgent" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent" -Force -ErrorAction SilentlyContinue

# Remove shortcuts
Write-Host "Removing shortcuts..."
Remove-Item -Path "`$PROFILE\..\Desktop\YAS Hardware Agent.lnk" -Force -ErrorAction SilentlyContinue

Write-Host "Uninstallation complete!"
"@ | Out-File -FilePath $uninstallerPath -Encoding UTF8 -Force
    Write-Success "Uninstaller created"
    
    # Setup registry entries
    Write-Info "Setting up registry entries..."
    $regPath = "HKCU:\Software\YAS\HardwareAgent"
    if (-not (Test-Path -Path "HKCU:\Software\YAS")) {
        New-Item -Path "HKCU:\Software" -Name "YAS" -Force | Out-Null
    }
    if (-not (Test-Path -Path $regPath)) {
        New-Item -Path "HKCU:\Software\YAS" -Name "HardwareAgent" -Force | Out-Null
    }
    
    New-ItemProperty -Path $regPath -Name "InstallLocation" -Value $InstallPath -PropertyType String -Force | Out-Null
    New-ItemProperty -Path $regPath -Name "Version" -Value $APP_VERSION -PropertyType String -Force | Out-Null
    New-ItemProperty -Path $regPath -Name "Path" -Value "$InstallPath\$APP_EXECUTABLE" -PropertyType String -Force | Out-Null
    Write-Success "Registry entries created"
    
    # Setup auto-start via Task Scheduler (Primary method - more reliable)
    Write-Info "Setting up auto-start via Task Scheduler..."
    $taskDescription = "$APP_NAME - Starts automatically with Windows"
    $taskAction = New-ScheduledTaskAction -Execute "$InstallPath\$APP_EXECUTABLE" -WorkingDirectory $InstallPath
    $taskTrigger = New-ScheduledTaskTrigger -AtStartup
    $taskSettings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
    $taskPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest
    
    # Remove existing task if it exists
    Unregister-ScheduledTask -TaskName $TASK_NAME -Confirm:$false -ErrorAction SilentlyContinue
    
    # Register new task
    Register-ScheduledTask -TaskName $TASK_NAME `
        -Action $taskAction `
        -Trigger $taskTrigger `
        -Settings $taskSettings `
        -Principal $taskPrincipal `
        -Description $taskDescription `
        -Force | Out-Null
    
    Write-Success "Auto-start scheduled task created"
    
    # Setup auto-start via Registry Run key (Secondary method - user login)
    Write-Info "Setting up auto-start via Registry Run key..."
    $regRunPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    New-ItemProperty -Path $regRunPath -Name $TASK_NAME -Value "`"$InstallPath\$APP_EXECUTABLE`"" -PropertyType String -Force | Out-Null
    Write-Success "Registry Run key configured"
    
    # Start the agent
    Write-Info "Starting $APP_NAME..."
    try {
        Start-Process -FilePath "$InstallPath\$APP_EXECUTABLE" -WorkingDirectory $InstallPath -WindowStyle Hidden
        Write-Success "Application started"
        
        # Wait for agent to initialize
        Write-Info "Waiting for agent to initialize (10 seconds)..."
        Start-Sleep -Seconds 10
    }
    catch {
        Write-Error-Custom "Failed to start application: $_"
        exit 1
    }
    
    # Verify installation
    Write-Info "Verifying installation..."
    $maxAttempts = 10
    $attempt = 0
    $agentRunning = $false
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $AGENT_URL -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $agentRunning = $true
                break
            }
        }
        catch {
            # Agent not responding yet, retry
        }
        
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Info "Attempt $attempt/$maxAttempts - Retrying in 1 second..."
            Start-Sleep -Seconds 1
        }
    }
    
    if ($agentRunning) {
        Write-Success "Agent verification successful!"
        Write-Info "Agent is running on: $AGENT_URL"
    }
    else {
        Write-Warning-Custom "Agent verification timed out"
        Write-Info "The agent may still be starting. Please wait a moment and check manually."
        Write-Info "Check status at: $AGENT_URL"
    }
    
    # Display installation summary
    Write-Header "Installation Complete!"
    Write-Host "`n$APP_NAME has been installed successfully!`n" -ForegroundColor $SuccessColor
    Write-Host "Installation Details:" -ForegroundColor $InfoColor
    Write-Host "  Location:  $InstallPath"
    Write-Host "  Version:   $APP_VERSION"
    Write-Host "  Agent URL: $AGENT_URL"
    Write-Host "  Status:    " -NoNewline
    
    if ($agentRunning) {
        Write-Host "✓ Running" -ForegroundColor $SuccessColor
    }
    else {
        Write-Host "⧖ Starting..." -ForegroundColor $WarningColor
    }
    
    Write-Host "`nNext Steps:" -ForegroundColor $InfoColor
    Write-Host "  1. Return to https://yas-laptop-diagnostic.vercel.app"
    Write-Host "  2. Click 'Verify Installation' on the download page"
    Write-Host "  3. Once verified, run the diagnostic"
    Write-Host "  4. The agent will automatically start on Windows restart"
    
    Write-Host "`n" + ("="*60) -ForegroundColor $InfoColor
    
    return 0
}

# Entry point
try {
    $result = Install-HardwareAgent
    exit $result
}
catch {
    Write-Error-Custom "Installation failed: $_"
    exit 1
}
