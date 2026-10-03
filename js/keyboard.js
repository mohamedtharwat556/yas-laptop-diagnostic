// YAS Laptop Diagnostic System - Virtual Keyboard Test
// هذا الملف يحتوي على اختبار لوحة المفاتيح التفاعلي

const KeyboardTest = {
    // Layout مفاتيح اللابتوب
    keyboardLayout: [
        // Function row
        [
            { code: 'Escape', label: 'Esc', width: 'small' },
            { code: 'F1', label: 'F1', width: 'small' },
            { code: 'F2', label: 'F2', width: 'small' },
            { code: 'F3', label: 'F3', width: 'small' },
            { code: 'F4', label: 'F4', width: 'small' },
            { code: 'F5', label: 'F5', width: 'small' },
            { code: 'F6', label: 'F6', width: 'small' },
            { code: 'F7', label: 'F7', width: 'small' },
            { code: 'F8', label: 'F8', width: 'small' },
            { code: 'F9', label: 'F9', width: 'small' },
            { code: 'F10', label: 'F10', width: 'small' },
            { code: 'F11', label: 'F11', width: 'small' },
            { code: 'F12', label: 'F12', width: 'small' }
        ],
        // Number row
        [
            { code: 'Backquote', label: '`', width: 'small' },
            { code: 'Digit1', label: '1', width: 'small' },
            { code: 'Digit2', label: '2', width: 'small' },
            { code: 'Digit3', label: '3', width: 'small' },
            { code: 'Digit4', label: '4', width: 'small' },
            { code: 'Digit5', label: '5', width: 'small' },
            { code: 'Digit6', label: '6', width: 'small' },
            { code: 'Digit7', label: '7', width: 'small' },
            { code: 'Digit8', label: '8', width: 'small' },
            { code: 'Digit9', label: '9', width: 'small' },
            { code: 'Digit0', label: '0', width: 'small' },
            { code: 'Minus', label: '-', width: 'small' },
            { code: 'Equal', label: '=', width: 'small' },
            { code: 'Backspace', label: '⌫', width: 'large' }
        ],
        // QWERTY row
        [
            { code: 'Tab', label: 'Tab', width: 'large' },
            { code: 'KeyQ', label: 'Q', width: 'normal' },
            { code: 'KeyW', label: 'W', width: 'normal' },
            { code: 'KeyE', label: 'E', width: 'normal' },
            { code: 'KeyR', label: 'R', width: 'normal' },
            { code: 'KeyT', label: 'T', width: 'normal' },
            { code: 'KeyY', label: 'Y', width: 'normal' },
            { code: 'KeyU', label: 'U', width: 'normal' },
            { code: 'KeyI', label: 'I', width: 'normal' },
            { code: 'KeyO', label: 'O', width: 'normal' },
            { code: 'KeyP', label: 'P', width: 'normal' },
            { code: 'BracketLeft', label: '[', width: 'small' },
            { code: 'BracketRight', label: ']', width: 'small' },
            { code: 'Backslash', label: '\\', width: 'small' }
        ],
        // Home row
        [
            { code: 'CapsLock', label: 'Caps', width: 'large' },
            { code: 'KeyA', label: 'A', width: 'normal' },
            { code: 'KeyS', label: 'S', width: 'normal' },
            { code: 'KeyD', label: 'D', width: 'normal' },
            { code: 'KeyF', label: 'F', width: 'normal' },
            { code: 'KeyG', label: 'G', width: 'normal' },
            { code: 'KeyH', label: 'H', width: 'normal' },
            { code: 'KeyJ', label: 'J', width: 'normal' },
            { code: 'KeyK', label: 'K', width: 'normal' },
            { code: 'KeyL', label: 'L', width: 'normal' },
            { code: 'Semicolon', label: ';', width: 'small' },
            { code: 'Quote', label: "'", width: 'small' },
            { code: 'Enter', label: 'Enter', width: 'xlarge' }
        ],
        // Shift row
        [
            { code: 'ShiftLeft', label: 'Shift', width: 'xlarge' },
            { code: 'KeyZ', label: 'Z', width: 'normal' },
            { code: 'KeyX', label: 'X', width: 'normal' },
            { code: 'KeyC', label: 'C', width: 'normal' },
            { code: 'KeyV', label: 'V', width: 'normal' },
            { code: 'KeyB', label: 'B', width: 'normal' },
            { code: 'KeyN', label: 'N', width: 'normal' },
            { code: 'KeyM', label: 'M', width: 'normal' },
            { code: 'Comma', label: ',', width: 'small' },
            { code: 'Period', label: '.', width: 'small' },
            { code: 'Slash', label: '/', width: 'small' },
            { code: 'ShiftRight', label: 'Shift', width: 'xlarge' }
        ],
        // Bottom control row
        [
            { code: 'ControlLeft', label: 'Ctrl', width: 'medium' },
            { code: 'Fn', label: 'Fn', width: 'medium' },
            { code: 'MetaLeft', label: 'Win', width: 'medium' },
            { code: 'AltLeft', label: 'Alt', width: 'medium' },
            { code: 'Space', label: '', width: 'xxlarge' },
            { code: 'AltRight', label: 'Alt', width: 'medium' },
            { code: 'ControlRight', label: 'Ctrl', width: 'medium' }
        ]
    ],
    
    // Arrow cluster
    arrowCluster: [
        [
            { code: 'Insert', label: 'Ins', width: 'small' },
            { code: 'Home', label: 'Home', width: 'small' },
            { code: 'PageUp', label: 'PgUp', width: 'small' }
        ],
        [
            { code: 'Delete', label: 'Del', width: 'small' },
            { code: 'End', label: 'End', width: 'small' },
            { code: 'PageDown', label: 'PgDn', width: 'small' }
        ],
        [
            { code: '', label: '', width: 'small' },
            { code: 'ArrowUp', label: '↑', width: 'small' },
            { code: '', label: '', width: 'small' }
        ],
        [
            { code: 'ArrowLeft', label: '←', width: 'small' },
            { code: 'ArrowDown', label: '↓', width: 'small' },
            { code: 'ArrowRight', label: '→', width: 'small' }
        ]
    ],
    
    // حالة المفاتيح
    keyStates: {},
    
    // إجمالي المفاتيح
    totalKeys: 0,
    
    // المفاتيح المختبرة
    testedKeys: 0,
    
    // المفاتيح غير القابلة للتحقق
    unsupportedKeys: 0,
    
    // بدء اختبار لوحة المفاتيح
    start: function() {
        console.log('Keyboard Test - Starting...');

        this.keyStates = {};
        this.testedKeys = 0;
        this.unsupportedKeys = 0;
        this.totalKeys = this.countTotalKeys();

        console.log('Total keys:', this.totalKeys);

        // عرض UI
        this.renderKeyboard('interactiveTestContent');

        // تهيئة الحالة بعد العرض
        this.initializeKeyStates();

        // إعداد event listeners
        this.setupEventListeners();

        // تحديث Counter
        this.updateCounter();

        console.log('Keyboard Test - Ready');
        console.log('Key states initialized:', Object.keys(this.keyStates).length);
    },

    // بدء اختبار لوحة المفاتيح في overlay
    startInOverlay: function(containerId) {
        console.log('Keyboard Test - Starting in Overlay...');

        this.keyStates = {};
        this.testedKeys = 0;
        this.unsupportedKeys = 0;
        this.totalKeys = this.countTotalKeys();

        console.log('Total keys:', this.totalKeys);

        // عرض UI في الـ overlay
        this.renderKeyboard(containerId);

        // تهيئة الحالة بعد العرض
        this.initializeKeyStates();

        // إعداد event listeners مع منع قوي
        this.setupOverlayListeners();

        // تحديث Counter
        this.updateCounter();

        console.log('Keyboard Test - Ready in Overlay');
        console.log('Key states initialized:', Object.keys(this.keyStates).length);
    },
    
    // حساب إجمالي المفاتيح
    countTotalKeys: function() {
        let count = 0;
        this.keyboardLayout.forEach(row => {
            count += row.length;
        });
        this.arrowCluster.forEach(row => {
            count += row.length;
        });
        return count;
    },
    
    // عرض لوحة المفاتيح
    renderKeyboard: function(containerId = 'interactiveTestContent') {
        const contentEl = document.getElementById(containerId);

        let html = '<div class="virtual-keyboard-container">';

        // Main keyboard
        html += '<div class="virtual-keyboard">';

        this.keyboardLayout.forEach(row => {
            html += '<div class="keyboard-row">';
            row.forEach(key => {
                html += this.renderKey(key);
            });
            html += '</div>';
        });

        html += '</div>';

        // Arrow cluster
        html += '<div class="arrow-cluster">';
        this.arrowCluster.forEach(row => {
            html += '<div class="keyboard-row">';
            row.forEach(key => {
                if (key.code) {
                    html += this.renderKey(key);
                } else {
                    html += '<div class="key-spacer"></div>';
                }
            });
            html += '</div>';
        });
        html += '</div>';

        html += '</div>';

        // Counter
        html += `
            <div class="keyboard-counter">
                <div class="counter-label">تم اختبار <span id="testedCount">0</span> من <span id="totalCount">${this.totalKeys}</span> مفتاح</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="keyboardProgress" style="width: 0%"></div>
                </div>
            </div>
        `;

        contentEl.innerHTML = html;
    },

    // تهيئة حالات المفاتيح
    initializeKeyStates: function() {
        this.keyboardLayout.forEach(row => {
            row.forEach(key => {
                this.keyStates[key.code] = 'unknown';
            });
        });
        this.arrowCluster.forEach(row => {
            row.forEach(key => {
                if (key.code) {
                    this.keyStates[key.code] = 'unknown';
                }
            });
        });
    },
    
    // عرض مفتاح واحد
    renderKey: function(key) {
        const widthClass = this.getWidthClass(key.width);
        return `
            <div class="key ${widthClass}" data-code="${key.code}" id="key-${key.code}">
                <span class="key-label">${key.label}</span>
            </div>
        `;
    },
    
    // الحصول على class العرض
    getWidthClass: function(width) {
        const widthClasses = {
            'small': 'key-small',
            'normal': 'key-normal',
            'medium': 'key-medium',
            'large': 'key-large',
            'xlarge': 'key-xlarge',
            'xxlarge': 'key-xxlarge'
        };
        return widthClasses[width] || 'key-normal';
    },
    
    // إعداد event listeners
    setupEventListeners: function() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // إضافة listeners على window بدلاً من document
        window.addEventListener('keydown', this.handleKeyDown, true);
        window.addEventListener('keyup', this.handleKeyUp, true);

        console.log('Event listeners added to window');
    },

    // إعداد event listeners للـ overlay مع منع قوي
    setupOverlayListeners: function() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // إضافة listeners على window في capture phase مع منع قوي
        window.addEventListener('keydown', this.handleKeyDown, { capture: true, passive: false });
        window.addEventListener('keyup', this.handleKeyUp, { capture: true, passive: false });

        console.log('Overlay event listeners added to window');
    },
    
    // معالجة keydown
    handleKeyDown: function(e) {
        const code = e.code;

        console.log('Key pressed:', code); // Debug

        // منع الأحداث الافتراضية لجميع المفاتيح
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (this.keyStates[code] === 'unknown') {
            // تحديث الحالة
            this.keyStates[code] = 'tested';
            this.testedKeys++;

            console.log('Key tested:', code, 'Total:', this.testedKeys); // Debug

            // تحديث UI
            const keyEl = document.getElementById(`key-${code}`);
            if (keyEl) {
                keyEl.classList.add('pressed');
                keyEl.classList.add('tested');
            }

            // تحديث Counter
            this.updateCounter();
        } else if (this.keyStates[code] === 'tested') {
            // المفتاح مختبر بالفعل، فقط تأثير بصري
            const keyEl = document.getElementById(`key-${code}`);
            if (keyEl) {
                keyEl.classList.add('pressed');
            }
        }
    },
    
    // معالجة keyup
    handleKeyUp: function(e) {
        const code = e.code;
        
        const keyEl = document.getElementById(`key-${code}`);
        if (keyEl) {
            keyEl.classList.remove('pressed');
        }
    },
    
    // تحديث Counter
    updateCounter: function() {
        const testedCountEl = document.getElementById('testedCount');
        const totalCountEl = document.getElementById('totalCount');
        const progressEl = document.getElementById('keyboardProgress');
        
        if (testedCountEl) {
            testedCountEl.textContent = this.testedKeys;
        }
        if (totalCountEl) {
            totalCountEl.textContent = this.totalKeys;
        }
        if (progressEl) {
            const progress = (this.testedKeys / this.totalKeys) * 100;
            progressEl.style.width = `${progress}%`;
        }
    },
    
    // إنهاء اختبار لوحة المفاتيح
    finish: function() {
        // إزالة event listeners
        if (this.handleKeyDown) {
            window.removeEventListener('keydown', this.handleKeyDown, true);
        }
        if (this.handleKeyUp) {
            window.removeEventListener('keyup', this.handleKeyUp, true);
        }

        console.log('Keyboard Test - Finished. Tested:', this.testedKeys, 'of', this.totalKeys);

        // حساب النتيجة
        const result = {
            status: 'passed',
            details: `تم اختبار ${this.testedKeys} من ${this.totalKeys} مفتاح. المفاتيح غير القابلة للتحقق من المتصفح: ${this.unsupportedKeys}`
        };

        return result;
    }
};
