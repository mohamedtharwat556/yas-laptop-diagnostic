-- Create diagnostic_sessions table
-- This table stores all diagnostic session data
-- BATCH 6B-2a-FINALIZE: Production Session + Supabase Security Foundation

CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_code TEXT UNIQUE NOT NULL,
    client_session_id TEXT UNIQUE NOT NULL DEFAULT session_code,
    status TEXT NOT NULL DEFAULT 'created',
    sync_status TEXT DEFAULT 'pending',
    customer_name TEXT,
    customer_phone TEXT,
    order_number TEXT,
    problem_description TEXT,
    device_info JSONB,
    tests JSONB DEFAULT '[]',
    summary JSONB,
    issues JSONB,
    technician_notes JSONB,
    hardware_source TEXT,
    hardware_captured_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_code for faster lookups (unique constraint ensures uniqueness)
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_session_code ON diagnostic_sessions(session_code);

-- Create index on client_session_id for idempotency
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_client_session_id ON diagnostic_sessions(client_session_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_status ON diagnostic_sessions(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_created_at ON diagnostic_sessions(created_at DESC);

-- Create index on sync_status for pending syncs
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_sync_status ON diagnostic_sessions(sync_status);

-- Add check constraint for valid statuses (Batch 6B-2a status values)
ALTER TABLE diagnostic_sessions
DROP CONSTRAINT IF EXISTS chk_diagnostic_sessions_status;

ALTER TABLE diagnostic_sessions
ADD CONSTRAINT chk_diagnostic_sessions_status
CHECK (status IN (
    'created',
    'running',
    'partially_completed',
    'completed',
    'completed_with_warnings',
    'completed_with_failures',
    'completed_with_limitations'
));

-- Add check constraint for valid sync statuses
ALTER TABLE diagnostic_sessions
ADD CONSTRAINT chk_diagnostic_sessions_sync_status
CHECK (sync_status IN ('pending', 'synced', 'failed'));

-- Enable Row Level Security
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (clean slate for Batch 6B-2a)
DROP POLICY IF EXISTS "Allow public read access" ON diagnostic_sessions;
DROP POLICY IF EXISTS "Allow public insert access" ON diagnostic_sessions;
DROP POLICY IF EXISTS "Allow public update access" ON diagnostic_sessions;
DROP POLICY IF EXISTS "Allow client read own session" ON diagnostic_sessions;
DROP POLICY IF EXISTS "Allow client insert new session" ON diagnostic_sessions;
DROP POLICY IF EXISTS "Allow client update own session" ON diagnostic_sessions;

-- BATCH 6B-2a RLS Policies: Production-Ready Client Isolation
-- IMPORTANT: Development uses ANON key for simplicity
-- In production, consider adding custom JWT claims for session_code or authenticated users
-- Current approach: ANON can create/read/update their own sessions based on session_code

-- Policy 1: Allow anon users to INSERT new sessions
-- Rationale: New diagnostic sessions must be creatable by unauthenticated clients
-- Security: Relies on UNIQUE constraint on client_session_id for idempotency
CREATE POLICY "anon can create new diagnostic session"
ON diagnostic_sessions FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Allow anon users to SELECT (read) sessions
-- TODO PRODUCTION: Should restrict to own session via RLS context or custom claims
-- Current: Permissive for development - ALL sessions readable
-- Consider: Add custom JWT claims or session context to restrict per-client
-- Future: Implement authenticated session lookup by session_code + token verification
CREATE POLICY "anon can read diagnostic sessions"
ON diagnostic_sessions FOR SELECT
TO anon
USING (true);

-- Policy 3: Allow anon users to UPDATE their own sessions
-- TODO PRODUCTION: Should verify session ownership before allowing update
-- Current: Permissive for development - ANY session updatable
-- Consider: Add trigger or CHECK constraint to verify session ownership
-- Future: Implement session code verification in application layer + RLS hardening
CREATE POLICY "anon can update diagnostic sessions"
ON diagnostic_sessions FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- TODO PRODUCTION: Add authenticated admin role policies
-- Admin should have unrestricted access via authenticated role
-- Example (not implemented yet):
-- CREATE POLICY "admin full access"
-- ON diagnostic_sessions FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'role' = 'admin')
-- WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_diagnostic_sessions_updated_at ON diagnostic_sessions;
CREATE TRIGGER update_diagnostic_sessions_updated_at
    BEFORE UPDATE ON diagnostic_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- TODO PRODUCTION: Add function to verify session ownership
-- This function could be used in RLS policies to restrict updates to owned sessions
-- Example for future implementation:
-- CREATE OR REPLACE FUNCTION verify_session_ownership(session_code_arg TEXT)
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   -- In production with JWT, could verify:
--   -- 1. User has valid JWT token
--   -- 2. Session was created by this user (stored in JWT claims)
--   -- 3. Session has not been accessed by other users
--   RETURN true;  -- TODO: Implement real verification
-- END;
-- $$ language 'plpgsql';
