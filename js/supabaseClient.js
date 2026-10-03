// YAS Laptop Diagnostic System - Supabase Client
// This module handles Supabase integration for session storage

// Configuration
const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || '',
    anonKey: window.SUPABASE_ANON_KEY || ''
};

// Supabase client (will be initialized when script loads)
let supabaseClient = null;
let configCheckInterval = null;

/**
 * Initialize Supabase client
 * @returns {Object|null} Supabase client or null if not configured
 */
function initSupabase() {
    // Update config from window (in case it was loaded asynchronously)
    SUPABASE_CONFIG.url = window.SUPABASE_URL || '';
    SUPABASE_CONFIG.anonKey = window.SUPABASE_ANON_KEY || '';

    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.log('Supabase not configured - using LocalStorage fallback');
        return null;
    }

    try {
        // Load Supabase from CDN
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            console.log('Supabase client initialized');
            return supabaseClient;
        } else {
            console.warn('Supabase library not loaded');
            return null;
        }
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return null;
    }
}

/**
 * Wait for Supabase config to be loaded asynchronously
 * @param {number} maxWait - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
function waitForConfig(maxWait = 5000) {
    return new Promise((resolve) => {
        if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
            resolve();
            return;
        }

        let elapsed = 0;
        const checkInterval = 100;

        configCheckInterval = setInterval(() => {
            elapsed += checkInterval;
            if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                clearInterval(configCheckInterval);
                resolve();
            } else if (elapsed >= maxWait) {
                clearInterval(configCheckInterval);
                console.log('Supabase config not available after waiting');
                resolve();
            }
        }, checkInterval);
    });
}

/**
 * Get Supabase client
 * @returns {Object|null} Supabase client or null
 */
function getSupabase() {
    if (!supabaseClient) {
        // Try to initialize with current config
        supabaseClient = initSupabase();
    }
    return supabaseClient;
}

/**
 * Check if Supabase is available
 * @returns {boolean}
 */
function isSupabaseAvailable() {
    return getSupabase() !== null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSupabase,
        getSupabase,
        isSupabaseAvailable,
        waitForConfig,
        SUPABASE_CONFIG
    };
} else {
    // Make available globally for vanilla JS
    window.initSupabase = initSupabase;
    window.getSupabase = getSupabase;
    window.isSupabaseAvailable = isSupabaseAvailable;
    window.waitForConfig = waitForConfig;
}
