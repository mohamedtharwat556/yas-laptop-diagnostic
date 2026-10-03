// YAS Laptop Diagnostic System - Diagnostic Engine
// هذا الملف يحتوي على محرك الفحص التشخيصي

const DiagnosticEngine = {
    // قائمة الاختبارات التشخيصية فقط (Device Info منفصل)
    tests: [
        {
            id: 'screen',
            name: 'فحص الشاشة',
            type: 'interactive',
            category: TestCategories.INTERACTIVE,
            run: this.testScreen
        },
        {
            id: 'keyboard',
            name: 'فحص لوحة المفاتيح',
            type: 'interactive',
            category: TestCategories.INTERACTIVE,
            run: this.testKeyboard
        },
        {
            id: 'mouse',
            name: 'فحص الماوس',
            type: 'interactive',
            category: TestCategories.INTERACTIVE,
            run: this.testMouse
        },
        {
            id: 'camera',
            name: 'فحص الكاميرا',
            type: 'permission',
            category: TestCategories.INTERACTIVE,
            run: this.testCamera
        },
        {
            id: 'microphone',
            name: 'فحص الميكروفون',
            type: 'permission',
            category: TestCategories.INTERACTIVE,
            run: this.testMicrophone
        },
        {
            id: 'speaker',
            name: 'فحص السماعات',
            type: 'interactive',
            category: TestCategories.INTERACTIVE,
            run: this.testSpeaker
        },
        {
            id: 'network',
            name: 'فحص الشبكة',
            type: 'automatic',
            category: TestCategories.SYSTEM,
            run: this.testNetwork
        },
        {
            id: 'battery',
            name: 'فحص البطارية',
            type: 'automatic',
            category: TestCategories.SYSTEM,
            run: this.testBattery
        },
        {
            id: 'performance',
            name: 'فحص الأداء',
            type: 'automatic',
            category: TestCategories.SYSTEM,
            run: this.testPerformance
        },
        {
            id: 'storage',
            name: 'فحص التخزين',
            type: 'automatic',
            category: TestCategories.SYSTEM,
            run: this.testStorage
        },
        {
            id: 'gpu',
            name: 'فحص الرسوميات',
            type: 'automatic',
            category: TestCategories.SYSTEM,
            run: this.testGPU
        }
    ],
    
    // بدء الفحص
    start: async function() {
        console.log('Diagnostic Engine - Starting...');

        const session = AppState.getCurrentSession();
        if (!session) {
            console.error('No active session');
            window.location.href = 'index.html';
            return;
        }

        // تحديث حالة Hardware Agent
        this.updateAgentStatus();

        // تحديث الحالة
        this.updateStatus('جاري جمع معلومات الجهاز...');

        // جمع معلومات الجهاز
        const deviceInfo = await this.detectDeviceInfo();
        session.deviceInfo = deviceInfo;
        AppState.saveDeviceInfo(deviceInfo);

        // عرض معلومات الجهاز
        this.displayDeviceInfo(deviceInfo);

        // تحديث الحالة
        this.updateStatus('جاري إعداد الاختبارات...');

        // عرض قائمة الاختبارات
        this.displayTestsList();

        // Setup refresh button
        this.setupRefreshButton();

        // تشغيل الاختبارات
        this.updateStatus('جاري تشغيل الاختبارات...');
        await this.runTests();
        
        // إكمال الفحص
        this.updateStatus('تم إكمال الفحص');
        this.showViewResultsButton();
        
        console.log('Diagnostic Engine - Complete');
    },
    
    // جمع معلومات الجهاز
    detectDeviceInfo: async function() {
        let info = {};
        let hardwareSource = HardwareAgent.SOURCES.BROWSER;

        // Try to get data from Hardware Agent first
        await HardwareAgent.detectAgent();

        if (HardwareAgent.isConnected) {
            try {
                const agentData = await HardwareAgent.getHardware();
                if (!agentData.error) {
                    info = this.mergeDeviceInfo(agentData);
                    hardwareSource = HardwareAgent.SOURCES.HARDWARE_AGENT;
                    console.log('Using Hardware Agent data');
                }
            } catch (error) {
                console.log('Failed to get Hardware Agent data, using browser fallback:', error);
            }
        }

        // If Agent not available or failed, use browser detection
        if (Object.keys(info).length === 0) {
            info = this.detectBrowserDeviceInfo();
            hardwareSource = HardwareAgent.SOURCES.BROWSER;
            console.log('Using Browser detection');
        }

        // Add metadata
        info.hardwareSource = hardwareSource;
        info.hardwareCapturedAt = new Date().toISOString();

        return info;
    },

    // Merge hardware agent data with additional browser data
    mergeDeviceInfo: function(agentData) {
        const info = {
            // Computer info from agent
            computer: agentData.computer,
            operatingSystem: agentData.operatingSystem,
            cpu: agentData.cpu,
            memory: agentData.memory,
            gpu: agentData.gpu,
            storage: agentData.storage,
            battery: agentData.battery,
            network: agentData.network,
            motherboard: agentData.motherboard,

            // Browser-specific data (always from browser)
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                pixelRatio: window.devicePixelRatio,
                orientation: screen.orientation?.type || 'غير متاح'
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            browser: this.detectBrowser()
        };

        return info;
    },

    // Detect device info from browser (fallback)
    detectBrowserDeviceInfo: function() {
        const info = {};

        // Computer info (limited from browser)
        info.computer = {
            manufacturer: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            model: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            deviceType: HardwareAgent.createInfoField(this.detectLaptopModel(), HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.MEDIUM),
            serialNumber: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
        };

        // Operating system
        info.operatingSystem = {
            name: HardwareAgent.createInfoField(this.detectOS(), HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            version: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            build: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
        };

        // CPU
        info.cpu = {
            name: HardwareAgent.createInfoField(this.detectCPUModel(), HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.LOW),
            manufacturer: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            cores: HardwareAgent.createInfoField(navigator.hardwareConcurrency, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            logicalProcessors: HardwareAgent.createInfoField(navigator.hardwareConcurrency, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            maxClockMHz: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
        };

        // Memory
        info.memory = {
            totalBytes: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            totalGB: HardwareAgent.createInfoField(navigator.deviceMemory, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.MEDIUM),
            modules: []
        };

        // GPU
        info.gpu = [this.detectGPU()];

        // Storage (limited from browser)
        info.storage = [];
        info.storageWarning = 'المتصفح لا يستطيع قراءة سعة الهارد الحقيقية';

        // Battery
        const batteryData = await this.detectBattery();
        info.battery = {
            present: HardwareAgent.createInfoField(batteryData.available, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            percentage: HardwareAgent.createInfoField(batteryData.level, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            charging: HardwareAgent.createInfoField(batteryData.charging, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.HIGH),
            designCapacityWh: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            fullChargeCapacityWh: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE),
            cycleCount: HardwareAgent.createInfoField(null, HardwareAgent.SOURCES.BROWSER, HardwareAgent.CONFIDENCE.NONE)
        };

        // Network
        info.network = [this.detectNetwork()];

        // Browser-specific data
        info.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: screen.orientation?.type || 'غير متاح'
        };

        info.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        info.browser = this.detectBrowser();

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

    // كشف نموذج المعالج (محدود)
    detectCPUModel: function() {
        // Browser لا يستطيع تحديد نموذج المعالج والجيل بشكل دقيق
        // هذه محاولة للقراءة من userAgent لكنها غير موثوقة
        try {
            const ua = navigator.userAgent;
            let model = 'غير متاح - قيود المتصفح';

            // محاولة استخراج معلومات من userAgent (غير موثوقة)
            if (ua.includes('Intel')) {
                model = 'Intel (التفاصيل غير متاحة)';
            } else if (ua.includes('AMD')) {
                model = 'AMD (التفاصيل غير متاحة)';
            } else if (ua.includes('ARM')) {
                model = 'ARM (التفاصيل غير متاحة)';
            }

            return model;
        } catch (e) {
            return 'غير متاح - قيود المتصفح';
        }
    },

    // كشف نوع اللابتوب (محدود جداً)
    detectLaptopModel: function() {
        // Browser لا يستطيع قراءة نوع اللابتوب أو الشركة المصنعة
        // بسبب قيود الخصوصية الشديدة
        try {
            // محاولة القراءة من userAgent لكنها غير موثوقة على الإطلاق
            const ua = navigator.userAgent;

            // بعض الأعلام في userAgent قد تشير إلى نوع الجهاز
            if (ua.includes('Windows')) {
                return 'Windows Laptop (التفاصيل غير متاحة - قيود الخصوصية)';
            } else if (ua.includes('Mac')) {
                return 'MacBook (التفاصيل غير متاحة - قيود الخصوصية)';
            } else if (ua.includes('Linux')) {
                return 'Linux Laptop (التفاصيل غير متاحة - قيود الخصوصية)';
            } else if (ua.includes('Android')) {
                return 'Android Device (التفاصيل غير متاحة - قيود الخصوصية)';
            } else if (ua.includes('iPhone') || ua.includes('iPad')) {
                return 'iOS Device (التفاصيل غير متاحة - قيود الخصوصية)';
            }

            return 'غير متاح - قيود الخصوصية الشديدة للمتصفح';
        } catch (e) {
            return 'غير متاح - قيود الخصوصية الشديدة للمتصفح';
        }
    },
    
    // كشف البطارية
    detectBattery: async function() {
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                return {
                    level: `${Math.round(battery.level * 100)}%`,
                    charging: battery.charging ? 'جاري الشحن' : 'غير مشحون'
                };
            } catch (e) {
                console.log('Battery detection failed:', e);
            }
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
                downlink: connection.downlink ? `${connection.downlink} Mbps` : 'غير متاح'
            };
        }
        
        return {
            online: navigator.onLine,
            type: 'غير متاح',
            downlink: 'غير متاح'
        };
    },
    
    // عرض معلومات الجهاز
    displayDeviceInfo: function(deviceInfo) {
        const container = document.getElementById('deviceInfoGrid');

        let html = '';

        // Check if using new normalized structure or old structure
        const isNewStructure = deviceInfo.computer && deviceInfo.operatingSystem;

        if (isNewStructure) {
            // New normalized structure from Hardware Agent
            html += this.displayNormalizedDeviceInfo(deviceInfo);
        } else {
            // Old structure (backward compatibility)
            html += this.displayLegacyDeviceInfo(deviceInfo);
        }

        container.innerHTML = html;
    },

    // عرض معلومات الجهاز (Normalized Structure)
    displayNormalizedDeviceInfo: function(deviceInfo) {
        let html = '';

        // Computer Info
        const manufacturer = this.getInfoValue(deviceInfo.computer?.manufacturer);
        const model = this.getInfoValue(deviceInfo.computer?.model);
        const deviceType = this.getInfoValue(deviceInfo.computer?.deviceType);

        if (manufacturer || model || deviceType) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">معلومات الجهاز</h3>';

            if (manufacturer) {
                html += this.createDeviceInfoCard('الشركة المصنعة', manufacturer);
            }
            if (model) {
                html += this.createDeviceInfoCard('الموديل', model);
            }
            if (deviceType) {
                html += this.createDeviceInfoCard('نوع الجهاز', deviceType);
            }

            html += '</div>';
        }

        // Operating System
        const osName = this.getInfoValue(deviceInfo.operatingSystem?.name);
        const osVersion = this.getInfoValue(deviceInfo.operatingSystem?.version);
        const osBuild = this.getInfoValue(deviceInfo.operatingSystem?.build);

        if (osName) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">نظام التشغيل</h3>';
            html += this.createDeviceInfoCard('النظام', osName);
            if (osVersion) {
                html += this.createDeviceInfoCard('الإصدار', osVersion);
            }
            if (osBuild) {
                html += this.createDeviceInfoCard('البناء', osBuild);
            }
            html += '</div>';
        }

        // CPU
        const cpuName = this.getInfoValue(deviceInfo.cpu?.name);
        const cpuCores = this.getInfoValue(deviceInfo.cpu?.cores);
        const cpuLogical = this.getInfoValue(deviceInfo.cpu?.logicalProcessors);

        if (cpuName || cpuCores) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">المعالج</h3>';
            if (cpuName) {
                html += this.createDeviceInfoCard('النوع', cpuName);
            }
            if (cpuCores) {
                html += this.createDeviceInfoCard('الأنوية الفعلية', cpuCores);
            }
            if (cpuLogical) {
                html += this.createDeviceInfoCard('المعالجات المنطقية', cpuLogical);
            }
            html += '</div>';
        }

        // Memory
        const ramGB = this.getInfoValue(deviceInfo.memory?.totalGB);

        if (ramGB) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">الذاكرة</h3>';
            html += this.createDeviceInfoCard('السعة', `${ramGB} GB`);
            html += '</div>';
        }

        // GPU
        if (deviceInfo.gpu && deviceInfo.gpu.length > 0) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">الرسوميات</h3>';
            deviceInfo.gpu.forEach((gpu, index) => {
                const gpuName = this.getInfoValue(gpu.name);
                if (gpuName) {
                    html += this.createDeviceInfoCard(index === 0 ? 'بطاقة الرسوميات' : `بطاقة الرسوميات ${index + 1}`, gpuName);
                }
            });
            html += '</div>';
        }

        // Storage
        if (deviceInfo.storage && deviceInfo.storage.length > 0) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">التخزين</h3>';
            deviceInfo.storage.forEach((disk, index) => {
                const model = this.getInfoValue(disk.model);
                const type = this.getInfoValue(disk.type);
                const capacityGB = this.getInfoValue(disk.capacityGB);
                const usedGB = disk.usedBytes ? `${Math.round(disk.usedBytes / 1073741824)} GB` : null;
                const freeGB = disk.freeBytes ? `${Math.round(disk.freeBytes / 1073741824)} GB` : null;

                if (model) {
                    html += this.createDeviceInfoCard(index === 0 ? 'القرص' : `القرص ${index + 1}`, model);
                }
                if (type) {
                    html += this.createDeviceInfoCard('النوع', type);
                }
                if (capacityGB) {
                    html += this.createDeviceInfoCard('السعة', `${capacityGB} GB`);
                }
                if (usedGB) {
                    html += this.createDeviceInfoCard('المستخدم', usedGB);
                }
                if (freeGB) {
                    html += this.createDeviceInfoCard('المتاح', freeGB);
                }
            });
            html += '</div>';
        } else if (deviceInfo.storageWarning) {
            // Browser limitation warning
            html += '<div class="device-info-section"><h3 class="device-info-section-title">التخزين</h3>';
            html += `<div class="device-info-card device-info-warning">`;
            html += `<div class="device-info-label">السعة الحقيقية</div>`;
            html += `<div class="device-info-value unavailable">غير متاحة من المتصفح</div>`;
            html += `<div class="device-info-note">${deviceInfo.storageWarning}</div>`;
            html += `</div></div>`;
        }

        // Battery
        const batteryPresent = this.getInfoValue(deviceInfo.battery?.present);
        const batteryPercentage = this.getInfoValue(deviceInfo.battery?.percentage);
        const batteryCharging = this.getInfoValue(deviceInfo.battery?.charging);

        if (batteryPresent) {
            html += '<div class="device-info-section"><h3 class="device-info-section-title">البطارية</h3>';
            if (batteryPercentage) {
                html += this.createDeviceInfoCard('المستوى', `${batteryPercentage}%`);
            }
            if (batteryCharging !== null) {
                html += this.createDeviceInfoCard('الحالة', batteryCharging ? 'جاري الشحن' : 'غير مشحون');
            }
            html += '</div>';
        }

        // Browser-specific info (always show these)
        html += '<div class="device-info-section"><h3 class="device-info-section-title">معلومات المتصفح</h3>';
        html += this.createDeviceInfoCard('المتصفح', deviceInfo.browser);
        html += this.createDeviceInfoCard('دقة الشاشة', `${deviceInfo.screen.width} × ${deviceInfo.screen.height}`);
        html += this.createDeviceInfoCard('Viewport', `${deviceInfo.viewport.width} × ${deviceInfo.viewport.height}`);
        html += '</div>';

        return html;
    },

    // عرض معلومات الجهاز (Legacy Structure - Backward Compatibility)
    displayLegacyDeviceInfo: function(deviceInfo) {
        let html = '';

        const infoItems = [
            { label: 'نظام التشغيل', value: deviceInfo.os },
            { label: 'المتصفح', value: deviceInfo.browser },
            { label: 'دقة الشاشة', value: `${deviceInfo.screen.width} × ${deviceInfo.screen.height}` },
            { label: 'Viewport', value: `${deviceInfo.viewport.width} × ${deviceInfo.viewport.height}` },
            { label: 'Pixel Ratio', value: deviceInfo.screen.pixelRatio },
            { label: 'المعالج', value: `${deviceInfo.cpu.cores} نواة` },
            { label: 'الذاكرة', value: deviceInfo.ram },
            { label: 'GPU', value: deviceInfo.gpu.renderer || 'غير متاح' },
            { label: 'الشبكة', value: deviceInfo.network.online ? 'متصل' : 'غير متصل' }
        ];

        infoItems.forEach(item => {
            const unavailable = item.value === 'غير متاح' || (typeof item.value === 'string' && item.value.includes('غير متاح'));
            html += `
                <div class="device-info-card">
                    <div class="device-info-label">${item.label}</div>
                    <div class="device-info-value ${unavailable ? 'unavailable' : ''}">${item.value}</div>
                </div>
            `;
        });

        return html;
    },

    // Helper: Get value from info field (handles {value, source, confidence} structure)
    getInfoValue: function(field) {
        if (!field) return null;

        if (typeof field === 'object' && field.value !== undefined) {
            return field.value;
        }

        return field;
    },

    // Helper: Create device info card
    createDeviceInfoCard: function(label, value) {
        const unavailable = value === null || value === 'غير متاح' || (typeof value === 'string' && value.includes('غير متاح'));
        return `
            <div class="device-info-card">
                <div class="device-info-label">${label}</div>
                <div class="device-info-value ${unavailable ? 'unavailable' : ''}">${value}</div>
            </div>
        `;
    },

    // Update Agent Status UI
    updateAgentStatus: async function() {
        const indicator = document.getElementById('agentStatusIndicator');
        const details = document.getElementById('agentStatusDetails');
        const statusDot = indicator?.querySelector('.status-dot');
        const statusText = indicator?.querySelector('.status-text');

        if (!indicator) return;

        statusDot.classList.remove('connected', 'disconnected');
        statusText.textContent = 'جاري التحقق من مساعد فحص الجهاز...';

        const connected = await HardwareAgent.detectAgent();

        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'مساعد فحص الجهاز متصل';
            if (details) details.style.display = 'none';
        } else {
            statusDot.classList.add('disconnected');
            statusText.textContent = 'مساعد فحص الجهاز غير متصل';
            if (details) {
                details.style.display = 'block';
                details.querySelector('.agent-detail').textContent = 'سيتم استخدام معلومات المتصفح المتاحة';
            }
        }
    },

    // Setup Refresh Hardware Button
    setupRefreshButton: function() {
        const refreshBtn = document.getElementById('refreshHardwareBtn');
        if (!refreshBtn) return;

        refreshBtn.addEventListener('click', async () => {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = 'جاري تحديث معلومات الجهاز...';

            try {
                // Refresh agent status
                await this.updateAgentStatus();

                // Re-detect device info
                const deviceInfo = await this.detectDeviceInfo();

                // Update session if exists
                const session = AppState.getCurrentSession();
                if (session) {
                    session.deviceInfo = deviceInfo;
                    AppState.saveDeviceInfo(deviceInfo);
                }

                // Update UI
                this.displayDeviceInfo(deviceInfo);

                console.log('Hardware info refreshed successfully');
            } catch (error) {
                console.error('Failed to refresh hardware info:', error);
                alert('تعذر تحديث معلومات الجهاز. سيتم استخدام المعلومات المتاحة.');
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = originalText;
            }
        });
    },
    
    // عرض قائمة الاختبارات
    displayTestsList: function() {
        const container = document.getElementById('testsList');

        let html = '';

        this.tests.forEach(test => {
            const isInteractive = test.type === 'interactive' || test.type === 'permission';
            const isAutomatic = test.type === 'automatic';
            html += `
                <div class="test-item" id="test-${test.id}">
                    <div class="test-item-info">
                        <div class="test-item-name">${test.name}</div>
                        <div class="test-item-category">${test.type === 'automatic' ? 'تلقائي' : 'تفاعلي'}</div>
                        <div class="test-item-status" id="status-${test.id}">قيد الانتظار</div>
                        <div class="test-item-status-bar">
                            <div class="test-item-status-fill" id="progress-${test.id}" style="width: 0%"></div>
                        </div>
                    </div>
                    ${isInteractive ? `
                        <button class="btn btn-sm btn-primary test-run-btn" data-test-id="${test.id}">
                            بدء الاختبار
                        </button>
                    ` : ''}
                </div>
            `;
        });

        container.innerHTML = html;

        // إضافة event listeners للأزرار التفاعلية
        document.querySelectorAll('.test-run-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testId = e.target.dataset.testId;
                this.runInteractiveTest(testId);
            });
        });
    },
    
    // تشغيل الاختبارات
    runTests: async function() {
        const totalTests = this.tests.length;
        let completedTests = 0;

        // تشغيل الاختبارات التلقائية أولاً
        for (const test of this.tests) {
            if (test.type === 'automatic') {
                // تحديث حالة الاختبار
                this.updateTestStatus(test.id, 'جاري التشغيل...');

                // تشغيل الاختبار
                const result = await this.runTest(test);

                // حفظ النتيجة
                AppState.saveTestResult(test.id, result);

                // تحديث حالة الاختبار
                this.updateTestStatus(test.id, this.getStatusText(result.status));
                this.updateTestProgress(test.id, 100);

                // تحديث التقدم الكلي
                completedTests++;
                this.updateOverallProgress((completedTests / totalTests) * 100);

                // انتظار قصير بين الاختبارات
                await this.sleep(500);
            }
        }

        // الآن تمييز الاختبارات التفاعلية كـ "بانتظار البدء"
        for (const test of this.tests) {
            if (test.type === 'interactive' || test.type === 'permission') {
                this.updateTestStatus(test.id, 'بانتظار البدء');
                this.updateTestProgress(test.id, 0);
                completedTests++;
                this.updateOverallProgress((completedTests / totalTests) * 100);
            }
        }
    },

    // تشغيل اختبار تفاعلي واحد
    runInteractiveTest: async function(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        // تحديث حالة الاختبار
        this.updateTestStatus(test.id, 'جاري التشغيل...');

        // تشغيل الاختبار
        const result = await this.runTest(test);

        // حفظ النتيجة
        AppState.saveTestResult(test.id, result);

        // تحديث حالة الاختبار
        this.updateTestStatus(test.id, this.getStatusText(result.status));
        this.updateTestProgress(test.id, 100);

        // إخفاء زر البدء
        const btn = document.querySelector(`.test-run-btn[data-test-id="${testId}"]`);
        if (btn) {
            btn.style.display = 'none';
        }
    },
    
    // تشغيل اختبار واحد
    runTest: async function(test) {
        if (test.id === 'screen') {
            return await this.testScreen();
        } else if (test.id === 'keyboard') {
            return await this.testKeyboard();
        } else if (test.id === 'mouse') {
            return await this.testMouse();
        } else if (test.id === 'camera') {
            return await this.testCamera();
        } else if (test.id === 'microphone') {
            return await this.testMicrophone();
        } else if (test.id === 'speaker') {
            return await this.testSpeaker();
        } else if (test.id === 'network') {
            return await this.testNetwork();
        } else if (test.id === 'battery') {
            return await this.testBattery();
        } else if (test.id === 'performance') {
            return await this.testPerformance();
        } else if (test.id === 'storage') {
            return await this.testStorage();
        } else if (test.id === 'gpu') {
            return await this.testGPU();
        }

        return { status: 'not_available', details: 'غير متاح' };
    },
    
    // اختبار الشاشة
    testScreen: async function() {
        return await this.runScreenTest();
    },
    
    // تشغيل اختبار الشاشة التفاعلي
    runScreenTest: async function() {
        return new Promise((resolve) => {
            const colors = ['black', 'white', 'red', 'green', 'blue'];
            let currentColorIndex = 0;
            const startedAt = new Date().toISOString();

            // إخفاء container التفاعلي وجعل الشاشة full screen
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            // إنشاء overlay للشاشة
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

            const colorArea = document.getElementById('screenColorArea');
            const messageEl = document.getElementById('screenMessage');
            const stepEl = document.getElementById('screenStep');
            const prevBtn = document.getElementById('screenPrevBtn');
            const nextBtn = document.getElementById('screenNextBtn');

            const colorNames = ['الأسود', 'الأبيض', 'الأحمر', 'الأخضر', 'الأزرق'];
            const colorHex = ['black', 'white', 'red', 'green', 'blue'];

            // زر التالي
            nextBtn.addEventListener('click', () => {
                currentColorIndex++;
                if (currentColorIndex >= colors.length) {
                    // عرض السؤال داخل الـ overlay
                    colorArea.style.display = 'none';
                    messageEl.style.display = 'none';
                    stepEl.style.display = 'none';
                    prevBtn.style.display = 'none';
                    nextBtn.style.display = 'none';

                    // إضافة سؤال الشاشة
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'screen-question-overlay';
                    questionDiv.innerHTML = `
                        <h3>هل لاحظت أي مشاكل في الشاشة؟</h3>
                        <p>نقاط مضيئة أو مظلمة، خطوط، ألوان غير طبيعية</p>
                        <div class="screen-question-buttons">
                            <button class="btn btn-success btn-lg" id="screenNoProblemBtn">لا، الشاشة سليمة</button>
                            <button class="btn btn-danger btn-lg" id="screenProblemBtn">نعم، توجد مشكلة</button>
                        </div>
                    `;
                    overlay.appendChild(questionDiv);

                    document.getElementById('screenNoProblemBtn').addEventListener('click', () => {
                        const completedAt = new Date().toISOString();
                        overlay.remove();
                        container.style.display = 'block';
                        resolve({
                            status: 'passed',
                            details: 'Visual confirmation: لا توجد مشاكل ظاهرة',
                            category: TestCategories.INTERACTIVE,
                            startedAt: startedAt,
                            completedAt: completedAt,
                            userConfirmation: true,
                            evidence: 'User confirmed no screen issues',
                            limitations: []
                        });
                    });

                    document.getElementById('screenProblemBtn').addEventListener('click', () => {
                        const completedAt = new Date().toISOString();
                        overlay.remove();
                        container.style.display = 'block';
                        resolve({
                            status: 'warning',
                            details: 'المستخدم أشار إلى وجود مشاكل في الشاشة',
                            category: TestCategories.INTERACTIVE,
                            startedAt: startedAt,
                            completedAt: completedAt,
                            userConfirmation: true,
                            evidence: 'User reported screen issues',
                            limitations: []
                        });
                    });
                } else {
                    // تحديث اللون
                    colorArea.style.backgroundColor = colorHex[currentColorIndex];
                    messageEl.textContent = colorNames[currentColorIndex];
                    stepEl.textContent = `${currentColorIndex + 1}/5`;

                    // تحديث الأزرار
                    prevBtn.disabled = false;
                    if (currentColorIndex === colors.length - 1) {
                        nextBtn.textContent = 'إكمال';
                    }
                }
            });

            // زر السابق
            prevBtn.addEventListener('click', () => {
                if (currentColorIndex > 0) {
                    currentColorIndex--;
                    colorArea.style.backgroundColor = colorHex[currentColorIndex];
                    messageEl.textContent = colorNames[currentColorIndex];
                    stepEl.textContent = `${currentColorIndex + 1}/5`;

                    // تحديث الأزرار
                    prevBtn.disabled = currentColorIndex === 0;
                    nextBtn.textContent = 'التالي';
                }
            });
        });
    },

    // عرض اختبار تفاعلي
    showInteractiveTest: function(title, description) {
        const container = document.getElementById('interactiveTestContainer');
        const titleEl = document.getElementById('interactiveTestTitle');
        const descEl = document.getElementById('interactiveTestDescription');
        
        container.style.display = 'block';
        titleEl.textContent = title;
        descEl.textContent = description;
    },
    
    // إخفاء اختبار تفاعلي
    hideInteractiveTest: function() {
        const container = document.getElementById('interactiveTestContainer');
        container.style.display = 'none';
    },
    
    // اختبار لوحة المفاتيح
    testKeyboard: async function() {
        return await this.runKeyboardTest();
    },
    
    // تشغيل اختبار لوحة المفاتيح
    runKeyboardTest: async function() {
        return new Promise((resolve) => {
            // إخفاء container التفاعلي
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            // إنشاء overlay للكيبورد
            const overlay = document.createElement('div');
            overlay.className = 'test-overlay keyboard-test-overlay';
            overlay.innerHTML = `
                <div class="test-overlay-header keyboard-overlay-header">
                    <h2>اختبار لوحة المفاتيح</h2>
                    <p>اضغط على المفاتيح الموجودة في لوحة المفاتيح الفعلية للابتوب واحدًا تلو الآخر</p>
                    <button class="btn btn-sm btn-secondary close-overlay-btn" id="closeKeyboardBtn">إغلاق</button>
                </div>
                <div class="test-overlay-content" id="keyboardTestContent"></div>
                <div class="test-overlay-actions keyboard-overlay-actions">
                    <button class="btn btn-success btn-lg" id="finishKeyboardBtn">إكمال الاختبار</button>
                </div>
            `;
            document.body.appendChild(overlay);

            // بدء اختبار لوحة المفاتيح في الـ overlay
            KeyboardTest.startInOverlay('keyboardTestContent');

            document.getElementById('finishKeyboardBtn').addEventListener('click', () => {
                const result = KeyboardTest.finish();
                overlay.remove();
                container.style.display = 'block';
                resolve(result);
            });

            document.getElementById('closeKeyboardBtn').addEventListener('click', () => {
                KeyboardTest.finish();
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'cancelled',
                    details: 'تم إلغاء الاختبار'
                });
            });
        });
    },
    
    // اختبار الماوس
    testMouse: async function() {
        return await this.runMouseTest();
    },
    
    // تشغيل اختبار الماوس
    runMouseTest: async function() {
        return new Promise((resolve) => {
            // إخفاء container التفاعلي
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            // إنشاء overlay للماوس
            const overlay = document.createElement('div');
            overlay.className = 'test-overlay mouse-test-overlay';
            overlay.innerHTML = `
                <div class="test-overlay-header mouse-overlay-header">
                    <h2>اختبار الماوس / Touchpad</h2>
                    <p>سنتقوم باختبار وظائف المؤشر. اتبع التعليمات التي تظهر.</p>
                    <button class="btn btn-sm btn-secondary close-overlay-btn" id="closeMouseBtn">إغلاق</button>
                </div>
                <div class="test-overlay-content" id="mouseTestContent"></div>
                <div class="test-overlay-actions mouse-overlay-actions">
                    <button class="btn btn-success btn-lg" id="finishMouseBtn" disabled>إكمال الاختبار</button>
                </div>
            `;
            document.body.appendChild(overlay);

            let testsPassed = {
                movement: false,
                leftClick: false,
                rightClick: false,
                scroll: false
            };

            const contentEl = document.getElementById('mouseTestContent');

            // اختبار الحركة
            const testArea = document.createElement('div');
            testArea.className = 'mouse-test-area';
            testArea.innerHTML = '<div class="mouse-instruction">حرّك المؤشر داخل هذه المنطقة</div>';
            contentEl.appendChild(testArea);

            const actionBtn = document.getElementById('finishMouseBtn');
            const closeBtn = document.getElementById('closeMouseBtn');

            // زر الإغلاق
            closeBtn.addEventListener('click', () => {
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'cancelled',
                    details: 'تم إلغاء الاختبار'
                });
            });

            testArea.addEventListener('mousemove', () => {
                if (!testsPassed.movement) {
                    testsPassed.movement = true;
                    testArea.innerHTML = '<div class="mouse-instruction">✓ الحركة تم الكشف - اضغط Left Click</div>';
                }
            });

            testArea.addEventListener('click', (e) => {
                if (e.button === 0 && !testsPassed.leftClick) {
                    testsPassed.leftClick = true;
                    testArea.innerHTML = '<div class="mouse-instruction">✓ Left Click تم - اضغط Right Click</div>';
                }
            });

            testArea.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (!testsPassed.rightClick) {
                    testsPassed.rightClick = true;
                    testArea.innerHTML = '<div class="mouse-instruction">✓ Right Click تم - حرّر عجلة الماوس</div>';
                }
            });

            // اختبار Scroll
            const scrollArea = document.createElement('div');
            scrollArea.className = 'mouse-scroll-area';
            scrollArea.innerHTML = '<div class="scroll-content">حرّر عجلة الماوس لأعلى ولأسفل</div>';
            scrollArea.style.height = '300px';
            scrollArea.style.overflow = 'auto';
            scrollArea.style.border = '2px solid var(--color-neutral-300)';
            scrollArea.style.borderRadius = 'var(--radius-lg)';
            scrollArea.style.padding = 'var(--spacing-4)';
            scrollArea.style.marginTop = 'var(--spacing-4)';
            contentEl.appendChild(scrollArea);

            scrollArea.addEventListener('wheel', () => {
                if (!testsPassed.scroll) {
                    testsPassed.scroll = true;
                    scrollArea.style.borderColor = 'var(--color-success)';
                    scrollArea.innerHTML = '<div class="scroll-content">✓ Scroll تم الكشف</div>';
                }
            });

            // فحص إكمال
            const checkComplete = setInterval(() => {
                if (testsPassed.movement && testsPassed.leftClick && testsPassed.rightClick && testsPassed.scroll) {
                    clearInterval(checkComplete);
                    actionBtn.disabled = false;
                }
            }, 100);

            actionBtn.addEventListener('click', () => {
                clearInterval(checkComplete);
                overlay.remove();
                container.style.display = 'block';

                const result = {
                    status: 'passed',
                    details: `تم اكتشاف تفاعل المؤشر بنجاح. الحركة: ${testsPassed.movement ? '✓' : '✗'}, Left Click: ${testsPassed.leftClick ? '✓' : '✗'}, Right Click: ${testsPassed.rightClick ? '✓' : '✗'}, Scroll: ${testsPassed.scroll ? '✓' : '✗'}. ملاحظة: المتصفح لا يستطيع التأكد بشكل موثوق أن الإدخال جاء من Touchpad أو Mouse خارجي.`
                };

                resolve(result);
            });
        });
    },

    // اختبار الكاميرا
    testCamera: async function() {
        return await this.runCameraTest();
    },
    
    // تشغيل اختبار الكاميرا
    runCameraTest: async function() {
        return new Promise((resolve) => {
            // إخفاء container التفاعلي
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            // إنشاء overlay للكاميرا
            const overlay = document.createElement('div');
            overlay.className = 'test-overlay camera-test-overlay';
            overlay.innerHTML = `
                <div class="test-overlay-header camera-overlay-header">
                    <h2>اختبار الكاميرا</h2>
                    <p>سنقوم باختبار الكاميرا. يرجى السماح للمتصفح باستخدام الكاميرا.</p>
                    <button class="btn btn-sm btn-secondary close-overlay-btn" id="closeCameraBtn">إغلاق</button>
                </div>
                <div class="test-overlay-content" id="cameraTestContent"></div>
                <div class="test-overlay-actions camera-overlay-actions">
                    <button class="btn btn-success btn-lg" id="finishCameraBtn" disabled>إكمال الاختبار</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const contentEl = document.getElementById('cameraTestContent');

            contentEl.innerHTML = `
                <div class="camera-test-container">
                    <video id="cameraPreview" autoplay playsinline muted></video>
                    <div class="camera-status" id="cameraStatus">جاري طلب الإذن...</div>
                </div>
            `;

            const videoEl = document.getElementById('cameraPreview');
            const statusEl = document.getElementById('cameraStatus');
            const finishBtn = document.getElementById('finishCameraBtn');
            const closeBtn = document.getElementById('closeCameraBtn');

            let stream = null;

            // زر الإغلاق
            closeBtn.addEventListener('click', () => {
                // إيقاف الـ stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'cancelled',
                    details: 'تم إلغاء الاختبار'
                });
            });

            // إيقاف عند النقر خارج المحتوى
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    // إيقاف الـ stream
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }

                    overlay.remove();
                    container.style.display = 'block';
                    resolve({
                        status: 'cancelled',
                        details: 'تم إلغاء الاختبار'
                    });
                }
            });

            navigator.mediaDevices.getUserMedia({ video: true })
                .then((mediaStream) => {
                    stream = mediaStream;
                    videoEl.srcObject = mediaStream;
                    statusEl.textContent = 'Camera stream available';
                    statusEl.classList.add('status-success');
                    finishBtn.disabled = false;
                })
                .catch((error) => {
                    console.log('Camera test failed:', error);
                    statusEl.textContent = 'تعذر الوصول إلى الكاميرا. تأكد من السماح للمتصفح باستخدام الكاميرا.';
                    statusEl.classList.add('status-error');
                    finishBtn.textContent = 'إغلاق';
                    finishBtn.disabled = false;
                });

            finishBtn.addEventListener('click', () => {
                // إيقاف الـ stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                overlay.remove();
                container.style.display = 'block';

                if (stream) {
                    resolve({
                        status: 'passed',
                        details: 'Camera permission granted, stream available'
                    });
                } else {
                    resolve({
                        status: 'failed',
                        details: 'تعذر الوصول إلى الكاميرا. تأكد من السماح للمتصفح باستخدام الكاميرا.'
                    });
                }
            });
        });
    },
    
    // اختبار الميكروفون
    testMicrophone: async function() {
        return await this.runMicrophoneTest();
    },
    
    // تشغيل اختبار الميكروفون
    runMicrophoneTest: async function() {
        return new Promise((resolve) => {
            // إخفاء container التفاعلي
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            // إنشاء overlay للميكروفون
            const overlay = document.createElement('div');
            overlay.className = 'test-overlay microphone-test-overlay';
            overlay.innerHTML = `
                <div class="test-overlay-header mic-overlay-header">
                    <h2>اختبار الميكروفون</h2>
                    <p>سنقوم باختبار الميكروفون. يرجى السماح للمتصفح باستخدام الميكروفون، ثم تحدث أو اضغط بالقرب من الميكروفون.</p>
                    <button class="btn btn-sm btn-secondary close-overlay-btn" id="closeMicBtn">إغلاق</button>
                </div>
                <div class="test-overlay-content" id="micTestContent"></div>
                <div class="test-overlay-actions mic-overlay-actions">
                    <button class="btn btn-success btn-lg" id="finishMicBtn" disabled>إكمال الاختبار</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const contentEl = document.getElementById('micTestContent');

            contentEl.innerHTML = `
                <div class="microphone-test-container">
                    <div class="mic-level-meter">
                        <div class="mic-level-bar" id="micLevelBar"></div>
                    </div>
                    <div class="mic-status" id="micStatus">جاري طلب الإذن...</div>
                    <div class="mic-instruction">تحدث أو اضغط بالقرب من الميكروفون</div>
                </div>
            `;

            const levelBar = document.getElementById('micLevelBar');
            const statusEl = document.getElementById('micStatus');
            const finishBtn = document.getElementById('finishMicBtn');
            const closeBtn = document.getElementById('closeMicBtn');

            // زر الإغلاق
            closeBtn.addEventListener('click', () => {
                // إيقاف الـ stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                // إغلاق AudioContext
                if (audioContext) {
                    audioContext.close();
                }

                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'cancelled',
                    details: 'تم إلغاء الاختبار'
                });
            });

            // إيقاف عند النقر خارج المحتوى
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    // إيقاف الـ stream
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }

                    // إغلاق AudioContext
                    if (audioContext) {
                        audioContext.close();
                    }

                    overlay.remove();
                    container.style.display = 'block';
                    resolve({
                        status: 'cancelled',
                        details: 'تم إلغاء الاختبار'
                    });
                }
            });

            let stream = null;
            let audioContext = null;
            let analyser = null;
            let inputDetected = false;

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((mediaStream) => {
                    stream = mediaStream;
                    statusEl.textContent = 'Microphone stream available';
                    statusEl.classList.add('status-success');

                    // إعداد Web Audio API
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    const source = audioContext.createMediaStreamSource(mediaStream);
                    source.connect(analyser);

                    // ربط بالمكبرات للسماع المباشر
                    analyser.connect(audioContext.destination);

                    analyser.fftSize = 256;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);

                    // مراقبة مستوى الصوت
                    const checkAudioLevel = () => {
                        if (!stream) return;

                        analyser.getByteFrequencyData(dataArray);

                        // حساب متوسط مستوى الصوت
                        let sum = 0;
                        for (let i = 0; i < dataArray.length; i++) {
                            sum += dataArray[i];
                        }
                        const average = sum / dataArray.length;

                        // تحديث شريط المستوى
                        const level = Math.min(100, (average / 128) * 100);
                        levelBar.style.width = `${level}%`;

                        // اكتشاف وجود إشارة صوتية
                        if (average > 10 && !inputDetected) {
                            inputDetected = true;
                            statusEl.textContent = 'Microphone input detected';
                            finishBtn.disabled = false;
                        }

                        requestAnimationFrame(checkAudioLevel);
                    };

                    checkAudioLevel();
                })
                .catch((error) => {
                    console.log('Microphone test failed:', error);
                    statusEl.textContent = 'تعذر الوصول إلى الميكروفون. تأكد من السماح للمتصفح باستخدام الميكروفون.';
                    statusEl.classList.add('status-error');
                    finishBtn.textContent = 'إغلاق';
                    finishBtn.disabled = false;
                });

            finishBtn.addEventListener('click', () => {
                // إيقاف الـ stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                // إغلاق AudioContext
                if (audioContext) {
                    audioContext.close();
                }

                overlay.remove();
                container.style.display = 'block';

                if (stream && inputDetected) {
                    resolve({
                        status: 'passed',
                        details: 'Microphone input detected'
                    });
                } else if (stream) {
                    resolve({
                        status: 'warning',
                        details: 'Microphone permission granted but no input detected'
                    });
                } else {
                    resolve({
                        status: 'failed',
                        details: 'تعذر الوصول إلى الميكروفون. تأكد من السماح للمتصفح باستخدام الميكروفون.'
                    });
                }
            });

            // إيقاف كل شيء عند إغلاق الـ overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    // إيقاف الـ stream
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }

                    // إغلاق AudioContext
                    if (audioContext) {
                        audioContext.close();
                    }

                    overlay.remove();
                    container.style.display = 'block';
                    resolve({
                        status: 'cancelled',
                        details: 'تم إلغاء الاختبار'
                    });
                }
            });
        });
    },

    // اختبار السماعات
    testSpeaker: async function() {
        return await this.runSpeakerTest();
    },

    // تشغيل اختبار السماعات
    runSpeakerTest: async function() {
        return new Promise((resolve) => {
            // إخفاء container التفاعلي
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';

            // إنشاء overlay للسماعات
            const overlay = document.createElement('div');
            overlay.className = 'test-overlay speaker-test-overlay';
            overlay.innerHTML = `
                <div class="test-overlay-header speaker-overlay-header">
                    <h2>فحص السماعات</h2>
                    <p>اضغط تشغيل للاستماع إلى نغمة الاختبار.</p>
                    <button class="btn btn-sm btn-secondary close-overlay-btn" id="closeSpeakerBtn">إغلاق</button>
                </div>
                <div class="test-overlay-content" id="speakerTestContent">
                    <div class="speaker-test-container">
                        <div class="speaker-test-buttons">
                            <button class="btn btn-primary btn-lg" id="playLeftBtn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5v14l11-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                اختبار السماعة اليسرى
                            </button>
                            <button class="btn btn-primary btn-lg" id="playRightBtn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5v14l11-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                اختبار السماعة اليمنى
                            </button>
                        </div>
                        <div class="speaker-status" id="speakerStatus"></div>
                        <div class="speaker-results" id="speakerResults"></div>
                    </div>
                </div>
                <div class="test-overlay-actions speaker-overlay-actions" id="speakerActions" style="display: none;">
                    <p class="speaker-question">هل سمعت الصوت من السماعتين؟</p>
                    <button class="btn btn-success btn-lg" id="speakerYesBtn">نعم، سمعت الصوت</button>
                    <button class="btn btn-danger btn-lg" id="speakerNoBtn">لا، لم أسمع الصوت</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const playLeftBtn = document.getElementById('playLeftBtn');
            const playRightBtn = document.getElementById('playRightBtn');
            const statusEl = document.getElementById('speakerStatus');
            const resultsEl = document.getElementById('speakerResults');
            const actionsEl = document.getElementById('speakerActions');
            const yesBtn = document.getElementById('speakerYesBtn');
            const noBtn = document.getElementById('speakerNoBtn');
            const closeBtn = document.getElementById('closeSpeakerBtn');

            let audioContext = null;
            let oscillator = null;
            let leftTested = false;
            let rightTested = false;

            // دالة مساعدة لإيقاف الصوت
            const stopSound = () => {
                if (oscillator) {
                    try {
                        oscillator.stop();
                    } catch (e) {}
                    oscillator = null;
                }
                if (audioContext) {
                    try {
                        audioContext.close();
                    } catch (e) {}
                    audioContext = null;
                }
            };

            // زر الإغلاق
            closeBtn.addEventListener('click', () => {
                stopSound();
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'cancelled',
                    details: 'تم إلغاء الاختبار'
                });
            });

            // إيقاف الصوت عند النقر خارج المحتوى
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    stopSound();
                    overlay.remove();
                    container.style.display = 'block';
                    resolve({
                        status: 'cancelled',
                        details: 'تم إلغاء الاختبار'
                    });
                }
            });

            // اختبار السماعة اليسرى
            playLeftBtn.addEventListener('click', () => {
                // إيقاف أي صوت موجود مسبقاً
                stopSound();

                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    if (audioContext.createStereoPanner) {
                        const panner = audioContext.createStereoPanner();
                        oscillator.connect(panner);
                        panner.connect(gainNode);
                        panner.pan.setValueAtTime(-1, audioContext.currentTime); // Left channel only
                    } else {
                        // Fallback for browsers without StereoPanner
                        oscillator.connect(gainNode);
                    }

                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

                    oscillator.start();
                    statusEl.textContent = 'جاري تشغيل الصوت من السماعة اليسرى...';
                    statusEl.classList.add('status-success');

                    // تشغيل لمدة 2 ثانية
                    setTimeout(() => {
                        stopSound();
                        leftTested = true;
                        statusEl.textContent = 'اكتمل اختبار السماعة اليسرى';
                        if (!resultsEl.innerHTML) {
                            resultsEl.innerHTML = '<div class="speaker-result-item">✓ السماعة اليسرى تم الاختبار</div>';
                        } else {
                            resultsEl.innerHTML += '<div class="speaker-result-item">✓ السماعة اليسرى تم الاختبار</div>';
                        }

                        if (leftTested && rightTested) {
                            actionsEl.style.display = 'flex';
                        }
                    }, 2000);
                } catch (error) {
                    console.log('Speaker test failed:', error);
                    statusEl.textContent = 'تعذر تشغيل الصوت. المتصفح لا يدعم Web Audio API.';
                    statusEl.classList.add('status-error');
                }
            });

            // اختبار السماعة اليمنى
            playRightBtn.addEventListener('click', () => {
                // إيقاف أي صوت موجود مسبقاً
                stopSound();

                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    if (audioContext.createStereoPanner) {
                        const panner = audioContext.createStereoPanner();
                        oscillator.connect(panner);
                        panner.connect(gainNode);
                        panner.pan.setValueAtTime(1, audioContext.currentTime); // Right channel only
                    } else {
                        // Fallback for browsers without StereoPanner
                        oscillator.connect(gainNode);
                    }

                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

                    oscillator.start();
                    statusEl.textContent = 'جاري تشغيل الصوت من السماعة اليمنى...';
                    statusEl.classList.add('status-success');

                    // تشغيل لمدة 2 ثانية
                    setTimeout(() => {
                        stopSound();
                        rightTested = true;
                        statusEl.textContent = 'اكتمل اختبار السماعة اليمنى';
                        if (!resultsEl.innerHTML) {
                            resultsEl.innerHTML = '<div class="speaker-result-item">✓ السماعة اليمنى تم الاختبار</div>';
                        } else {
                            resultsEl.innerHTML += '<div class="speaker-result-item">✓ السماعة اليمنى تم الاختبار</div>';
                        }

                        if (leftTested && rightTested) {
                            actionsEl.style.display = 'flex';
                        }
                    }, 2000);
                } catch (error) {
                    console.log('Speaker test failed:', error);
                    statusEl.textContent = 'تعذر تشغيل الصوت. المتصفح لا يدعم Web Audio API.';
                    statusEl.classList.add('status-error');
                }
            });

            yesBtn.addEventListener('click', () => {
                stopSound();
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'passed',
                    details: `تم تشغيل اختبار الصوت من السماعتين. السماعة اليسرى: ${leftTested ? 'سمعت' : 'لم تسمع'}, السماعة اليمنى: ${rightTested ? 'سمعت' : 'لم تسمع'}`
                });
            });

            noBtn.addEventListener('click', () => {
                stopSound();
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'warning',
                    details: `تم تشغيل اختبار الصوت من السماعتين. السماعة اليسرى: ${leftTested ? 'سمعت' : 'لم تسمع'}, السماعة اليمنى: ${rightTested ? 'سمعت' : 'لم تسمع'}`
                });
            });

            // إيقاف عند النقر خارج المحتوى
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    // إيقاف الصوت تماماً
                    if (oscillator) {
                        oscillator.stop();
                        oscillator = null;
                    }
                    if (audioContext) {
                        audioContext.close();
                        audioContext = null;
                    }

                    overlay.remove();
                    container.style.display = 'block';
                    resolve({
                        status: 'cancelled',
                        details: 'تم إلغاء الاختبار'
                    });
                }
            });
        });
    },

    // اختبار الشبكة
    testNetwork: async function() {
        return await this.runNetworkTest();
    },

    // تشغيل اختبار الشبكة
    runNetworkTest: async function() {
        return new Promise((resolve) => {
            const startedAt = new Date().toISOString();
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            if (!connection) {
                const completedAt = new Date().toISOString();
                resolve({
                    status: 'limited',
                    details: 'Network API غير متاح في هذا المتصفح',
                    category: TestCategories.SYSTEM,
                    startedAt: startedAt,
                    completedAt: completedAt,
                    userConfirmation: false,
                    evidence: 'navigator.connection API not available',
                    limitations: ['Network API غير متاح في هذا المتصفح']
                });
                return;
            }

            const networkInfo = {
                online: navigator.onLine,
                type: connection.effectiveType || 'غير متاح',
                downlink: connection.downlink ? `${connection.downlink} Mbps` : 'غير متاح',
                rtt: connection.rtt ? `${connection.rtt} ms` : 'غير متاح',
                saveData: connection.saveData ? 'نعم' : 'لا'
            };

            const completedAt = new Date().toISOString();

            if (!navigator.onLine) {
                resolve({
                    status: 'warning',
                    details: 'الجهاز غير متصل بالإنترنت حالياً',
                    category: TestCategories.SYSTEM,
                    startedAt: startedAt,
                    completedAt: completedAt,
                    data: networkInfo,
                    userConfirmation: false,
                    evidence: 'navigator.onLine = false',
                    limitations: []
                });
            } else {
                resolve({
                    status: 'passed',
                    details: 'الاتصال متاح - نوع: ' + networkInfo.type + ', سرعة: ' + networkInfo.downlink,
                    category: TestCategories.SYSTEM,
                    startedAt: startedAt,
                    completedAt: completedAt,
                    data: networkInfo,
                    userConfirmation: false,
                    evidence: 'navigator.onLine = true',
                    limitations: []
                });
            }
        });
    },

    // اختبار البطارية
    testBattery: async function() {
        return await this.runBatteryTest();
    },

    // تشغيل اختبار البطارية
    runBatteryTest: async function() {
        return new Promise((resolve) => {
            if (!navigator.getBattery) {
                resolve({
                    status: 'limited',
                    details: 'المتصفح لا يدعم قراءة معلومات البطارية'
                });
                return;
            }

            navigator.getBattery().then(battery => {
                const level = Math.round(battery.level * 100);
                const charging = battery.charging ? 'جاري الشحن' : 'غير مشحون';
                const chargingTime = battery.chargingTime ? Math.round(battery.chargingTime / 60) + ' دقيقة' : 'غير متاح';
                const dischargingTime = battery.dischargingTime ? Math.round(battery.dischargingTime / 60) + ' دقيقة' : 'غير متاح';

                resolve({
                    status: 'passed',
                    details: `مستوى البطارية: ${level}%, الحالة: ${charging}`,
                    data: {
                        level: level,
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    }
                });
            }).catch(error => {
                console.log('Battery test failed:', error);
                resolve({
                    status: 'limited',
                    details: 'تعذر قراءة معلومات البطارية'
                });
            });
        });
    },

    // اختبار الأداء
    testPerformance: async function() {
        return await this.runPerformanceTest();
    },

    // تشغيل اختبار الأداء
    runPerformanceTest: async function() {
        return new Promise((resolve) => {
            const startTime = performance.now();
            
            // اختبار العمليات الحسابية
            let iterations = 0;
            const maxIterations = 1000000;
            const testDuration = 3000; // 3 ثواني
            
            while (performance.now() - startTime < testDuration && iterations < maxIterations) {
                // عملية حسابية بسيطة
                Math.sqrt(Math.random() * 1000);
                iterations++;
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // اختبار Web Worker availability
            let workerAvailable = false;
            try {
                if (window.Worker) {
                    workerAvailable = true;
                }
            } catch (e) {
                workerAvailable = false;
            }
            
            resolve({
                status: 'passed',
                details: `استغرقت ${iterations} عملية في ${duration.toFixed(2)}ms. Web Worker: ${workerAvailable ? 'متاح' : 'غير متاح'}`,
                data: {
                    iterations: iterations,
                    duration: duration,
                    workerAvailable: workerAvailable
                }
            });
        });
    },

    // اختبار التخزين
    testStorage: async function() {
        return await this.runStorageTest();
    },

    // تشغيل اختبار التخزين
    runStorageTest: async function() {
        return new Promise((resolve) => {
            if (!navigator.storage || !navigator.storage.estimate) {
                resolve({
                    status: 'limited',
                    details: 'Storage API غير متاح في هذا المتصفح. المتصفح لا يستطيع تحديد نوع الهارد (SSD/HDD) بسبب قيود الأمان.',
                    data: {
                        usage: 0,
                        quota: 0,
                        usagePercent: 0,
                        diskType: 'غير متاح'
                    }
                });
                return;
            }

            navigator.storage.estimate().then(estimate => {
                const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
                const usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2);

                resolve({
                    status: 'passed',
                    details: `تم التحقق من قدرات التخزين المتاحة للمتصفح فقط. المتصفح لا يستطيع تحديد نوع الهارد (SSD/HDD) بسبب قيود الأمان.`,
                    data: {
                        usage: estimate.usage,
                        quota: estimate.quota,
                        usagePercent: usagePercent,
                        diskType: 'غير متاح - قيود المتصفح'
                    }
                });
            }).catch(error => {
                console.log('Storage test failed:', error);
                resolve({
                    status: 'limited',
                    details: 'تعذر قراءة معلومات التخزين. المتصفح لا يستطيع تحديد نوع الهارد (SSD/HDD) بسبب قيود الأمان.',
                    data: {
                        usage: 0,
                        quota: 0,
                        usagePercent: 0,
                        diskType: 'غير متاح'
                    }
                });
            });
        });
    },

    // اختبار الرسوميات
    testGPU: async function() {
        return await this.runGPUTest();
    },

    // تشغيل اختبار الرسوميات
    runGPUTest: async function() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                resolve({
                    status: 'limited',
                    details: 'WebGL غير متاح في هذا المتصفح'
                });
                return;
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            let renderer = 'غير متاح';
            let vendor = 'غير متاح';

            if (debugInfo) {
                renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            }

            resolve({
                status: 'passed',
                details: `تم التحقق من قدرة المتصفح على تشغيل WebGL. Renderer: ${renderer || 'محدودة بسبب قيود الخصوصية'}`,
                data: {
                    webgl: true,
                    renderer: renderer,
                    vendor: vendor
                }
            });
        });
    },

    // تحديث حالة الفحص
    updateStatus: function(status) {
        const statusEl = document.getElementById('diagnosticStatus');
        if (statusEl) {
            statusEl.textContent = status;
        }
    },
    
    // تحديث حالة اختبار
    updateTestStatus: function(testId, status) {
        const statusEl = document.getElementById(`status-${testId}`);
        if (statusEl) {
            statusEl.textContent = status;
        }
    },
    
    // تحديث تقدم اختبار
    updateTestProgress: function(testId, progress) {
        const progressEl = document.getElementById(`progress-${testId}`);
        if (progressEl) {
            progressEl.style.width = `${progress}%`;
        }
    },
    
    // تحديث التقدم الكلي
    updateOverallProgress: function(progress) {
        const progressFill = document.getElementById('overallProgressFill');
        const progressText = document.getElementById('overallProgressText');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
    },
    
    // عرض زر عرض النتائج
    showViewResultsButton: function() {
        const actionsEl = document.getElementById('diagnosticActions');
        if (actionsEl) {
            actionsEl.style.display = 'block';
        }
        
        const viewResultsBtn = document.getElementById('viewResultsBtn');
        if (viewResultsBtn) {
            viewResultsBtn.addEventListener('click', () => {
                window.location.href = 'result.html';
            });
        }
    },
    
    // تحويل الحالة إلى نص
    getStatusText: function(status) {
        const statusMap = {
            'passed': 'اجتاز',
            'failed': 'فشل',
            'warning': 'تحذير',
            'limited': 'محدود',
            'not_available': 'غير متاح',
            'pending': 'قيد الانتظار',
            'cancelled': 'ملغي'
        };
        return statusMap[status] || status;
    },
    
    // انتظار
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// بدء الفحص عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    DiagnosticEngine.start();
    
    // إضافة event listeners للـ online/offline
    window.addEventListener('online', () => {
        console.log('Network connection restored');
        const statusEl = document.getElementById('networkStatus');
        if (statusEl) {
            statusEl.textContent = 'متصل';
            statusEl.classList.remove('status-offline');
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('Network connection lost');
        const statusEl = document.getElementById('networkStatus');
        if (statusEl) {
            statusEl.textContent = 'غير متصل';
            statusEl.classList.add('status-offline');
        }
    });
});
