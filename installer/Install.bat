@echo off
REM YAS Hardware Agent Installer Wrapper
REM This batch file launches the PowerShell installer with proper privileges

setlocal enabledelayedexpansion

REM Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] This installer requires Administrator privileges!
    echo.
    echo Please right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%Install-YASHardwareAgent.ps1"

REM Check if PowerShell script exists
if not exist "!PS_SCRIPT!" (
    echo.
    echo [ERROR] PowerShell script not found: !PS_SCRIPT!
    echo.
    pause
    exit /b 1
)

REM Run PowerShell installer with bypass execution policy
echo.
echo ============================================================
echo    YAS Hardware Agent Installer
echo ============================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "!PS_SCRIPT!"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Installation completed successfully!
    echo.
    echo Please return to https://yas-laptop-diagnostic.vercel.app
    echo and click "Verify Installation" to confirm the agent is running.
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo [ERROR] Installation failed with error code %ERRORLEVEL%
    echo.
    pause
    exit /b %ERRORLEVEL%
)
