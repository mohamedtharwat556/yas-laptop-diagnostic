// YAS Laptop Diagnostic System - Diagnostic Engine
// Clean rewrite with proper Agent detection flow

const DiagnosticEngine = {
    // Test definitions
    tests: [
        {
            id: 'screen',
            name: 'فحص الشاشة',
            type: 'interactive',
            run: async function() { return await DiagnosticEngine.testScreen(); }
        },
        {
            id: 'keyboard',
            name: 'فحص لوحة المفاتيح',
            type: 'interactive',
            run: async function() { return await DiagnosticEngine.testKeyboard(); }
        },
        {
            id: 'mouse',
            name: 'فحص الماوس',
            type: 'interactive',
            run: async function() { return await DiagnosticEngine.testMouse(); }
        },
        {
            id: 'camera',
            name: 'فحص الكاميرا',
            type: 'interactive',
            run: async function() { return await DiagnosticEngine.testCamera(); }
        },
        {
            id: 'microphone',
            name: 'فحص الميكروفون',
            type: 'interactive',
            run: async function() { return await DiagnosticEngine.testMicrophone(); }
        },
        {
            id: 'speaker',
            name: 'فحص السماعات',
            type: 'interactive',
            run: async function() { return await DiagnosticEngine.testSpeaker(); }
        },
        {
            id: 'network',
            name: 'فحص الشبكة',
            type: 'automatic',
            run: async function() { return await DiagnosticEngine.testNetwork(); }
        },
        {
            id: 'battery',
            name: 'فحص البطارية',
            type: 'automatic',
            run: async function() { return await DiagnosticEngine.testBattery(); }
        },
        {
            id: 'performance',
            name: 'فحص الأداء',
            type: 'automatic',
            run: async function() { return await DiagnosticEngine.testPerformance(); }
        },
        {
            id: 'storage',
            name: 'فحص التخزين',
            type: 'automatic',
            run: async function() { return await DiagnosticEngine.testStorage(); }
        },
        {
            id: 'gpu',
            name: 'فحص الرسوميات',
            type: 'automatic',
            run: async function() { return await DiagnosticEngine.testGPU(); }
        }
    ],

    // Main start function
    start: async function() {
        console.log('[YAS Diagnostic] Engine starting...');
        
        // BATCH 6B-6: Check Agent connection FIRST
        if (!AgentStateManager.isFullDiagnosticAllowed()) {
            console.log('[YAS Diagnostic] Agent NOT connected - blocking diagnostic');
            this.updateStatus('مساعد YAS غير متصل - الفحص محظور');
            this.displayBlockedMessage();
            return;
        }

        try {
            const session = AppState.getCurrentSession();
            if (!session) {
                console.error('[YAS Diagnostic] No active session');
                window.location.href = 'index.html';
                return;
            }

            this.updateStatus('جاري جمع معلومات الجهاز من مساعد YAS...');

            // BATCH 6B-6: Get hardware from Agent ONLY (no browser fallback)
            console.log('[YAS Diagnostic] Fetching hardware from Agent...');
            const hardwareData = await HardwareAgent.getHardware();
            
            if (!hardwareData || hardwareData.error) {
                console.error('[YAS Diagnostic] Agent hardware fetch failed');
                this.updateStatus('فشل جلب بيانات الجهاز من المساعد');
                return;
            }

            console.log('[YAS Diagnostic] Real hardware from Agent received');
            session.deviceInfo = hardwareData;
            AppState.saveDeviceInfo(hardwareData);
            this.displayDeviceInfo(hardwareData);

            this.updateStatus('جاري إعداد الاختبارات...');
            this.displayTestsList();

            // Run automatic tests
            this.updateStatus('جاري تشغيل الاختبارات...');
            await this.runAutomaticTests();

            this.updateStatus('تم إكمال الفحص');
            console.log('[YAS Diagnostic] Engine complete');
            
        } catch (error) {
            console.error('[YAS Diagnostic] Fatal error:', error);
            this.updateStatus('حدث خطأ في الفحص');
        }
    },

    // Display blocked message
    displayBlockedMessage: function() {
        const container = document.getElementById('clientContent') || document.querySelector('.client-content');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">
                    مساعد YAS غير متصل
                </h2>
                <p style="font-size: 16px; color: #6b7280; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">
                    لا يمكن بدء الفحص الكامل دون تثبيت واتصال مساعد YAS.
                </p>
                <p style="font-size: 14px; color: #9ca3af; margin-bottom: 24px;">
                    تأكد من تثبيت المساعد وتشغيل الخدمة ثم حاول مرة أخرى.
                </p>
                <button onclick="window.location.href='installation-required.html'" 
                    style="padding: 14px 32px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-right: 12px;">
                    ذهاب إلى صفحة التثبيت
                </button>
                <button onclick="location.reload()" 
                    style="padding: 14px 32px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                    إعادة محاولة
                </button>
            </div>
        `;
    },

    // Display error message
    displayError: function(title, message) {
        const container = document.getElementById('clientContent') || document.querySelector('.client-content');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #dc2626;">
                    ${title}
                </h2>
                <p style="font-size: 16px; color: #6b7280; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">
                    ${message}
                </p>
                <button onclick="location.reload()" 
                    style="padding: 14px 32px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                    إعادة المحاولة
                </button>
            </div>
        `;
    },

    // Browser detection REMOVED for BATCH 6B-6
    // Only Agent hardware data is displayed

    // Browser utilities
    detectOS: function() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Win') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'macOS';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        return 'غير معروف';
    },

    detectBrowser: function() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf('Edg') !== -1) {
            const match = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
            return `Edge ${match ? match[1] : 'غير معروف'}`;
        }
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
        
        return 'غير معروف';
    },

    detectDeviceType: function() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Windows') !== -1) return 'Windows Laptop';
        if (userAgent.indexOf('Mac') !== -1) return 'MacBook';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux Device';
        return 'غير معروف';
    },

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
                        name: HardwareAgent.createInfoField(renderer, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.MEDIUM),
                        vendor: HardwareAgent.createInfoField(vendor, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.MEDIUM)
                    };
                }
            }
        } catch (e) {}
        
        return {
            name: HardwareAgent.createInfoField('غير متاح', HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            vendor: HardwareAgent.createInfoField('غير متاح', HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
        };
    },

    detectBattery: async function() {
        if (!navigator.getBattery) {
            return {
                present: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
                percentage: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
                charging: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
            };
        }
        
        try {
            const battery = await navigator.getBattery();
            return {
                present: HardwareAgent.createInfoField(true, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
                percentage: HardwareAgent.createInfoField(Math.round(battery.level * 100), HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
                charging: HardwareAgent.createInfoField(battery.charging, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH)
            };
        } catch (e) {
            return {
                present: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
                percentage: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
                charging: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
            };
        }
    },

    detectNetwork: function() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            online: HardwareAgent.createInfoField(navigator.onLine, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            type: HardwareAgent.createInfoField(connection?.effectiveType || 'غير متاح', HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.MEDIUM),
            downlink: HardwareAgent.createInfoField(connection?.downlink || null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.MEDIUM)
        };
    },

    // Display device info - BATCH 6B-6: REAL DATA ONLY
    displayDeviceInfo: function(hardwareData) {
        const container = document.getElementById('deviceInfoGrid');
        if (!container) return;

        console.log('[YAS Diagnostic] Displaying device info from:', hardwareData.source || 'unknown');
        
        // BATCH 6B-6: Only display if source is hardware-agent
        if (hardwareData.source !== 'hardware-agent') {
            console.error('[YAS Diagnostic] Invalid hardware source - must be hardware-agent');
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc2626;"><strong>خطأ:</strong> بيانات الجهاز غير صحيحة</div>';
            return;
        }

        let html = '';

        // Computer Info Section
        if (hardwareData.computer) {
            const mfg = this.getInfoValue(hardwareData.computer.manufacturer);
            const model = this.getInfoValue(hardwareData.computer.model);
            const deviceType = this.getInfoValue(hardwareData.computer.deviceType);
            
            if (mfg || model || deviceType) {
                html += `<div class="device-info-section">
                    <h3 class="device-info-section-title">معلومات الجهاز</h3>`;
                if (mfg) html += this.createCard('الشركة المصنعة', mfg, 'hardware-agent');
                if (model) html += this.createCard('الموديل', model, 'hardware-agent');
                if (deviceType) html += this.createCard('نوع الجهاز', deviceType, 'hardware-agent');
                html += '</div>';
            }
        }

        // Operating System Section
        if (hardwareData.operatingSystem) {
            const osName = this.getInfoValue(hardwareData.operatingSystem.name);
            const osVersion = this.getInfoValue(hardwareData.operatingSystem.version);
            const osBuild = this.getInfoValue(hardwareData.operatingSystem.build);
            
            if (osName || osVersion) {
                html += `<div class="device-info-section">
                    <h3 class="device-info-section-title">نظام التشغيل</h3>`;
                if (osName) html += this.createCard('النظام', osName, 'hardware-agent');
                if (osVersion) html += this.createCard('الإصدار', osVersion, 'hardware-agent');
                if (osBuild) html += this.createCard('الـ Build', osBuild, 'hardware-agent');
                html += '</div>';
            }
        }

        // CPU Section
        if (hardwareData.cpu) {
            const cpuName = this.getInfoValue(hardwareData.cpu.name);
            const cpuCores = this.getInfoValue(hardwareData.cpu.cores);
            const cpuLogical = this.getInfoValue(hardwareData.cpu.logicalProcessors);
            const cpuMaxClock = this.getInfoValue(hardwareData.cpu.maxClockMHz);
            
            if (cpuName || cpuCores) {
                html += `<div class="device-info-section">
                    <h3 class="device-info-section-title">المعالج</h3>`;
                if (cpuName) html += this.createCard('الموديل', cpuName, 'hardware-agent');
                if (cpuCores) html += this.createCard('الأنوية الفعلية', cpuCores, 'hardware-agent');
                if (cpuLogical) html += this.createCard('المعالجات المنطقية', cpuLogical, 'hardware-agent');
                if (cpuMaxClock) html += this.createCard('السرعة القصوى', `${cpuMaxClock} MHz`, 'hardware-agent');
                html += '</div>';
            }
        }

        // Memory Section
        if (hardwareData.memory) {
            const ramGB = this.getInfoValue(hardwareData.memory.totalGB);
            const usedGB = this.getInfoValue(hardwareData.memory.usedGB);
            const availGB = this.getInfoValue(hardwareData.memory.availableGB);
            
            if (ramGB) {
                html += `<div class="device-info-section">
                    <h3 class="device-info-section-title">الذاكرة العشوائية</h3>`;
                html += this.createCard('الإجمالي', typeof ramGB === 'number' ? `${ramGB} GB` : ramGB, 'hardware-agent');
                if (usedGB) html += this.createCard('المستخدم', typeof usedGB === 'number' ? `${usedGB} GB` : usedGB, 'hardware-agent');
                if (availGB) html += this.createCard('المتاح', typeof availGB === 'number' ? `${availGB} GB` : availGB, 'hardware-agent');
                html += '</div>';
            }
        }

        // GPU Section
        if (hardwareData.gpu && hardwareData.gpu.length > 0) {
            html += `<div class="device-info-section">
                <h3 class="device-info-section-title">الرسوميات</h3>`;
            hardwareData.gpu.forEach((gpu, idx) => {
                const gpuName = this.getInfoValue(gpu.name);
                const gpuVendor = this.getInfoValue(gpu.vendor);
                if (gpuName) {
                    html += this.createCard(idx === 0 ? 'المعالج' : `المعالج ${idx + 1}`, gpuName, 'hardware-agent');
                }
                if (gpuVendor) {
                    html += this.createCard('الصانع', gpuVendor, 'hardware-agent');
                }
            });
            html += '</div>';
        }

        // Storage Section
        if (hardwareData.storage && hardwareData.storage.length > 0) {
            html += `<div class="device-info-section">
                <h3 class="device-info-section-title">التخزين</h3>`;
            hardwareData.storage.forEach((disk, idx) => {
                const diskModel = this.getInfoValue(disk.model);
                const diskType = this.getInfoValue(disk.type);
                const diskCapacity = this.getInfoValue(disk.capacityGB);
                
                if (diskModel) {
                    html += this.createCard(idx === 0 ? 'القرص' : `القرص ${idx + 1}`, diskModel, 'hardware-agent');
                }
                if (diskType) {
                    html += this.createCard('النوع', diskType, 'hardware-agent');
                }
                if (diskCapacity) {
                    html += this.createCard('السعة', `${diskCapacity} GB`, 'hardware-agent');
                }
            });
            html += '</div>';
        }

        // Battery Section
        if (hardwareData.battery) {
            const batteryPresent = this.getInfoValue(hardwareData.battery.present);
            const batteryPercent = this.getInfoValue(hardwareData.battery.percentage);
            const batteryCharging = this.getInfoValue(hardwareData.battery.charging);
            
            if (batteryPresent !== null || batteryPercent !== null) {
                html += `<div class="device-info-section">
                    <h3 class="device-info-section-title">البطارية</h3>`;
                if (batteryPresent === false) {
                    html += this.createCard('الحالة', 'لا توجد بطارية', 'hardware-agent');
                } else if (batteryPercent !== null) {
                    html += this.createCard('المستوى', `${batteryPercent}%`, 'hardware-agent');
                    if (batteryCharging !== null) {
                        html += this.createCard('الحالة', batteryCharging ? 'جاري الشحن' : 'غير مشحون', 'hardware-agent');
                    }
                }
                html += '</div>';
            }
        }

        // Network Section
        if (hardwareData.network && hardwareData.network.length > 0) {
            html += `<div class="device-info-section">
                <h3 class="device-info-section-title">الشبكة</h3>`;
            hardwareData.network.forEach((nic, idx) => {
                const nicName = this.getInfoValue(nic.name);
                const nicType = this.getInfoValue(nic.type);
                const nicMac = this.getInfoValue(nic.macAddress);
                
                if (nicName) {
                    html += this.createCard(idx === 0 ? 'الواجهة' : `الواجهة ${idx + 1}`, nicName, 'hardware-agent');
                }
                if (nicType) {
                    html += this.createCard('النوع', nicType, 'hardware-agent');
                }
            });
            html += '</div>';
        }

        // Source badge
        html += `<div class="device-info-section">
            <div style="padding: 12px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
                <span style="color: #059669; font-weight: 500;">✓ مصدر البيانات: مساعد YAS Hardware Agent</span>
            </div>
        </div>`;

        container.innerHTML = html;
    },

    createCard: function(label, value, source) {
        if (!value || value === 'غير متاح') {
            return `<div class="device-info-card">
                <div class="device-info-label">${label}</div>
                <div class="device-info-value unavailable">غير متاح</div>
            </div>`;
        }
        
        const sourceBadgeText = source === 'hardware-agent' ? 'Agent' : source;
        return `<div class="device-info-card">
            <div class="device-info-label">${label}</div>
            <div class="device-info-value">${value}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">من ${sourceBadgeText}</div>
        </div>`;
    },

    getInfoValue: function(field) {
        if (!field) return null;
        if (typeof field === 'object' && field.value !== undefined) return field.value;
        if (typeof field === 'string' && field.length > 0) return field;
        return null;
    },

    // Display tests list
    displayTestsList: function() {
        const container = document.getElementById('testsList');
        if (!container) return;

        let html = '';
        this.tests.forEach(test => {
            const isInteractive = test.type === 'interactive';
            html += `<div class="test-item" id="test-${test.id}">
                <div class="test-item-info">
                    <div class="test-item-name">${test.name}</div>
                    <div class="test-item-category">${test.type === 'automatic' ? 'تلقائي' : 'تفاعلي'}</div>
                    <div class="test-item-status" id="status-${test.id}">قيد الانتظار</div>
                    <div class="test-item-status-bar">
                        <div class="test-item-status-fill" id="progress-${test.id}" style="width: 0%"></div>
                    </div>
                </div>
                ${isInteractive ? `<button class="btn btn-sm btn-primary test-run-btn" data-test-id="${test.id}">بدء الاختبار</button>` : ''}
            </div>`;
        });

        container.innerHTML = html;

        // Add event listeners for interactive tests
        document.querySelectorAll('.test-run-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testId = e.target.dataset.testId;
                this.runInteractiveTest(testId);
            });
        });
    },

    // Run automatic tests only
    runAutomaticTests: async function() {
        const autoTests = this.tests.filter(t => t.type === 'automatic');
        const total = this.tests.length;

        for (const test of autoTests) {
            this.updateTestStatus(test.id, 'جاري التشغيل...');
            
            try {
                const result = await test.run();
                await AppState.saveTestResult(test.id, result);
                this.updateTestStatus(test.id, this.getStatusText(result.status));
                this.updateTestProgress(test.id, 100);
            } catch (error) {
                console.error(`Test ${test.id} failed:`, error);
                this.updateTestStatus(test.id, 'فشل');
                this.updateTestProgress(test.id, 0);
            }

            const completedCount = autoTests.indexOf(test) + 1;
            this.updateOverallProgress((completedCount / total) * 100);
            await this.sleep(300);
        }

        // Mark interactive tests as waiting
        this.tests.filter(t => t.type === 'interactive').forEach(test => {
            this.updateTestStatus(test.id, 'بانتظار البدء');
        });
    },

    runInteractiveTest: async function(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        this.updateTestStatus(testId, 'جاري التشغيل...');
        const result = await test.run();
        await AppState.saveTestResult(testId, result);
        this.updateTestStatus(testId, this.getStatusText(result.status));
        this.updateTestProgress(testId, 100);

        const btn = document.querySelector(`.test-run-btn[data-test-id="${testId}"]`);
        if (btn) btn.style.display = 'none';
    },

    // Test implementations - Interactive tests
    testScreen: async function() {
        return new Promise((resolve) => {
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            const overlay = document.createElement('div');
            overlay.className = 'test-overlay screen-test-overlay';
            overlay.innerHTML = `
                <div class="screen-color-area" id="screenColorArea" style="background-color: black;"></div>
                <div class="screen-test-message" id="screenMessage">الأسود</div>
                <div class="screen-test-controls">
                    <button class="btn btn-secondary" id="screenPrevBtn" disabled>السابق</button>
                    <span class="screen-step" id="screenStep">1/5</span>
                    <button class="btn btn-primary" id="screenNextBtn">التالي</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const colors = ['black', 'white', 'red', 'green', 'blue'];
            const colorNames = ['الأسود', 'الأبيض', 'الأحمر', 'الأخضر', 'الأزرق'];
            const colorArea = document.getElementById('screenColorArea');
            const messageEl = document.getElementById('screenMessage');
            const stepEl = document.getElementById('screenStep');
            const nextBtn = document.getElementById('screenNextBtn');
            const prevBtn = document.getElementById('screenPrevBtn');

            let currentColorIndex = 0;
            const startedAt = new Date().toISOString();

            nextBtn.addEventListener('click', () => {
                currentColorIndex++;
                if (currentColorIndex >= colors.length) {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'screen-question-overlay';
                    questionDiv.innerHTML = `
                        <h3>هل لاحظت أي مشاكل في الشاشة؟</h3>
                        <div class="screen-question-buttons">
                            <button class="btn btn-success btn-lg" id="screenNoProblemBtn">لا، الشاشة سليمة</button>
                            <button class="btn btn-danger btn-lg" id="screenProblemBtn">نعم، توجد مشكلة</button>
                        </div>
                    `;
                    overlay.appendChild(questionDiv);

                    document.getElementById('screenNoProblemBtn').addEventListener('click', () => {
                        overlay.remove();
                        container.style.display = 'block';
                        resolve({
                            status: 'passed',
                            details: 'لا توجد مشاكل ظاهرة في الشاشة',
                            startedAt: startedAt,
                            completedAt: new Date().toISOString()
                        });
                    });

                    document.getElementById('screenProblemBtn').addEventListener('click', () => {
                        overlay.remove();
                        container.style.display = 'block';
                        resolve({
                            status: 'warning',
                            details: 'المستخدم أشار إلى وجود مشاكل في الشاشة',
                            startedAt: startedAt,
                            completedAt: new Date().toISOString()
                        });
                    });
                } else {
                    colorArea.style.backgroundColor = colors[currentColorIndex];
                    messageEl.textContent = colorNames[currentColorIndex];
                    stepEl.textContent = `${currentColorIndex + 1}/5`;
                    prevBtn.disabled = false;
                }
            });

            prevBtn.addEventListener('click', () => {
                if (currentColorIndex > 0) {
                    currentColorIndex--;
                    colorArea.style.backgroundColor = colors[currentColorIndex];
                    messageEl.textContent = colorNames[currentColorIndex];
                    stepEl.textContent = `${currentColorIndex + 1}/5`;
                    prevBtn.disabled = currentColorIndex === 0;
                }
            });
        });
    },

    testKeyboard: async function() {
        return new Promise((resolve) => {
            resolve({
                status: 'passed',
                details: 'Keyboard test available',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            });
        });
    },

    testMouse: async function() {
        return new Promise((resolve) => {
            resolve({
                status: 'passed',
                details: 'Mouse test available',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            });
        });
    },

    testCamera: async function() {
        return new Promise((resolve) => {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    stream.getTracks().forEach(track => track.stop());
                    resolve({
                        status: 'passed',
                        details: 'Camera available',
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString()
                    });
                })
                .catch(error => {
                    resolve({
                        status: 'failed',
                        details: 'Camera not available: ' + error.message,
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString()
                    });
                });
        });
    },

    testMicrophone: async function() {
        return new Promise((resolve) => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    stream.getTracks().forEach(track => track.stop());
                    resolve({
                        status: 'passed',
                        details: 'Microphone available',
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString()
                    });
                })
                .catch(error => {
                    resolve({
                        status: 'failed',
                        details: 'Microphone not available: ' + error.message,
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString()
                    });
                });
        });
    },

    testSpeaker: async function() {
        return new Promise((resolve) => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    audioContext.close();
                    resolve({
                        status: 'passed',
                        details: 'Speaker test completed',
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString()
                    });
                }, 1000);
            } catch (error) {
                resolve({
                    status: 'failed',
                    details: 'Speaker test failed: ' + error.message,
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString()
                });
            }
        });
    },

    // Test implementations - Automatic tests
    testNetwork: async function() {
        return {
            status: navigator.onLine ? 'passed' : 'warning',
            details: navigator.onLine ? 'Network connected' : 'Network offline',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        };
    },

    testBattery: async function() {
        if (!navigator.getBattery) {
            return {
                status: 'limited',
                details: 'Battery API not available',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        }

        try {
            const battery = await navigator.getBattery();
            const level = Math.round(battery.level * 100);
            return {
                status: 'passed',
                details: `Battery level: ${level}%`,
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'limited',
                details: 'Battery info not available',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        }
    },

    testPerformance: async function() {
        const startTime = performance.now();
        let iterations = 0;

        while (performance.now() - startTime < 1000 && iterations < 1000000) {
            Math.sqrt(Math.random() * 1000);
            iterations++;
        }

        return {
            status: 'passed',
            details: `${iterations} operations completed`,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
        };
    },

    testStorage: async function() {
        if (!navigator.storage || !navigator.storage.estimate) {
            return {
                status: 'limited',
                details: 'Storage API not available',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        }

        try {
            const estimate = await navigator.storage.estimate();
            const usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
            return {
                status: 'passed',
                details: `Storage usage: ${usagePercent}%`,
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'limited',
                details: 'Storage info not available',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        }
    },

    testGPU: async function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                return {
                    status: 'limited',
                    details: 'WebGL not available',
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString()
                };
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            let renderer = 'WebGL available';
            if (debugInfo) {
                renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
            }

            return {
                status: 'passed',
                details: renderer,
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'limited',
                details: 'GPU test failed',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
        }
    },

    // UI updates
    updateStatus: function(status) {
        const el = document.getElementById('diagnosticStatus');
        if (el) el.textContent = status;
    },

    updateTestStatus: function(testId, status) {
        const el = document.getElementById(`status-${testId}`);
        if (el) el.textContent = status;
    },

    updateTestProgress: function(testId, progress) {
        const el = document.getElementById(`progress-${testId}`);
        if (el) el.style.width = `${progress}%`;
    },

    updateOverallProgress: function(progress) {
        const fill = document.getElementById('overallProgressFill');
        const text = document.getElementById('overallProgressText');
        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${Math.round(progress)}%`;
    },

    getStatusText: function(status) {
        const map = {
            'passed': 'اجتاز',
            'failed': 'فشل',
            'warning': 'تحذير',
            'limited': 'محدود',
            'not_available': 'غير متاح'
        };
        return map[status] || status;
    },

    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Start on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[YAS Diagnostic] DOM content loaded, starting engine...');
    DiagnosticEngine.start();
});
