// YAS Laptop Diagnostic System - Hardware Agent Client
// BATCH 6B-2b: Hardware Agent Detection + Installation Flow
// This module handles communication with the YAS Hardware Agent

// Agent States (State Machine)
const AgentState = {
    CHECKING: 'CHECKING',                   // جاري التحقق
    CONNECTED: 'CONNECTED',                 // متصل
    DISCONNECTED: 'DISCONNECTED',           // غير متصل
    PERMISSION_REQUIRED: 'PERMISSION_REQUIRED', // يحتاج صلاحية
    ERROR: 'ERROR',                         // خطأ
    COLLECTING: 'COLLECTING',               // جاري قراءة المعلومات
    COMPLETED: 'COMPLETED'                  // اكتمل
};

// Agent State Messages (Arabic)
const AgentStateMessages = {
    CHECKING: 'جاري التحقق من مساعد فحص YAS...',
    CONNECTED: 'مساعد فحص YAS متصل',
    DISCONNECTED: 'مساعد فحص الجهاز غير متصل',
    PERMISSION_REQUIRED: 'يحتاج الموقع إلى السماح بالوصول إلى مساعد الفحص المحلي',
    ERROR: 'تعذر الاتصال بمساعد فحص YAS',
    COLLECTING: 'جاري قراءة معلومات الجهاز...',
    COMPLETED: 'تم التعرف على معلومات الجهاز'
};

// Hardware Agent Configuration
const HARDWARE_AGENT_CONFIG = {
    // Get base URL from environment or use default
    getBaseURL: function() {
        // Check for environment variable first (for production)
        if (typeof VITE_HARDWARE_AGENT_URL !== 'undefined') {
            return VITE_HARDWARE_AGENT_URL;
        }
        // Check localStorage for configured URL (for development)
        const stored = localStorage.getItem('hardware_agent_url');
        if (stored) {
            return stored;
        }
        // Default to localhost
        return 'http://127.0.0.1:5275';
    },
    
    timeout: 3000, // 3 seconds timeout (2 second grace period before decision)
    
    // Download URL for Hardware Agent installer
    getDownloadURL: function() {
        if (typeof VITE_HARDWARE_AGENT_DOWNLOAD_URL !== 'undefined') {
            return VITE_HARDWARE_AGENT_DOWNLOAD_URL;
        }
        return null; // Not configured
    },
    
    // Retry configuration for installation verification
    retryConfig: {
        attempts: 3,
        delays: [500, 1000, 2000] // milliseconds
    }
};

const HardwareAgent = {
    // Data sources
    SOURCES: {
        HARDWARE_AGENT: 'hardware-agent',
        BROWSER: 'browser',
        MANUAL: 'manual',
        UNAVAILABLE: 'unavailable'
    },

    // Confidence levels
    CONFIDENCE: {
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW',
        NONE: 'NONE'
    },

    // States
    state: AgentState.DISCONNECTED,
    
    // Current connection status
    isConnected: false,
    agentInfo: null,
    lastHardwareData: null,
    
    // State change callback
    onStateChange: null,

    // Set state and trigger callback
    setState: function(newState) {
        if (this.state !== newState) {
            const oldState = this.state;
            this.state = newState;
            console.log(`[Agent] State: ${oldState} → ${newState} | ${AgentStateMessages[newState]}`);
            
            // Trigger callback
            if (this.onStateChange && typeof this.onStateChange === 'function') {
                this.onStateChange({
                    oldState: oldState,
                    newState: newState,
                    message: AgentStateMessages[newState]
                });
            }
        }
    },

    // Check if agent is available (Health Check)
    // Supports Loopback Network Access for HTTPS → localhost
    detectAgent: async function() {
        console.log('[YAS Agent] Detection started');
        this.setState(AgentState.CHECKING);
        
        const baseURL = HARDWARE_AGENT_CONFIG.getBaseURL();
        console.log('[YAS Agent] Checking:', baseURL + '/api/health');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('[YAS Agent] Health check timeout');
                controller.abort();
            }, HARDWARE_AGENT_CONFIG.timeout);

            // Build request with loopback support
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                signal: controller.signal
            };

            // Add targetAddressSpace for loopback network access
            if (baseURL.includes('127.0.0.1') || baseURL.includes('localhost')) {
                console.log('[YAS Agent] Targeting loopback address space');
                fetchOptions.targetAddressSpace = 'loopback';
            }

            const response = await fetch(`${baseURL}/api/health`, fetchOptions);
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok') {
                    this.isConnected = true;
                    this.agentInfo = data;
                    this.setState(AgentState.CONNECTED);
                    console.log('[YAS Agent] Detection result: CONNECTED');
                    console.log('[YAS Agent] Agent info:', data);
                    return true;
                }
            } else {
                console.log('[YAS Agent] HTTP error:', response.status);
            }
        } catch (error) {
            console.error('[YAS Agent] Connection failed:', error.message);
            
            // Diagnose specific error
            if (error.name === 'AbortError') {
                console.log('[YAS Agent] Timeout - Agent not responding');
            } else if (error.message.includes('Failed to fetch')) {
                console.log('[YAS Agent] Fetch failed - checking if permission required');
                
                // Check if we're on HTTPS
                if (window.location.protocol === 'https:') {
                    console.log('[YAS Agent] Running on HTTPS - Local Network Access may require permission');
                    this.setState(AgentState.PERMISSION_REQUIRED);
                    return false;
                }
            } else if (error.message.includes('CORS')) {
                console.log('[YAS Agent] CORS error - Check agent CORS configuration');
            }
        }

        this.isConnected = false;
        this.agentInfo = null;
        this.setState(AgentState.DISCONNECTED);
        console.log('[YAS Agent] Final state: DISCONNECTED');
        return false;
    },

    // Get agent health status
    getHealth: async function() {
        const baseURL = HARDWARE_AGENT_CONFIG.getBaseURL();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), HARDWARE_AGENT_CONFIG.timeout);

            const response = await fetch(`${baseURL}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.json();
            } else {
                return {
                    status: 'error',
                    message: 'Agent returned error'
                };
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    },

    // Get hardware information from agent
    getHardware: async function() {
        const baseURL = HARDWARE_AGENT_CONFIG.getBaseURL();
        
        if (!this.isConnected) {
            console.log('[YAS Agent] Not connected, cannot collect hardware');
            return this.handleAgentUnavailable('Agent not connected');
        }

        console.log('[YAS Agent] Fetching hardware data');
        this.setState(AgentState.COLLECTING);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), HARDWARE_AGENT_CONFIG.timeout);

            const response = await fetch(`${baseURL}/api/hardware`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log('[YAS Agent] Hardware data received');
                this.lastHardwareData = data;
                this.setState(AgentState.COMPLETED);
                return this.normalizeHardwareData(data);
            } else {
                console.log('[YAS Agent] Hardware fetch returned error:', response.status);
                this.setState(AgentState.ERROR);
                return this.handleInvalidResponse('Agent returned error');
            }
        } catch (error) {
            console.error('[YAS Agent] Hardware fetch error:', error.message);
            this.setState(AgentState.ERROR);
            return this.handleAgentUnavailable(error.message);
        }
    },

    // Normalize hardware data to web app format
    normalizeHardwareData: function(agentData) {
        return {
            computer: {
                manufacturer: this.createInfoField(agentData.computer?.manufacturer, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                model: this.createInfoField(agentData.computer?.model, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                deviceType: this.createInfoField(agentData.computer?.deviceType, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                serialNumber: this.createInfoField(agentData.computer?.serialNumber, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                computerName: this.createInfoField(agentData.computer?.computerName, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            operatingSystem: {
                name: this.createInfoField(agentData.operatingSystem?.name, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                version: this.createInfoField(agentData.operatingSystem?.version, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                build: this.createInfoField(agentData.operatingSystem?.build, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                architecture: this.createInfoField(agentData.operatingSystem?.architecture, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                installDate: this.createInfoField(agentData.operatingSystem?.installDate, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                systemDirectory: this.createInfoField(agentData.operatingSystem?.systemDirectory, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            cpu: {
                name: this.createInfoField(agentData.cpu?.name, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                manufacturer: this.createInfoField(agentData.cpu?.manufacturer, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                description: this.createInfoField(agentData.cpu?.description, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                cores: this.createInfoField(agentData.cpu?.cores, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                logicalProcessors: this.createInfoField(agentData.cpu?.logicalProcessors, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                maxClockMHz: this.createInfoField(agentData.cpu?.maxClockMHz, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                currentClockMHz: this.createInfoField(agentData.cpu?.currentClockMHz, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                architecture: this.createInfoField(agentData.cpu?.architecture, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                processorId: this.createInfoField(agentData.cpu?.processorId, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                socketDesignation: this.createInfoField(agentData.cpu?.socketDesignation, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                l2CacheSizeKB: this.createInfoField(agentData.cpu?.l2CacheSizeKB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                l3CacheSizeKB: this.createInfoField(agentData.cpu?.l3CacheSizeKB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            memory: {
                totalBytes: this.createInfoField(agentData.memory?.totalBytes, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                totalGB: this.createInfoField(agentData.memory?.totalGB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                usedBytes: this.createInfoField(agentData.memory?.usedBytes, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                usedGB: this.createInfoField(agentData.memory?.usedGB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                availableBytes: this.createInfoField(agentData.memory?.availableBytes, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                availableGB: this.createInfoField(agentData.memory?.availableGB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                usagePercent: this.createInfoField(agentData.memory?.usagePercent, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                modules: (agentData.memory?.modules || []).map(module => ({
                    manufacturer: this.createInfoField(module.manufacturer, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    capacityBytes: this.createInfoField(module.capacityBytes, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    capacityGB: this.createInfoField(module.capacityGB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    type: this.createInfoField(module.type, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    speedMHz: this.createInfoField(module.speedMHz, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    configuredClockSpeedMHz: this.createInfoField(module.configuredClockSpeedMHz, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    partNumber: this.createInfoField(module.partNumber, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    serialNumber: this.createInfoField(module.serialNumber, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    formFactor: this.createInfoField(module.formFactor, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    deviceLocator: this.createInfoField(module.deviceLocator, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                    bankLabel: this.createInfoField(module.bankLabel, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
                }))
            },
            gpu: agentData.gpu || [],
            storage: agentData.storage || [],
            battery: {
                present: this.createInfoField(agentData.battery?.present, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                percentage: this.createInfoField(agentData.battery?.percentage, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                charging: this.createInfoField(agentData.battery?.charging, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                designCapacityWh: this.createInfoField(agentData.battery?.designCapacityWh, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                fullChargeCapacityWh: this.createInfoField(agentData.battery?.fullChargeCapacityWh, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                cycleCount: this.createInfoField(agentData.battery?.cycleCount, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            network: agentData.network || [],
            motherboard: agentData.motherboard || null,
            source: this.SOURCES.HARDWARE_AGENT,
            capturedAt: agentData.metadata?.capturedAt
        };
    },

    // Create info field with source and confidence
    createInfoField: function(value, source, confidence) {
        return {
            value: value,
            source: source,
            confidence: confidence
        };
    },

    // Handle agent unavailable
    handleAgentUnavailable: function(reason) {
        console.log('Hardware Agent unavailable:', reason);
        return {
            error: 'AGENT_UNAVAILABLE',
            message: reason,
            fallback: 'Browser detection will be used'
        };
    },

    // Handle invalid response
    handleInvalidResponse: function(reason) {
        console.log('Hardware Agent invalid response:', reason);
        return {
            error: 'INVALID_RESPONSE',
            message: reason,
            fallback: 'Browser detection will be used'
        };
    },

    // Refresh agent connection status
    refreshStatus: async function() {
        const wasConnected = this.isConnected;
        const nowConnected = await this.detectAgent();

        if (wasConnected !== nowConnected) {
            console.log('[Agent] Connection status changed:', wasConnected, '->', nowConnected);
        }

        return nowConnected;
    },

    // Verify installation with retry logic
    verifyInstallation: async function() {
        console.log('[Agent] Starting installation verification...');
        const config = HARDWARE_AGENT_CONFIG.retryConfig;
        
        for (let attempt = 1; attempt <= config.attempts; attempt++) {
            console.log(`[Agent] Verification attempt ${attempt}/${config.attempts}`);
            
            const connected = await this.detectAgent();
            if (connected) {
                console.log('[Agent] Installation verified successfully!');
                return true;
            }
            
            if (attempt < config.attempts) {
                const delay = config.delays[attempt - 1];
                console.log(`[Agent] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        console.log('[Agent] Installation verification failed after all attempts');
        return false;
    },

    // Get download URL
    getDownloadURL: function() {
        return HARDWARE_AGENT_CONFIG.getDownloadURL();
    },

    // Check if download URL is configured
    isDownloadAvailable: function() {
        return this.getDownloadURL() !== null;
    },

    // Configure agent URL (for testing)
    configureURL: function(url) {
        localStorage.setItem('hardware_agent_url', url);
        console.log('[Agent] URL configured:', url);
    },

    // Reset agent state
    reset: function() {
        this.state = AgentState.DISCONNECTED;
        this.isConnected = false;
        this.agentInfo = null;
        this.lastHardwareData = null;
        console.log('[Agent] State reset');
    }
};
