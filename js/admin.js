// YAS Laptop Diagnostic System - Admin Portal
// هذا الملف يحتوي على وظائف الأدمن

const Admin = {
    // تهيئة الأدمن
    init: function() {
        console.log('YAS Admin Portal - Starting...');

        // تحميل البيانات من localStorage
        AppState.loadFromLocalStorage();

        // التحقق من الصفحة الحالية
        const path = window.location.pathname;

        if (path.includes('login.html')) {
            this.initLoginPage();
        } else if (path.includes('dashboard.html')) {
            this.initDashboard();
        } else if (path.includes('sessions.html')) {
            this.initSessionsPage();
        } else if (path.includes('session-details.html')) {
            this.initSessionDetailsPage();
        }

        console.log('YAS Admin Portal - Ready');
    },
    
    // تهيئة صفحة تسجيل الدخول
    initLoginPage: function() {
        const form = document.getElementById('adminLoginForm');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Mock Authentication
                // في المستقبل سيتم استبدال هذا بـ Authentication حقيقي
                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPassword').value;
                
                if (email && password) {
                    // حفظ حالة تسجيل الدخول
                    localStorage.setItem('adminLoggedIn', 'true');
                    
                    // الانتقال إلى لوحة التحكم
                    window.location.href = 'dashboard.html';
                }
            });
        }
    },
    
    // تهيئة لوحة التحكم
    initDashboard: function() {
        // التحقق من تسجيل الدخول
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        // تهيئة التنقل
        Navigation.init();
        
        // تحديث البيانات
        this.updateDashboard();
    },
    
    // تهيئة صفحة الجلسات
    initSessionsPage: function() {
        // التحقق من تسجيل الدخول
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        // تحديث جدول الجلسات
        this.updateSessionsTable();
    },
    
    // تهيئة صفحة تفاصيل الجلسة
    initSessionDetailsPage: function() {
        // التحقق من تسجيل الدخول
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        // عرض تفاصيل الجلسة
        this.displaySessionDetails();
    },
    
    // التحقق من تسجيل الدخول
    isLoggedIn: function() {
        return localStorage.getItem('adminLoggedIn') === 'true';
    },
    
    // تحديث لوحة التحكم
    updateDashboard: function() {
        // تحديث الإحصائيات
        const totalSessionsEl = document.getElementById('totalSessions');
        const todaySessionsEl = document.getElementById('todaySessions');
        const healthyDevicesEl = document.getElementById('healthyDevices');
        const problematicDevicesEl = document.getElementById('problematicDevices');
        
        if (totalSessionsEl) totalSessionsEl.textContent = AppState.recentSessions.length;
        if (todaySessionsEl) todaySessionsEl.textContent = AppState.recentSessions.length; // Mock
        if (healthyDevicesEl) healthyDevicesEl.textContent = AppState.recentSessions.length; // Mock
        if (problematicDevicesEl) problematicDevicesEl.textContent = 0; // Mock
        
        // تحديث جدول الجلسات الأخيرة
        this.updateRecentSessionsTable();
    },
    
    // تحديث جدول الجلسات الأخيرة
    updateRecentSessionsTable: function() {
        const tableBody = document.getElementById('recentSessionsTable');
        
        if (!tableBody) return;
        
        if (AppState.recentSessions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">لا توجد جلسات فحص حتى الآن</td>
                </tr>
            `;
            return;
        }
        
        const statusMap = {
            'active': '<span class="badge badge-warning">جاري الفحص</span>',
            'completed': '<span class="badge badge-success">مكتمل</span>',
            'needs_review': '<span class="badge badge-danger">تحتاج مراجعة</span>'
        };
        
        tableBody.innerHTML = AppState.recentSessions.slice(0, 5).map(session => `
            <tr>
                <td>#${session.sessionId}</td>
                <td>${session.customer.name}</td>
                <td>${statusMap[session.status] || session.status}</td>
                <td>${new Date(session.startedAt).toLocaleDateString('ar-SA')}</td>
                <td>
                    <a href="session-details.html?id=${session.sessionId}" class="btn btn-sm btn-primary">عرض</a>
                </td>
            </tr>
        `).join('');
    },
    
    // تحديث جدول جميع الجلسات
    updateSessionsTable: function() {
        const tableBody = document.getElementById('allSessionsTable');
        
        if (!tableBody) return;
        
        if (AppState.recentSessions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">لا توجد جلسات فحص حتى الآن</td>
                </tr>
            `;
            return;
        }
        
        const statusMap = {
            'active': '<span class="badge badge-warning">جاري الفحص</span>',
            'completed': '<span class="badge badge-success">مكتمل</span>',
            'needs_review': '<span class="badge badge-danger">تحتاج مراجعة</span>'
        };
        
        tableBody.innerHTML = AppState.recentSessions.map(session => `
            <tr>
                <td>#${session.sessionId}</td>
                <td>${session.customer.name}</td>
                <td>${session.customer.phone}</td>
                <td>${statusMap[session.status] || session.status}</td>
                <td>${new Date(session.startedAt).toLocaleDateString('ar-SA')}</td>
                <td>
                    <a href="session-details.html?id=${session.sessionId}" class="btn btn-sm btn-primary">عرض</a>
                </td>
            </tr>
        `).join('');
    },
    
    // عرض تفاصيل الجلسة
    displaySessionDetails: function() {
        // الحصول على معرف الجلسة من URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('id');

        if (!sessionId) {
            window.location.href = 'sessions.html';
            return;
        }

        const session = AppState.recentSessions.find(s => s.sessionId == sessionId);

        if (!session) {
            window.location.href = 'sessions.html';
            return;
        }

        // Use Diagnostic Summary Engine
        const summary = DiagnosticSummaryEngine.generateTechnicianSummary(session);
        const timeline = DiagnosticSummaryEngine.getTestTimeline(session);

        // عرض بيانات العميل
        document.getElementById('detailCustomerName').textContent = session.customer.name;
        document.getElementById('detailCustomerPhone').textContent = session.customer.phone;
        document.getElementById('detailServiceOrder').textContent = session.customer.serviceOrder || '-';
        document.getElementById('detailProblemDescription').textContent = session.customer.problem;

        // عرض معلومات الجهاز
        this.displayDeviceInfo(session.deviceInfo);

        // عرض Technician Summary
        this.displayTechnicianSummary(summary);

        // عرض Detected Issues
        this.displayIssues(summary.issues);

        // عرض Timeline
        this.displayTimeline(timeline);

        // عرض Technician Notes
        this.displayTechnicianNotes(session);

        // Setup add note button
        this.setupTechnicianNotes(session);

        // عرض نتائج الاختبارات
        this.displayTestResults(session.tests);
    },
    
    // عرض معلومات الجهاز
    displayDeviceInfo: function(deviceInfo) {
        const container = document.getElementById('detailDeviceInfo');

        if (!deviceInfo) {
            container.innerHTML = '<p class="empty-state">لا توجد معلومات</p>';
            return;
        }

        let html = '<div class="info-grid">';

        // Check if using new normalized structure
        const isNewStructure = deviceInfo.computer && deviceInfo.operatingSystem;

        if (isNewStructure) {
            // New normalized structure
            const manufacturer = this.getInfoValue(deviceInfo.computer?.manufacturer);
            const model = this.getInfoValue(deviceInfo.computer?.model);
            const deviceType = this.getInfoValue(deviceInfo.computer?.deviceType);
            const osName = this.getInfoValue(deviceInfo.operatingSystem?.name);
            const osVersion = this.getInfoValue(deviceInfo.operatingSystem?.version);
            const cpuName = this.getInfoValue(deviceInfo.cpu?.name);
            const cpuCores = this.getInfoValue(deviceInfo.cpu?.cores);
            const ramGB = this.getInfoValue(deviceInfo.memory?.totalGB);

            if (manufacturer) {
                html += this.createInfoItem('الشركة المصنعة', manufacturer);
            }
            if (model) {
                html += this.createInfoItem('الموديل', model);
            }
            if (deviceType) {
                html += this.createInfoItem('نوع الجهاز', deviceType);
            }
            if (osName) {
                html += this.createInfoItem('نظام التشغيل', osName);
            }
            if (osVersion) {
                html += this.createInfoItem('الإصدار', osVersion);
            }
            if (cpuName) {
                html += this.createInfoItem('المعالج', cpuName);
            }
            if (cpuCores) {
                html += this.createInfoItem('الأنوية', cpuCores);
            }
            if (ramGB) {
                html += this.createInfoItem('الذاكرة', `${ramGB} GB`);
            }

            // GPU
            if (deviceInfo.gpu && deviceInfo.gpu.length > 0) {
                deviceInfo.gpu.forEach((gpu, index) => {
                    const gpuName = this.getInfoValue(gpu.name);
                    if (gpuName) {
                        html += this.createInfoItem(index === 0 ? 'الرسوميات' : `الرسوميات ${index + 1}`, gpuName);
                    }
                });
            }

            // Storage
            if (deviceInfo.storage && deviceInfo.storage.length > 0) {
                deviceInfo.storage.forEach((disk, index) => {
                    const model = this.getInfoValue(disk.model);
                    const type = this.getInfoValue(disk.type);
                    const capacityGB = this.getInfoValue(disk.capacityGB);

                    if (model) {
                        html += this.createInfoItem(index === 0 ? 'التخزين' : `التخزين ${index + 1}`, model);
                    }
                    if (type) {
                        html += this.createInfoItem('النوع', type);
                    }
                    if (capacityGB) {
                        html += this.createInfoItem('السعة', `${capacityGB} GB`);
                    }
                });
            } else if (deviceInfo.storageWarning) {
                html += this.createInfoItem('التخزين', 'غير متاح من المتصفح');
            }

            // Show source for technician
            if (deviceInfo.hardwareSource) {
                const sourceLabel = deviceInfo.hardwareSource === 'hardware-agent' 
                    ? 'مساعد فحص YAS (Hardware Agent)'
                    : 'المتصفح (Browser)';
                const timestamp = deviceInfo.hardwareCapturedAt 
                    ? new Date(deviceInfo.hardwareCapturedAt).toLocaleString('ar-SA')
                    : 'غير متاح';
                
                html += '<div class="info-item" style="margin-top: 20px; border-top: 1px solid var(--color-neutral-200); padding-top: 10px; background-color: var(--color-neutral-50); padding: 10px; border-radius: 4px;">';
                html += `<span class="info-label" style="font-weight: bold; color: var(--color-primary);">مصدر المعلومات:</span>`;
                html += `<span class="info-value" style="color: var(--color-success-700); font-weight: 500;">${sourceLabel}</span>`;
                html += `<br/><span class="info-label" style="font-size: 0.85em; color: var(--color-neutral-600); margin-top: 5px; display: block;">وقت الجمع:</span>`;
                html += `<span class="info-value" style="font-size: 0.85em; color: var(--color-neutral-600);">${timestamp}</span>`;
                html += '</div>';
            }
        } else {
            // Legacy structure (backward compatibility)
            if (deviceInfo.os) {
                html += this.createInfoItem('نظام التشغيل', deviceInfo.os);
            }
            if (deviceInfo.browser) {
                html += this.createInfoItem('المتصفح', deviceInfo.browser);
            }
            if (deviceInfo.screen) {
                html += this.createInfoItem('دقة الشاشة', `${deviceInfo.screen.width} × ${deviceInfo.screen.height}`);
            }
            if (deviceInfo.cpu) {
                html += this.createInfoItem('المعالج', `${deviceInfo.cpu.cores} نواة`);
            }
            if (deviceInfo.ram) {
                html += this.createInfoItem('الذاكرة', deviceInfo.ram);
            }
        }

        html += '</div>';
        container.innerHTML = html;
    },

    // Helper: Get value from info field
    getInfoValue: function(field) {
        if (!field) return null;

        if (typeof field === 'object' && field.value !== undefined) {
            return field.value;
        }

        return field;
    },

    // Helper: Create info item
    createInfoItem: function(label, value) {
        const unavailable = value === null || value === 'غير متاح' || (typeof value === 'string' && value.includes('غير متاح'));
        return `
            <div class="info-item">
                <span class="info-label">${label}:</span>
                <span class="info-value ${unavailable ? 'unavailable' : ''}">${value}</span>
            </div>
        `;
    },
    
    // عرض نتائج الاختبارات
    displayTestResults: function(tests) {
        const container = document.getElementById('detailTestResults');

        if (!tests || Object.keys(tests).length === 0) {
            container.innerHTML = '<p class="empty-state">لا توجد نتائج</p>';
            return;
        }

        const testNames = {
            'screen': 'فحص الشاشة',
            'keyboard': 'فحص لوحة المفاتيح',
            'mouse': 'فحص الماوس',
            'camera': 'فحص الكاميرا',
            'microphone': 'فحص الميكروفون',
            'speaker': 'فحص السماعات',
            'network': 'فحص الشبكة',
            'battery': 'فحص البطارية',
            'performance': 'فحص الأداء',
            'storage': 'فحص التخزين',
            'gpu': 'فحص الرسوميات'
        };

        const statusMap = {
            'passed': { class: 'badge-success', text: 'اجتاز' },
            'failed': { class: 'badge-danger', text: 'فشل' },
            'warning': { class: 'badge-warning', text: 'تحذير' },
            'limited': { class: 'badge-warning', text: 'محدود' },
            'not_available': { class: 'badge-neutral', text: 'غير متاح' },
            'cancelled': { class: 'badge-neutral', text: 'ملغي' }
        };

        let html = '<div class="test-results-list">';

        for (const [testId, result] of Object.entries(tests)) {
            const status = statusMap[result.status] || statusMap['not_available'];
            const testName = testNames[testId] || testId;

            html += `
                <div class="test-result-item">
                    <div class="test-result-header">
                        <span class="test-result-name">${testName}</span>
                        <span class="badge ${status.class}">${status.text}</span>
                    </div>
                    ${result.details ? `<div class="test-result-details">${result.details}</div>` : ''}
                    ${result.data ? `<div class="test-result-data">${JSON.stringify(result.data, null, 2)}</div>` : ''}
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    },

    // عرض Technician Summary
    displayTechnicianSummary: function(summary) {
        const container = document.getElementById('technicianSummary');

        if (!container) return;

        const statusMap = {
            'COMPLETED': { class: 'badge-success', text: 'مكتمل' },
            'COMPLETED_WITH_WARNINGS': { class: 'badge-warning', text: 'مكتمل مع تحذيرات' },
            'COMPLETED_WITH_FAILURES': { class: 'badge-danger', text: 'مكتمل مع مشاكل' },
            'COMPLETED_WITH_LIMITATIONS': { class: 'badge-warning', text: 'مكتمل مع قيود' },
            'PARTIALLY_COMPLETED': { class: 'badge-neutral', text: 'غير مكتمل' }
        };

        const status = statusMap[summary.overallStatus] || statusMap['PARTIALLY_COMPLETED'];

        let html = `
            <div class="technician-summary-grid">
                <div class="summary-item">
                    <span class="summary-label">الحالة العامة:</span>
                    <span class="badge ${status.class}">${status.text}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">إجمالي الاختبارات:</span>
                    <span class="summary-value">${summary.totalTests}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">نجح:</span>
                    <span class="summary-value text-success">${summary.passed}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">تحذيرات:</span>
                    <span class="summary-value text-warning">${summary.warnings}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">فشل:</span>
                    <span class="summary-value text-danger">${summary.failed}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">محدود:</span>
                    <span class="summary-value text-warning">${summary.limited}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">غير متاح:</span>
                    <span class="summary-value text-neutral">${summary.notAvailable}</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // عرض Issues
    displayIssues: function(issues) {
        const container = document.getElementById('issuesList');
        const section = document.getElementById('issuesSection');

        if (!container || !section) return;

        if (!issues || issues.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        const severityMap = {
            'info': { class: 'badge-neutral', text: 'معلومة' },
            'low': { class: 'badge-warning', text: 'منخفض' },
            'medium': { class: 'badge-warning', text: 'متوسط' },
            'high': { class: 'badge-danger', text: 'عالي' }
        };

        let html = '';
        issues.forEach(issue => {
            const severity = severityMap[issue.severity] || severityMap['info'];
            html += `
                <div class="issue-item">
                    <div class="issue-header">
                        <span class="issue-title">${issue.title}</span>
                        <span class="badge ${severity.class}">${severity.text}</span>
                    </div>
                    <div class="issue-description">${issue.description}</div>
                    <div class="issue-source">المصدر: ${issue.sourceTestId}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // عرض Timeline
    displayTimeline: function(timeline) {
        const container = document.getElementById('testTimeline');
        const section = document.getElementById('timelineSection');

        if (!container || !section) return;

        if (!timeline || timeline.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        let html = '<div class="timeline-list">';
        timeline.forEach(item => {
            const time = new Date(item.timestamp).toLocaleTimeString('ar-SA');
            html += `
                <div class="timeline-item">
                    <span class="timeline-time">${time}</span>
                    <span class="timeline-event">${item.event}</span>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    // عرض Technician Notes
    displayTechnicianNotes: function(session) {
        const container = document.getElementById('technicianNotesList');

        if (!container) return;

        const notes = session.technicianNotes || [];

        if (notes.length === 0) {
            container.innerHTML = '<p class="empty-state">لا توجد ملاحظات</p>';
            return;
        }

        let html = '';
        notes.forEach(note => {
            const time = new Date(note.timestamp).toLocaleString('ar-SA');
            html += `
                <div class="technician-note-item">
                    <div class="note-header">
                        <span class="note-time">${time}</span>
                    </div>
                    <div class="note-content">${note.content}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Setup Technician Notes Input
    setupTechnicianNotes: function(session) {
        const input = document.getElementById('newTechnicianNote');
        const btn = document.getElementById('addTechnicianNoteBtn');

        if (!input || !btn) return;

        btn.addEventListener('click', () => {
            const content = input.value.trim();
            if (!content) return;

            if (!session.technicianNotes) {
                session.technicianNotes = [];
            }

            session.technicianNotes.push({
                content: content,
                timestamp: new Date().toISOString()
            });

            AppState.saveToLocalStorage();

            input.value = '';
            this.displayTechnicianNotes(session);
        });
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
