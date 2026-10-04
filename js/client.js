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
            
            // معالجة إرسال النموذج (only if not already handled by index.html Agent check)
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    // Check if Agent pre-check already validated (flag set in index.html)
                    if (!window.agentPreCheckPassed) {
                        // This is for direct access to client/index.html without Agent check
                        console.log('[ClientForm] No pre-check detected - Agent validation required');
                        throw new Error('Agent verification required');
                    }

                    // Agent already verified, proceed with form submission
                    console.log('[ClientForm] Agent pre-check passed, proceeding with form submission');

                    if (!this.validateForm(form)) {
                        console.log('[ClientForm] Form validation failed');
                        throw new Error('Invalid form data');
                    }

                    const formData = new FormData(form);
                    const sessionData = {
                        customerName: formData.get('customerName'),
                        customerPhone: formData.get('customerPhone'),
                        serviceOrder: formData.get('serviceOrder'),
                        problemDescription: formData.get('problemDescription')
                    };

                    const submitBtn = form.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.innerHTML;

                    // Disable button and show loading state
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'جاري إنشاء جلسة الفحص...';

                    console.log('[ClientForm] Creating session');
                    // إضافة جلسة جديدة (with Supabase fallback)
                    const session = await AppState.addSession(sessionData);

                    // Verify session was created
                    if (!session || !session.sessionCode) {
                        console.error('[ClientForm] Invalid session returned:', session);
                        throw new Error('Session creation failed - invalid response');
                    }

                    console.log('[ClientForm] ✅ Session created:', {
                        sessionCode: session.sessionCode,
                        syncStatus: session.syncStatus
                    });

                    // الانتقال إلى صفحة الفحص
                    window.location.href = 'diagnostic.html';
                } catch (error) {
                    console.error('[ClientForm] Error:', error.message);
                    
                    // Show user-friendly error message
                    let userMessage = 'تعذر إنشاء جلسة الفحص';
                    
                    if (error.message.includes('Agent')) {
                        userMessage = 'يجب التحقق من مساعد YAS أولاً';
                    } else if (error.message.includes('Invalid')) {
                        userMessage = 'تحقق من صحة البيانات المدخلة';
                    } else if (error.message.includes('Network')) {
                        userMessage = 'تحقق من اتصالك بالإنترنت';
                    }
                    
                    alert(userMessage);
                    
                    // Reset button
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
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
        // Use Diagnostic Summary Engine
        const summary = DiagnosticSummaryEngine.generateTechnicianSummary(session);
        const customerSummary = DiagnosticSummaryEngine.generateCustomerSummary(session);

        // تحديث الملخص
        document.getElementById('passedTests').textContent = summary.passed;
        document.getElementById('failedTests').textContent = summary.failed;
        document.getElementById('warningTests').textContent = summary.warnings;
        document.getElementById('limitedTests').textContent = summary.limited;
        document.getElementById('notAvailableTests').textContent = summary.notAvailable;

        // تحديث حالة النتيجة
        this.updateResultStatus(summary);

        // عرض معلومات الجهاز
        this.displayDeviceInfo(session.deviceInfo);

        // عرض نتائج الاختبارات
        this.displayTestResults(session.tests);

        // عرض Limitations
        this.displayLimitations(summary.limitations);

        // عرض Customer Summary
        this.displayCustomerSummary(customerSummary);
    },

    // تحديث حالة النتيجة
    updateResultStatus: function(summary) {
        const statusEl = document.getElementById('resultStatus');

        switch(summary.overallStatus) {
            case 'COMPLETED_WITH_FAILURES':
                statusEl.textContent = 'تم إكمال الفحص - توجد مشاكل';
                statusEl.className = 'result-status result-status-failed';
                break;
            case 'COMPLETED_WITH_WARNINGS':
                statusEl.textContent = 'تم إكمال الفحص - توجد تحذيرات';
                statusEl.className = 'result-status result-status-warning';
                break;
            case 'COMPLETED_WITH_LIMITATIONS':
                statusEl.textContent = 'تم إكمال الفحص - بعض الاختبارات محدودة';
                statusEl.className = 'result-status result-status-warning';
                break;
            case 'COMPLETED':
                statusEl.textContent = 'تم إكمال الفحص بنجاح';
                statusEl.className = 'result-status result-status-success';
                break;
            case 'PARTIALLY_COMPLETED':
                statusEl.textContent = 'الفحص غير مكتمل';
                statusEl.className = 'result-status result-status-pending';
                break;
            default:
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
            if (deviceInfo.cpu && deviceInfo.cpu.model) {
                html += this.createInfoItem('نوع المعالج', deviceInfo.cpu.model);
            }
            if (deviceInfo.laptopModel) {
                html += this.createInfoItem('نوع الجهاز', deviceInfo.laptopModel);
            }
            if (deviceInfo.ram) {
                html += this.createInfoItem('الذاكرة العشوائية', deviceInfo.ram);
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
    },

    // عرض Limitations
    displayLimitations: function(limitations) {
        const container = document.getElementById('limitationsList');

        if (!limitations || limitations.length === 0) {
            if (container) {
                container.style.display = 'none';
            }
            return;
        }

        if (container) {
            container.style.display = 'block';
            let html = '<h3 class="result-section-title">حدود الفحص</h3>';
            html += '<ul class="limitations-list">';
            limitations.forEach(limit => {
                html += `<li class="limitation-item">${limit}</li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        }
    },

    // عرض Customer Summary
    displayCustomerSummary: function(summary) {
        const container = document.getElementById('customerSummary');

        if (!container) return;

        container.innerHTML = summary.replace(/\n/g, '<br>');
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Client.init();
});
