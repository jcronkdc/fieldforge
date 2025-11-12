-- Audit Logs Table
-- Stores authentication and security events for compliance and security monitoring

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Composite index for user activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- Note: RLS policies are commented out as they require Supabase auth setup
-- Uncomment and adjust if using Supabase Row Level Security

-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Service role can insert audit logs"
--   ON audit_logs FOR INSERT
--   TO service_role
--   WITH CHECK (true);
-- 
-- CREATE POLICY "Users can read their own audit logs"
--   ON audit_logs FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Admins can read all audit logs"
--   ON audit_logs FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_profiles
--       WHERE user_profiles.id = auth.uid()
--       AND user_profiles.is_admin = true
--     )
--   );

COMMENT ON TABLE audit_logs IS 'Stores authentication and security events for compliance monitoring';
COMMENT ON COLUMN audit_logs.action IS 'The action performed (e.g., auth_login_success, token_verification)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., authentication, user_profile)';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the event in JSON format';

