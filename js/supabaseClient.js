// YAS Laptop Diagnostic System - Supabase Client
// This module handles Supabase integration for session storage

// Configuration
const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || '',
    anonKey: window.SUPABASE_ANON_KEY || ''
};

// Supabase client (will be initialized when script loads)
let supabase = null;

/**
 * Initialize Supabase client
 * @returns {Object|null} Supabase client or null if not configured
 */
function initSupabase() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.log('Supabase not configured - using LocalStorage fallback');
        return null;
    }

    try {
        // Load Supabase from CDN
        if (window.supabase) {
            supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            console.log('Supabase client initialized');
            return supabase;
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
 * Get Supabase client
 * @returns {Object|null} Supabase client or null
 */
function getSupabase() {
    if (!supabase) {
        supabase = initSupabase();
    }
    return supabase;
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
        SUPABASE_CONFIG
    };
}
