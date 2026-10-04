// YAS Laptop Diagnostic System - State Management
// هذا الملف يحتوي على إدارة حالة التطبيق

// Categories for tests
const TestCategories = {
    INTERACTIVE: 'interactive',
    SYSTEM: 'system',
    DEVICE_INFO: 'device_info'
};

// Valid test statuses
const TestStatus = {
    PASS: 'pass',
    WARNING: 'warning',
    FAILED: 'failed',
    LIMITED: 'limited',
    NOT_AVAILABLE: 'not_available',
    PENDING: 'pending',
    RUNNING: 'running',
    CANCELLED: 'cancelled'
};

// Session statuses - MUST match Supabase schema
const SessionStatus = {
    CREATED: 'created',
    RUNNING: 'running',
    PARTIALLY_COMPLETED: 'partially_completed',
    COMPLETED: 'completed',
    COMPLETED_WITH_WARNINGS: 'completed_with_warnings',
    COMPLETED_WITH_FAILURES: 'completed_with_failures',
    COMPLETED_WITH_LIMITATIONS: 'completed_with_limitations'
};

// Severity levels for issues
const IssueSeverity = {
    INFO: 'info',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

const AppState = {
    // Mock Data - بيانات تجريبية للعرض فقط
    stats: {
        totalDevices: 0,
        activeSessions: 0,
        completedSessions: 0,
        needsReview: 0
    },

    recentSessions: [],

    currentSession: null,

    // إحصائيات الفحوصات
    testResults: {},
    
    // تحديث الإحصائيات (Mock Data)
    updateStats: function() {
        // في المستقبل سيتم جلب هذه البيانات من قاعدة البيانات
        // حالياً نستخدم بيانات تجريبية
        this.stats.totalDevices = this.recentSessions.length;
        this.stats.activeSessions = this.recentSessions.filter(s => 
            s.status === SessionStatus.CREATED || s.status === SessionStatus.RUNNING
        ).length;
        this.stats.completedSessions = this.recentSessions.filter(s => 
            s.status && s.status.startsWith('completed')
        ).length;
        this.stats.needsReview = this.recentSessions.filter(s => 
            s.status === SessionStatus.COMPLETED_WITH_FAILURES || 
            s.status === SessionStatus.COMPLETED_WITH_WARNINGS
        ).length;
    },
    
    // إضافة جلسة فحص جديدة
    // BATCH 6B-6: Ensures Agent verification + hardware source tracking
    addSession: async function(sessionData) {
        console.log('[AppState] addSession called with:', sessionData);
        console.log('[AppState] SessionService available:', !!window.sessionService);

        // BATCH 6B-6: Verify Agent was checked before session creation
        if (!window.agentPreCheckPassed) {
            const error = new Error('Agent verification required before session creation');
            console.error('[AppState] Session creation blocked:', error);
            throw error;
        }

        // Validate input data
        if (!sessionData.customerName?.trim() || !sessionData.customerPhone?.trim() || !sessionData.problemDescription?.trim()) {
            const error = new Error('Invalid session data: missing required fields');
            console.error('[AppState] Session creation failed:', error);
            throw error;
        }

        let supabaseSession = null;
        let creationError = null;

        // Try to create session via SessionService (which handles Supabase + fallback)
        if (window.sessionService) {
            try {
                console.log('[AppState] Calling SessionService.createSession...');
                supabaseSession = await window.sessionService.createSession({
                    name: sessionData.customerName,
                    phone: sessionData.customerPhone,
                    serviceOrder: sessionData.serviceOrder,
                    problem: sessionData.problemDescription,
                    // BATCH 6B-6: Include Agent metadata
                    hardware_source: 'hardware-agent',
                    agent_connected: true,
                    agent_verified_at: new Date().toISOString()
                });
                console.log('[AppState] Session created by SessionService:', {
                    sessionCode: supabaseSession?.sessionCode,
                    supabaseId: supabaseSession?.id,
                    syncStatus: supabaseSession?.sync_status,
                    hardwareSource: supabaseSession?.hardware_source
                });
            } catch (error) {
                creationError = error;
                console.error('[AppState] SessionService.createSession failed:', error);
            }
        } else {
            console.log('[AppState] SessionService not available - local mode only');
        }

        // Create AppState session
        const session = {
            sessionId: supabaseSession?.id || Date.now().toString(),
            sessionCode: supabaseSession?.sessionCode || null,
            supabaseId: supabaseSession?.id || null,
            syncStatus: supabaseSession?.sync_status || 'pending', // Track sync state
            // BATCH 6B-6: Hardware source tracking
            hardwareSource: 'hardware-agent',
            agentConnected: true,
            agentVerifiedAt: new Date().toISOString(),
            customer: {
                name: sessionData.customerName,
                phone: sessionData.customerPhone,
                serviceOrder: sessionData.serviceOrder || null,
                problem: sessionData.problemDescription
            },
            deviceInfo: null,
            tests: {},
            summary: {
                passed: 0,
                warning: 0,
                failed: 0,
                limited: 0,
                notAvailable: 0
            },
            status: SessionStatus.RUNNING,
            startedAt: new Date().toISOString(),
            completedAt: null,
            technicianNotes: [],
            createdAt: new Date().toISOString()
        };

        this.recentSessions.unshift(session);
        this.currentSession = session;
        this.updateStats();

        // Save to localStorage for persistence
        this.saveToLocalStorage();

        console.log('[AppState] Session added to AppState:', {
            sessionCode: session.sessionCode,
            status: session.status,
            syncStatus: session.syncStatus,
            hardwareSource: session.hardwareSource,
            agentConnected: session.agentConnected,
            isOnline: navigator.onLine
        });

        return session;
    },
    
    // تحديث حالة جلسة الفحص
    updateSessionStatus: function(sessionId, status) {
        const session = this.recentSessions.find(s => s.sessionId === sessionId);
        if (session) {
            session.status = status;
            if (status === 'completed') {
                session.completedAt = new Date().toISOString();
            }
            this.updateStats();
            this.saveToLocalStorage();
        }
    },
    
    // حفظ نتيجة اختبار - Normalized Model
    saveTestResult: async function(testId, result) {
        if (this.currentSession) {
            const startTime = Date.now();

            // Normalized test result model
            const normalizedResult = {
                id: testId,
                name: result.name || testId,
                category: result.category || TestCategories.SYSTEM,
                status: result.status || TestStatus.NOT_AVAILABLE,
                startedAt: result.startedAt || new Date().toISOString(),
                completedAt: result.completedAt || new Date().toISOString(),
                duration: result.duration || 0,
                summary: result.summary || result.details || '',
                details: result.details || '',
                data: result.data || {},
                limitations: result.limitations || [],
                evidence: result.evidence || null,
                userConfirmation: result.userConfirmation || false
            };

            // Calculate duration if not provided
            if (!result.duration && result.startedAt && result.completedAt) {
                const start = new Date(result.startedAt).getTime();
                const end = new Date(result.completedAt).getTime();
                normalizedResult.duration = end - start;
            }

            this.currentSession.tests[testId] = normalizedResult;
            this.testResults[testId] = normalizedResult;

            // تحديث الملخص
            this.updateSummary(normalizedResult);

            this.saveToLocalStorage();

            // Sync to Supabase if available
            if (window.sessionService && this.currentSession.sessionCode) {
                try {
                    await window.sessionService.saveTestResult(this.currentSession.sessionCode, testId, normalizedResult);
                } catch (error) {
                    console.error('Failed to sync test result to Supabase:', error);
                }
            }
        }
    },
    
    // تحديث ملخص النتائج
    updateSummary: function(result) {
        if (!this.currentSession) return;

        const summary = this.currentSession.summary;

        switch(result.status) {
            case TestStatus.PASS:
            case 'passed': // For backward compatibility
                summary.passed++;
                break;
            case TestStatus.WARNING:
            case 'warning': // For backward compatibility
                summary.warning++;
                break;
            case TestStatus.FAILED:
            case 'failed': // For backward compatibility
                summary.failed++;
                break;
            case TestStatus.LIMITED:
            case 'limited': // For backward compatibility
                summary.limited++;
                break;
            case TestStatus.NOT_AVAILABLE:
            case 'not_available': // For backward compatibility
                summary.notAvailable++;
                break;
            case TestStatus.CANCELLED:
            case 'cancelled': // For backward compatibility
                // لا نضيف للمجموع - المستخدم ألغى الاختبار
                break;
        }
    },

    // حفظ في localStorage
    saveToLocalStorage: function() {
        try {
            localStorage.setItem('diagnosticSessions', JSON.stringify(this.recentSessions));
            if (this.currentSession) {
                localStorage.setItem('currentSession', JSON.stringify(this.currentSession));
            } else {
                localStorage.removeItem('currentSession');
            }
        } catch (e) {
            console.log('Failed to save to localStorage:', e);
        }
    },

    // تحميل من localStorage
    loadFromLocalStorage: function() {
        try {
            const sessions = localStorage.getItem('diagnosticSessions');
            const current = localStorage.getItem('currentSession');

            if (sessions) {
                this.recentSessions = JSON.parse(sessions);
            }

            if (current) {
                this.currentSession = JSON.parse(current);
            }
        } catch (e) {
            console.log('Failed to load from localStorage:', e);
            // In case of corruption, clear the data
            this.recentSessions = [];
            this.currentSession = null;
        }
    },
    
    // حفظ معلومات الجهاز - BATCH 6B-6: Agent source tracking
    saveDeviceInfo: async function(deviceInfo) {
        if (this.currentSession) {
            // BATCH 6B-6: Validate source is hardware-agent
            if (deviceInfo.source !== 'hardware-agent') {
                console.warn('[AppState] Invalid device info source:', deviceInfo.source);
                // Still save but mark as invalid source
            }
            
            this.currentSession.deviceInfo = deviceInfo;
            this.currentSession.hardwareSource = deviceInfo.source || 'unknown';
            this.saveToLocalStorage();

            // Sync to Supabase if available
            if (window.sessionService && this.currentSession.sessionCode) {
                try {
                    await window.sessionService.saveDeviceInfo(this.currentSession.sessionCode, deviceInfo);
                    console.log('[AppState] Device info synced to Supabase');
                } catch (error) {
                    console.error('[AppState] Failed to sync device info to Supabase:', error);
                }
            }
        }
    },
    
    // الحصول على جلسة فحص حالية
    getCurrentSession: function() {
        if (!this.currentSession) {
            this.loadFromLocalStorage();
        }
        return this.currentSession;
    },
    
    // الحصول على جلسة بواسطة ID
    getSessionById: function(sessionId) {
        return this.recentSessions.find(s => s.sessionId === sessionId);
    },
    
    // إلغاء جلسة الفحص الحالية
    cancelCurrentSession: function() {
        if (this.currentSession) {
            const index = this.recentSessions.findIndex(s => s.sessionId === this.currentSession.sessionId);
            if (index > -1) {
                this.recentSessions.splice(index, 1);
            }
            this.currentSession = null;
            this.testResults = {};
            this.updateStats();
            this.saveToLocalStorage();
        }
    },
    
    // إتمام جلسة الفحص الحالية - BATCH 6B-6: Track hardware source
    completeCurrentSession: function() {
        if (this.currentSession) {
            const summary = this.currentSession.summary;
            
            // Determine final status based on test results
            if (summary.failed > 0) {
                this.currentSession.status = SessionStatus.COMPLETED_WITH_FAILURES;
            } else if (summary.warning > 0) {
                this.currentSession.status = SessionStatus.COMPLETED_WITH_WARNINGS;
            } else if (summary.limited > 0 || summary.notAvailable > 0) {
                this.currentSession.status = SessionStatus.COMPLETED_WITH_LIMITATIONS;
            } else if (summary.passed > 0) {
                this.currentSession.status = SessionStatus.COMPLETED;
            } else {
                this.currentSession.status = SessionStatus.PARTIALLY_COMPLETED;
            }
            
            this.currentSession.completedAt = new Date().toISOString();
            this.updateStats();
            this.saveToLocalStorage();

            // Sync to Supabase if available
            if (window.sessionService && this.currentSession.sessionCode) {
                window.sessionService.completeSession(this.currentSession.sessionCode, {
                    summary: this.currentSession.summary,
                    hardwareSource: this.currentSession.hardwareSource,
                    agentConnected: this.currentSession.agentConnected,
                    issues: DiagnosticSummaryEngine.extractIssues(this.currentSession)
                }).catch(error => {
                    console.error('[AppState] Failed to sync session completion to Supabase:', error);
                });
            }
        }
    },
    
    // حفظ في localStorage
    saveToLocalStorage: function() {
        try {
            localStorage.setItem('diagnosticSessions', JSON.stringify(this.recentSessions));
            if (this.currentSession) {
                localStorage.setItem('currentSession', JSON.stringify(this.currentSession));
            } else {
                localStorage.removeItem('currentSession');
            }
        } catch (e) {
            console.log('Failed to save to localStorage:', e);
        }
    },
    
    // تحميل من localStorage
    loadFromLocalStorage: function() {
        try {
            const sessions = localStorage.getItem('diagnosticSessions');
            const current = localStorage.getItem('currentSession');
            
            if (sessions) {
                this.recentSessions = JSON.parse(sessions);
            }
            
            if (current) {
                this.currentSession = JSON.parse(current);
            }
        } catch (e) {
            console.log('Failed to load from localStorage:', e);
        }
    },
    
    // مسح البيانات
    clearData: function() {
        this.recentSessions = [];
        this.currentSession = null;
        this.testResults = {};
        localStorage.removeItem('diagnosticSessions');
        localStorage.removeItem('currentSession');
    }
};

// Diagnostic Summary Engine
const DiagnosticSummaryEngine = {
    // Calculate overall status
    calculateOverallStatus: function(session) {
        if (!session || !session.tests) {
            return 'PENDING';
        }

        const tests = Object.values(session.tests);
        if (tests.length === 0) {
            return 'PENDING';
        }

        const summary = session.summary;

        // Priority: FAILED > WARNING > LIMITED/NOT_AVAILABLE > PASS
        if (summary.failed > 0) {
            return 'COMPLETED_WITH_FAILURES';
        }

        if (summary.warning > 0) {
            return 'COMPLETED_WITH_WARNINGS';
        }

        if (summary.limited > 0 || summary.notAvailable > 0) {
            return 'COMPLETED_WITH_LIMITATIONS';
        }

        if (summary.passed > 0) {
            return 'COMPLETED';
        }

        return 'PARTIALLY_COMPLETED';
    },

    // Get total test count
    getTotalTests: function(session) {
        if (!session || !session.tests) return 0;
        return Object.keys(session.tests).length;
    },

    // Extract issues from test results
    extractIssues: function(session) {
        if (!session || !session.tests) return [];

        const issues = [];
        const tests = Object.values(session.tests);

        tests.forEach(test => {
            if (test.status === TestStatus.FAILED || test.status === 'failed') {
                issues.push({
                    type: this.getIssueType(test.id),
                    severity: IssueSeverity.HIGH,
                    title: `مشكلة في ${test.name}`,
                    description: test.details || 'فشل الاختبار',
                    sourceTestId: test.id
                });
            } else if (test.status === TestStatus.WARNING || test.status === 'warning') {
                issues.push({
                    type: this.getIssueType(test.id),
                    severity: IssueSeverity.MEDIUM,
                    title: `ملاحظة في ${test.name}`,
                    description: test.details || 'تحذير من الاختبار',
                    sourceTestId: test.id
                });
            } else if (test.status === TestStatus.LIMITED || test.status === 'limited') {
                issues.push({
                    type: this.getIssueType(test.id),
                    severity: IssueSeverity.INFO,
                    title: `اختبار محدود: ${test.name}`,
                    description: test.details || 'الاختبار محدود بسبب قيود المتصفح',
                    sourceTestId: test.id
                });
            } else if (test.status === TestStatus.NOT_AVAILABLE || test.status === 'not_available') {
                issues.push({
                    type: this.getIssueType(test.id),
                    severity: IssueSeverity.INFO,
                    title: `اختبار غير متاح: ${test.name}`,
                    description: test.details || 'الاختبار غير متاح في هذا المتصفح',
                    sourceTestId: test.id
                });
            }
        });

        return issues;
    },

    // Get issue type based on test ID
    getIssueType: function(testId) {
        const typeMap = {
            'screen': 'display',
            'keyboard': 'input',
            'mouse': 'input',
            'camera': 'media',
            'microphone': 'media',
            'speaker': 'audio',
            'network': 'network',
            'battery': 'power',
            'performance': 'performance',
            'storage': 'storage',
            'gpu': 'graphics'
        };
        return typeMap[testId] || 'general';
    },

    // Collect all limitations
    collectLimitations: function(session) {
        if (!session || !session.tests) return [];

        const limitations = new Set();
        const tests = Object.values(session.tests);

        tests.forEach(test => {
            if (test.limitations && Array.isArray(test.limitations)) {
                test.limitations.forEach(limit => limitations.add(limit));
            }

            // Add common limitations based on status
            if (test.status === TestStatus.LIMITED || test.status === 'limited') {
                if (test.id === 'storage') {
                    limitations.add('المتصفح لا يستطيع تحديد نوع الهارد (SSD/HDD) بسبب قيود الأمان');
                }
                if (test.id === 'gpu') {
                    limitations.add('معلومات GPU Renderer محدودة بسبب قيود الخصوصية');
                }
                if (test.id === 'battery') {
                    limitations.add('Battery API غير متاح في هذا المتصفح');
                }
                if (test.id === 'network') {
                    limitations.add('Network API غير متاح في هذا المتصفح');
                }
            }
        });

        return Array.from(limitations);
    },

    // Generate customer summary
    generateCustomerSummary: function(session) {
        if (!session) return '';

        const totalTests = this.getTotalTests(session);
        const summary = session.summary;
        const overallStatus = this.calculateOverallStatus(session);

        let text = `تم إكمال الفحص\n`;
        text += `تم تنفيذ ${totalTests} اختبار.\n\n`;

        if (summary.passed > 0) {
            text += `✓ ${summary.passed} اختبارات ناجحة\n`;
        }
        if (summary.warning > 0) {
            text += `⚠ ${summary.warning} ملاحظة\n`;
        }
        if (summary.failed > 0) {
            text += `✕ ${summary.failed} مشكلة\n`;
        }
        if (summary.limited > 0) {
            text += `ℹ ${summary.limited} اختبار محدود\n`;
        }
        if (summary.notAvailable > 0) {
            text += `ℹ ${summary.notAvailable} اختبار غير متاح\n`;
        }

        return text;
    },

    // Generate technician summary
    generateTechnicianSummary: function(session) {
        if (!session) return null;

        return {
            overallStatus: this.calculateOverallStatus(session),
            totalTests: this.getTotalTests(session),
            passed: session.summary.passed,
            warnings: session.summary.warning,
            failed: session.summary.failed,
            limited: session.summary.limited,
            notAvailable: session.summary.notAvailable,
            issues: this.extractIssues(session),
            limitations: this.collectLimitations(session)
        };
    },

    // Format duration for display
    formatDuration: function(ms) {
        if (!ms || ms < 0) return 'غير متاح';

        if (ms < 1000) {
            return `${ms} ms`;
        } else if (ms < 60000) {
            const seconds = (ms / 1000).toFixed(1);
            return `${seconds} ثانية`;
        } else {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(0);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    },

    // Get test timeline
    getTestTimeline: function(session) {
        if (!session || !session.tests) return [];

        const timeline = [];
        const tests = Object.values(session.tests);

        // Add session start
        if (session.startedAt) {
            timeline.push({
                timestamp: session.startedAt,
                event: 'بدأ الفحص',
                type: 'session'
            });
        }

        // Add each test
        tests.forEach(test => {
            if (test.startedAt) {
                timeline.push({
                    timestamp: test.startedAt,
                    event: test.name,
                    type: 'test_start',
                    testId: test.id
                });
            }
        });

        // Add session completion
        if (session.completedAt) {
            timeline.push({
                timestamp: session.completedAt,
                event: 'اكتمل الفحص',
                type: 'session'
            });
        }

        // Sort by timestamp
        timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return timeline;
    }
};

// تحميل البيانات عند البدء
AppState.loadFromLocalStorage();

// تصدير State للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}
