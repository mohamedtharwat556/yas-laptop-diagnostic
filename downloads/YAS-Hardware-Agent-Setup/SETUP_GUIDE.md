# YAS Hardware Agent - Complete Setup Guide

## Overview

YAS Hardware Agent enables real Windows hardware detection for the YAS Laptop Diagnostic System. It runs as a local service on Windows 10/11 and provides accurate hardware information via HTTP API.

---

## Installation Methods

### Method 1: Automatic Installation (Recommended)

1. **Double-click** `Install.bat`
2. **Click** "Run as Administrator" if prompted
3. Follow the on-screen instructions
4. The agent will start automatically

**Installation takes 1-2 minutes**

### Method 2: Manual PowerShell Installation

1. Right-click `PowerShell`
2. Select `Run as Administrator`
3. Navigate to this folder:
   ```powershell
   cd "C:\path\to\installer"
   ```
4. Run the installer:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
   .\Install-YASHardwareAgent.ps1
   ```

### Method 3: Portable Mode (No Installation)

1. Double-click `Run-Agent-Portable.bat`
2. The agent will start and display its URL
3. **Note:** This won't auto-start on reboot (for testing only)

---

## Verification

### Automatic Verification (After Installation)

1. Go to: https://yas-laptop-diagnostic.vercel.app
2. Click **"Verify Installation"**
3. If successful: ✓ **Agent Connected**

### Manual Verification

1. Run `Verify-AutoStart.ps1` (requires Admin)
   ```powershell
   .\Verify-AutoStart.ps1
   ```

2. Test API endpoints:
   ```powershell
   .\Test-Agent-Endpoints.ps1
   ```

3. Open browser and check:
   - Health: http://127.0.0.1:5275/api/health
   - Hardware: http://127.0.0.1:5275/api/hardware

---

## What Gets Installed

| Item | Location |
|------|----------|
| **Application** | `C:\Program Files\YAS Hardware Agent` |
| **Registry Key** | `HKEY_CURRENT_USER\Software\YAS\HardwareAgent` |
| **Registry Run** | `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run` |
| **Task Scheduler** | `Task Scheduler → YAS Hardware Agent` |
| **Shortcuts** | `Desktop` (optional), `Start Menu` |

### What Gets Configured

1. **Task Scheduler Task**
   - Runs at Windows startup
   - Restarts automatically if crashed
   - Runs with user privileges (no Admin required after install)

2. **Registry Auto-Start**
   - Backup method for auto-start
   - Runs when user logs in

3. **Registry Entries**
   - Installation location
   - Version information
   - Executable path

---

## First Run After Installation

After installation:

1. **Automatic startup** (Windows starts or restarts)
2. **Task Scheduler** launches the agent
3. Agent starts listening on `http://127.0.0.1:5275`
4. Web app auto-detects and uses the agent

**No user action required after installation!**

---

## Troubleshooting

### Agent Not Starting After Installation

**Symptoms:**
- Verification shows "Not Connected"
- Can't reach http://127.0.0.1:5275

**Solutions:**

1. **Manually start the agent:**
   ```cmd
   C:\Program Files\YAS Hardware Agent\YAS.HardwareAgent.exe
   ```

2. **Check Task Scheduler:**
   - Press `Windows+R`, type `taskschd.msc`
   - Find "YAS Hardware Agent"
   - Right-click → **Run**

3. **Check if port 5275 is available:**
   ```cmd
   netstat -ano | findstr :5275
   ```

4. **Disable antivirus temporarily:**
   - Some antivirus software may block the agent
   - Add the installation folder to antivirus whitelist

### Agent Crashes on Start

1. **Check logs:**
   - Open `Event Viewer` (press `Windows+R`, type `eventvwr`)
   - Look for errors related to "YAS Hardware Agent"

2. **Check .NET 8.0 Runtime:**
   - Agent requires .NET 8.0
   - Download from: https://dotnet.microsoft.com/download/dotnet/8.0

3. **Run with verbose logging:**
   ```cmd
   cd "C:\Program Files\YAS Hardware Agent"
   YAS.HardwareAgent.exe
   ```

### Port 5275 Already in Use

1. Edit `appsettings.json`:
   ```
   C:\Program Files\YAS Hardware Agent\appsettings.json
   ```

2. Change port value (e.g., 5276):
   ```json
   {
     "Server": {
       "Urls": "http://127.0.0.1:5276",
       "Port": 5276
     }
   }
   ```

3. Restart the agent

4. Update browser settings to use new port

### Cannot Connect from Web App

1. **Check firewall:**
   - Local firewall may block localhost connections
   - Temporarily disable Windows Defender Firewall:
     - Settings → Privacy & Security → Windows Defender Firewall
     - Toggle OFF (or add exception)

2. **Verify the agent is running:**
   ```cmd
   tasklist | findstr YAS.HardwareAgent
   ```

3. **Test connectivity:**
   ```cmd
   curl http://127.0.0.1:5275/api/health
   ```

---

## Uninstallation

### Option 1: Control Panel (Easiest)

1. Go to **Settings → Apps → Apps & features**
2. Find **"YAS Hardware Agent"**
3. Click **"Uninstall"**
4. Follow the prompts

### Option 2: PowerShell Script

```powershell
cd "C:\Program Files\YAS Hardware Agent"
.\Uninstall.ps1
```

### Option 3: Manual Removal

1. **Stop the agent:**
   ```cmd
   taskkill /IM YAS.HardwareAgent.exe /F
   ```

2. **Remove Task Scheduler task:**
   ```cmd
   schtasks /delete /tn "YAS Hardware Agent" /f
   ```

3. **Remove registry entries:**
   ```cmd
   reg delete "HKEY_CURRENT_USER\Software\YAS\HardwareAgent" /f
   reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "YAS Hardware Agent" /f
   ```

4. **Delete folder:**
   ```cmd
   rmdir /s /q "C:\Program Files\YAS Hardware Agent"
   ```

---

## System Requirements

- **OS:** Windows 10 or Windows 11 (64-bit)
- **.NET Runtime:** .NET 8.0 (included in package)
- **Disk Space:** ~200 MB
- **Memory:** ~50-100 MB
- **Privileges:** Administrator for installation only

---

## API Endpoints

### Health Check
```
GET http://127.0.0.1:5275/api/health
```

**Response:**
```json
{
  "status": "ok",
  "agent": "YAS Hardware Agent",
  "version": "1.0.0",
  "timestamp": "2026-10-04T10:00:00Z"
}
```

### Hardware Information
```
GET http://127.0.0.1:5275/api/hardware
```

**Returns:** Complete hardware configuration
- Computer information
- Operating System details
- CPU specifications
- Memory information
- GPU information
- Storage devices
- Battery status
- Network adapters

---

## Security

✓ **Localhost only** - Not accessible from internet  
✓ **Read-only** - No write operations  
✓ **No arbitrary commands** - No PowerShell/CMD execution  
✓ **No file access** - No file browsing or transfer  
✓ **Windows WMI only** - Standard Windows APIs only  
✓ **No credentials** - No username/password exposure  

---

## Performance Impact

- **CPU:** <1% at idle
- **Memory:** ~50-100 MB
- **Disk:** <200 MB total
- **Startup time:** 3-5 seconds
- **No noticeable impact on system performance**

---

## Logs and Diagnostics

Agent logs to Windows Event Viewer:

1. Press `Windows+R`
2. Type `eventvwr`
3. Look for entries from Task Scheduler or Application logs

---

## Version Information

- **Agent Version:** 1.0.0
- **Build Date:** 2026-10-04
- **Platform:** Windows x64
- **.NET Framework:** 8.0
- **Self-Contained:** Yes (no external dependencies)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Run verification scripts to diagnose issues
3. Check Windows Event Viewer for errors
4. Contact YAS support team

---

## Frequently Asked Questions

**Q: Will the agent slow down my computer?**  
A: No. The agent uses minimal resources and only collects hardware info on-demand.

**Q: Can I uninstall it later?**  
A: Yes, easily via Settings → Apps → Apps & features

**Q: Does it require internet?**  
A: No. It runs completely offline and local to your computer.

**Q: Is my data safe?**  
A: Yes. The agent only collects hardware specifications and doesn't transmit data anywhere.

**Q: What if installation fails?**  
A: Try the portable mode (Run-Agent-Portable.bat) and check Event Viewer for errors.

**Q: Can multiple users use it?**  
A: Yes, each user can run their own instance on the same computer.

---

**Last Updated:** 2026-10-04  
**Status:** Production Ready
