-- User Settings System
-- Stores application preferences and configurations for each user

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Settings stored as JSONB for flexibility
  settings JSONB NOT NULL DEFAULT '{
    "theme": "dark",
    "language": "en",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "firstDayOfWeek": 0,
    "notificationsEnabled": true,
    "notificationCategories": {
      "safety": {"app": true, "email": true, "sms": true, "push": true},
      "projects": {"app": true, "email": true, "sms": false, "push": true},
      "equipment": {"app": true, "email": false, "sms": false, "push": true},
      "weather": {"app": true, "email": false, "sms": false, "push": true},
      "system": {"app": true, "email": true, "sms": false, "push": false}
    },
    "quietHoursEnabled": false,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "07:00",
    "autoSync": true,
    "syncInterval": 15,
    "offlineMode": false,
    "cacheSize": 100,
    "dataCompression": false,
    "reducedMotion": false,
    "lowDataMode": false,
    "biometricAuth": false,
    "sessionTimeout": 30,
    "showProfilePhoto": true,
    "shareLocation": true,
    "analyticsEnabled": true,
    "highContrast": false,
    "largeText": false,
    "soundEffects": true,
    "hapticFeedback": true,
    "screenReaderOptimized": false,
    "debugMode": false,
    "showPerformanceStats": false,
    "enableBetaFeatures": false,
    "autoBackup": true,
    "backupFrequency": "weekly",
    "storageUsed": 0
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Cache Table (for tracking cache usage)
CREATE TABLE IF NOT EXISTS user_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cache Details
  cache_key VARCHAR(255) NOT NULL,
  cache_type VARCHAR(50) NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  
  -- Metadata
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, cache_key)
);

-- Settings History Table (for tracking changes)
CREATE TABLE IF NOT EXISTS user_settings_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Change Details
  settings_before JSONB,
  settings_after JSONB NOT NULL,
  changed_fields TEXT[],
  
  -- Metadata
  changed_by UUID REFERENCES auth.users(id),
  change_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_settings_updated ON user_settings(updated_at);
CREATE INDEX idx_user_cache_user ON user_cache(user_id);
CREATE INDEX idx_user_cache_accessed ON user_cache(last_accessed);
CREATE INDEX idx_user_cache_expires ON user_cache(expires_at);
CREATE INDEX idx_settings_history_user ON user_settings_history(user_id);
CREATE INDEX idx_settings_history_created ON user_settings_history(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track settings changes
CREATE OR REPLACE FUNCTION track_settings_change() RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  key TEXT;
  old_value JSONB;
  new_value JSONB;
BEGIN
  -- Only track if settings actually changed
  IF OLD.settings IS DISTINCT FROM NEW.settings THEN
    -- Find changed fields
    changed_fields := ARRAY[]::TEXT[];
    
    -- Compare each key in the settings
    FOR key IN SELECT jsonb_object_keys(OLD.settings) UNION SELECT jsonb_object_keys(NEW.settings)
    LOOP
      old_value := OLD.settings->key;
      new_value := NEW.settings->key;
      
      IF old_value IS DISTINCT FROM new_value THEN
        changed_fields := array_append(changed_fields, key);
      END IF;
    END LOOP;
    
    -- Insert into history
    INSERT INTO user_settings_history (
      user_id, settings_before, settings_after, changed_fields
    ) VALUES (
      NEW.user_id, OLD.settings, NEW.settings, changed_fields
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to track settings changes
CREATE TRIGGER track_user_settings_changes
  AFTER UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION track_settings_change();

-- Function to clean up expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS void AS $$
BEGIN
  DELETE FROM user_cache
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE user_settings IS 'User application preferences and configurations';
COMMENT ON TABLE user_cache IS 'Tracks user cache storage and usage';
COMMENT ON TABLE user_settings_history IS 'Audit trail of settings changes';

COMMENT ON COLUMN user_settings.settings IS 'JSONB storage for flexible settings schema';
COMMENT ON COLUMN user_cache.cache_type IS 'Type of cached data (images, documents, api_responses, etc)';
COMMENT ON COLUMN user_settings_history.changed_fields IS 'Array of setting keys that changed';
