# YAS Laptop Diagnostic System - Security Guidelines

## Overview
This document outlines the security practices and requirements for the YAS Laptop Diagnostic System.

## CRITICAL: No Secrets in Frontend

### ✅ CORRECT - Environment Variables (Production)
- Supabase credentials stored in Vercel environment variables
- Exposed only via `/api/config` (server-side)
- Frontend loads credentials at runtime via API call

### ✅ CORRECT - Local Development
- Use `js/supabaseConfig.local.js` (git-ignored)
- Copy from `js/supabaseConfig.local.example.js`
- Never commit real credentials to git

### ❌ FORBIDDEN
- Hardcoded API keys in JavaScript files
- Hardcoded tokens in HTML
- Secrets in version control (git)
- Service role keys in frontend (only ANON_KEY allowed)

## Secret Management

### Environment Variables (Vercel)
Set these in Vercel project settings:
```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your-anon-public-key
```

### Local Development
Create `js/supabaseConfig.local.js`:
```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
```

**IMPORTANT:** This file is in `.gitignore` and should NEVER be committed.

## API Keys

### ANON_KEY (Allowed in Frontend)
- Public, unauthenticated access key
- Limited by Row Level Security (RLS) policies
- Cannot perform administrative operations
- Safe to expose in frontend

### SERVICE_ROLE_KEY (FORBIDDEN in Frontend)
- Bypasses Row Level Security (RLS)
- Must NEVER be exposed in frontend
- Only use in backend/serverless functions
- Provides full database access

## Data Security

### Session Data
- Stored in Supabase with RLS protection
- Client can only access their own session via session_code
- Each session has unique `client_session_id` for idempotency

### LocalStorage (Offline)
- Used only as fallback when Supabase unavailable
- Not encrypted (client-side storage limitation)
- Synced to Supabase when online
- Respects offline-first architecture

### Customer Data
- Name, phone, problem description stored in sessions
- Not personally identifiable beyond what customer provides
- Available to technicians via admin portal
- Deleted per company data retention policy (TODO: implement)

## RLS Policies (Row Level Security)

### Current Status (Development)
Policies are permissive for development:
- Clients can create new sessions
- Clients can read all sessions (TODO: restrict to own)
- Clients can update all sessions (TODO: add ownership checks)

### Production Hardening Required
- Implement JWT-based authentication
- Restrict SELECT to own session via JWT claims
- Add ownership verification before UPDATE
- Implement admin authentication

See `supabase/migrations/001_create_diagnostic_sessions.sql` for TODOs.

## Authentication & Authorization

### Current Status (Development)
- No authentication required for client portal
- Admin portal has mock authentication (localStorage)
- No real authorization checks

### Production Requirements
- Implement proper session verification
- Add JWT tokens for authenticated users
- Implement admin authentication with Supabase Auth
- Add role-based access control (RBAC)

## HTTPS/TLS
- Always use HTTPS in production
- Enforce secure cookies
- Enable HSTS headers

## CORS
- `/api/config` allows all origins (development)
- Production: Restrict to actual domain

## Deployment Checklist

- [ ] No hardcoded secrets in codebase
- [ ] Environment variables set in Vercel
- [ ] RLS policies reviewed and hardened
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Admin authentication implemented
- [ ] Rate limiting configured
- [ ] Monitoring/logging in place
- [ ] Data retention policy enforced
- [ ] Regular security audits scheduled

## Incident Response

### If Secrets are Exposed
1. Revoke compromised keys immediately (Supabase dashboard)
2. Regenerate new keys
3. Update environment variables
4. Audit access logs for suspicious activity
5. Document incident

### If Unauthorized Access Suspected
1. Check access logs in Supabase
2. Review session data for tampering
3. Notify affected users
4. Implement additional logging

## Security Audit Log

### Batch 6B-2a-FINALIZE
- ✅ Removed hardcoded ANON_KEY from production code
- ✅ Implemented secure config loading (Vercel API → local file)
- ✅ Added .gitignore for local config
- ✅ Added RLS policies (development-ready with TODOs for production)
- ✅ Documented security requirements
- ⚠️ TODO: Implement production RLS hardening
- ⚠️ TODO: Add authentication for admin portal
- ⚠️ TODO: Implement data retention policies

## Questions?
Contact the security team or create an issue for security concerns.
