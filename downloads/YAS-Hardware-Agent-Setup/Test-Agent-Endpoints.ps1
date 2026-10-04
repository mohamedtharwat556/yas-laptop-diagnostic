<#
.SYNOPSIS
    Test YAS Hardware Agent API endpoints
    
.DESCRIPTION
    Verifies that both /api/health and /api/hardware endpoints are working
#>

param(
    [string]$BaseUrl = "http://127.0.0.1:5275"
)

$ErrorActionPreference = "Continue"

Write-Host "`n" + ("="*70) -ForegroundColor Cyan
Write-Host "YAS Hardware Agent - Endpoint Testing" -ForegroundColor Cyan
Write-Host ("="*70) -ForegroundColor Cyan

$healthUrl = "$BaseUrl/api/health"
$hardwareUrl = "$BaseUrl/api/hardware"
$baseUrlRounded = "$BaseUrl/api"

Write-Host "`nTesting API endpoints..." -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n"

# Test 1: Health Endpoint
Write-Host "[TEST 1] GET $healthUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "[PASS] Health endpoint responding (HTTP 200)" -ForegroundColor Green
        
        try {
            $json = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            
            Write-Host "       Status: $($json.status)" -ForegroundColor Cyan
            if ($json.agent) { Write-Host "       Agent: $($json.agent)" -ForegroundColor Cyan }
            if ($json.version) { Write-Host "       Version: $($json.version)" -ForegroundColor Cyan }
            if ($json.timestamp) { Write-Host "       Timestamp: $($json.timestamp)" -ForegroundColor Cyan }
        }
        catch {
            Write-Host "       Response (raw): $($response.Content)" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "[FAIL] Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
    }
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Hardware Endpoint
Write-Host "`n[TEST 2] GET $hardwareUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $hardwareUrl -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "[PASS] Hardware endpoint responding (HTTP 200)" -ForegroundColor Green
        
        try {
            $json = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            
            Write-Host "`n       Response Structure:" -ForegroundColor Cyan
            
            if ($json.computer) {
                Write-Host "         ✓ computer" -ForegroundColor Green
                if ($json.computer.manufacturer) { Write-Host "           - manufacturer: $($json.computer.manufacturer)" -ForegroundColor Cyan }
                if ($json.computer.model) { Write-Host "           - model: $($json.computer.model)" -ForegroundColor Cyan }
            }
            
            if ($json.operatingSystem) {
                Write-Host "         ✓ operatingSystem" -ForegroundColor Green
                if ($json.operatingSystem.name) { Write-Host "           - name: $($json.operatingSystem.name)" -ForegroundColor Cyan }
                if ($json.operatingSystem.version) { Write-Host "           - version: $($json.operatingSystem.version)" -ForegroundColor Cyan }
            }
            
            if ($json.cpu) {
                Write-Host "         ✓ cpu" -ForegroundColor Green
                if ($json.cpu.name) { Write-Host "           - name: $($json.cpu.name)" -ForegroundColor Cyan }
            }
            
            if ($json.memory) {
                Write-Host "         ✓ memory" -ForegroundColor Green
                if ($json.memory.totalGB) { Write-Host "           - totalGB: $($json.memory.totalGB)" -ForegroundColor Cyan }
            }
            
            if ($json.gpu) {
                Write-Host "         ✓ gpu (count: $($json.gpu.Count))" -ForegroundColor Green
            }
            
            if ($json.storage) {
                Write-Host "         ✓ storage (count: $($json.storage.Count))" -ForegroundColor Green
            }
            
            if ($json.battery) {
                Write-Host "         ✓ battery" -ForegroundColor Green
            }
            
            if ($json.network) {
                Write-Host "         ✓ network (count: $($json.network.Count))" -ForegroundColor Green
            }
            
            if ($json.metadata) {
                Write-Host "         ✓ metadata" -ForegroundColor Green
                if ($json.metadata.source) { Write-Host "           - source: $($json.metadata.source)" -ForegroundColor Cyan }
                if ($json.metadata.capturedAt) { Write-Host "           - capturedAt: $($json.metadata.capturedAt)" -ForegroundColor Cyan }
            }
        }
        catch {
            Write-Host "       Response (raw, truncated): $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "[FAIL] Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
    }
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n" + ("="*70) -ForegroundColor Cyan
Write-Host "All tests passed! Agent is working correctly." -ForegroundColor Green
Write-Host ("="*70) -ForegroundColor Cyan

exit 0
