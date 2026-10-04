@echo off
REM YAS Hardware Agent - Windows Service Installer
REM This batch file elevates to admin and runs the PowerShell installer

setlocal enabledelayedexpansion

:: Check for administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Administrator privileges required!
    echo Please right-click and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo ==============================
echo YAS Hardware Agent Installer
echo ==============================
echo.

:: Run PowerShell installer
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0Install-YASAgent-Service.ps1"

pause
