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
        document.getElementById('limitedTests').textContent = session.summary.limited;
        document.getElementById('notAvailableTests').textContent = session.summary.notAvailable;

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

        if (deviceInfo.cpu && deviceInfo.cpu.model) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">نوع المعالج</div>
                    <div class="device-info-detail-value">${deviceInfo.cpu.model}</div>
                </div>
            `;
        }

        if (deviceInfo.laptopModel) {
            html += `
                <div class="device-info-detail-item">
                    <div class="device-info-detail-label">نوع الجهاز</div>
                    <div class="device-info-detail-value">${deviceInfo.laptopModel}</div>
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

        // تصنيف الاختبارات
        const interactiveTests = ['screen', 'keyboard', 'mouse', 'camera', 'microphone', 'speaker'];
        const systemTests = ['network', 'battery', 'performance', 'storage', 'gpu'];

        let html = '';

        // قسم الاختبارات التفاعلية
        const interactiveResults = Object.entries(tests).filter(([id]) => interactiveTests.includes(id));
        if (interactiveResults.length > 0) {
            html += '<h3 class="result-section-title">الاختبارات التفاعلية</h3>';
            interactiveResults.forEach(([testId, result]) => {
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
            });
        }

        // قسم اختبارات النظام
        const systemResults = Object.entries(tests).filter(([id]) => systemTests.includes(id));
        if (systemResults.length > 0) {
            html += '<h3 class="result-section-title">اختبارات النظام</h3>';
            systemResults.forEach(([testId, result]) => {
                const status = statusMap[result.status] || statusMap['not_available'];
                const testName = testNames[testId] || testId;

                // عرض البيانات التفصيلية
                let dataHtml = '';
                if (result.data) {
                    dataHtml = '<div class="test-result-data">';
                    if (testId === 'network') {
                        dataHtml += `
                            <div class="data-row"><span class="data-label">الحالة:</span> <span class="data-value">${result.data.online ? 'متصل' : 'غير متصل'}</span></div>
                            <div class="data-row"><span class="data-label">النوع:</span> <span class="data-value">${result.data.type}</span></div>
                            <div class="data-row"><span class="data-label">السرعة:</span> <span class="data-value">${result.data.downlink}</span></div>
                            <div class="data-row"><span class="data-label">RTT:</span> <span class="data-value">${result.data.rtt}</span></div>
                        `;
                    } else if (testId === 'battery') {
                        dataHtml += `
                            <div class="data-row"><span class="data-label">المستوى:</span> <span class="data-value">${result.data.level}%</span></div>
                            <div class="data-row"><span class="data-label">الحالة:</span> <span class="data-value">${result.data.charging ? 'جاري الشحن' : 'غير مشحون'}</span></div>
                        `;
                    } else if (testId === 'performance') {
                        dataHtml += `
                            <div class="data-row"><span class="data-label">العمليات:</span> <span class="data-value">${result.data.iterations.toLocaleString()}</span></div>
                            <div class="data-row"><span class="data-label">المدة:</span> <span class="data-value">${result.data.duration.toFixed(2)}ms</span></div>
                            <div class="data-row"><span class="data-label">Web Worker:</span> <span class="data-value">${result.data.workerAvailable ? 'متاح' : 'غير متاح'}</span></div>
                        `;
                    } else if (testId === 'storage') {
                        dataHtml += `
                            <div class="data-row"><span class="data-label">الاستخدام:</span> <span class="data-value">${result.data.usagePercent}%</span></div>
                            <div class="data-row"><span class="data-label">نوع الهارد:</span> <span class="data-value">${result.data.diskType}</span></div>
                        `;
                    } else if (testId === 'gpu') {
                        dataHtml += `
                            <div class="data-row"><span class="data-label">WebGL:</span> <span class="data-value">${result.data.webgl ? 'متاح' : 'غير متاح'}</span></div>
                            <div class="data-row"><span class="data-label">Renderer:</span> <span class="data-value">${result.data.renderer || 'محدود'}</span></div>
                        `;
                    }
                    dataHtml += '</div>';
                }

                html += `
                    <div class="test-result-item">
                        <div class="test-result-header">
                            <span class="test-result-name">${testName}</span>
                            <span class="badge ${status.class}">${status.text}</span>
                        </div>
                        ${result.details ? `<div class="test-result-details">${result.details}</div>` : ''}
                        ${dataHtml}
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Client.init();
});
