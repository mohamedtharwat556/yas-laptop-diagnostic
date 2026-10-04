# BATCH 6B-6 QA Testing - Phase 9
**Mandatory Hardware Agent Flow - Agent Absent Scenarios**

**Status:** NOT STARTED  
**Date Started:** _____  
**Tester:** [Your Name]  

---

## Phase 9: QA Testing - Agent Absent

### Prerequisites
- [ ] Windows machine without YAS Hardware Agent running
- [ ] Verify Agent is NOT listening: `http://127.0.0.1:5275/api/health` should FAIL
- [ ] Browser console open (F12) for debugging
- [ ] Phase 8 (Agent present) tests already completed and passed

### Test 9.1: Agent Detection Failure
**Goal:** Verify system detects Agent is not running

**Steps:**
1. Make sure YAS Hardware Agent is NOT running
   - Check Task Manager - no "YAS Hardware Agent" process
   - Or verify: `http://127.0.0.1:5275/api/health` fails
2. Navigate to Client portal
3. Watch browser console

**Expected Result:**
- ✅ Console shows: `[YAS Agent] Connection error: Failed to fetch`
- ✅ State transitions: INITIALIZING → CHECKING → DISCONNECTED
- ✅ No form submission allowed
- ✅ UI indicates Agent not found

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

**Console Output:**
```
[paste detection failure logs here]
```

---

### Test 9.2: Redirect to Installation Screen
**Goal:** Verify form submission redirects to installation-required.html

**Steps:**
1. Agent is not running (from Test 9.1)
2. Try to fill and submit the client form
3. Observe behavior

**Expected Result:**
- ✅ Form submission blocked
- ✅ User redirected to installation-required.html
- ✅ Arabic message shows: "مساعد YAS مطلوب" (YAS Agent Required)
- ✅ NO partial session created
- ✅ NO Supabase sync attempted

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 9.3: installation-required.html UI
**Goal:** Verify installation screen displays correctly and functions

**Steps:**
1. On installation-required.html (redirected from form)
2. Check page content:
   - Title and description
   - Download button
   - Installation instructions
   - "Verify Installation" section
   - Auto-polling status

**Expected Content:**
- ✅ Arabic title: "مساعد YAS مطلوب"
- ✅ Download button points to installer
- ✅ Instructions for installation visible
- ✅ "فحص الاتصال" (Check Connection) button
- ✅ Auto-polling indicator active

**Expected Result:**
- [ ] PASS - UI displays all expected elements
- [ ] FAIL - Details: _____________________

---

### Test 9.4: Auto-Polling During Installation
**Goal:** Verify system automatically checks for Agent after installation

**Steps:**
1. On installation-required.html
2. Click "Download Installer" button
3. Follow installer instructions to install Agent
4. Don't need to complete installation - just get Agent running
5. Or start Agent manually: `dotnet run --project hardware-agent/src/YAS.HardwareAgent`
6. Watch the page - should auto-poll every 3 seconds

**Expected Result:**
- ✅ Page auto-polls for Agent connection
- ✅ When Agent starts, polling detects it
- ✅ State changes: DISCONNECTED → CHECKING → CONNECTED
- ✅ Page automatically redirects to Client form or diagnostic
- ✅ Console shows polling attempts: `[YAS Agent] Detection started`

**Actual Result:**
- [ ] PASS - Auto-polling works
- [ ] FAIL - Details: _____________________

**Polling Attempts Observed:** _____ times before detecting Agent

---

### Test 9.5: Manual Verification Button
**Goal:** Verify "Check Connection" button triggers manual verification

**Steps:**
1. On installation-required.html (Agent not running initially)
2. Click "فحص الاتصال" (Check Connection) button
3. Start Agent
4. Click button again

**Expected Result:**
- ✅ First click shows "مساعد YAS غير متصل" (Agent not connected)
- ✅ After starting Agent, button shows loading state
- ✅ Second click detects Agent connection
- ✅ Auto-redirects to Client form

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 9.6: No Fallback to Browser Data
**Goal:** Verify diagnostic CANNOT start without Agent

**Steps:**
1. Agent not running
2. Try to bypass installation screen by going directly to diagnostic.html
3. Check if diagnostic starts or blocks

**Expected Result:**
- ✅ diagnostic.html displays blocked message
- ✅ No browser-based tests run
- ✅ No fake hardware data shown
- ✅ Error message: "مساعد YAS غير متصل"
- ✅ User redirected to installation-required.html

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 9.7: No Session Created Without Agent
**Goal:** Verify session is NOT created if Agent verification fails

**Steps:**
1. Agent not running
2. Try to submit form (if you get past validation)
3. Check browser console
4. Check Supabase (if available):
   - No session should be created with this timestamp
   - Or session created but with agentConnected=false

**Expected Result:**
- ✅ Console shows: `[AppState] Agent verification required before session creation`
- ✅ Form submission blocked
- ✅ No session in Supabase
- ✅ Error shown to user

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

### Test 9.8: Graceful Error Messages
**Goal:** Verify error messages are user-friendly (Arabic, no technical details)

**Steps:**
1. Agent not running
2. Navigate to Client form
3. Try to submit
4. Check error message shown to user

**Expected Error Message:**
- ✅ Arabic message (not English)
- ✅ User-friendly (not technical)
- ✅ No error codes (not "ERR_CONNECTION_REFUSED")
- ✅ No stack traces
- ✅ No internal URLs

**Example Good Message:**
❌ "خطأ: ERR_FETCH_FAILED at 127.0.0.1:5275"  
✅ "يجب تثبيت مساعد YAS أولاً"

**Actual Result:**
- [ ] PASS - Messages are user-friendly
- [ ] FAIL - Details: _____________________

**Error Message Observed:**
```
[paste error message here]
```

---

### Test 9.9: State Machine - Agent Absent Path
**Goal:** Verify state machine correctly represents Agent absence

**Steps:**
1. Agent not running
2. Open browser console
3. Watch state transitions during:
   - Initial page load
   - Form submission attempt
   - Redirect to installation screen
   - After Agent starts

**Expected State Sequence:**
```
INITIALIZING
  ↓
CHECKING (detecting Agent)
  ↓
DISCONNECTED (Agent not found)
  ↓
INSTALLATION_REQUIRED (display install screen)
  ↓
[User installs/starts Agent]
  ↓
CHECKING (auto-poll detects Agent)
  ↓
CONNECTED (Agent is now running)
  ↓
[Redirect to Client form]
```

**Actual Result:**
- [ ] PASS - State transitions follow expected path
- [ ] FAIL - Details: _____________________

---

### Test 9.10: localStorage Behavior - Agent Absent Session
**Goal:** Verify localStorage handles Agent-absent gracefully

**Steps:**
1. Agent not running
2. Check DevTools → Application → Local Storage
3. Look for `currentSession`
4. Should be empty or contain previous session (not new one)

**Expected Result:**
- ✅ No NEW session created
- ✅ Old session (if exists) still there
- ✅ Can still start new session after Agent connects

**Actual Result:**
- [ ] PASS
- [ ] FAIL - Details: _____________________

---

## Summary - Phase 9

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
- [ ] Ready for Phase 10 (Installation flow testing)

**Phase 9 Status:** 
- [ ] ✅ PASS - Agent absent flow works correctly
- [ ] ❌ FAIL - See critical issues above

**Tester Signature:** ___________________  
**Date Completed:** ___________________

---

## Next Steps
Move to **Phase 10: QA Testing - Installation Flow** to verify end-to-end installer experience.
