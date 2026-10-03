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
        
        // عرض بيانات العميل
        document.getElementById('detailCustomerName').textContent = session.customer.name;
        document.getElementById('detailCustomerPhone').textContent = session.customer.phone;
        document.getElementById('detailServiceOrder').textContent = session.customer.serviceOrder || '-';
        document.getElementById('detailProblemDescription').textContent = session.customer.problem;
        
        // عرض معلومات الجهاز
        this.displayDeviceInfo(session.deviceInfo);
        
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
        
        if (deviceInfo.os) {
            html += `
                <div class="info-item">
                    <span class="info-label">نظام التشغيل:</span>
                    <span class="info-value">${deviceInfo.os}</span>
                </div>
            `;
        }
        
        if (deviceInfo.browser) {
            html += `
                <div class="info-item">
                    <span class="info-label">المتصفح:</span>
                    <span class="info-value">${deviceInfo.browser}</span>
                </div>
            `;
        }
        
        if (deviceInfo.screen) {
            html += `
                <div class="info-item">
                    <span class="info-label">دقة الشاشة:</span>
                    <span class="info-value">${deviceInfo.screen.width} × ${deviceInfo.screen.height}</span>
                </div>
            `;
        }
        
        if (deviceInfo.cpu) {
            html += `
                <div class="info-item">
                    <span class="info-label">المعالج:</span>
                    <span class="info-value">${deviceInfo.cpu.cores} نواة</span>
                </div>
            `;
        }
        
        if (deviceInfo.ram) {
            html += `
                <div class="info-item">
                    <span class="info-label">الذاكرة:</span>
                    <span class="info-value">${deviceInfo.ram}</span>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
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
            'microphone': 'فحص الميكروفون'
        };
        
        const statusMap = {
            'passed': { class: 'badge-success', text: 'اجتاز' },
            'failed': { class: 'badge-danger', text: 'فشل' },
            'warning': { class: 'badge-warning', text: 'تحذير' },
            'limited': { class: 'badge-warning', text: 'محدود' },
            'not_available': { class: 'badge-neutral', text: 'غير متاح' }
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
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
