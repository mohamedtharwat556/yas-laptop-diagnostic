// YAS Laptop Diagnostic System - Client Portal
// هذا الملف يحتوي على وظائف العميل

const Client = {
    // تهيئة صفحة العميل
    init: function() {
        console.log('YAS Client Portal - Starting...');
        
        // التحقق من الصفحة الحالية
        const path = window.location.pathname;
        
        if (path.includes('index.html') || path.endsWith('/client/')) {
            this.initStartPage();
        } else if (path.includes('result.html')) {
            this.initResultPage();
        }
        
        console.log('YAS Client Portal - Ready');
    },
    
    // تهيئة صفحة البداية
    initStartPage: function() {
        const form = document.getElementById('clientForm');
        
        if (form) {
            // عداد الأحرف
            const problemDesc = document.getElementById('problemDescription');
            
            if (problemDesc) {
                problemDesc.addEventListener('input', (e) => {
                    const count = e.target.value.length;
                    document.getElementById('problemDescCount').textContent = count;
                });
            }
            
            // معالجة إرسال النموذج
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.validateForm(form)) {
                    const formData = new FormData(form);
                    const sessionData = {
                        customerName: formData.get('customerName'),
                        customerPhone: formData.get('customerPhone'),
                        serviceOrder: formData.get('serviceOrder'),
                        problemDescription: formData.get('problemDescription')
                    };
                    
                    // إضافة جلسة جديدة
                    AppState.addSession(sessionData);
                    
                    // الانتقال إلى صفحة الفحص
                    window.location.href = 'diagnostic.html';
                }
            });
        }
    },
    
    // التحقق من صحة النموذج
    validateForm: function(form) {
        let isValid = true;
        
        // الحقول المطلوبة
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const errorSpan = field.parentElement.querySelector('.form-error');
            
            if (!field.value.trim()) {
                field.classList.add('error');
                if (errorSpan) {
                    errorSpan.textContent = 'هذا الحقل مطلوب';
                }
                isValid = false;
            } else {
                field.classList.remove('error');
                if (errorSpan) {
                    errorSpan.textContent = '';
                }
            }
        });
        
        // التحقق من رقم الهاتف
        const phoneField = document.getElementById('customerPhone');
        if (phoneField && phoneField.value.trim()) {
            const phoneRegex = /^[0-9+()-\s]+$/;
            if (!phoneRegex.test(phoneField.value.trim())) {
                phoneField.classList.add('error');
                const errorSpan = phoneField.parentElement.querySelector('.form-error');
                if (errorSpan) {
                    errorSpan.textContent = 'رقم هاتف غير صالح';
                }
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    // تهيئة صفحة النتائج
    initResultPage: function() {
        const session = AppState.getCurrentSession();
        
        if (session) {
            this.displayResults(session);
        } else {
            // إذا لم تكن هناك جلسة، العودة إلى الصفحة الرئيسية
            window.location.href = 'index.html';
        }
    },
    
    // عرض النتائج
    displayResults: function(session) {
        // تحديث الملخص
        document.getElementById('passedTests').textContent = session.summary.passed;
        document.getElementById('failedTests').textContent = session.summary.failed;
        document.getElementById('warningTests').textContent = session.summary.warning;

        // تحديث حالة النتيجة
        this.updateResultStatus(session);

        // عرض معلومات الجهاز
        this.displayDeviceInfo(session.deviceInfo);

        // عرض نتائج الاختبارات
        this.displayTestResults(session.tests);
    },

    // تحديث حالة النتيجة
    updateResultStatus: function(session) {
        const statusEl = document.getElementById('resultStatus');
        const summary = session.summary;

        if (summary.failed > 0) {
            statusEl.textContent = 'تم إكمال الفحص - توجد مشاكل';
            statusEl.className = 'result-status result-status-failed';
        } else if (summary.warning > 0) {
            statusEl.textContent = 'تم إكمال الفحص - توجد تحذيرات';
            statusEl.className = 'result-status result-status-warning';
        } else if (summary.limited > 0) {
            statusEl.textContent = 'تم إكمال الفحص - بعض الاختبارات محدودة';
            statusEl.className = 'result-status result-status-warning';
        } else if (summary.passed > 0) {
            statusEl.textContent = 'تم إكمال الفحص بنجاح';
            statusEl.className = 'result-status result-status-success';
        } else {
            statusEl.textContent = 'الفحص غير مكتمل';
            statusEl.className = 'result-status result-status-pending';
        }
    },
    
    // عرض معلومات الجهاز
    displayDeviceInfo: function(deviceInfo) {
        const container = document.getElementById('deviceInfoDetails');
        
        if (!deviceInfo) {
            container.innerHTML = '<p class="empty-state">لا توجد معلومات</p>';
            return;
        }
        
        let html = '';
        
        if (deviceInfo.os) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">نظام التشغيل</div>
                    <div class="device-info-detail-value">${deviceInfo.os}</div>
                </div>
            `;
        }
        
        if (deviceInfo.browser) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">المتصفح</div>
                    <div class="device-info-detail-value">${deviceInfo.browser}</div>
                </div>
            `;
        }
        
        if (deviceInfo.screen) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">دقة الشاشة</div>
                    <div class="device-info-detail-value">${deviceInfo.screen.width} × ${deviceInfo.screen.height}</div>
                </div>
            `;
        }
        
        if (deviceInfo.cpu) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">المعالج</div>
                    <div class="device-info-detail-value">${deviceInfo.cpu.cores} نواة</div>
                </div>
            `;
        }
        
        if (deviceInfo.ram) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">الذاكرة العشوائية</div>
                    <div class="device-info-detail-value">${deviceInfo.ram}</div>
                </div>
            `;
        }
        
        container.innerHTML = html || '<p class="empty-state">لا توجد معلومات</p>';
    },
    
    // عرض نتائج الاختبارات
    displayTestResults: function(tests) {
        const container = document.getElementById('testResultsList');
        
        if (!tests || Object.keys(tests).length === 0) {
            container.innerHTML = '<p class="empty-state">لا توجد نتائج</p>';
            return;
        }
        
        const testNames = {
            'screen': 'فحص الشاشة',
            'keyboard': 'فحص لوحة المفاتيح',
            'mouse': 'فحص الماوس',
            'touchpad': 'فحص Touchpad',
            'camera': 'فحص الكاميرا',
            'microphone': 'فحص الميكروفون',
            'speakers': 'فحص السماعات',
            'network': 'فحص الشبكة',
            'battery': 'فحص البطارية',
            'performance': 'فحص الأداء',
            'storage': 'فحص التخزين',
            'graphics': 'فحص الرسوميات',
            'system': 'معلومات النظام'
        };
        
        const statusMap = {
            'passed': { class: 'badge-success', text: 'اجتاز' },
            'failed': { class: 'badge-danger', text: 'فشل' },
            'warning': { class: 'badge-warning', text: 'تحذير' },
            'limited': { class: 'badge-warning', text: 'محدود' },
            'not_available': { class: 'badge-neutral', text: 'غير متاح' }
        };
        
        let html = '';
        
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
        
        container.innerHTML = html;
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Client.init();
});
