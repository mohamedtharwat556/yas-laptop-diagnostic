// YAS Laptop Diagnostic System - Hardware Agent Detection UI
// BATCH 6B-2b: Hardware Agent Detection + Installation Flow
// This module manages the UI for Agent detection and installation flow

const AgentUI = {
    // State flags
    agentConnected: false,
    continueWithoutAgent: false,

    // Initialize Agent UI
    init: async function() {
        console.log('[AgentUI] Initializing...');
        
        // Set up state change listener
        HardwareAgent.onStateChange = (event) => {
            this.onAgentStateChange(event);
        };

        // Show unavailable card if download not available
        this.updateDownloadButton();

        // Setup refresh hardware button
        const refreshBtn = document.getElementById('refreshHardwareBtn');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.refreshHardware();
            refreshBtn.style.display = this.agentConnected ? 'flex' : 'none';
        }

        // Start agent detection
        await this.performAgentDetection();
    },

    // Perform Agent Detection
    performAgentDetection: async function() {
        console.log('[AgentUI] Starting agent detection...');
        
        const connected = await HardwareAgent.detectAgent();
        
        if (connected) {
            this.onAgentConnected();
        } else {
            this.onAgentDisconnected();
        }
    },

    // Handle Agent Connected
    onAgentConnected: async function() {
        console.log('[AgentUI] Agent connected!');
        this.agentConnected = true;
        
        // Hide unavailable card
        const card = document.getElementById('agentUnavailableCard');
        if (card) {
            card.style.display = 'none';
        }

        // Show device info section
        const deviceInfoSection = document.getElementById('deviceInfoSection');
        if (deviceInfoSection) {
            deviceInfoSection.style.display = 'block';
        }

        // Show refresh hardware button
        const refreshBtn = document.getElementById('refreshHardwareBtn');
        if (refreshBtn) {
            refreshBtn.style.display = 'flex';
        }

        // Collect and display hardware info
        await this.collectAndDisplayHardware();

        // Update status indicator
        this.updateStatusIndicator('connected');
    },

    // Handle Agent Disconnected
    onAgentDisconnected: async function() {
        console.log('[AgentUI] Agent disconnected');
        this.agentConnected = false;

        // Show unavailable card
        const card = document.getElementById('agentUnavailableCard');
        if (card) {
            card.style.display = 'block';
        }

        // Update status indicator
        this.updateStatusIndicator('disconnected');

        // Show appropriate buttons
        this.updateUnavailableCardButtons();
    },

    // Handle Agent State Change
    onAgentStateChange: function(event) {
        console.log(`[AgentUI] State changed: ${event.newState} - ${event.message}`);
        
        // Update status indicator based on state
        const dot = document.querySelector('.agent-status-indicator .status-dot');
        const text = document.querySelector('.agent-status-indicator .status-text');

        if (dot && text) {
            text.textContent = event.message;
            
            // Update dot color based on state
            dot.classList.remove('connected', 'disconnected', 'error');
            
            switch (event.newState) {
                case AgentState.CONNECTED:
                case AgentState.COLLECTING:
                case AgentState.COMPLETED:
                    dot.classList.add('connected');
                    break;
                case AgentState.DISCONNECTED:
                    dot.classList.add('disconnected');
                    break;
                case AgentState.ERROR:
                    dot.classList.add('error');
                    break;
                default:
                    // CHECKING state - pulsing animation
                    break;
            }
        }
    },

    // Update Status Indicator
    updateStatusIndicator: function(status) {
        const indicator = document.getElementById('agentStatusIndicator');
        if (!indicator) return;

        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');

        if (dot) {
            dot.classList.remove('connected', 'disconnected', 'error');
            if (status === 'connected') {
                dot.classList.add('connected');
                text.textContent = 'مساعد فحص YAS متصل';
            } else {
                dot.classList.add('disconnected');
                text.textContent = 'مساعد فحص الجهاز غير متصل';
            }
        }
    },

    // Collect and Display Hardware Information
    collectAndDisplayHardware: async function() {
        console.log('[AgentUI] Collecting hardware information...');
        
        const hardwareData = await HardwareAgent.getHardware();
        
        if (hardwareData && !hardwareData.error) {
            // Update session with hardware data
            const session = AppState.getCurrentSession();
            if (session) {
                // Merge hardware data with existing device info
                session.deviceInfo = {
                    ...session.deviceInfo,
                    ...hardwareData,
                    hardwareSource: HardwareAgent.SOURCES.HARDWARE_AGENT,
                    hardwareCapturedAt: new Date().toISOString()
                };
                
                // Save device info to session (synchronizes with Supabase)
                await AppState.saveDeviceInfo(session.deviceInfo);
                
                console.log('[AgentUI] Hardware data saved to session:', {
                    source: HardwareAgent.SOURCES.HARDWARE_AGENT,
                    timestamp: session.deviceInfo.hardwareCapturedAt
                });
            }

            // Display hardware information
            this.displayDeviceInfo(hardwareData);
        } else {
            console.log('[AgentUI] Failed to collect hardware data');
        }
    },

    // Display Device Information
    displayDeviceInfo: function(hardwareData) {
        console.log('[AgentUI] Displaying device information...');
        
        const grid = document.getElementById('deviceInfoGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Define device info fields to display
        const infoFields = [
            {
                label: 'الشركة المصنعة',
                value: hardwareData.computer?.manufacturer?.value,
                source: hardwareData.computer?.manufacturer?.source
            },
            {
                label: 'الموديل',
                value: hardwareData.computer?.model?.value,
                source: hardwareData.computer?.model?.source
            },
            {
                label: 'نظام التشغيل',
                value: hardwareData.operatingSystem?.name?.value,
                source: hardwareData.operatingSystem?.name?.source
            },
            {
                label: 'النسخة',
                value: hardwareData.operatingSystem?.version?.value,
                source: hardwareData.operatingSystem?.version?.source
            },
            {
                label: 'المعالج',
                value: hardwareData.cpu?.name?.value,
                source: hardwareData.cpu?.name?.source
            },
            {
                label: 'الأنوية الفعلية',
                value: hardwareData.cpu?.cores?.value ? `${hardwareData.cpu.cores.value} أنوية` : 'غير متاح',
                source: hardwareData.cpu?.cores?.source
            },
            {
                label: 'المعالجات المنطقية',
                value: hardwareData.cpu?.logicalProcessors?.value ? `${hardwareData.cpu.logicalProcessors.value} معالج` : 'غير متاح',
                source: hardwareData.cpu?.logicalProcessors?.source
            },
            {
                label: 'الذاكرة',
                value: hardwareData.memory?.totalGB?.value ? `${hardwareData.memory.totalGB.value} GB` : 'غير متاح',
                source: hardwareData.memory?.totalGB?.source
            },
            {
                label: 'كارت الشاشة',
                value: hardwareData.gpu && hardwareData.gpu.length > 0 
                    ? hardwareData.gpu[0].name || 'متاح'
                    : 'غير متاح',
                source: 'hardware-agent'
            },
            {
                label: 'التخزين',
                value: hardwareData.storage && hardwareData.storage.length > 0 
                    ? `${hardwareData.storage.length} قرص`
                    : 'غير متاح',
                source: 'hardware-agent'
            }
        ];

        // Create cards for each field
        infoFields.forEach(field => {
            if (field.value) {
                const card = document.createElement('div');
                card.className = 'device-info-card';
                
                const sourceBadge = field.source 
                    ? `<span class="source-badge ${field.source}">${this.getSourceLabel(field.source)}</span>`
                    : '';

                card.innerHTML = `
                    <div class="card-label">${field.label}</div>
                    <div class="card-value">${field.value}</div>
                    <div class="card-source">${sourceBadge}</div>
                `;

                grid.appendChild(card);
            }
        });

        console.log('[AgentUI] Device information displayed');
    },

    // Get Source Label
    getSourceLabel: function(source) {
        const labels = {
            'hardware-agent': 'مساعد الفحص',
            'browser': 'المتصفح',
            'unavailable': 'غير متاح'
        };
        return labels[source] || source;
    },

    // Update Download Button
    updateDownloadButton: function() {
        const downloadBtn = document.getElementById('downloadAgentBtn');
        const verifyBtn = document.getElementById('verifyInstallationBtn');
        const urlMessage = document.getElementById('downloadURLMessage');

        if (!HardwareAgent.isDownloadAvailable()) {
            if (downloadBtn) downloadBtn.style.display = 'none';
            if (urlMessage) urlMessage.style.display = 'block';
        } else {
            if (downloadBtn) downloadBtn.style.display = 'flex';
            if (urlMessage) urlMessage.style.display = 'none';
        }

        if (verifyBtn) {
            verifyBtn.style.display = 'flex';
        }
    },

    // Update Unavailable Card Buttons
    updateUnavailableCardButtons: function() {
        const downloadBtn = document.getElementById('downloadAgentBtn');
        const verifyBtn = document.getElementById('verifyInstallationBtn');
        const continueBtn = document.getElementById('continueWithoutAgentBtn');

        if (HardwareAgent.isDownloadAvailable()) {
            if (downloadBtn) {
                downloadBtn.style.display = 'flex';
                downloadBtn.onclick = () => this.onDownloadClick();
            }
        }

        if (verifyBtn) {
            verifyBtn.style.display = 'flex';
            verifyBtn.onclick = () => this.onVerifyInstallationClick();
        }

        if (continueBtn) {
            continueBtn.onclick = () => this.onContinueWithoutAgentClick();
        }
    },

    // Handle Download Click
    onDownloadClick: function() {
        console.log('[AgentUI] Download clicked');
        
        const downloadURL = HardwareAgent.getDownloadURL();
        if (downloadURL) {
            window.open(downloadURL, '_blank');
        }
    },

    // Handle Verify Installation Click
    onVerifyInstallationClick: async function() {
        console.log('[AgentUI] Verify installation clicked');
        
        const verifyBtn = document.getElementById('verifyInstallationBtn');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'جاري التحقق...';
        }

        const connected = await HardwareAgent.verifyInstallation();

        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'تحقق من التثبيت';
        }

        if (connected) {
            this.onAgentConnected();
        } else {
            console.log('[AgentUI] Installation verification failed');
        }
    },

    // Handle Continue Without Agent Click
    onContinueWithoutAgentClick: function() {
        console.log('[AgentUI] Continue without agent clicked');
        
        this.continueWithoutAgent = true;
        
        // Hide unavailable card
        const card = document.getElementById('agentUnavailableCard');
        if (card) {
            card.style.display = 'none';
        }

        // Update status to indicate browser fallback
        const indicator = document.querySelector('.agent-status-indicator .status-text');
        if (indicator) {
            indicator.textContent = 'تم تجهيز الفحص الأساسي من المتصفح';
        }

        // Trigger diagnostic start
        if (typeof DiagnosticEngine !== 'undefined' && DiagnosticEngine.startTests) {
            DiagnosticEngine.startTests();
        }
    },

    // Refresh Hardware
    refreshHardware: async function() {
        console.log('[AgentUI] Refreshing hardware...');
        
        if (!this.agentConnected) {
            console.log('[AgentUI] Agent not connected, cannot refresh');
            return;
        }

        // Set state to checking
        HardwareAgent.setState(AgentState.CHECKING);

        // Re-detect agent
        const connected = await HardwareAgent.detectAgent();

        if (connected) {
            // Collect hardware again
            await this.collectAndDisplayHardware();
        } else {
            HardwareAgent.setState(AgentState.DISCONNECTED);
            this.onAgentDisconnected();
        }
    }
};
