-- Add preferences column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_profiles' AND column_name='preferences'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Add email verification tracking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_profiles' AND column_name='email_verified_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_profiles' AND column_name='last_login_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_profiles' AND column_name='login_count'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create function to update last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET 
        last_login_at = NOW(),
        login_count = COALESCE(login_count, 0) + 1
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for login tracking (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_login'
    ) THEN
        CREATE TRIGGER on_auth_user_login
            AFTER UPDATE ON auth.users
            FOR EACH ROW
            WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
            EXECUTE FUNCTION update_last_login();
    END IF;
END $$;

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles in their company
CREATE POLICY "Admins can view company profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.is_admin = true
            AND admin_profile.company_id = user_profiles.company_id
        )
    );

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access" ON user_profiles
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create email templates configuration table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, html_body, variables)
VALUES 
    ('welcome', 'Welcome to FieldForge!', 
     '<h1>Welcome {{first_name}}!</h1><p>Thank you for joining FieldForge.</p>', 
     '["first_name", "email", "company"]'::jsonb),
    ('project_invite', 'You have been invited to a FieldForge project',
     '<h1>Project Invitation</h1><p>{{inviter_name}} has invited you to join {{project_name}}</p>',
     '["inviter_name", "project_name", "recipient_email"]'::jsonb),
    ('daily_digest', 'Your FieldForge Daily Summary',
     '<h1>Daily Summary for {{date}}</h1><p>Here is your activity summary...</p>',
     '["date", "user_name", "activities"]'::jsonb)
ON CONFLICT (template_name) DO NOTHING;

-- Add audit logging for user actions
CREATE TABLE IF NOT EXISTS user_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_user_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_action ON user_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_created_at ON user_audit_log(created_at DESC);

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
    p_user_id UUID,
    p_action TEXT,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO user_audit_log (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON user_audit_log TO authenticated;
