@echo off
REM Setup auto-start for YAS Hardware Agent using Windows Task Scheduler
REM This script creates a scheduled task that starts the agent at system startup

setlocal enabledelayedexpansion

REM Get the installation directory (should be passed or determined)
set "INSTALL_DIR=%~dp0"
set "EXECUTABLE=%INSTALL_DIR%YAS.HardwareAgent.exe"
set "TASK_NAME=YAS Hardware Agent"

REM Check if executable exists
if not exist "%EXECUTABLE%" (
    echo Error: YAS.HardwareAgent.exe not found at %EXECUTABLE%
    exit /b 1
)

REM Delete existing task if it exists
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM Create scheduled task for startup
REM This task will:
REM - Run at system startup
REM - Run with highest privileges (but not requiring admin prompt)
REM - Restart automatically if it crashes
REM - Run hidden (no visible window)

schtasks /create ^
    /tn "%TASK_NAME%" ^
    /tr "\"%EXECUTABLE%\"" ^
    /sc onstart ^
    /rl highest ^
    /f

if %ERRORLEVEL% EQU 0 (
    echo Successfully created auto-start task
    
    REM Wait a moment for task to be created
    timeout /t 2 /nobreak
    
    REM Start the task immediately
    schtasks /run /tn "%TASK_NAME%"
    
    if %ERRORLEVEL% EQU 0 (
        echo Task started successfully
        echo YAS Hardware Agent is now running on http://127.0.0.1:5275
        exit /b 0
    ) else (
        echo Warning: Task was created but could not be started immediately
        echo Please restart your computer or manually start the task
        exit /b 1
    )
) else (
    echo Error: Failed to create auto-start task
    exit /b 1
)
