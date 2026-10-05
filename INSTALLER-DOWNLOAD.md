# 📦 YAS Hardware Agent Installer

## Download

**Latest Version: 1.0.0 (Production Ready)**

### 🔗 Download Location
```
C:\Temp\YAS-Agent-Build\
```

### 📋 Files Included
- `Install.bat` - Installation script
- `Uninstall.bat` - Uninstallation script
- `publish/` - All application files (self-contained .NET 8)

### 📊 Package Size
- ~800 MB (includes .NET 8 runtime)
- No external dependencies needed

---

## ⚙️ Installation Instructions

### Step 1: Download
Download the installer package from `C:\Temp\YAS-Agent-Build\`

### Step 2: Run Installer
1. Right-click `Install.bat`
2. Select "Run as Administrator"
3. Click "Yes" when prompted

### Step 3: Wait for Installation
- Files will be copied to `C:\Program Files\YAS Hardware Agent\`
- Windows Service will be created
- Service will start automatically

### Step 4: Return to Website
1. Open: https://yas-laptop-diagnostic.vercel.app/
2. Agent will be detected automatically
3. Click "Start Diagnostic"

---

## ✅ Verification

After installation, verify:

**Check Service:**
```
services.msc
```
Look for "YAS Hardware Agent" with Status = Running

**Check API:**
```
http://127.0.0.1:5275/api/health
```
Should return: `{"status":"ok","agent":"YAS Hardware Agent",...}`

**Check Website:**
```
https://yas-laptop-diagnostic.vercel.app/
```
Should show: "✓ مساعد YAS متصل"

---

## 🔧 Uninstallation

To uninstall:
1. Right-click `Uninstall.bat`
2. Select "Run as Administrator"
3. Confirm removal

This will:
- Stop the Windows Service
- Remove installation directory
- Clean registry entries

---

## 🆘 Troubleshooting

### "Port 5275 already in use"
Kill existing process:
```
netstat -ano | findstr :5275
taskkill /PID <PID> /F
```

### "Administrator Required"
Make sure to:
1. Right-click Install.bat
2. Select "Run as Administrator"
3. Click "Yes" when prompted

### "Installation Failed"
1. Uninstall first: `Uninstall.bat`
2. Restart Windows
3. Try installing again

---

## 📝 System Requirements

- Windows 10 or Windows 11 (x64)
- Administrator privileges for installation
- ~800 MB free disk space
- No .NET runtime needed (included in installer)

---

## 🎯 What's Included

✓ Full Windows 10/11 hardware detection  
✓ CPU, RAM, GPU, Storage, Battery information  
✓ Network adapter details  
✓ BIOS information  
✓ Automatic Windows Service  
✓ Auto-start on system boot  
✓ Crash recovery/restart  

---

## 📊 Real Hardware Data

The agent returns **real hardware data** from Windows:
- No fake/placeholder values
- No demo data
- Actual system information via WMI

---

**Status: ✅ Production Ready**

For latest updates, check: https://github.com/mohamedtharwat556/yas-laptop-diagnostic
