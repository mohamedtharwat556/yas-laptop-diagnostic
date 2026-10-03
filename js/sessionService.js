// YAS Laptop Diagnostic System - Session Service
// Central service for session management with Supabase sync

class SessionService {
    constructor() {
        this.supabase = null;
        this.localSessions = new Map();
        this.pendingSync = new Map();
        this.isOnline = navigator.onLine;
        this.initialized = false;
        this.initPromise = this.init();
    }

    /**
     * Initialize session service
     */
    async init() {
        // Wait for Supabase config to be loaded
        if (window.waitForConfig) {
            await window.waitForConfig(3000);
        }

        // Initialize Supabase if available
        if (window.getSupabase) {
            this.supabase = window.getSupabase();
        }

        // Load pending sessions from localStorage
        this.loadPendingSync();

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        this.initialized = true;

        console.log('SessionService initialized', {
            supabaseAvailable: this.supabase !== null,
            isOnline: this.isOnline
        });
    }

    /**
     * Wait for session service to be initialized
     */
    async waitForInitialization() {
        await this.initPromise;
    }

    /**
     * Handle online event
     */
    handleOnline() {
        this.isOnline = true;
        console.log('Connection restored - syncing pending sessions');
        this.syncPendingSessions();
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        this.isOnline = false;
        console.log('Connection lost - using local storage');
    }

    /**
     * Load pending sync sessions from localStorage
     */
    loadPendingSync() {
        try {
            const pending = localStorage.getItem('pending_sessions');
            if (pending) {
                this.pendingSync = new Map(JSON.parse(pending));
                console.log(`Loaded ${this.pendingSync.size} pending sessions`);
            }
        } catch (error) {
            console.error('Failed to load pending sessions:', error);
        }
    }

    /**
     * Save pending sync sessions to localStorage
     */
    savePendingSync() {
        try {
            localStorage.setItem('pending_sessions', JSON.stringify([...this.pendingSync]));
        } catch (error) {
            console.error('Failed to save pending sessions:', error);
        }
    }

    /**
     * Generate unique session code
     * @returns {string}
     */
    generateSessionCode() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `YAS-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Create a new session
     * @param {Object} customerData - Customer information
     * @returns {Promise<Object>} Session object
     */
    async createSession(customerData) {
        console.log('SessionService.createSession called with:', customerData);

        // Wait for initialization
        await this.waitForInitialization();

        const sessionCode = this.generateSessionCode();
        console.log('Generated session code:', sessionCode);
        const session = {
            id: null, // Will be set by Supabase
            sessionCode,
            status: 'created',
            customer_name: customerData.name || '',
            customer_phone: customerData.phone || '',
            order_number: customerData.serviceOrder || '',
            problem_description: customerData.problem || '',
            device_info: null,
            summary: null,
            issues: null,
            technician_notes: null,
            hardware_source: null,
            hardware_captured_at: null,
            started_at: new Date().toISOString(),
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Supabase available:', !!this.supabase);
        console.log('Is online:', this.isOnline);

        // Try to create in Supabase
        if (this.supabase && this.isOnline) {
            try {
                console.log('Attempting to insert session into Supabase...');
                const { data, error } = await this.supabase
                    .from('diagnostic_sessions')
                    .insert([session])
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase session creation failed:', error);
                    // Fall back to local storage
                    session.id = sessionCode; // Use session code as local ID
                    this.localSessions.set(sessionCode, session);
                    this.pendingSync.set(sessionCode, session);
                    this.savePendingSync();
                } else {
                    session.id = data.id;
                    this.localSessions.set(sessionCode, session);
                    console.log('Session created in Supabase:', session.id);
                }
            } catch (error) {
                console.error('Supabase session creation error:', error);
                // Fall back to local storage
                session.id = sessionCode;
                this.localSessions.set(sessionCode, session);
                this.pendingSync.set(sessionCode, session);
                this.savePendingSync();
            }
        } else {
            // No Supabase available - use local storage
            console.log('No Supabase or offline - using local storage');
            session.id = sessionCode;
            this.localSessions.set(sessionCode, session);
            this.pendingSync.set(sessionCode, session);
            this.savePendingSync();
            console.log('Session created locally:', sessionCode);
        }

        // Also save to localStorage for backward compatibility
        localStorage.setItem('current_session', JSON.stringify(session));

        return session;
    }

    /**
     * Get session by session code
     * @param {string} sessionCode
     * @returns {Promise<Object|null>}
     */
    async getSession(sessionCode) {
        // Check local cache first
        if (this.localSessions.has(sessionCode)) {
            return this.localSessions.get(sessionCode);
        }

        // Try to fetch from Supabase
        if (this.supabase && this.isOnline) {
            try {
                const { data, error } = await this.supabase
                    .from('diagnostic_sessions')
                    .select('*')
                    .eq('session_code', sessionCode)
                    .single();

                if (error) {
                    console.error('Failed to fetch session:', error);
                    return null;
                }

                this.localSessions.set(sessionCode, data);
                return data;
            } catch (error) {
                console.error('Session fetch error:', error);
                return null;
            }
        }

        return null;
    }

    /**
     * Update session
     * @param {string} sessionCode
     * @param {Object} updates
     * @returns {Promise<boolean>}
     */
    async updateSession(sessionCode, updates) {
        const session = this.localSessions.get(sessionCode);
        if (!session) {
            console.error('Session not found:', sessionCode);
            return false;
        }

        // Update local session
        Object.assign(session, updates, { updated_at: new Date().toISOString() });
        this.localSessions.set(sessionCode, session);

        // Update localStorage for backward compatibility
        localStorage.setItem('current_session', JSON.stringify(session));

        // Try to sync to Supabase
        if (this.supabase && this.isOnline) {
            try {
                const { error } = await this.supabase
                    .from('diagnostic_sessions')
                    .update(updates)
                    .eq('session_code', sessionCode);

                if (error) {
                    console.error('Supabase update failed:', error);
                    this.pendingSync.set(sessionCode, session);
                    this.savePendingSync();
                    return false;
                }

                // Remove from pending if successful
                this.pendingSync.delete(sessionCode);
                this.savePendingSync();
                console.log('Session updated in Supabase:', sessionCode);
                return true;
            } catch (error) {
                console.error('Session update error:', error);
                this.pendingSync.set(sessionCode, session);
                this.savePendingSync();
                return false;
            }
        } else {
            // Add to pending sync
            this.pendingSync.set(sessionCode, session);
            this.savePendingSync();
            return false;
        }
    }

    /**
     * Save device info
     * @param {string} sessionCode
     * @param {Object} deviceInfo
     * @returns {Promise<boolean>}
     */
    async saveDeviceInfo(sessionCode, deviceInfo) {
        return this.updateSession(sessionCode, {
            device_info: deviceInfo,
            hardware_source: deviceInfo.hardwareSource || 'browser',
            hardware_captured_at: deviceInfo.hardwareCapturedAt || new Date().toISOString()
        });
    }

    /**
     * Save test result
     * @param {string} sessionCode
     * @param {string} testId
     * @param {Object} result
     * @returns {Promise<boolean>}
     */
    async saveTestResult(sessionCode, testId, result) {
        const session = this.localSessions.get(sessionCode);
        if (!session) {
            return false;
        }

        // Initialize tests array if not exists
        if (!session.tests) {
            session.tests = [];
        }

        // Update or add test result
        const existingIndex = session.tests.findIndex(t => t.id === testId);
        if (existingIndex >= 0) {
            session.tests[existingIndex] = result;
        } else {
            session.tests.push(result);
        }

        return this.updateSession(sessionCode, { tests: session.tests });
    }

    /**
     * Complete session
     * @param {string} sessionCode
     * @param {Object} summary
     * @returns {Promise<boolean>}
     */
    async completeSession(sessionCode, summary = {}) {
        return this.updateSession(sessionCode, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            summary: summary.summary || null,
            issues: summary.issues || null
        });
    }

    /**
     * Sync pending sessions to Supabase
     */
    async syncPendingSessions() {
        if (!this.supabase || !this.isOnline) {
            return;
        }

        console.log(`Syncing ${this.pendingSync.size} pending sessions...`);

        for (const [sessionCode, session] of this.pendingSync) {
            try {
                // Check if session already exists in Supabase
                const { data: existing } = await this.supabase
                    .from('diagnostic_sessions')
                    .select('id')
                    .eq('session_code', sessionCode)
                    .single();

                if (existing) {
                    // Update existing session
                    const { error } = await this.supabase
                        .from('diagnostic_sessions')
                        .update(session)
                        .eq('session_code', sessionCode);

                    if (error) {
                        console.error('Failed to sync session update:', sessionCode, error);
                    } else {
                        console.log('Session synced (update):', sessionCode);
                        this.pendingSync.delete(sessionCode);
                    }
                } else {
                    // Insert new session
                    const { error } = await this.supabase
                        .from('diagnostic_sessions')
                        .insert([session]);

                    if (error) {
                        console.error('Failed to sync session insert:', sessionCode, error);
                    } else {
                        console.log('Session synced (insert):', sessionCode);
                        this.pendingSync.delete(sessionCode);
                    }
                }
            } catch (error) {
                console.error('Failed to sync session:', sessionCode, error);
            }
        }

        this.savePendingSync();
    }
}

// Create singleton instance
const sessionService = new SessionService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sessionService;
}
