// YAS Laptop Diagnostic System - Navigation
// هذا الملف يحتوي على وظائف التنقل بين الصفحات

const Navigation = {
    // الصفحات المتاحة
    pages: {
        'dashboard': 'لوحة التحكم',
        'new-check': 'بدء فحص جديد',
        'devices': 'الأجهزة',
        'sessions': 'جلسات الفحص',
        'reports': 'التقارير',
        'settings': 'إعدادات'
    },
    
    // الصفحة الحالية
    currentPage: 'dashboard',
    
    // الانتقال إلى صفحة معينة
    navigateTo: function(pageName) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إزالة النشاط من جميع روابط التنقل
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // إظهار الصفحة المطلوبة
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // تحديث عنوان الصفحة
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle && this.pages[pageName]) {
                pageTitle.textContent = this.pages[pageName];
            }
            
            // تحديث رابط التنقل النشط
            const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            
            // إغلاق القائمة الجانبية في الموبايل
            this.closeSidebar();
            
            // تحديث البيانات حسب الصفحة
            this.updatePageData(pageName);
        }
    },
    
    // تحديث بيانات الصفحة
    updatePageData: function(pageName) {
        switch(pageName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'diagnostic-session':
                // التحقق من وجود جلسة نشطة
                if (!AppState.getCurrentSession()) {
                    // إذا لم تكن هناك جلسة نشطة، العودة إلى لوحة التحكم
                    this.navigateTo('dashboard');
                    return;
                }
                this.updateDiagnosticSession();
                break;
        }
    },
    
    // تحديث لوحة التحكم
    updateDashboard: function() {
        // تحديث الإحصائيات
        const totalDevicesEl = document.getElementById('totalDevices');
        const activeSessionsEl = document.getElementById('activeSessions');
        const completedSessionsEl = document.getElementById('completedSessions');
        const needsReviewEl = document.getElementById('needsReview');
        
        if (totalDevicesEl) totalDevicesEl.textContent = AppState.stats.totalDevices;
        if (activeSessionsEl) activeSessionsEl.textContent = AppState.stats.activeSessions;
        if (completedSessionsEl) completedSessionsEl.textContent = AppState.stats.completedSessions;
        if (needsReviewEl) needsReviewEl.textContent = AppState.stats.needsReview;
        
        // تحديث جدول الجلسات الأخيرة
        this.updateRecentSessionsTable();
    },
    
    // تحديث جدول الجلسات الأخيرة
    updateRecentSessionsTable: function() {
        const tableBody = document.getElementById('recentSessionsTable');
        
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
        
        const deviceTypeMap = {
            'laptop': 'لابتوب',
            'desktop': 'كمبيوتر مكتبي',
            'tablet': 'تابلت',
            'other': 'أخرى'
        };
        
        tableBody.innerHTML = AppState.recentSessions.slice(0, 5).map(session => `
            <tr>
                <td>#${session.id}</td>
                <td>${session.customerName}</td>
                <td>${deviceTypeMap[session.deviceType] || session.deviceType}</td>
                <td>${statusMap[session.status] || session.status}</td>
                <td>${new Date(session.createdAt).toLocaleDateString('ar-SA')}</td>
            </tr>
        `).join('');
    },
    
    // تحديث صفحة جلسة الفحص
    updateDiagnosticSession: function() {
        const session = AppState.getCurrentSession();
        
        if (session) {
            const deviceNameEl = document.getElementById('sessionDeviceName');
            const customerNameEl = document.getElementById('sessionCustomerName');
            const deviceModelEl = document.getElementById('sessionDeviceModel');
            const serialNumberEl = document.getElementById('sessionSerialNumber');
            
            if (deviceNameEl) {
                deviceNameEl.textContent = `${session.manufacturer} ${session.deviceModel}`;
            }
            if (customerNameEl) {
                customerNameEl.textContent = session.customerName;
            }
            if (deviceModelEl) {
                deviceModelEl.textContent = session.deviceModel;
            }
            if (serialNumberEl) {
                serialNumberEl.textContent = session.serialNumber || 'غير محدد';
            }
        }
    },
    
    // فتح القائمة الجانبية (موبايل)
    openSidebar: function() {
        document.getElementById('sidebar').classList.add('open');
    },
    
    // إغلاق القائمة الجانبية (موبايل)
    closeSidebar: function() {
        document.getElementById('sidebar').classList.remove('open');
    },
    
    // تهيئة التنقل
    init: function() {
        // إضافة مستمعي الأحداث لروابط التنقل
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = link.getAttribute('data-page');
                this.navigateTo(pageName);
            });
        });
        
        // زر فتح القائمة الجانبية
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.openSidebar();
            });
        }
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // تحميل الصفحة الافتراضية
        this.navigateTo('dashboard');
    }
};

// تصدير Navigation للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
