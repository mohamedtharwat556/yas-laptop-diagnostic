// Supabase Configuration
// SECURITY: Never hardcode secrets in frontend
// Load from Vercel API (production) or environment file (development)

window.SUPABASE_URL = null;
window.SUPABASE_ANON_KEY = null;
window.SUPABASE_CONFIG_LOADED = false;

// Load configuration
(async () => {
  try {
    // PRIMARY: Try to load from Vercel API (production)
    // Environment variables are set on Vercel and exposed via /api/config
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      window.SUPABASE_URL = config.SUPABASE_URL;
      window.SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
      window.SUPABASE_CONFIG_LOADED = true;
      console.log('✅ Supabase config loaded from Vercel API (production)');
      return;
    }
  } catch (error) {
    console.log('⚠️  Could not load from Vercel API, trying fallback...');
  }

  // FALLBACK: Local development only
  // For local development, use .env.local or create supabaseConfig.local.js
  // WARNING: Never commit real credentials to git
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Try to load from local config file (if it exists - should be in .gitignore)
    try {
      const response = await fetch('js/supabaseConfig.local.js');
      if (response.ok) {
        console.log('📁 Loading from js/supabaseConfig.local.js (git-ignored)');
        // The local file should set window.SUPABASE_URL and window.SUPABASE_ANON_KEY
        const script = document.createElement('script');
        script.src = 'js/supabaseConfig.local.js';
        document.head.appendChild(script);
        window.SUPABASE_CONFIG_LOADED = true;
        return;
      }
    } catch (error) {
      // Local file doesn't exist - this is OK
    }

    console.warn('⚠️  No Supabase config available for local development');
    console.warn('     For local development, create js/supabaseConfig.local.js with:');
    console.warn('     window.SUPABASE_URL = "your-project-url";');
    console.warn('     window.SUPABASE_ANON_KEY = "your-anon-key";');
    console.warn('     Make sure .gitignore includes js/supabaseConfig.local.js');
    console.error('❌ Supabase config not available - site will use LocalStorage only');
    window.SUPABASE_CONFIG_LOADED = false;
  } else {
    console.error('❌ Supabase config not available - site will use LocalStorage only');
    window.SUPABASE_CONFIG_LOADED = false;
  }
})();
