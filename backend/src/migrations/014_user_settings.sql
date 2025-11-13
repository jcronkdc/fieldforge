-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'auto',
  language VARCHAR(10) DEFAULT 'en',
  notifications JSONB DEFAULT '{"safety": true, "projects": true, "equipment": true, "crew": true, "documents": true, "email_digest": "daily"}',
  sync_preferences JSONB DEFAULT '{"wifi_only": false, "auto_sync": true, "sync_interval": 30}',
  performance JSONB DEFAULT '{"animations": true, "high_quality_images": true, "cache_size": 100}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Create RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own settings
CREATE POLICY user_settings_user_policy ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- Function to get or create user settings
CREATE OR REPLACE FUNCTION get_or_create_user_settings(p_user_id UUID)
RETURNS user_settings AS $$
DECLARE
  v_settings user_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings FROM user_settings WHERE user_id = p_user_id;
  
  -- If not found, create new settings with defaults
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id) VALUES (p_user_id) RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql;
