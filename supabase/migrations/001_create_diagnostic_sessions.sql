-- Create diagnostic_sessions table
-- This table stores all diagnostic session data

CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    customer_name TEXT,
    customer_phone TEXT,
    order_number TEXT,
    problem_description TEXT,
    device_info JSONB,
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

-- Create index on session_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_session_code ON diagnostic_sessions(session_code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_status ON diagnostic_sessions(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_created_at ON diagnostic_sessions(created_at DESC);

-- Add check constraint for valid statuses
ALTER TABLE diagnostic_sessions
ADD CONSTRAINT chk_diagnostic_sessions_status
CHECK (status IN ('created', 'waiting_for_agent', 'running', 'completed', 'cancelled', 'failed'));

-- Enable Row Level Security
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read sessions (read-only for public)
-- Note: In production, this should be restricted to authenticated users
CREATE POLICY IF NOT EXISTS "Allow public read access"
ON diagnostic_sessions FOR SELECT
TO anon
USING (true);

-- Policy: Allow anyone to insert sessions (for creating new diagnostic sessions)
CREATE POLICY IF NOT EXISTS "Allow public insert access"
ON diagnostic_sessions FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Allow anyone to update sessions (for updating during diagnostic)
CREATE POLICY IF NOT EXISTS "Allow public update access"
ON diagnostic_sessions FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_diagnostic_sessions_updated_at
    BEFORE UPDATE ON diagnostic_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
