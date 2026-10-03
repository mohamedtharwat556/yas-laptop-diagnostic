// YAS Laptop Diagnostic System - Diagnostic Engine
// هذا الملف يحتوي على محرك الفحص التشخيصي

const DiagnosticEngine = {
    // قائمة الاختبارات التشخيصية فقط (Device Info منفصل)
    tests: [
        {
            id: 'screen',
            name: 'فحص الشاشة',
            type: 'interactive',
            run: this.testScreen
        },
        {
            id: 'keyboard',
            name: 'فحص لوحة المفاتيح',
            type: 'interactive',
            run: this.testKeyboard
        },
        {
            id: 'mouse',
            name: 'فحص الماوس',
            type: 'interactive',
            run: this.testMouse
        },
        {
            id: 'camera',
            name: 'فحص الكاميرا',
            type: 'permission',
            run: this.testCamera
        },
        {
            id: 'microphone',
            name: 'فحص الميكروفون',
            type: 'permission',
            run: this.testMicrophone
        },
        {
            id: 'speaker',
            name: 'فحص السماعات',
            type: 'interactive',
            run: this.testSpeaker
        },
        {
            id: 'network',
            name: 'فحص الشبكة',
            type: 'automatic',
            run: this.testNetwork
        },
        {
            id: 'battery',
            name: 'فحص البطارية',
            type: 'automatic',
            run: this.testBattery
        },
        {
            id: 'performance',
            name: 'فحص الأداء',
            type: 'automatic',
            run: this.testPerformance
        },
        {
            id: 'storage',
            name: 'فحص التخزين',
            type: 'automatic',
            run: this.testStorage
        },
        {
            id: 'gpu',
            name: 'فحص الرسوميات',
            type: 'automatic',
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
        const info = {};
        
        // نظام التشغيل
        info.os = this.detectOS();
        
        // المتصفح
        info.browser = this.detectBrowser();
        
        // الشاشة
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
        
        // Viewport
        info.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // المعالج
        info.cpu = {
            cores: navigator.hardwareConcurrency || 'غير متاح',
            architecture: navigator.userAgentData?.platform || navigator.platform
        };
        
        // الذاكرة
        info.ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'غير متاح';
        
        // GPU
        info.gpu = this.detectGPU();
        
        // البطارية
        info.battery = await this.detectBattery();
        
        // الشبكة
        info.network = this.detectNetwork();
        
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
        
        container.innerHTML = html;
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
            
            // إخفاء container التفاعلي وجعل الشاشة full screen
            const container = document.getElementById('interactiveTestContainer');
            container.style.display = 'none';
            
            // إنشاء منطقة الاختبار مباشرة على body
            const testArea = document.createElement('div');
            testArea.className = 'screen-test-area black';
            testArea.innerHTML = '<div class="screen-test-message">الأسود</div>';
            document.body.appendChild(testArea);
            
            // أزرار التنقل
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'screen-test-controls';
            controlsDiv.innerHTML = `
                <button class="btn btn-secondary" id="screenPrevBtn" disabled>السابق</button>
                <button class="btn btn-primary" id="screenNextBtn">التالي</button>
            `;
            document.body.appendChild(controlsDiv);
            
            const prevBtn = document.getElementById('screenPrevBtn');
            const nextBtn = document.getElementById('screenNextBtn');
            
            // زر التالي
            nextBtn.addEventListener('click', () => {
                currentColorIndex++;
                if (currentColorIndex >= colors.length) {
                    // اكمال الاختبار
                    testArea.remove();
                    controlsDiv.remove();
                    container.style.display = 'block';
                    this.showScreenQuestion(resolve);
                } else {
                    // تحديث اللون
                    testArea.className = `screen-test-area ${colors[currentColorIndex]}`;
                    const colorNames = ['الأسود', 'الأبيض', 'الأحمر', 'الأخضر', 'الأزرق'];
                    testArea.innerHTML = `<div class="screen-test-message">${colorNames[currentColorIndex]}</div>`;
                    
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
                    testArea.className = `screen-test-area ${colors[currentColorIndex]}`;
                    const colorNames = ['الأسود', 'الأبيض', 'الأحمر', 'الأخضر', 'الأزرق'];
                    testArea.innerHTML = `<div class="screen-test-message">${colorNames[currentColorIndex]}</div>`;
                    
                    // تحديث الأزرار
                    prevBtn.disabled = currentColorIndex === 0;
                    nextBtn.textContent = 'التالي';
                }
            });
        });
    },
    
    // عرض سؤال الشاشة
    showScreenQuestion: function(resolve) {
        const contentEl = document.getElementById('interactiveTestContent');
        const actionsEl = document.getElementById('interactiveTestActions');
        
        contentEl.innerHTML = `
            <div class="screen-question">
                <h3>هل لاحظت أي مشاكل في الشاشة؟</h3>
                <p>نقاط مضيئة أو مظلمة، خطوط، ألوان غير طبيعية</p>
            </div>
        `;
        
        actionsEl.innerHTML = `
            <button class="btn btn-success btn-lg" id="screenNoIssue">لا، الشاشة سليمة</button>
            <button class="btn btn-danger btn-lg" id="screenHasIssue">نعم، توجد مشكلة</button>
        `;
        
        document.getElementById('screenNoIssue').addEventListener('click', () => {
            this.hideInteractiveTest();
            resolve({ status: 'passed', details: 'Visual confirmation: لا توجد مشاكل ظاهرة' });
        });
        
        document.getElementById('screenHasIssue').addEventListener('click', () => {
            this.hideInteractiveTest();
            resolve({ status: 'warning', details: 'Customer reported visual issue' });
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

            let stream = null;

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
                </div>
                <div class="test-overlay-content" id="speakerTestContent">
                    <div class="speaker-test-container">
                        <button class="btn btn-primary btn-lg" id="playSpeakerBtn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5v14l11-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            تشغيل الصوت
                        </button>
                        <div class="speaker-status" id="speakerStatus"></div>
                    </div>
                </div>
                <div class="test-overlay-actions speaker-overlay-actions" id="speakerActions" style="display: none;">
                    <p class="speaker-question">هل سمعت الصوت بوضوح؟</p>
                    <button class="btn btn-success btn-lg" id="speakerYesBtn">نعم، سمعت الصوت</button>
                    <button class="btn btn-danger btn-lg" id="speakerNoBtn">لا، لم أسمع الصوت</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const playBtn = document.getElementById('playSpeakerBtn');
            const statusEl = document.getElementById('speakerStatus');
            const actionsEl = document.getElementById('speakerActions');
            const yesBtn = document.getElementById('speakerYesBtn');
            const noBtn = document.getElementById('speakerNoBtn');

            let audioContext = null;
            let oscillator = null;

            playBtn.addEventListener('click', () => {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

                    oscillator.start();
                    statusEl.textContent = 'جاري تشغيل اختبار الصوت...';
                    statusEl.classList.add('status-success');

                    // تشغيل لمدة 2 ثانية
                    setTimeout(() => {
                        oscillator.stop();
                        oscillator = null;
                        if (audioContext) {
                            audioContext.close();
                        }
                        statusEl.textContent = 'اكتمل تشغيل الصوت';
                        playBtn.style.display = 'none';
                        actionsEl.style.display = 'flex';
                    }, 2000);
                } catch (error) {
                    console.log('Speaker test failed:', error);
                    statusEl.textContent = 'تعذر تشغيل الصوت. المتصفح لا يدعم Web Audio API.';
                    statusEl.classList.add('status-error');
                    playBtn.style.display = 'none';
                    actionsEl.style.display = 'flex';
                }
            });

            yesBtn.addEventListener('click', () => {
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'passed',
                    details: 'تم تشغيل اختبار الصوت وتأكيده بواسطة المستخدم'
                });
            });

            noBtn.addEventListener('click', () => {
                overlay.remove();
                container.style.display = 'block';
                resolve({
                    status: 'warning',
                    details: 'تم تشغيل اختبار الصوت لكن المستخدم لم يسمعه بوضوح'
                });
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
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (!connection) {
                resolve({
                    status: 'limited',
                    details: 'Network API غير متاح في هذا المتصفح'
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

            if (!navigator.onLine) {
                resolve({
                    status: 'warning',
                    details: 'الجهاز غير متصل بالإنترنت حالياً',
                    data: networkInfo
                });
            } else {
                resolve({
                    status: 'passed',
                    details: 'الاتصال متاح - نوع: ' + networkInfo.type + ', سرعة: ' + networkInfo.downlink,
                    data: networkInfo
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
                    details: 'Storage API غير متاح في هذا المتصفح'
                });
                return;
            }

            navigator.storage.estimate().then(estimate => {
                const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
                const usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2);

                resolve({
                    status: 'passed',
                    details: `تم التحقق من قدرات التخزين المتاحة للمتصفح فقط. Usage: ${usageMB}MB / ${quotaMB}MB (${usagePercent}%)`,
                    data: {
                        usage: estimate.usage,
                        quota: estimate.quota,
                        usagePercent: usagePercent
                    }
                });
            }).catch(error => {
                console.log('Storage test failed:', error);
                resolve({
                    status: 'limited',
                    details: 'تعذر قراءة معلومات التخزين'
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
            'pending': 'قيد الانتظار'
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
