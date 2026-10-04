// YAS Laptop Diagnostic - Agent State Manager
// BATCH 6B-6: Mandatory Hardware Agent Flow
// Manages the complete Agent lifecycle and flow routing

const AgentStateManager = {
    currentState: AgentState.INITIALIZING,
    previousState: null,
    
    // Lifecycle hooks
    onStateChange: null,
    onMandatoryRequired: null,
    onConnected: null,
    onDisconnected: null,

    // Initialize the state manager
    init: async function() {
        console.log('[AgentStateManager] Initializing...');
        this.setState(AgentState.INITIALIZING);
        
        // Perform initial detection
        const currentPage = window.location.pathname;
        console.log('[AgentStateManager] Current page:', currentPage);
        
        // Detect if we're on diagnostic page
        if (currentPage.includes('diagnostic.html')) {
            await this.initDiagnosticFlow();
        }
    },

    // Flow for diagnostic.html - Mandatory Agent
    initDiagnosticFlow: async function() {
        console.log('[AgentStateManager] Initializing diagnostic flow');
        this.setState(AgentState.CHECKING);
        
        try {
            const connected = await HardwareAgent.detectAgent();
            
            if (connected) {
                console.log('[AgentStateManager] Agent connected on diagnostic page');
                this.setState(AgentState.CONNECTED);
                if (this.onConnected) this.onConnected();
            } else {
                console.log('[AgentStateManager] Agent NOT connected - showing mandatory installation');
                this.setState(AgentState.INSTALLATION_REQUIRED);
                
                // Redirect to installation-required page
                if (this.onMandatoryRequired) this.onMandatoryRequired();
                else window.location.href = 'installation-required.html';
            }
        } catch (error) {
            console.error('[AgentStateManager] Detection error:', error);
            this.setState(AgentState.ERROR);
        }
    },

    // Set new state
    setState: function(newState) {
        if (this.currentState !== newState) {
            this.previousState = this.currentState;
            this.currentState = newState;
            
            console.log(`[AgentStateManager] State: ${this.previousState} → ${newState}`);
            console.log(`[AgentStateManager] Message: ${AgentStateMessages[newState]}`);
            
            // Trigger callback
            if (this.onStateChange && typeof this.onStateChange === 'function') {
                this.onStateChange({
                    oldState: this.previousState,
                    newState: newState,
                    message: AgentStateMessages[newState]
                });
            }

            // Trigger specific hooks
            this.triggerStateHook(newState);
        }
    },

    // Trigger state-specific hooks
    triggerStateHook: function(state) {
        switch(state) {
            case AgentState.CONNECTED:
                if (this.onConnected) this.onConnected();
                break;
            case AgentState.DISCONNECTED:
                if (this.onDisconnected) this.onDisconnected();
                break;
            case AgentState.INSTALLATION_REQUIRED:
                if (this.onMandatoryRequired) this.onMandatoryRequired();
                break;
            case AgentState.PERMISSION_REQUIRED:
                // Show permission UI
                break;
            case AgentState.ERROR:
                // Show error UI
                break;
        }
    },

    // Check if full diagnostic is allowed
    isFullDiagnosticAllowed: function() {
        return this.currentState === AgentState.CONNECTED;
    },

    // Get current state string
    getState: function() {
        return this.currentState;
    },

    // Get state message
    getStateMessage: function() {
        return AgentStateMessages[this.currentState];
    },

    // Reset state
    reset: function() {
        this.previousState = null;
        this.currentState = AgentState.INITIALIZING;
        console.log('[AgentStateManager] State reset');
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AgentStateManager.init();
});
