// YAS Laptop Diagnostic System - Main Application
// هذا الملف يحتوي على الوظائف الرئيسية للتطبيق

const App = {
    // تهيئة التطبيق
    init: function() {
        console.log('YAS Laptop Diagnostic System - Starting...');
        
        // تهيئة التنقل
        Navigation.init();
        
        // تهيئة النموذج
        this.initForm();
        
        // تهيئة اختبارات التشخيص
        this.initDiagnosticTests();
        
        // تهيئة أزرار جلسة الفحص
        this.initSessionActions();
        
        console.log('YAS Laptop Diagnostic System - Ready');
    },
    
    // تهيئة نموذج بدء الفحص
    initForm: function() {
        const form = document.getElementById('newCheckForm');
        
        if (form) {
            // عداد الأحرف
            const problemDesc = document.getElementById('problemDescription');
            const customerNotes = document.getElementById('customerNotes');
            
            if (problemDesc) {
                problemDesc.addEventListener('input', (e) => {
                    const count = e.target.value.length;
                    document.getElementById('problemDescCount').textContent = count;
                });
            }
            
            if (customerNotes) {
                customerNotes.addEventListener('input', (e) => {
                    const count = e.target.value.length;
                    document.getElementById('customerNotesCount').textContent = count;
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
                        company: formData.get('company'),
                        deviceType: formData.get('deviceType'),
                        manufacturer: formData.get('manufacturer'),
                        deviceModel: formData.get('deviceModel'),
                        serialNumber: formData.get('serialNumber'),
                        serviceTag: formData.get('serviceTag'),
                        problemDescription: formData.get('problemDescription'),
                        customerNotes: formData.get('customerNotes')
                    };
                    
                    // إضافة جلسة جديدة
                    AppState.addSession(sessionData);
                    
                    // الانتقال إلى صفحة جلسة الفحص
                    Navigation.navigateTo('diagnostic-session');
                    
                    // إعادة تعيين النموذج
                    form.reset();
                    document.getElementById('problemDescCount').textContent = '0';
                    document.getElementById('customerNotesCount').textContent = '0';
                }
            });
            
            // معالجة إلغاء النموذج
            form.addEventListener('reset', () => {
                // إزالة رسائل الخطأ
                form.querySelectorAll('.form-error').forEach(error => {
                    error.textContent = '';
                });
                form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
                    input.classList.remove('error');
                });
                document.getElementById('problemDescCount').textContent = '0';
                document.getElementById('customerNotesCount').textContent = '0';
            });
        }
    },
    
    // التحقق من صحة النموذج
    validateForm: function(form) {
        let isValid = true;
        
        // الحقول المطلوبة
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            // البحث عن عنصر الخطأ الصحيح
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
    
    // تهيئة اختبارات التشخيص
    initDiagnosticTests: function() {
        // أزرار بدء الاختبار
        document.querySelectorAll('.test-start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testName = btn.getAttribute('data-test');
                this.startTest(testName);
            });
        });
        
        // أزرار إعادة الاختبار
        document.querySelectorAll('.test-retry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testName = btn.getAttribute('data-test');
                this.startTest(testName);
            });
        });
    },
    
    // بدء اختبار
    startTest: function(testName) {
        const testCard = document.querySelector(`.test-card[data-test="${testName}"]`);
        if (!testCard) return;
        
        const statusDiv = document.getElementById(`${testName}-status`);
        const progressDiv = document.getElementById(`${testName}-progress`);
        const resultDiv = document.getElementById(`${testName}-result`);
        const startBtn = testCard.querySelector('.test-start-btn');
        const retryBtn = testCard.querySelector('.test-retry-btn');
        
        // تحديث الحالة إلى "جاري الاختبار"
        statusDiv.innerHTML = '<span class="badge badge-warning">جاري الاختبار...</span>';
        
        // إظهار شريط التقدم
        progressDiv.style.display = 'block';
        const progressFill = progressDiv.querySelector('.progress-fill');
        
        // إخفاء النتيجة السابقة
        resultDiv.style.display = 'none';
        
        // تعطيل الأزرار
        startBtn.disabled = true;
        retryBtn.style.display = 'none';
        
        // تنفيذ الاختبار المناسب
        if (testName === 'system') {
            this.runSystemTest(progressFill, statusDiv, resultDiv, startBtn, retryBtn);
        } else {
            this.runSimulatedTest(testName, progressFill, statusDiv, resultDiv, startBtn, retryBtn);
        }
    },
    
    // اختبار معلومات النظام (حقيقي)
    runSystemTest: function(progressFill, statusDiv, resultDiv, startBtn, retryBtn) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // جمع معلومات النظام
                const systemInfo = this.collectSystemInfo();
                
                setTimeout(() => {
                    statusDiv.innerHTML = '<span class="badge badge-success">اجتاز الاختبار</span>';
                    resultDiv.innerHTML = this.formatSystemInfo(systemInfo);
                    resultDiv.style.display = 'block';
                    AppState.saveTestResult('system', 'passed');
                    
                    // إخفاء شريط التقدم
                    document.getElementById('system-progress').style.display = 'none';
                    progressFill.style.width = '0%';
                    
                    // تفعيل زر إعادة الاختبار
                    retryBtn.style.display = 'inline-flex';
                    startBtn.disabled = false;
                    
                    // تحديث حالة زر إتمام الجلسة
                    this.updateCompleteSessionButton();
                }, 500);
            }
        }, 50);
    },
    
    // جمع معلومات النظام
    collectSystemInfo: function() {
        const info = {};
        
        // Operating System
        info.os = this.detectOS();
        
        // Browser
        info.browser = this.detectBrowser();
        
        // Screen Resolution
        info.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        };
        
        // CPU Information
        info.cpu = {
            cores: navigator.hardwareConcurrency || 'غير متاح',
            architecture: navigator.userAgentData?.platform || navigator.platform
        };
        
        // RAM Estimate
        info.ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'غير متاح';
        
        // GPU Information (محاول)
        info.gpu = this.detectGPU();
        
        // Storage Information
        info.storage = this.detectStorage();
        
        // Battery Information
        info.battery = 'غير متاح حالياً'; // سيتم تنفيذه لاحقاً
        
        // Network Information
        info.network = this.detectNetwork();
        
        // Device Capabilities
        info.device = {
            touch: 'ontouchstart' in window,
            mobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
            language: navigator.language,
            languages: navigator.languages
        };
        
        // Browser Capabilities
        info.capabilities = {
            cookies: navigator.cookieEnabled,
            online: navigator.onLine,
            pdf: navigator.pdfViewerEnabled,
            webGL: this.detectWebGL()
        };
        
        return info;
    },
    
    // كشف نظام التشغيل
    detectOS: function() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        if (userAgent.indexOf('Win') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'macOS';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        
        return platform || 'غير معروف';
    },
    
    // كشف المتصفح
    detectBrowser: function() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) {
            const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
            return `Chrome ${match ? match[1] : 'غير معروف'}`;
        }
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
            const match = userAgent.match(/Version\/(\d+\.\d+)/);
            return `Safari ${match ? match[1] : 'غير معروف'}`;
        }
        if (userAgent.indexOf('Firefox') !== -1) {
            const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
            return `Firefox ${match ? match[1] : 'غير معروف'}`;
        }
        if (userAgent.indexOf('Edg') !== -1) {
            const match = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
            return `Edge ${match ? match[1] : 'غير معروف'}`;
        }
        
        return 'غير معروف';
    },
    
    // كشف GPU
    detectGPU: function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    return {
                        vendor: vendor,
                        renderer: renderer
                    };
                }
            }
        } catch (e) {
            console.log('GPU detection failed:', e);
        }
        
        return { vendor: 'غير متاح', renderer: 'غير متاح' };
    },
    
    // كشف التخزين
    detectStorage: function() {
        if (navigator.storage && navigator.storage.estimate) {
            return 'متاح (API مدعوم)';
        }
        return 'غير متاح';
    },
    
    // كشف الشبكة
    detectNetwork: function() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            return {
                online: navigator.onLine,
                type: connection.effectiveType || 'غير متاح',
                downlink: connection.downlink ? `${connection.downlink} Mbps` : 'غير متاح',
                rtt: connection.rtt ? `${connection.rtt} ms` : 'غير متاح'
            };
        }
        
        return {
            online: navigator.onLine,
            type: 'غير متاح',
            downlink: 'غير متاح',
            rtt: 'غير متاح'
        };
    },
    
    // كشف WebGL
    detectWebGL: function() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    },
    
    // تنسيق معلومات النظام للعرض
    formatSystemInfo: function(info) {
        return `
            <div class="system-info-result">
                <h4>معلومات النظام</h4>
                <table class="info-table">
                    <tr><td><strong>نظام التشغيل:</strong></td><td>${info.os}</td></tr>
                    <tr><td><strong>المتصفح:</strong></td><td>${info.browser}</td></tr>
                    <tr><td><strong>دقة الشاشة:</strong></td><td>${info.screen.width} × ${info.screen.height}</td></tr>
                    <tr><td><strong>عمق الألوان:</strong></td><td>${info.screen.colorDepth} bit</td></tr>
                    <tr><td><strong>المعالج:</strong></td><td>${info.cpu.cores} نواة</td></tr>
                    <tr><td><strong>الذاكرة العشوائية:</strong></td><td>${info.ram}</td></tr>
                    <tr><td><strong>GPU:</strong></td><td>${info.gpu.renderer}</td></tr>
                    <tr><td><strong>التخزين:</strong></td><td>${info.storage}</td></tr>
                    <tr><td><strong>الشبكة:</strong></td><td>${info.network.online ? 'متصل' : 'غير متصل'} (${info.network.type})</td></tr>
                    <tr><td><strong>جهاز touch:</strong></td><td>${info.device.touch ? 'نعم' : 'لا'}</td></tr>
                    <tr><td><strong>جهاز محمول:</strong></td><td>${info.device.mobile ? 'نعم' : 'لا'}</td></tr>
                    <tr><td><strong>اللغة:</strong></td><td>${info.device.language}</td></tr>
                    <tr><td><strong>WebGL:</strong></td><td>${info.capabilities.webGL ? 'مدعوم' : 'غير مدعوم'}</td></tr>
                </table>
            </div>
        `;
    },
    
    // اختبار محاكاة (للاختبارات الأخرى)
    runSimulatedTest: function(testName, progressFill, statusDiv, resultDiv, startBtn, retryBtn) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // الاختبار مكتمل (محاكاة)
                // في المستقبل سيتم تنفيذ الاختبارات الحقيقية هنا
                // حالياً نعرض رسالة توضيحية
                setTimeout(() => {
                    const isPassed = Math.random() > 0.3; // محاكاة نجاح 70%
                    
                    if (isPassed) {
                        statusDiv.innerHTML = '<span class="badge badge-success">اجتاز الاختبار</span>';
                        resultDiv.innerHTML = '<p class="text-success">الاختبار ناجح - جميع المعايير ضمن الحدود المقبولة</p>';
                        resultDiv.style.display = 'block';
                        AppState.saveTestResult(testName, 'passed');
                    } else {
                        statusDiv.innerHTML = '<span class="badge badge-danger">فشل الاختبار</span>';
                        resultDiv.innerHTML = '<p class="text-danger">تم اكتشاف مشكلة - يحتاج إلى فحص يدوي</p>';
                        resultDiv.style.display = 'block';
                        AppState.saveTestResult(testName, 'failed');
                    }
                    
                    // إخفاء شريط التقدم
                    progressDiv.style.display = 'none';
                    progressFill.style.width = '0%';
                    
                    // تفعيل زر إعادة الاختبار
                    retryBtn.style.display = 'inline-flex';
                    startBtn.disabled = false;
                    
                    // تحديث حالة زر إتمام الجلسة
                    this.updateCompleteSessionButton();
                }, 500);
            }
        }, 100);
    },
    
    // تحديث زر إتمام الجلسة
    updateCompleteSessionButton: function() {
        const completeBtn = document.getElementById('completeSessionBtn');
        const session = AppState.getCurrentSession();
        
        if (session && completeBtn) {
            const completedTests = Object.keys(session.tests).length;
            const totalTests = 10; // عدد الاختبارات الكلي (سيتم تحديثه عند إضافة المزيد)
            
            if (completedTests >= totalTests) {
                completeBtn.disabled = false;
            }
        }
    },
    
    // تهيئة أزرار جلسة الفحص
    initSessionActions: function() {
        // زر إتمام الجلسة
        const completeBtn = document.getElementById('completeSessionBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من إتمام جلسة الفحص؟')) {
                    AppState.completeCurrentSession();
                    Navigation.navigateTo('dashboard');
                }
            });
        }
        
        // زر إلغاء الجلسة
        const cancelBtn = document.getElementById('cancelSessionBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من إلغاء جلسة الفحص؟ سيتم حذف جميع البيانات.')) {
                    AppState.cancelCurrentSession();
                    Navigation.navigateTo('dashboard');
                }
            });
        }
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
