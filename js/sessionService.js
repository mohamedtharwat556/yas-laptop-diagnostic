// YAS Laptop Diagnostic System - Session Service
// Central service for session management with Supabase sync

class SessionService {
    constructor() {
        this.supabase = null;
        this.localSessions = new Map();
        this.pendingSync = new Map();
        this.syncRetry = new Map(); // Track retry attempts: {sessionCode: {attempts, lastRetry, backoffMs}}
        this.isOnline = navigator.onLine;
        this.initialized = false;
        this.initPromise = this.init();
        this.syncInProgress = false;
        
        // Exponential backoff configuration
        this.MAX_RETRY_ATTEMPTS = 5;
        this.INITIAL_BACKOFF_MS = 1000;     // 1 second
        this.MAX_BACKOFF_MS = 32000;        // 32 seconds
        this.BACKOFF_MULTIPLIER = 2;
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
     * Handle online event - schedule pending sync
     */
    handleOnline() {
        this.isOnline = true;
        console.log('✅ Connection restored - scheduling sync of pending sessions');
        
        // Schedule immediate sync attempt
        this.syncPendingSessions();
        
        // Schedule periodic checks if there are still pending sessions
        // This handles cases where backoff prevents immediate retry
        const checkInterval = setInterval(() => {
            if (!this.isOnline || this.pendingSync.size === 0) {
                clearInterval(checkInterval);
                return;
            }
            
            this.syncPendingSessions();
        }, 5000); // Check every 5 seconds
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
     * Calculate backoff delay for exponential backoff retry
     * @param {number} attempts - Number of attempts so far
     * @returns {number} Backoff delay in milliseconds
     */
    getBackoffDelay(attempts) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s
        const backoffMs = Math.min(
            this.INITIAL_BACKOFF_MS * Math.pow(this.BACKOFF_MULTIPLIER, attempts - 1),
            this.MAX_BACKOFF_MS
        );
        
        // Add jitter (random 0-25% variation) to prevent thundering herd
        const jitter = backoffMs * (Math.random() * 0.25);
        return backoffMs + jitter;
    }

    /**
     * Check if session should be retried based on backoff
     * @param {string} sessionCode
     * @returns {boolean}
     */
    shouldRetry(sessionCode) {
        const retryInfo = this.syncRetry.get(sessionCode);
        
        if (!retryInfo) {
            // First attempt - always retry
            return true;
        }
        
        if (retryInfo.attempts >= this.MAX_RETRY_ATTEMPTS) {
            console.warn(`Max retry attempts (${this.MAX_RETRY_ATTEMPTS}) reached for session:`, sessionCode);
            return false;
        }
        
        // Check if backoff time has elapsed
        const now = Date.now();
        const timeSinceLastRetry = now - retryInfo.lastRetry;
        
        if (timeSinceLastRetry >= retryInfo.backoffMs) {
            return true;
        }
        
        return false;
    }

    /**
     * Record failed sync attempt and calculate next backoff
     * @param {string} sessionCode
     */
    recordFailedAttempt(sessionCode) {
        const retryInfo = this.syncRetry.get(sessionCode) || { attempts: 0, lastRetry: 0, backoffMs: 0 };
        
        retryInfo.attempts += 1;
        retryInfo.lastRetry = Date.now();
        retryInfo.backoffMs = this.getBackoffDelay(retryInfo.attempts);
        
        this.syncRetry.set(sessionCode, retryInfo);
        
        console.log(`Scheduled retry for ${sessionCode}: attempt ${retryInfo.attempts}/${this.MAX_RETRY_ATTEMPTS}, backoff ${retryInfo.backoffMs.toFixed(0)}ms`);
    }

    /**
     * Clear retry tracking for session
     * @param {string} sessionCode
     */
    clearRetry(sessionCode) {
        this.syncRetry.delete(sessionCode);
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
     * Create a new session with idempotency protection
     * Prevents duplicate sessions from refresh/reconnect/retry
     * 
     * Uses session_code (client-generated, deterministic) + client_session_id for idempotency
     * Supabase is authoritative: successful Supabase creation is required for production sessions
     * 
     * @param {Object} customerData - Customer information
     * @returns {Promise<Object>} Session object with UUID from Supabase or local UUID for offline
     */
    async createSession(customerData) {
        console.log('SessionService.createSession called with:', customerData);

        // Validate customer data
        if (!customerData || !customerData.name || !customerData.phone || !customerData.problem) {
            const error = new Error('Missing required customer data: name, phone, problem');
            console.error('Session creation validation failed:', error);
            throw error;
        }

        // Wait for initialization
        await this.waitForInitialization();

        const sessionCode = this.generateSessionCode();
        console.log('Generated session code:', sessionCode);

        // Check for existing session in local cache first (fast path for double-submit protection)
        if (this.localSessions.has(sessionCode)) {
            console.warn('⚠️  Session code already exists locally:', sessionCode);
            return this.localSessions.get(sessionCode);
        }

        const session = {
            id: null, // Will be set by Supabase (UUID) or use sessionCode locally
            sessionCode,
            client_session_id: sessionCode, // For idempotency detection at Supabase level
            status: 'created',
            sync_status: 'pending', // Default to pending - will change to 'synced' on success
            customer_name: customerData.name.trim(),
            customer_phone: customerData.phone.trim(),
            order_number: customerData.serviceOrder?.trim() || null,
            problem_description: customerData.problem.trim(),
            device_info: null,
            tests: [],
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

        console.log('Session object prepared:', {
            sessionCode: session.sessionCode,
            supabaseAvailable: !!this.supabase,
            isOnline: this.isOnline,
            syncStatus: session.sync_status
        });

        // Try to create in Supabase (authoritative source)
        if (this.supabase && this.isOnline) {
            try {
                console.log('Creating session in Supabase with idempotency check...');
                
                // IDEMPOTENCY CHECK: Check if session already exists by client_session_id
                const { data: existing, error: checkError } = await this.supabase
                    .from('diagnostic_sessions')
                    .select('id, sessionCode, sync_status')
                    .eq('client_session_id', sessionCode)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') {
                    // PGRST116 = no rows found (expected on first create)
                    console.warn('Error checking for existing session:', checkError);
                }

                if (existing) {
                    console.warn('✅ Idempotency: Session already exists, returning existing:', existing.sessionCode);
                    // Session already exists - return it (idempotent)
                    const existingSession = {
                        ...session,
                        id: existing.id,
                        sync_status: existing.sync_status
                    };
                    this.localSessions.set(sessionCode, existingSession);
                    return existingSession;
                }

                // Session doesn't exist - create new one
                console.log('No existing session found - creating new one in Supabase...');
                const { data, error } = await this.supabase
                    .from('diagnostic_sessions')
                    .insert([session])
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Supabase creation failed:', error.message);
                    
                    // Treat Supabase error as critical for now - fall back to local
                    session.id = sessionCode;
                    session.sync_status = 'pending';
                    
                    this.localSessions.set(sessionCode, session);
                    this.pendingSync.set(sessionCode, session);
                    this.savePendingSync();
                    
                    console.log('⚠️  Falling back to local storage (will retry sync on reconnect)');
                    return session;
                }

                // ✅ Supabase succeeded - session is now authoritative on server
                session.id = data.id; // Use UUID from Supabase
                session.sync_status = 'synced';
                
                this.localSessions.set(sessionCode, session);
                // Remove from pending - successfully synced
                this.pendingSync.delete(sessionCode);
                this.savePendingSync();
                
                console.log('✅ Session created in Supabase (authoritative):', {
                    supabaseId: session.id,
                    sessionCode: session.sessionCode,
                    syncStatus: 'synced',
                    idempotent: false
                });

                return session;
            } catch (error) {
                console.error('❌ Supabase creation error:', error);
                
                // Network or other runtime error - fall back to local
                session.id = sessionCode;
                session.sync_status = 'pending';
                
                this.localSessions.set(sessionCode, session);
                this.pendingSync.set(sessionCode, session);
                this.savePendingSync();
                
                console.log('⚠️  Network error - falling back to local storage');
                return session;
            }
        } else {
            // No Supabase available or offline - use local storage
            // Will sync to Supabase when online
            session.id = sessionCode; // Use session code as temporary local ID
            session.sync_status = 'pending';
            
            this.localSessions.set(sessionCode, session);
            this.pendingSync.set(sessionCode, session);
            this.savePendingSync();
            
            console.log('⚠️  Offline or Supabase unavailable - session stored locally:', {
                sessionCode: session.sessionCode,
                offline: !this.isOnline,
                supabaseUnavailable: !this.supabase,
                syncStatus: 'pending'
            });

            return session;
        }
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
                    session.sync_status = 'pending';
                    this.localSessions.set(sessionCode, session);
                    this.pendingSync.set(sessionCode, session);
                    this.savePendingSync();
                    return false;
                }

                // Remove from pending if successful
                session.sync_status = 'synced';
                this.localSessions.set(sessionCode, session);
                this.pendingSync.delete(sessionCode);
                this.savePendingSync();
                console.log('Session updated in Supabase:', sessionCode);
                return true;
            } catch (error) {
                console.error('Session update error:', error);
                session.sync_status = 'pending';
                this.localSessions.set(sessionCode, session);
                this.pendingSync.set(sessionCode, session);
                this.savePendingSync();
                return false;
            }
        } else {
            // Add to pending sync
            session.sync_status = 'pending';
            this.localSessions.set(sessionCode, session);
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
            issues: summary.issues || null,
            sync_status: 'pending'
        });
    }

    /**
     * Sync pending sessions to Supabase with idempotency protection and exponential backoff
     * Prevents duplicate inserts via client_session_id unique constraint
     * Uses exponential backoff for failed retries
     */
    async syncPendingSessions() {
        if (!this.supabase || !this.isOnline) {
            console.log('Sync skipped: Supabase unavailable or offline');
            return;
        }

        // Prevent concurrent sync operations
        if (this.syncInProgress) {
            console.log('Sync already in progress, skipping...');
            return;
        }

        this.syncInProgress = true;
        console.log(`Starting sync of ${this.pendingSync.size} pending sessions...`);

        const syncStartTime = Date.now();
        let syncedCount = 0;
        let failedCount = 0;

        for (const [sessionCode, session] of this.pendingSync) {
            // Check if this session should be retried (respects backoff)
            if (!this.shouldRetry(sessionCode)) {
                console.log(`Skipping retry (backoff in effect) for session:`, sessionCode);
                continue;
            }

            try {
                // First, check if session already exists (idempotency check)
                const { data: existing, error: checkError } = await this.supabase
                    .from('diagnostic_sessions')
                    .select('id, sync_status')
                    .eq('client_session_id', session.client_session_id)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') {
                    // PGRST116 = no rows found (expected)
                    console.warn('Error checking for existing session during sync:', checkError);
                    throw checkError;
                }

                if (existing) {
                    // Session already exists - this is idempotent
                    console.log('✅ Idempotent sync: Session already exists in Supabase:', sessionCode);
                    
                    // Update local record with Supabase ID if we don't have it
                    if (!session.id || session.id === sessionCode) {
                        session.id = existing.id;
                    }
                    session.sync_status = 'synced';
                    this.localSessions.set(sessionCode, session);
                    this.pendingSync.delete(sessionCode);
                    this.clearRetry(sessionCode);
                    syncedCount++;
                    continue;
                }

                // Session doesn't exist in Supabase - insert it
                console.log('Syncing new session to Supabase:', sessionCode);
                const { data: inserted, error: insertError } = await this.supabase
                    .from('diagnostic_sessions')
                    .insert([session])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Failed to sync session insert:', sessionCode, insertError);
                    this.recordFailedAttempt(sessionCode);
                    session.sync_status = 'failed';
                    this.localSessions.set(sessionCode, session);
                    failedCount++;
                    continue;
                }

                // ✅ Successfully inserted
                console.log('✅ Session synced (insert):', sessionCode);
                session.id = inserted.id;
                session.sync_status = 'synced';
                this.localSessions.set(sessionCode, session);
                this.pendingSync.delete(sessionCode);
                this.clearRetry(sessionCode);
                syncedCount++;

            } catch (error) {
                console.error('Error during session sync:', sessionCode, error);
                this.recordFailedAttempt(sessionCode);
                session.sync_status = 'failed';
                this.localSessions.set(sessionCode, session);
                failedCount++;
            }
        }

        this.savePendingSync();
        const syncDuration = Date.now() - syncStartTime;
        
        this.syncInProgress = false;
        console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed/retrying in ${syncDuration}ms. Remaining pending: ${this.pendingSync.size}`);
    }
}

// Create singleton instance
const sessionService = new SessionService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sessionService;
}
