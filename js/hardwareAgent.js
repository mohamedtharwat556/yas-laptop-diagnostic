// YAS Laptop Diagnostic System - Hardware Agent Client
// This module handles communication with the YAS Hardware Agent

const HARDWARE_AGENT_CONFIG = {
    host: "127.0.0.1",
    port: null, // To be configured when agent is available
    timeout: 5000 // 5 seconds timeout
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

    // Current connection status
    isConnected: false,
    agentInfo: null,

    // Check if agent is available
    detectAgent: async function() {
        if (!HARDWARE_AGENT_CONFIG.port) {
            console.log('Hardware Agent port not configured');
            return false;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), HARDWARE_AGENT_CONFIG.timeout);

            const response = await fetch(`http://${HARDWARE_AGENT_CONFIG.host}:${HARDWARE_AGENT_CONFIG.port}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok') {
                    this.isConnected = true;
                    this.agentInfo = data;
                    console.log('Hardware Agent connected:', data);
                    return true;
                }
            }
        } catch (error) {
            console.log('Hardware Agent not available:', error.message);
        }

        this.isConnected = false;
        this.agentInfo = null;
        return false;
    },

    // Get agent health status
    getHealth: async function() {
        if (!HARDWARE_AGENT_CONFIG.port) {
            return {
                status: 'error',
                message: 'Agent port not configured'
            };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), HARDWARE_AGENT_CONFIG.timeout);

            const response = await fetch(`http://${HARDWARE_AGENT_CONFIG.host}:${HARDWARE_AGENT_CONFIG.port}/api/health`, {
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
        if (!HARDWARE_AGENT_CONFIG.port) {
            return this.handleAgentUnavailable('Port not configured');
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), HARDWARE_AGENT_CONFIG.timeout);

            const response = await fetch(`http://${HARDWARE_AGENT_CONFIG.host}:${HARDWARE_AGENT_CONFIG.port}/api/hardware`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return this.normalizeHardwareData(data);
            } else {
                return this.handleInvalidResponse('Agent returned error');
            }
        } catch (error) {
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
                serialNumber: this.createInfoField(agentData.computer?.serialNumber, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            operatingSystem: {
                name: this.createInfoField(agentData.operatingSystem?.name, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                version: this.createInfoField(agentData.operatingSystem?.version, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                build: this.createInfoField(agentData.operatingSystem?.build, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            cpu: {
                name: this.createInfoField(agentData.cpu?.name, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                manufacturer: this.createInfoField(agentData.cpu?.manufacturer, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                cores: this.createInfoField(agentData.cpu?.cores, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                logicalProcessors: this.createInfoField(agentData.cpu?.logicalProcessors, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                maxClockMHz: this.createInfoField(agentData.cpu?.maxClockMHz, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH)
            },
            memory: {
                totalBytes: this.createInfoField(agentData.memory?.totalBytes, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                totalGB: this.createInfoField(agentData.memory?.totalGB, this.SOURCES.HARDWARE_AGENT, this.CONFIDENCE.HIGH),
                modules: agentData.memory?.modules || []
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
            console.log('Agent connection status changed:', wasConnected, '->', nowConnected);
        }

        return nowConnected;
    },

    // Configure agent port
    configurePort: function(port) {
        HARDWARE_AGENT_CONFIG.port = port;
        console.log('Hardware Agent port configured:', port);
    }
};
