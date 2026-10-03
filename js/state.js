// YAS Laptop Diagnostic System - State Management
// هذا الملف يحتوي على إدارة حالة التطبيق

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
        this.stats.activeSessions = this.recentSessions.filter(s => s.status === 'active').length;
        this.stats.completedSessions = this.recentSessions.filter(s => s.status === 'completed').length;
        this.stats.needsReview = this.recentSessions.filter(s => s.status === 'needs_review').length;
    },
    
    // إضافة جلسة فحص جديدة
    addSession: function(sessionData) {
        const session = {
            sessionId: Date.now().toString(),
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
            status: 'active',
            startedAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.recentSessions.unshift(session);
        this.currentSession = session;
        this.updateStats();
        
        // حفظ في localStorage للاستخدام بين الصفحات
        this.saveToLocalStorage();
        
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
    
    // حفظ نتيجة اختبار
    saveTestResult: function(testName, result) {
        if (this.currentSession) {
            this.currentSession.tests[testName] = result;
            this.testResults[testName] = result;
            
            // تحديث الملخص
            this.updateSummary(result);
            
            this.saveToLocalStorage();
        }
    },
    
    // تحديث ملخص النتائج
    updateSummary: function(result) {
        if (!this.currentSession) return;
        
        const summary = this.currentSession.summary;
        
        switch(result.status) {
            case 'passed':
                summary.passed++;
                break;
            case 'warning':
                summary.warning++;
                break;
            case 'failed':
                summary.failed++;
                break;
            case 'limited':
                summary.limited++;
                break;
            case 'not_available':
                summary.notAvailable++;
                break;
        }
    },
    
    // حفظ معلومات الجهاز
    saveDeviceInfo: function(deviceInfo) {
        if (this.currentSession) {
            this.currentSession.deviceInfo = deviceInfo;
            this.saveToLocalStorage();
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
    
    // إتمام جلسة الفحص الحالية
    completeCurrentSession: function() {
        if (this.currentSession) {
            this.updateSessionStatus(this.currentSession.sessionId, 'completed');
            this.currentSession = null;
            this.testResults = {};
            this.saveToLocalStorage();
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

// تحميل البيانات عند البدء
AppState.loadFromLocalStorage();

// تصدير State للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}
