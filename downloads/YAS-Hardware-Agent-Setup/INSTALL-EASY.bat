@echo off
REM ========================================
REM YAS Hardware Agent - Simple Installer
REM ========================================
REM This batch file handles installation
REM without PowerShell execution policy issues

setlocal enabledelayedexpansion

:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    cls
    echo.
    echo ====================================
    echo ERROR - Administrator Required
    echo ====================================
    echo.
    echo This installer requires Administrator privileges!
    echo.
    echo Please:
    echo 1. Right-click this file
    echo 2. Select "Run as Administrator"
    echo 3. Click "Yes" when prompted
    echo.
    pause
    exit /b 1
)

cls
echo.
echo ====================================
echo YAS Hardware Agent Installer v1.0.0
echo ====================================
echo.

:: Define installation path
set "INSTALL_PATH=%ProgramFiles%\YAS Hardware Agent"
set "APP_EXE=YAS.HardwareAgent.exe"
set "AGENT_URL=http://127.0.0.1:5275/api/health"
set "TASK_NAME=YAS Hardware Agent"

echo [*] Installation Directory: %INSTALL_PATH%
echo [*] Checking installation files...
echo.

:: Verify executable exists in current directory
if not exist "%~dp0%APP_EXE%" (
    echo [ERROR] File not found: "%~dp0%APP_EXE%"
    echo.
    echo Please make sure you extracted all files from the ZIP archive.
    echo The following files should be present:
    echo   - %APP_EXE%
    echo   - YAS.HardwareAgent.dll
    echo   - Many other .DLL files
    echo.
    pause
    exit /b 1
)

echo [OK] Installation files found
echo.

:: Create installation directory
echo [*] Creating installation directory...
if exist "%INSTALL_PATH%" (
    echo [!] Directory exists - backing up...
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
    ren "%INSTALL_PATH%" "%INSTALL_PATH%.backup_!mydate!_!mytime!" 2>nul
    if %errorLevel% equ 0 (
        echo [OK] Old version backed up
    ) else (
        echo [!] Could not backup old version, continuing anyway...
    )
)

mkdir "%INSTALL_PATH%" 2>nul
if %errorLevel% equ 0 (
    echo [OK] Directory created
) else (
    echo [ERROR] Failed to create directory
    echo Ensure you have write permissions to: %ProgramFiles%
    pause
    exit /b 1
)

echo.
echo [*] Copying application files...
xcopy "%~dp0*" "%INSTALL_PATH%\" /E /I /Y /Q >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Files copied successfully
) else (
    echo [ERROR] Failed to copy files
    echo Check folder permissions
    pause
    exit /b 1
)

echo.
echo [*] Setting up registry entries...
reg add "HKCU\Software\YAS\HardwareAgent" /v "InstallLocation" /d "%INSTALL_PATH%" /f >nul 2>&1
reg add "HKCU\Software\YAS\HardwareAgent" /v "Version" /d "1.0.0" /f >nul 2>&1
reg add "HKCU\Software\YAS\HardwareAgent" /v "Path" /d "%INSTALL_PATH%\%APP_EXE%" /f >nul 2>&1
echo [OK] Registry entries created

echo.
echo [*] Setting up auto-start...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "%TASK_NAME%" /d "\"%INSTALL_PATH%\%APP_EXE%\"" /f >nul 2>&1
echo [OK] Auto-start configured (will start when you log in)

echo.
echo [*] Setting up Task Scheduler (Windows boot start)...
REM Use PowerShell for advanced Task Scheduler setup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName='YAS Hardware Agent'; $exe='%INSTALL_PATH%\%APP_EXE%'; $workDir='%INSTALL_PATH%'; try { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null; $action = New-ScheduledTaskAction -Execute $exe -WorkingDirectory $workDir; $trigger = New-ScheduledTaskTrigger -AtStartup; $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1); $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest; Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null; Write-Host 'OK - Task created' } catch { Write-Host 'PARTIAL - Installed but Task Scheduler setup skipped' }" 2>nul
echo.

echo [*] Starting agent...
start "" "%INSTALL_PATH%\%APP_EXE%"
echo [OK] Application started

echo.
echo [*] Waiting for agent to initialize (10 seconds)...
timeout /t 10 /nobreak >nul 2>&1

echo.
echo ====================================
echo Installation Complete!
echo ====================================
echo.
echo Installation Details:
echo   Location: %INSTALL_PATH%
echo   Version:  1.0.0
echo   Status:   Ready
echo.
echo Next Steps:
echo   1. Close this window
echo   2. Open your web browser
echo   3. Go back to: https://yas-laptop-diagnostic.vercel.app/client/download-agent.html
echo   4. Click "Verify Installation" button
echo   5. You should see "✓ Agent Connected"
echo   6. Now you can run full diagnostics!
echo.
echo Notes:
echo   - Agent will auto-start when you restart Windows
echo   - To uninstall: Delete C:\Program Files\YAS Hardware Agent
echo   - For support, visit the main diagnostic website
echo.
pause

