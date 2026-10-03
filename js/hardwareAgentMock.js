// YAS Laptop Diagnostic System - Hardware Agent Mock (DEVELOPMENT ONLY)
// WARNING: This is for development testing only
// DO NOT use in production
// DO NOT expose mock data to end users

const HardwareAgentMock = {
    // Enable mock mode (default: false)
    enabled: false,

    // Mock hardware data
    mockData: {
        agent: {
            name: "YAS Hardware Agent",
            version: "1.0.0 (MOCK)",
            connected: true
        },
        computer: {
            manufacturer: "Mock Manufacturer",
            model: "Mock Model (TEST ONLY)",
            deviceType: "Laptop",
            serialNumber: "MOCK123456"
        },
        operatingSystem: {
            name: "Windows 11 Pro (MOCK)",
            version: "10.0.22621",
            build: "22621"
        },
        cpu: {
            name: "Mock CPU (TEST ONLY)",
            manufacturer: "Mock",
            cores: 4,
            logicalProcessors: 8,
            maxClockMHz: 1600
        },
        memory: {
            totalBytes: 17179869184,
            totalGB: 16,
            modules: []
        },
        gpu: [
            {
                name: "Mock GPU (TEST ONLY)",
                manufacturer: "Mock",
                driverVersion: "1.0.0",
                adapterRamBytes: null
            }
        ],
        storage: [
            {
                model: "Mock SSD (TEST ONLY)",
                deviceID: "MOCK-DISK-1",
                type: "SSD",
                interface: "NVMe",
                capacityBytes: 512000000000,
                capacityGB: 512,
                usedBytes: 180000000000,
                freeBytes: 332000000000,
                systemDrive: true,
                partitions: []
            }
        ],
        battery: {
            present: true,
            percentage: 85,
            charging: false,
            designCapacityWh: 48,
            fullChargeCapacityWh: 45,
            cycleCount: 250
        },
        network: [],
        motherboard: null,
        metadata: {
            source: "hardware-agent-mock",
            capturedAt: new Date().toISOString()
        }
    },

    // Enable mock mode
    enable: function() {
        console.warn('⚠️  HARDWARE AGENT MOCK MODE ENABLED - FOR DEVELOPMENT ONLY');
        this.enabled = true;
    },

    // Disable mock mode
    disable: function() {
        this.enabled = false;
        console.log('Hardware Agent mock mode disabled');
    },

    // Mock detect agent
    detectAgent: async function() {
        if (!this.enabled) return false;
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
    },

    // Mock get health
    getHealth: async function() {
        if (!this.enabled) {
            return { status: 'error', message: 'Mock not enabled' };
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            status: 'ok',
            agent: 'YAS Hardware Agent (MOCK)',
            version: '1.0.0 (MOCK)'
        };
    },

    // Mock get hardware
    getHardware: async function() {
        if (!this.enabled) {
            return { error: 'AGENT_UNAVAILABLE', message: 'Mock not enabled' };
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        return JSON.parse(JSON.stringify(this.mockData));
    }
};
