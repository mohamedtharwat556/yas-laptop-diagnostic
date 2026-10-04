# YAS Hardware Agent Installer

## Overview

This directory contains the installation files and scripts for YAS Hardware Agent.

## Files

- **Install.bat** - Main installer (double-click to run)
- **Install-YASHardwareAgent.ps1** - PowerShell installation script
- **setup-autostart.bat** - Auto-start configuration utility
- **YAS-Hardware-Agent.nsi** - NSIS installer script (for future builds)

## Installation

### Method 1: Simple Installation (Recommended)

1. Right-click **Install.bat**
2. Select **"Run as Administrator"**
3. Follow the on-screen instructions
4. The agent will start automatically

### Method 2: PowerShell Installation

1. Right-click PowerShell
2. Select **"Run as Administrator"**
3. Run this command:
   ```powershell
   cd "C:\path\to\installer"
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
   .\Install-YASHardwareAgent.ps1
   ```

## What Gets Installed

- Application files in: `C:\Program Files\YAS Hardware Agent`
- Registry entries for auto-detection
- Windows Task Scheduler task for auto-start
- Desktop shortcut (optional)

## Verification

After installation:

1. Go to https://yas-laptop-diagnostic.vercel.app
2. Click **"Verify Installation"**
3. If successful, you'll see: ✓ **Agent Connected**

## Uninstallation

### Method 1: Control Panel

1. Go to Settings → Apps → Apps & Features
2. Find "YAS Hardware Agent"
3. Click Uninstall

### Method 2: PowerShell

Run this command as Administrator:

```powershell
C:\Program Files\YAS Hardware Agent\Uninstall.ps1
```

### Method 3: Manual

1. Stop the agent:
   ```cmd
   taskkill /IM YAS.HardwareAgent.exe /F
   ```

2. Remove scheduled task:
   ```cmd
   schtasks /delete /tn "YAS Hardware Agent" /f
   ```

3. Delete folder: `C:\Program Files\YAS Hardware Agent`

4. Delete registry key:
   ```cmd
   reg delete "HKEY_CURRENT_USER\Software\YAS\HardwareAgent" /f
   ```

## Troubleshooting

### Installation requires Administrator privileges

The installer needs administrator rights to:
- Create files in Program Files
- Setup Windows Task Scheduler
- Configure registry

**Solution:** Right-click Install.bat and select "Run as Administrator"

### Agent not starting after installation

**Solution:** 
1. Open Task Scheduler (press Windows+R, type `taskschd.msc`)
2. Find "YAS Hardware Agent" task
3. Right-click and select "Run"

### Port 5275 already in use

If another application is using port 5275:

1. Edit `C:\Program Files\YAS Hardware Agent\appsettings.json`
2. Change the Port value to an unused port (e.g., 5276)
3. Restart the agent:
   ```cmd
   taskkill /IM YAS.HardwareAgent.exe /F
   ```
4. Start the agent again via Task Scheduler

### Agent crashes on startup

Check the Windows Event Viewer for detailed error messages:
1. Press Windows+R
2. Type `eventvwr`
3. Look for entries from "Task Scheduler" related to "YAS Hardware Agent"

### Cannot verify installation

If verification fails:
1. Ensure no firewall is blocking localhost:5275
2. Check Task Scheduler to ensure the task is running
3. Open Command Prompt and run:
   ```cmd
   curl http://127.0.0.1:5275/api/health
   ```

## Version Information

- **Agent Version:** 1.0.0
- **Installer Version:** 1.0.0
- **Compatible with:** Windows 10, Windows 11
- **Required:** .NET 8.0 Runtime (auto-extracted)

## Security

- Agent runs on localhost (127.0.0.1) only
- No internet access required
- No credentials or sensitive data exposed
- Read-only hardware information
- No arbitrary command execution

## Support

For issues or questions, contact the YAS support team.
