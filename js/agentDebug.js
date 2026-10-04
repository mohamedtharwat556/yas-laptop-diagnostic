// YAS Hardware Agent - Production Debug Panel
// Only activated with ?debug=agent in URL

const AgentDebugPanel = {
    enabled: false,
    
    init: function() {
        // Check for debug parameter
        const params = new URLSearchParams(window.location.search);
        this.enabled = params.get('debug') === 'agent';
        
        if (!this.enabled) return;
        
        console.log('[AgentDebug] Enabled');
        this.createPanel();
        this.logEnvironment();
    },
    
    createPanel: function() {
        const panel = document.createElement('div');
        panel.id = 'agent-debug-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            background: white;
            border: 2px solid #ef4444;
            border-radius: 8px;
            padding: 15px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 600px;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        panel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #ef4444;">
                YAS Hardware Agent Debug Panel
            </div>
            <div id="debug-content" style="font-size: 11px; line-height: 1.5;"></div>
        `;
        
        document.body.appendChild(panel);
        this.panel = panel;
        this.content = panel.querySelector('#debug-content');
    },
    
    logEnvironment: function() {
        const logs = [];
        
        logs.push(`<strong>Production Origin:</strong> ${window.location.origin}`);
        logs.push(`<strong>Protocol:</strong> ${window.location.protocol}`);
        logs.push(`<strong>Browser:</strong> ${navigator.userAgent.split('/').pop()}`);
        logs.push(`<strong>Agent URL:</strong> http://127.0.0.1:5275`);
        logs.push(`<strong>Time:</strong> ${new Date().toISOString()}`);
        logs.push(`<hr style="margin: 5px 0; border: none; border-top: 1px solid #ccc;">`);
        
        this.updateContent(logs);
    },
    
    log: function(message, data = null) {
        if (!this.enabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const line = `[${timestamp}] ${message}`;
        
        if (data) {
            console.log(line, data);
        } else {
            console.log(line);
        }
        
        const current = this.content.innerHTML;
        this.content.innerHTML = current + `<div>${line}</div>`;
        this.panel.scrollTop = this.panel.scrollHeight;
    },
    
    updateContent: function(lines) {
        this.content.innerHTML = lines.map(line => `<div>${line}</div>`).join('');
    },
    
    logRequestStart: function() {
        this.log('📤 REQUEST STARTED');
        this.log('  URL: http://127.0.0.1:5275/api/health');
        this.log('  Method: GET');
        this.log('  Mode: cors');
        this.log('  targetAddressSpace: loopback');
    },
    
    logRequestSuccess: function(status, response) {
        this.log('✅ REQUEST SUCCESS');
        this.log(`  Status: ${status}`);
        this.log(`  Response: ${JSON.stringify(response).substring(0, 100)}`);
    },
    
    logRequestError: function(error) {
        this.log('❌ REQUEST ERROR');
        this.log(`  Name: ${error.name}`);
        this.log(`  Message: ${error.message}`);
        this.log(`  Stack: ${error.stack?.split('\n')[0] || 'N/A'}`);
    },
    
    logCORS: function(origin) {
        this.log('🔒 CORS Configuration');
        this.log(`  Origin: ${origin}`);
        this.log(`  Agent allows: https://yas-laptop-diagnostic.vercel.app`);
    },
    
    logPermission: function(state) {
        this.log(`🔐 Permission State: ${state}`);
    },
    
    logFinalState: function(state) {
        this.log(`🎯 Final Agent State: ${state}`);
    }
};

// Hook into HardwareAgent
const originalDetectAgent = HardwareAgent.detectAgent;
HardwareAgent.detectAgent = async function() {
    AgentDebugPanel.log('🔍 detectAgent() called');
    AgentDebugPanel.logRequestStart();
    
    const baseURL = HARDWARE_AGENT_CONFIG.getBaseURL();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            AgentDebugPanel.log('⏱️ Health check timeout');
            controller.abort();
        }, HARDWARE_AGENT_CONFIG.timeout);

        const fetchOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            signal: controller.signal
        };

        if (baseURL.includes('127.0.0.1') || baseURL.includes('localhost')) {
            AgentDebugPanel.log('📌 Loopback target detected');
            fetchOptions.targetAddressSpace = 'loopback';
            AgentDebugPanel.log(`  targetAddressSpace: ${fetchOptions.targetAddressSpace}`);
        }

        const response = await fetch(`${baseURL}/api/health`, fetchOptions);
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            AgentDebugPanel.logRequestSuccess(response.status, data);
            
            if (data.status === 'ok') {
                this.isConnected = true;
                this.agentInfo = data;
                this.setState(AgentState.CONNECTED);
                AgentDebugPanel.logFinalState('CONNECTED');
                return true;
            }
        } else {
            AgentDebugPanel.log(`⚠️ HTTP Error: ${response.status}`);
        }
    } catch (error) {
        AgentDebugPanel.logRequestError(error);
        
        if (error.name === 'AbortError') {
            AgentDebugPanel.log('⏱️ AbortError detected');
        } else if (error.message.includes('Failed to fetch')) {
            AgentDebugPanel.log('🚫 Failed to fetch - likely permission or network');
            
            if (window.location.protocol === 'https:') {
                AgentDebugPanel.logPermission('REQUIRED');
                this.setState(AgentState.PERMISSION_REQUIRED);
                AgentDebugPanel.logFinalState('PERMISSION_REQUIRED');
                return false;
            }
        }
    }

    this.isConnected = false;
    this.agentInfo = null;
    this.setState(AgentState.DISCONNECTED);
    AgentDebugPanel.logFinalState('DISCONNECTED');
    return false;
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        AgentDebugPanel.init();
    }, 100);
});
