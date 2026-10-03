// Supabase Configuration
// Loads from Vercel API in production, uses fallback for local development

window.SUPABASE_URL = null;
window.SUPABASE_ANON_KEY = null;

// Load configuration
(async () => {
  try {
    // Try to load from Vercel API (production)
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      window.SUPABASE_URL = config.SUPABASE_URL;
      window.SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
      console.log('Supabase config loaded from Vercel API');
      return;
    }
  } catch (error) {
    console.log('Could not load from API, using fallback for local development');
  }

  // Fallback for local development (localhost only)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.SUPABASE_URL = 'https://crhtlgsjqucwhjjcurpt.supabase.co';
    window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyaHRsZ3NqcXVjd2hqamN1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjQ3OTQsImV4cCI6MjA5ODgwMDc1NH0.-Hw9e2RhOTcGP5xZKtB-NY2sAvmZd7q1KDlS3O1EDMs';
    console.log('Supabase config loaded from local fallback');
  } else {
    console.error('Supabase config not available - site will use LocalStorage only');
  }
})();
