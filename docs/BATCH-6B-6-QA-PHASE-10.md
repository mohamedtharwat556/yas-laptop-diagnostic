# BATCH 6B-6 QA Testing - Phase 10
**Mandatory Hardware Agent Flow - Installation and Recovery Flow**

**Status:** NOT STARTED  
**Date Started:** _____  
**Tester:** [Your Name]  

---

## Phase 10: QA Testing - Installation Flow

### Prerequisites
- [ ] Windows machine with clean Agent state (can be fresh uninstall or first install)
- [ ] Installer available at: `/downloads/YAS-Hardware-Agent-Setup/Install.bat`
- [ ] Browser console open (F12)
- [ ] Phase 8 and 9 tests completed and passed

### Test 10.1: Installer Download and Execution
**Goal:** Verify installer can be downloaded and executed

**Steps:**
1. Navigate to installation-required.html
2. Look for download button/link
3. Click "Download Installer" or similar
4. Verify installer file downloads (YAS-Hardware-Agent-Setup.exe or similar)
5. Execute installer

**Expected Result:**
- ✅ Installer downloads successfully
- ✅ File is recognized as executable (not corrupted)
- ✅ UAC prompt appears (Windows admin rights request)
- ✅ Installer window opens

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Installer Info:**
- File name: ___________________
- File size: ___________________
- Downloaded from: ___________________

---

### Test 10.2: Installation Process
**Goal:** Verify Agent installs successfully

**Steps:**
1. In installer window:
2. Accept license (if prompted)
3. Choose installation directory (default OK)
4. Click "Install" or equivalent
5. Wait for installation to complete
6. Note installation messages

**Expected Result:**
- ✅ Installation progresses without errors
- ✅ No cryptic error messages
- ✅ Completion message shows "Installation successful" or equivalent
- ✅ Option to start service after install
- ✅ Agent service starts automatically or manually

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Installation Log:**
```
[paste installer console output here]
```

---

### Test 10.3: Service Startup After Installation
**Goal:** Verify Agent service starts and is accessible

**Steps:**
1. After installation, check if service auto-started
2. Or manually start:
   - Open Services (services.msc)
   - Find "YAS Hardware Agent" service
   - Click "Start" if not running
3. Wait 5 seconds
4. Check if Agent responds to health check

**Expected Result:**
- ✅ Service appears in Windows Services
- ✅ Service status: "Running"
- ✅ `http://127.0.0.1:5275/api/health` responds with 200 OK
- ✅ Response: `{"status":"ok","agent":"YAS Hardware Agent"}`
- ✅ No errors in Windows Event Viewer

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Service Status:**
- Service found: [ ] Yes [ ] No
- Service status: ___________________
- Health check response: ___________________

---

### Test 10.4: Auto-Detection After Installation
**Goal:** Verify web UI auto-detects Agent after installation

**Steps:**
1. Keep browser on installation-required.html
2. Complete Agent installation (from Test 10.2)
3. Agent service starts
4. Watch auto-polling on the page (should check every 3 seconds)
5. Wait for detection

**Expected Result:**
- ✅ Auto-polling detects Agent within 10 seconds
- ✅ Page shows: "تم الاتصال بمساعد YAS" (Connected to YAS Agent)
- ✅ State changes: DISCONNECTED → CHECKING → CONNECTED
- ✅ Auto-redirects to Client form
- ✅ User can immediately start diagnostic

**Actual Result:**
- [ ] PASS - Auto-detection works
- [ ] FAIL - Details: _____________________

**Detection Time:** _____ seconds

---

### Test 10.5: End-to-End Installation + Diagnostic
**Goal:** Verify complete flow from Agent absent to running diagnostic

**Steps:**
1. Start: Agent not running, on Client form
2. Try to submit form
3. Redirected to installation-required.html
4. Download and install Agent
5. Auto-detection succeeds
6. Redirect back to Client form
7. Fill and submit form
8. Start diagnostic
9. Hardware data displays

**Expected Result:**
- ✅ Entire flow works without manual intervention
- ✅ No errors or stuck states
- ✅ Session created with hardwareSource='hardware-agent'
- ✅ Real hardware displayed on diagnostic page
- ✅ All data from Agent, not browser fallback

**Actual Result:**
- [ ] PASS - End-to-end flow works
- [ ] FAIL - Details: _____________________

**Hardware Data Verified:**
- [ ] Processor: ___________________
- [ ] RAM: ___________________
- [ ] GPU: ___________________
- [ ] Storage: ___________________

---

### Test 10.6: Uninstall and Reinstall Scenario
**Goal:** Verify system handles uninstall/reinstall gracefully

**Steps:**
1. Agent is currently installed and running
2. Uninstall Agent:
   - Windows → Settings → Apps → Apps & Features
   - Find "YAS Hardware Agent"
   - Click "Uninstall"
   - Wait for removal
3. Verify Agent is removed:
   - `http://127.0.0.1:5275/api/health` should fail
   - Service no longer in Services.msc
4. Navigate back to Client form
5. Reinstall Agent
6. Verify everything works again

**Expected Result:**
- ✅ Uninstall completes without errors
- ✅ Agent immediately unavailable
- ✅ Page detects disconnection
- ✅ Reinstall works cleanly
- ✅ No residual issues or conflicts
- ✅ Full diagnostic works again

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 10.7: Registry Entry Persistence
**Goal:** Verify Agent registers itself for auto-start (if applicable)

**Steps:**
1. After installation, check Windows Registry:
   - Open `regedit` (Registry Editor)
   - Navigate to: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
   - Look for entry: "YAS Hardware Agent" or similar
2. Verify entry points to Agent executable
3. Restart Windows
4. Check if Agent auto-starts

**Expected Result:**
- ✅ Registry entry exists for auto-start
- ✅ Path is correct
- ✅ After restart, Agent automatically running
- ✅ Health check succeeds immediately

**Actual Result:**
- [ ] PASS - Auto-start configured
- [ ] INFO - Auto-start not tested (optional feature)
- [ ] FAIL - Details: _____________________

**Registry Entry:**
- Key found: ___________________
- Value: ___________________

---

### Test 10.8: Port Binding Verification
**Goal:** Verify Agent binds to correct loopback port

**Steps:**
1. Agent is running
2. Open Command Prompt (cmd)
3. Run: `netstat -ano | findstr :5275`
4. Look for port 5275 listening

**Expected Result:**
- ✅ Port 5275 shows in netstat output
- ✅ Status: "LISTENING"
- ✅ Address: 127.0.0.1:5275 (loopback only, not 0.0.0.0)
- ✅ Process is Agent executable

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**netstat Output:**
```
[paste command output here]
```

---

### Test 10.9: Recovery from Crash
**Goal:** Verify system recovers if Agent crashes mid-diagnostic

**Steps:**
1. Start diagnostic with Agent running
2. Open Task Manager (Ctrl+Shift+Esc)
3. Find "YAS Hardware Agent" process (or dotnet.exe if running locally)
4. Click "End Task" to force crash
5. Observe web UI behavior
6. Watch auto-polling
7. Restart Agent service
8. Observe recovery

**Expected Result:**
- ✅ UI detects Agent disconnect
- ✅ Graceful error message shown
- ✅ User can retry
- ✅ Auto-polling watches for restart
- ✅ When Agent restarts, new session can be created
- ✅ No orphaned processes or resource leaks

**Actual Result:**
- [ ] PASS - Recovery works
- [ ] FAIL - Details: _____________________

---

### Test 10.10: Admin Rights Requirement
**Goal:** Verify Admin rights are properly requested/handled

**Steps:**
1. Try to install Agent as regular (non-admin) user
2. Observe if UAC prompt appears
3. If blocked, verify error message is clear
4. As Admin, install successfully

**Expected Result:**
- ✅ UAC prompt appears (if UAC enabled)
- ✅ User can approve installation
- ✅ Installation proceeds as admin
- ✅ Service runs properly
- ✅ If no admin rights, error message is clear

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

## Summary - Phase 10

**Total Tests:** 10  
**Passed:** _____ / 10  
**Failed:** _____ / 10  

### Critical Issues Found:
1. ___________________________________
2. ___________________________________
3. ___________________________________

### Minor Issues Found:
1. ___________________________________
2. ___________________________________

### Recommendations:
- [ ] All critical issues resolved
- [ ] Installation process verified end-to-end
- [ ] Ready for Phase 11 (Final QA report and sign-off)

**Phase 10 Status:** 
- [ ] ✅ PASS - Installation flow works correctly
- [ ] ❌ FAIL - See critical issues above

**Tester Signature:** ___________________  
**Date Completed:** ___________________

---

## Next Steps
Move to **Phase 11: Final QA Report and Sign-Off** to document all findings and complete BATCH 6B-6.
