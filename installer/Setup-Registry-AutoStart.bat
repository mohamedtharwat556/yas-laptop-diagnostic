@echo off
REM Alternative auto-start setup using Windows Registry Run key
REM This is in addition to Task Scheduler for better compatibility

setlocal enabledelayedexpansion

set "INSTALL_DIR=%~dp0"
set "EXECUTABLE=!INSTALL_DIR!YAS.HardwareAgent.exe"
set "APP_NAME=YAS Hardware Agent"
set "REG_KEY=HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run"

REM Check if executable exists
if not exist "!EXECUTABLE!" (
    echo Error: YAS.HardwareAgent.exe not found at !EXECUTABLE!
    exit /b 1
)

echo Setting up registry auto-start...
echo.

REM Add to Run key (will start when user logs in)
reg add "!REG_KEY!" /v "!APP_NAME!" /t REG_SZ /d "\"!EXECUTABLE!\"" /f

if %ERRORLEVEL% equ 0 (
    echo Successfully added to Windows Run key
    echo.
    echo The application will start automatically when you log in.
    exit /b 0
) else (
    echo Error: Failed to add to Windows Run key
    exit /b 1
)
