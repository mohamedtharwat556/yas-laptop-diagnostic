@echo off
REM YAS Hardware Agent Portable Launcher
REM Run without installation - useful for testing or portable use

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PUBLISH_DIR=!SCRIPT_DIR!..\hardware-agent\publish"
set "EXECUTABLE=!PUBLISH_DIR!\YAS.HardwareAgent.exe"

echo.
echo ============================================================
echo      YAS Hardware Agent - Portable Mode
echo ============================================================
echo.

if not exist "!EXECUTABLE!" (
    echo [ERROR] YAS.HardwareAgent.exe not found at:
    echo !EXECUTABLE!
    echo.
    echo Please ensure the application files are in:
    echo !PUBLISH_DIR!
    echo.
    pause
    exit /b 1
)

echo Starting YAS Hardware Agent...
echo.
echo Agent will run on: http://127.0.0.1:5275
echo Press Ctrl+C to stop
echo.
echo Endpoints:
echo   - Health:   http://127.0.0.1:5275/api/health
echo   - Hardware: http://127.0.0.1:5275/api/hardware
echo.

"!EXECUTABLE!"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Agent failed with exit code %ERRORLEVEL%
    echo.
    pause
    exit /b %ERRORLEVEL%
)

exit /b 0
