// YAS Hardware Agent - Version Management
// Tracks agent version and checks for compatibility

const HardwareAgentVersion = {
    // Current recommended version
    CURRENT_AGENT_VERSION: '1.0.0',
    
    // Minimum required version for compatibility
    MIN_AGENT_VERSION: '1.0.0',
    
    // Version check states
    VersionState: {
        COMPATIBLE: 'COMPATIBLE',
        UPDATE_RECOMMENDED: 'UPDATE_RECOMMENDED',
        UPDATE_REQUIRED: 'UPDATE_REQUIRED',
        UNKNOWN: 'UNKNOWN'
    },

    // Parse version string into comparable format
    parseVersion: function(versionString) {
        if (!versionString) return null;
        
        const parts = versionString.split('.');
        return {
            major: parseInt(parts[0]) || 0,
            minor: parseInt(parts[1]) || 0,
            patch: parseInt(parts[2]) || 0,
            original: versionString
        };
    },

    // Compare two versions
    compareVersions: function(v1, v2) {
        // Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
        if (v1.major !== v2.major) return v1.major < v2.major ? -1 : 1;
        if (v1.minor !== v2.minor) return v1.minor < v2.minor ? -1 : 1;
        if (v1.patch !== v2.patch) return v1.patch < v2.patch ? -1 : 1;
        return 0;
    },

    // Check version compatibility
    checkVersionCompatibility: function(agentVersion) {
        console.log('[VersionCheck] Agent version:', agentVersion);
        
        const agentVer = this.parseVersion(agentVersion);
        const currentVer = this.parseVersion(this.CURRENT_AGENT_VERSION);
        const minVer = this.parseVersion(this.MIN_AGENT_VERSION);

        if (!agentVer) {
            return {
                state: this.VersionState.UNKNOWN,
                message: 'لم يتمكن من تحديد إصدار المساعد',
                recommendation: 'تثبيت النسخة الأحدث موصى به'
            };
        }

        // Check if below minimum
        const versionComparison = this.compareVersions(agentVer, minVer);
        if (versionComparison < 0) {
            return {
                state: this.VersionState.UPDATE_REQUIRED,
                message: `إصدار المساعد ${agentVersion} قديم جداً (المطلوب: ${this.MIN_AGENT_VERSION})`,
                recommendation: 'يجب تحديث المساعد قبل الاستمرار',
                currentVersion: agentVersion,
                requiredVersion: this.MIN_AGENT_VERSION
            };
        }

        // Check if below current recommended
        const recommendedComparison = this.compareVersions(agentVer, currentVer);
        if (recommendedComparison < 0) {
            return {
                state: this.VersionState.UPDATE_RECOMMENDED,
                message: `يوجد إصدار أحدث من مساعد فحص الجهاز (${agentVersion} → ${this.CURRENT_AGENT_VERSION})`,
                recommendation: 'يُنصح بتحديث المساعد للحصول على أفضل الأداء',
                currentVersion: agentVersion,
                latestVersion: this.CURRENT_AGENT_VERSION
            };
        }

        // Compatible
        return {
            state: this.VersionState.COMPATIBLE,
            message: `إصدار المساعد متوافق (${agentVersion})`,
            recommendation: 'المساعد جاهز للاستخدام',
            currentVersion: agentVersion
        };
    },

    // Get update URL
    getUpdateDownloadURL: function() {
        // This would typically come from configuration
        return '/downloads/YAS-Hardware-Agent-Setup/';
    },

    // Check if update is available
    isUpdateAvailable: function(agentVersion) {
        const check = this.checkVersionCompatibility(agentVersion);
        return check.state === this.VersionState.UPDATE_RECOMMENDED ||
               check.state === this.VersionState.UPDATE_REQUIRED;
    },

    // Get human-readable message
    getStatusMessage: function(agentVersion) {
        const check = this.checkVersionCompatibility(agentVersion);
        
        switch (check.state) {
            case this.VersionState.COMPATIBLE:
                return `✓ متوافق - ${check.message}`;
            case this.VersionState.UPDATE_RECOMMENDED:
                return `⚠ تحديث موصى به - ${check.message}`;
            case this.VersionState.UPDATE_REQUIRED:
                return `✗ تحديث مطلوب - ${check.message}`;
            case this.VersionState.UNKNOWN:
                return `? غير معروف - ${check.message}`;
            default:
                return 'حالة غير محددة';
        }
    },

    // Get color for status display
    getStatusColor: function(agentVersion) {
        const check = this.checkVersionCompatibility(agentVersion);
        
        switch (check.state) {
            case this.VersionState.COMPATIBLE:
                return '#28a745'; // Green
            case this.VersionState.UPDATE_RECOMMENDED:
                return '#ffc107'; // Yellow
            case this.VersionState.UPDATE_REQUIRED:
                return '#dc3545'; // Red
            case this.VersionState.UNKNOWN:
                return '#6c757d'; // Gray
            default:
                return '#999';
        }
    }
};

// Extend HardwareAgent with version tracking
if (typeof HardwareAgent !== 'undefined') {
    HardwareAgent.agentVersion = null;

    // Store version from health check
    const originalGetHealth = HardwareAgent.getHealth;
    HardwareAgent.getHealth = async function() {
        const health = await originalGetHealth.call(this);
        if (health.version) {
            this.agentVersion = health.version;
            console.log('[Agent] Version:', this.agentVersion);
        }
        return health;
    };

    // Store version from detection
    const originalDetectAgent = HardwareAgent.detectAgent;
    HardwareAgent.detectAgent = async function() {
        const result = await originalDetectAgent.call(this);
        if (result && this.agentInfo && this.agentInfo.version) {
            this.agentVersion = this.agentInfo.version;
        }
        return result;
    };

    // Expose version check method
    HardwareAgent.checkVersion = function() {
        if (!this.agentVersion) {
            return {
                state: HardwareAgentVersion.VersionState.UNKNOWN,
                message: 'لم يتم تحديد إصدار المساعد'
            };
        }
        return HardwareAgentVersion.checkVersionCompatibility(this.agentVersion);
    };
}
