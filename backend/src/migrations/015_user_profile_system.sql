-- User Profile System
-- Comprehensive user profile management with certifications and training

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Personal Information
  full_name VARCHAR(255),
  phone VARCHAR(50),
  job_title VARCHAR(100),
  employee_id VARCHAR(50),
  department VARCHAR(100),
  location VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  language VARCHAR(10) DEFAULT 'en',
  avatar_url TEXT,
  bio TEXT,
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  
  -- Professional Information  
  hire_date DATE,
  supervisor_id UUID REFERENCES auth.users(id),
  
  -- Preferences
  theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  
  -- Metadata
  last_login TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Certifications Table
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Certification Details
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_number VARCHAR(100),
  
  -- Documentation
  document_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Training Records Table
CREATE TABLE IF NOT EXISTS user_trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Training Details
  course_name VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  completion_date DATE NOT NULL,
  hours DECIMAL(5,2),
  
  -- Documentation
  certificate_url TEXT,
  next_renewal DATE,
  training_type VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Skills Table (for skill tracking)
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Skill Details
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50),
  proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience DECIMAL(3,1),
  
  -- Validation
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

-- User Notification Preferences Table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Types
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('app', 'email', 'sms', 'push')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, notification_type, channel)
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_department ON user_profiles(department);
CREATE INDEX idx_user_profiles_supervisor ON user_profiles(supervisor_id);
CREATE INDEX idx_user_profiles_deleted ON user_profiles(deleted_at);

CREATE INDEX idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_expiry ON user_certifications(expiry_date);
CREATE INDEX idx_user_certifications_status ON user_certifications(verification_status);

CREATE INDEX idx_user_trainings_user ON user_trainings(user_id);
CREATE INDEX idx_user_trainings_completion ON user_trainings(completion_date);
CREATE INDEX idx_user_trainings_renewal ON user_trainings(next_renewal);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_category ON user_skills(skill_category);

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON user_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_trainings_updated_at BEFORE UPDATE ON user_trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check certification expiry
CREATE OR REPLACE FUNCTION check_certification_expiry() RETURNS void AS $$
BEGIN
  -- Mark certifications as expiring soon (30 days)
  UPDATE user_certifications
  SET verification_status = 'pending'
  WHERE expiry_date IS NOT NULL
    AND expiry_date < NOW() + INTERVAL '30 days'
    AND expiry_date > NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond auth.users';
COMMENT ON TABLE user_certifications IS 'Professional certifications and licenses';
COMMENT ON TABLE user_trainings IS 'Training and professional development records';
COMMENT ON TABLE user_skills IS 'User skills and competencies';
COMMENT ON TABLE user_notification_preferences IS 'Granular notification preferences by type and channel';

COMMENT ON COLUMN user_profiles.deleted_at IS 'Soft delete timestamp for GDPR compliance';
COMMENT ON COLUMN user_certifications.verification_status IS 'Admin verification status of certification';
COMMENT ON COLUMN user_skills.proficiency_level IS 'Self-assessed or validated skill level';
