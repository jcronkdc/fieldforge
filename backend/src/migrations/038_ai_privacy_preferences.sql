-- Migration: Add AI configuration preferences to company_settings
-- This allows companies to choose between local (private) and cloud AI

-- Add AI preference columns to company_settings table
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(20) DEFAULT 'cloud' CHECK (ai_mode IN ('local', 'cloud', 'hybrid'));
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS local_ai_url VARCHAR(500);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS local_ai_model VARCHAR(100);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS ai_privacy_mode BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN company_settings.ai_mode IS 'AI operation mode: local (private, NDA-safe), cloud (powerful), or hybrid (mix)';
COMMENT ON COLUMN company_settings.local_ai_url IS 'URL to local AI endpoint (e.g., http://localhost:11434 for Ollama)';
COMMENT ON COLUMN company_settings.local_ai_model IS 'Local model name (e.g., llama3, mistral, codellama)';
COMMENT ON COLUMN company_settings.ai_privacy_mode IS 'When TRUE, AI never sends data to external services';

-- Create index for AI mode queries
CREATE INDEX IF NOT EXISTS idx_company_settings_ai_mode ON company_settings(ai_mode);

-- Add audit logging for AI preference changes
CREATE TABLE IF NOT EXISTS ai_preference_audit (
  id SERIAL PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  old_mode VARCHAR(20),
  new_mode VARCHAR(20),
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_preference_audit IS 'Audit log for AI privacy preference changes (compliance tracking)';

-- RLS policies for AI preferences
ALTER TABLE ai_preference_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company AI audit log" ON ai_preference_audit
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert AI audit log" ON ai_preference_audit
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND company_id = ai_preference_audit.company_id
      AND is_admin = TRUE
    )
  );

-- Add helper function to check if company uses local AI only
CREATE OR REPLACE FUNCTION uses_local_ai_only(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT ai_mode = 'local' OR ai_privacy_mode = TRUE
    FROM company_settings
    WHERE company_id = p_company_id
  );
END;
$$;

COMMENT ON FUNCTION uses_local_ai_only IS 'Returns TRUE if company requires local-only AI (NDA compliance)';


