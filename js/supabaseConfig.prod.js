// Supabase Configuration for Production
// This will be replaced by Vercel build process or loaded from API

// Load from Vercel API
window.SUPABASE_URL = null;
window.SUPABASE_ANON_KEY = null;

// Try to load from API
(async () => {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      window.SUPABASE_URL = config.SUPABASE_URL;
      window.SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
      console.log('Supabase config loaded from Vercel API');
    }
  } catch (error) {
    console.error('Failed to load Supabase config:', error);
  }
})();
