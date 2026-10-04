# BATCH 6B-6 QA Testing Checklist
**Mandatory Hardware Agent Flow - Real Windows Verification**

**Status:** IN PROGRESS  
**Date Started:** October 3, 2026  
**Tester:** [Your Name]  
**Windows Version:** [Fill in]  
**Agent Version:** [Fill in from /api/health]  

---

## Phase 8: QA Testing - Agent Present ✅

### Prerequisites
- [ ] Windows machine with YAS Hardware Agent installed and running
- [ ] Agent listening on `http://127.0.0.1:5275`
- [ ] Verify Agent is running: `http://127.0.0.1:5275/api/health` returns `{"status":"ok","agent":"YAS Hardware Agent"}`
- [ ] Browser open to Vercel deployed site OR local dev server
- [ ] Browser console open (F12) for debugging

### Test 8.1: Agent Health Check
**Goal:** Verify Agent detection works when Agent is running

**Steps:**
1. Open browser console (F12)
2. Note Agent base URL and status
3. Check console logs for `[YAS Agent] Detection started`
4. Look for `[YAS Agent] Detection result: CONNECTED`

**Expected Result:**
- ✅ Console shows Agent connection successful
- ✅ No timeout errors
- ✅ No CORS errors
- ✅ Response validates: `status='ok'`, `agent='YAS Hardware Agent'`

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 8.2: Form Submission with Agent Present
**Goal:** Verify session creation requires and validates Agent presence

**Steps:**
1. Navigate to Client portal (http://localhost:8080/client/ or Vercel URL)
2. Verify `agentPreCheckPassed` flag was set during initial Agent check
3. Fill in form:
   - Customer Name: "تحقق فحص" (Test Check)
   - Phone: "+20 100 123 4567"
   - Service Order: "SO-2026-001"
   - Problem: "اختبار الفحص الكامل" (Full Diagnostic Test)
4. Click "بدء الفحص" (Start Diagnostic)
5. Observe console for session creation

**Expected Result:**
- ✅ Form validates successfully
- ✅ Session created with `hardwareSource='hardware-agent'`
- ✅ Redirects to diagnostic.html
- ✅ Console shows: `[AppState] Session created: sessionCode=...`
- ✅ No Agent verification errors

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 8.3: Hardware Data Display - Real Agent Data
**Goal:** Verify displayDeviceInfo() shows only Agent hardware data

**Steps:**
1. On diagnostic.html page
2. Wait for Agent to respond with hardware data
3. Check "معلومات الجهاز" (Device Information) section
4. Scroll down to see all hardware categories

**Expected Hardware Visible:**
- ✅ Computer (Brand, Model from /api/hardware)
- ✅ Operating System (Windows version, build)
- ✅ Processor (CPU name, cores from /api/hardware)
- ✅ RAM (Memory capacity from /api/hardware)
- ✅ Graphics (GPU name from /api/hardware)
- ✅ Storage (Disk info from /api/hardware)
- ✅ Battery (if laptop has battery)
- ✅ Network (Network adapters)
- ✅ Each item shows badge: "مساعد YAS" (YAS Agent)

**Expected Result:**
- ✅ All hardware data displayed correctly
- ✅ Source badges show "مساعد YAS"
- ✅ No browser fallback data shown
- ✅ No "N/A" or default values
- ✅ Console shows no validation errors for source

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Detailed Hardware Output:**
```
Computer: _________________________________
OS: _________________________________
Processor: _________________________________
RAM: _________________________________
GPU: _________________________________
Storage: _________________________________
Battery: _________________________________
Network: _________________________________
```

---

### Test 8.4: Session Metadata - Hardware Source Tracking
**Goal:** Verify session includes hardware_source in Supabase

**Steps:**
1. Complete diagnostic session (run tests, finish)
2. Check browser console for session completion log
3. Look for: `[AppState] Sync to Supabase: hardwareSource='hardware-agent'`
4. Optional: Check Supabase directly:
   - Go to https://supabase.com
   - Open your project
   - Go to "diagnostic_sessions" table
   - Find session by sessionCode from form
   - Check `hardware_source` column = `'hardware-agent'`
   - Check `agent_connected` = `true`

**Expected Result:**
- ✅ Console shows hardware source sync
- ✅ Supabase record has `hardware_source='hardware-agent'`
- ✅ Supabase record has `agent_connected=true`
- ✅ `agent_verified_at` timestamp is set
- ✅ Session NOT created if Agent not verified

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Supabase Verification:**
- Session Code: ___________________
- hardware_source: ___________________
- agent_connected: ___________________
- agent_verified_at: ___________________

---

### Test 8.5: Console Logging - No Sensitive Errors Leaking
**Goal:** Verify error handling logs debugging info but doesn't expose technical details

**Steps:**
1. Open browser console (F12)
2. Filter logs to show only `[YAS Agent]`, `[AppState]`, `[ClientForm]`
3. Look for error patterns - should be descriptive but safe

**Expected Console Pattern:**
```
[YAS Agent] Detection started
[YAS Agent] Checking: http://127.0.0.1:5275/api/health
[YAS Agent] Targeting loopback address space
[YAS Agent] Detection result: CONNECTED
[AppState] Session created: sessionCode=...
```

**Not Expected (Security Risk):**
- ✅ Raw stack traces
- ✅ Full error.message with technical details
- ✅ Sensitive file paths
- ✅ Internal API URLs

**Actual Result:**
- [ ] PASS - Logs are secure and descriptive
- [ ] FAIL - Details: _____________________

**Sample Console Output:**
```
[paste 5 key log lines here]
```

---

### Test 8.6: Timeout Handling
**Goal:** Verify Agent timeout is handled gracefully

**Steps:**
1. On diagnostic.html, check Agent response time
2. Note timeout is set to 5000ms (5 seconds) in code
3. Agent should respond within timeout

**Expected Result:**
- ✅ Agent responds within timeout
- ✅ Hardware data displayed
- ✅ No "timeout" errors shown to user
- ✅ Console logs indicate successful response

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Response Time:** __________ ms

---

### Test 8.7: Loopback Network Access
**Goal:** Verify fetch to localhost:5275 works correctly

**Steps:**
1. Browser is on HTTP (not HTTPS) - Agent only supports HTTP on localhost
2. Check Network tab (F12 → Network)
3. Look for request to `127.0.0.1:5275/api/health` and `127.0.0.1:5275/api/hardware`
4. Verify response status is 200 OK

**Expected Result:**
- ✅ Requests reach Agent successfully
- ✅ Status codes: 200 OK
- ✅ Response headers include CORS headers
- ✅ No "Failed to fetch" errors

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Network Tab Output:**
- Health Check Status: _____ (expected 200)
- Hardware Fetch Status: _____ (expected 200)

---

### Test 8.8: State Machine Transitions
**Goal:** Verify Agent state machine progresses correctly

**Steps:**
1. Open browser console
2. Navigate to Client form
3. Watch state transitions:
   - Should see: INITIALIZING → CHECKING → CONNECTED
4. Complete form and start diagnostic
5. Watch next transitions during diagnostic

**Expected State Progression:**
```
INITIALIZING (page load)
  ↓
CHECKING (detecting Agent)
  ↓
CONNECTED (Agent found and healthy)
  ↓
[Form submission]
  ↓
Session created with hardwareSource='hardware-agent'
```

**Actual Result:**
- [ ] PASS - States transition correctly
- [ ] FAIL - Details: _____________________

**State Transitions Observed:**
```
[paste console state logs here]
```

---

### Test 8.9: Error Recovery - Agent Restart
**Goal:** Verify system recovers if Agent restarts mid-diagnostic

**Steps:**
1. Start diagnostic on diagnostic.html
2. While diagnostic is running, stop Agent service on Windows
   - Open Task Manager
   - Find "YAS Hardware Agent" process
   - Click "End Task"
3. Wait 10 seconds
4. Restart Agent service
   - Or run: `dotnet run --project hardware-agent/src/YAS.HardwareAgent`

**Expected Result:**
- ✅ Error displayed to user (friendly Arabic message, not technical)
- ✅ User can retry or download installer
- ✅ Console shows error handling in action
- ✅ After restart, can create new session successfully

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 8.10: Session Persistence - localStorage Fallback
**Goal:** Verify session data persists even if offline

**Steps:**
1. Complete a diagnostic session
2. Open DevTools → Application → Local Storage
3. Check for key: `currentSession`
4. Verify session data is saved locally

**Expected Result:**
- ✅ Session data in localStorage
- ✅ hardwareSource tracked in localStorage
- ✅ Can recover session if page refreshes

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**localStorage Check:**
```
currentSession.hardwareSource: ___________________
currentSession.sessionCode: ___________________
currentSession.agentConnected: ___________________
```

---

## Summary - Phase 8

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
- [ ] All minor issues documented
- [ ] Ready for Phase 9 (Agent absent testing)

**Phase 8 Status:** 
- [ ] ✅ PASS - Agent present flow works correctly
- [ ] ❌ FAIL - See critical issues above

**Tester Signature:** ___________________  
**Date Completed:** ___________________

---

## Next Steps
Move to **Phase 9: QA Testing - Agent Absent** to verify installation-required flow.
