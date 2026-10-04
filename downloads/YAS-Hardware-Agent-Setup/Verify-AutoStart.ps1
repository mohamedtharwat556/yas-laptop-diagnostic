#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Verify that YAS Hardware Agent auto-start is configured correctly
    
.DESCRIPTION
    Checks Task Scheduler, registry, and actual process to verify auto-start
    
.EXAMPLE
    .\Verify-AutoStart.ps1
#>

$ErrorActionPreference = "Continue"

$TASK_NAME = "YAS Hardware Agent"
$APP_EXECUTABLE = "YAS.HardwareAgent.exe"
$AGENT_URL = "http://127.0.0.1:5275/api/health"

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "YAS Hardware Agent - Auto-Start Verification" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

# Check 1: Task Scheduler Task
Write-Host "`n[1] Checking Task Scheduler..." -ForegroundColor Cyan
$task = Get-ScheduledTask -TaskName $TASK_NAME -ErrorAction SilentlyContinue

if ($task) {
    Write-Host "[OK] Task found: $($task.TaskName)" -ForegroundColor Green
    Write-Host "     State: $($task.State)" -ForegroundColor Cyan
    Write-Host "     Path: $($task.TaskPath)" -ForegroundColor Cyan
    
    $taskAction = $task.Actions[0]
    if ($taskAction) {
        Write-Host "     Executable: $($taskAction.Execute)" -ForegroundColor Cyan
        Write-Host "     Working Dir: $($taskAction.WorkingDirectory)" -ForegroundColor Cyan
    }
}
else {
    Write-Host "[ERROR] Task not found!" -ForegroundColor Red
}

# Check 2: Registry
Write-Host "`n[2] Checking Registry..." -ForegroundColor Cyan
$regPath = "HKCU:\Software\YAS\HardwareAgent"

if (Test-Path -Path $regPath) {
    Write-Host "[OK] Registry key found" -ForegroundColor Green
    
    $props = Get-ItemProperty -Path $regPath
    if ($props.InstallLocation) {
        Write-Host "     Install Location: $($props.InstallLocation)" -ForegroundColor Cyan
    }
    if ($props.Version) {
        Write-Host "     Version: $($props.Version)" -ForegroundColor Cyan
    }
    if ($props.Path) {
        Write-Host "     Executable Path: $($props.Path)" -ForegroundColor Cyan
        
        if (Test-Path -Path $props.Path) {
            Write-Host "     [OK] Executable exists" -ForegroundColor Green
        }
        else {
            Write-Host "     [ERROR] Executable not found!" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "[WARNING] Registry key not found" -ForegroundColor Yellow
}

# Check 3: Running Process
Write-Host "`n[3] Checking Running Process..." -ForegroundColor Cyan
$process = Get-Process -Name $APP_EXECUTABLE -ErrorAction SilentlyContinue

if ($process) {
    Write-Host "[OK] Process is running" -ForegroundColor Green
    Write-Host "     PID: $($process.Id)" -ForegroundColor Cyan
    Write-Host "     Memory: $([Math]::Round($process.WorkingSet / 1MB, 2)) MB" -ForegroundColor Cyan
    Write-Host "     Start Time: $($process.StartTime)" -ForegroundColor Cyan
}
else {
    Write-Host "[WARNING] Process not running" -ForegroundColor Yellow
}

# Check 4: Agent Health
Write-Host "`n[4] Checking Agent Health Endpoint..." -ForegroundColor Cyan

$attempt = 0
$maxAttempts = 5
$agentHealthy = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri $AGENT_URL -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Agent is responding" -ForegroundColor Green
            Write-Host "     URL: $AGENT_URL" -ForegroundColor Cyan
            Write-Host "     Status Code: $($response.StatusCode)" -ForegroundColor Cyan
            
            $json = $response.Content | ConvertFrom-Json
            if ($json.status) {
                Write-Host "     Status: $($json.status)" -ForegroundColor Cyan
            }
            if ($json.version) {
                Write-Host "     Version: $($json.version)" -ForegroundColor Cyan
            }
            
            $agentHealthy = $true
            break
        }
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "     Attempt $attempt/$maxAttempts - Retrying..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
}

if (-not $agentHealthy) {
    Write-Host "[WARNING] Agent not responding" -ForegroundColor Yellow
    Write-Host "     Make sure the application is running" -ForegroundColor Cyan
}

# Summary
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "Auto-Start Verification Summary" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

$allChecks = $true

if ($task -and $task.State -eq "Ready") {
    Write-Host "[OK] Task Scheduler configured" -ForegroundColor Green
}
else {
    Write-Host "[ERROR] Task Scheduler not properly configured" -ForegroundColor Red
    $allChecks = $false
}

if (Test-Path -Path $regPath) {
    Write-Host "[OK] Registry entries present" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] Registry entries missing" -ForegroundColor Yellow
}

if ($process) {
    Write-Host "[OK] Agent process running" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] Agent process not running" -ForegroundColor Yellow
}

if ($agentHealthy) {
    Write-Host "[OK] Agent responding on $AGENT_URL" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] Agent health check failed" -ForegroundColor Yellow
}

Write-Host "`n"

if ($allChecks -and $agentHealthy) {
    Write-Host "Result: Auto-start is properly configured!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Result: Some issues detected. Please review above." -ForegroundColor Yellow
    exit 1
}
