// YAS Laptop Diagnostic - Hardware Agent Proxy
// Provides fallback methods to access hardware agent

const HardwareAgentProxy = {
    // Try to fetch from agent with multiple methods
    fetchAgentData: async function(endpoint, options = {}) {
        const baseURL = 'http://127.0.0.1:5275';
        const url = `${baseURL}${endpoint}`;
        
        console.log(`[Proxy] Fetching: ${url}`);
        
        const timeout = options.timeout || 3000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            // Method 1: Direct fetch with CORS
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                mode: 'cors',
                credentials: 'omit',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`[Proxy] Success: ${endpoint}`, data);
                return {
                    success: true,
                    data: data,
                    method: 'fetch'
                };
            } else {
                console.log(`[Proxy] HTTP Error: ${response.status}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}`,
                    method: 'fetch'
                };
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.log(`[Proxy] Fetch failed: ${error.message}`);
            
            // Check if it's a known issue
            if (error.name === 'AbortError') {
                console.log('[Proxy] Timeout - Agent not responding');
            } else if (error.message.includes('Failed to fetch')) {
                console.log('[Proxy] Network error - Agent may not be running');
            } else if (error.message.includes('CORS')) {
                console.log('[Proxy] CORS error - Check agent configuration');
            }
            
            return {
                success: false,
                error: error.message,
                method: 'fetch'
            };
        }
    },
    
    // Check if agent is accessible
    isAgentAccessible: async function() {
        const result = await this.fetchAgentData('/api/health', { timeout: 2000 });
        return result.success;
    },
    
    // Get hardware data from agent
    getHardwareData: async function() {
        const result = await this.fetchAgentData('/api/hardware', { timeout: 5000 });
        if (result.success) {
            return result.data;
        }
        throw new Error(`Failed to get hardware data: ${result.error}`);
    },
    
    // Get normalized hardware data
    getNormalizedHardwareData: async function() {
        const result = await this.fetchAgentData('/api/hardware/normalized', { timeout: 5000 });
        if (result.success) {
            return result.data;
        }
        throw new Error(`Failed to get normalized hardware data: ${result.error}`);
    }
};

// Attach to HardwareAgent if available
if (typeof HardwareAgent !== 'undefined') {
    HardwareAgent.proxy = HardwareAgentProxy;
}
