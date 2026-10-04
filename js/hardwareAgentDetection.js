// YAS Hardware Agent Detection Module
// Handles automatic detection, connection, and fallback to browser APIs

const HardwareAgentDetection = {
    // Configuration
    AGENT_URL: 'http://127.0.0.1:5275',
    HEALTH_ENDPOINT: '/api/health',
    HARDWARE_ENDPOINT: '/api/hardware',
    TIMEOUT_MS: 3000,
    
    // State
    isConnected: false,
    agentAvailable: false,
    hardwareData: null,
    
    // Callbacks
    onStatusChanged: null,
    
    /**
     * Initialize detection and connect to agent if available
     */
    async initialize() {
        console.log('[AgentDetection] Initializing...');
        
        try {
            this.isConnected = await this.detectAgent();
            
            if (this.isConnected) {
                console.log('[AgentDetection] Agent detected successfully');
                this.hardwareData = await this.fetchHardwareData();
                this.triggerCallback('connected', this.hardwareData);
            } else {
                console.log('[AgentDetection] Agent not available, using browser APIs');
                this.triggerCallback('disconnected', null);
            }
        } catch (error) {
            console.error('[AgentDetection] Initialization error:', error);
            this.triggerCallback('error', error);
        }
    },
    
    /**
     * Detect if hardware agent is running
     */
    async detectAgent() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
            
            const url = `${this.AGENT_URL}${this.HEALTH_ENDPOINT}`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok') {
                    this.agentAvailable = true;
                    return true;
                }
            }
        } catch (error) {
            console.log('[AgentDetection] Detection failed:', error.message);
        }
        
        this.agentAvailable = false;
        return false;
    },
    
    /**
     * Fetch hardware data from agent
     */
    async fetchHardwareData() {
        if (!this.isConnected) {
            throw new Error('Agent not connected');
        }
        
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
            
            const url = `${this.AGENT_URL}${this.HARDWARE_ENDPOINT}`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('[AgentDetection] Failed to fetch hardware data:', error);
            throw error;
        }
    },
    
    /**
     * Get browser-based hardware information as fallback
     */
    getBrowserHardwareInfo() {
        return {
            source: 'browser',
            confidence: 'low',
            computerInfo: {
                manufacturer: 'Unknown',
                model: 'Unknown'
            },
            operatingSystem: {
                name: navigator.userAgentData?.platform || 'Unknown',
                version: 'Unknown'
            },
            cpu: {
                cores: navigator.hardwareConcurrency || 'Unknown',
                threads: navigator.hardwareConcurrency || 'Unknown'
            },
            memory: {
                total: navigator.deviceMemory * 1024 * 1024 * 1024 || 'Unknown',
                available: 'Unknown'
            },
            gpu: {
                name: 'Unknown',
                memory: 'Unknown'
            },
            storage: {
                available: 'Unknown'
            },
            battery: {
                percentage: 'Unknown'
            }
        };
    },
    
    /**
     * Get hardware data with fallback
     */
    async getHardwareInfo() {
        if (this.isConnected && this.hardwareData) {
            return this.hardwareData;
        }
        
        return this.getBrowserHardwareInfo();
    },
    
    /**
     * Check if agent is available (with retry option)
     */
    async checkAgentAvailability(retries = 1) {
        for (let i = 0; i < retries; i++) {
            if (await this.detectAgent()) {
                return true;
            }
            if (i < retries - 1) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return false;
    },
    
    /**
     * Trigger status callback
     */
    triggerCallback(status, data) {
        if (this.onStatusChanged && typeof this.onStatusChanged === 'function') {
            this.onStatusChanged({
                status: status,
                data: data,
                timestamp: new Date().toISOString()
            });
        }
    },
    
    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            agentAvailable: this.agentAvailable,
            agentURL: this.AGENT_URL,
            hasData: this.hardwareData !== null
        };
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HardwareAgentDetection;
}
