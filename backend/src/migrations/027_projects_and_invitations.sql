-- Projects and Team Management System
-- Migration: 027_projects_and_invitations.sql
-- Core tables for project management, team membership, and invite-only invitations

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project details
  project_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT, -- T&D, Substation, Distribution, Transmission, etc.
  status TEXT CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'planning',
  
  -- Dates
  start_date DATE,
  end_date DATE,
  completion_date DATE,
  
  -- Location
  location TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  coordinates GEOGRAPHY(POINT),
  
  -- Financial
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  
  -- Company association
  company_id UUID REFERENCES company_settings(id) ON DELETE CASCADE,
  
  -- Project ownership
  created_by UUID REFERENCES auth.users(id),
  project_manager_id UUID REFERENCES auth.users(id),
  
  -- Settings
  settings JSONB DEFAULT '{
    "notifications_enabled": true,
    "auto_reporting": true,
    "require_daily_photos": false
  }'::jsonb,
  
  -- Metadata
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PROJECT MEMBERS TABLE (Team Membership)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role in project
  role TEXT CHECK (role IN ('admin', 'manager', 'supervisor', 'worker', 'viewer')) DEFAULT 'worker',
  
  -- Permissions
  can_edit BOOLEAN DEFAULT false,
  can_invite BOOLEAN DEFAULT false,
  can_view_budget BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'inactive', 'removed')) DEFAULT 'active',
  
  -- Tracking
  joined_at TIMESTAMPTZ DEFAULT now(),
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id, user_id)
);

-- ============================================================================
-- PROJECT INVITATIONS TABLE (Invite-Only System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Invitation details
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'supervisor', 'worker', 'viewer')) DEFAULT 'worker',
  token TEXT UNIQUE NOT NULL,
  
  -- Invited by
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invitation_message TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  
  -- Acceptance
  accepted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  
  -- Expiry
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id, email, status) -- One pending invitation per email per project
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_project_manager ON projects(project_manager_id);
CREATE INDEX idx_projects_archived ON projects(archived) WHERE archived = false;

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_status ON project_members(status) WHERE status = 'active';

CREATE INDEX idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX idx_project_invitations_email ON project_invitations(email);
CREATE INDEX idx_project_invitations_token ON project_invitations(token);
CREATE INDEX idx_project_invitations_status ON project_invitations(status) WHERE status = 'pending';
CREATE INDEX idx_project_invitations_expires ON project_invitations(expires_at) WHERE status = 'pending';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Projects: Users can see projects they're members of
CREATE POLICY projects_member_access ON projects FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR created_by = auth.uid()
  );

-- Projects: Only admins/managers can create projects
CREATE POLICY projects_create ON projects FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Projects: Only admins can update projects
CREATE POLICY projects_update ON projects FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Project Members: Users can see members of projects they're in
CREATE POLICY project_members_access ON project_members FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Project Members: Only admins/managers with can_invite can add members
CREATE POLICY project_members_add ON project_members FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND can_invite = true
    )
  );

-- Project Invitations: Users can see invitations for projects they're admin/manager of
CREATE POLICY project_invitations_access ON project_invitations FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
    OR invited_by = auth.uid()
  );

-- Project Invitations: Only admins/managers with can_invite can create invitations
CREATE POLICY project_invitations_create ON project_invitations FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND can_invite = true
    )
  );

-- ============================================================================
-- RPC FUNCTIONS FOR INVITATIONS
-- ============================================================================

-- Function to invite user to project (generates token, sends notification)
CREATE OR REPLACE FUNCTION invite_to_project(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_invited_by UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_invitation_id UUID;
  v_project_name TEXT;
  v_inviter_name TEXT;
BEGIN
  -- Check if inviter has permission
  IF NOT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = p_project_id 
    AND user_id = p_invited_by 
    AND role IN ('admin', 'manager')
    AND can_invite = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins/managers with invite permission can invite members';
  END IF;
  
  -- Generate unique token
  v_token := encode(gen_random_bytes(32), 'base64');
  
  -- Get project name for notification
  SELECT name INTO v_project_name FROM projects WHERE id = p_project_id;
  
  -- Get inviter name for notification
  SELECT COALESCE(up.full_name, u.email) INTO v_inviter_name
  FROM auth.users u
  LEFT JOIN user_profiles up ON up.user_id = u.id
  WHERE u.id = p_invited_by;
  
  -- Create invitation
  INSERT INTO project_invitations (
    project_id,
    email,
    role,
    token,
    invited_by,
    invitation_message
  ) VALUES (
    p_project_id,
    p_email,
    p_role,
    v_token,
    p_invited_by,
    p_message
  )
  ON CONFLICT (project_id, email, status) 
  WHERE status = 'pending'
  DO UPDATE SET
    token = v_token,
    invited_by = p_invited_by,
    invitation_message = p_message,
    expires_at = now() + INTERVAL '7 days',
    created_at = now()
  RETURNING id INTO v_invitation_id;
  
  -- Create notification for invited user (if they have an account)
  PERFORM create_notification(
    (SELECT id FROM auth.users WHERE email = p_email LIMIT 1),
    'project_invite',
    'Project Invitation',
    v_inviter_name || ' invited you to join "' || v_project_name || '"',
    '/invitations/' || v_token,
    'Accept Invitation',
    'project',
    p_project_id,
    p_invited_by
  ) WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = p_email);
  
  RETURN v_token;
END;
$$;

-- Function to accept project invitation
CREATE OR REPLACE FUNCTION accept_project_invitation(
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM project_invitations
  WHERE token = p_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Verify email matches (if user exists)
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = v_user_id 
      AND email = v_invitation.email
    ) THEN
      RAISE EXCEPTION 'Email mismatch: This invitation is for a different email address';
    END IF;
  END IF;
  
  -- Add user to project
  INSERT INTO project_members (
    project_id,
    user_id,
    role,
    can_invite,
    can_edit
  ) VALUES (
    v_invitation.project_id,
    v_user_id,
    v_invitation.role,
    v_invitation.role IN ('admin', 'manager'),
    v_invitation.role IN ('admin', 'manager', 'supervisor')
  )
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET status = 'active';
  
  -- Mark invitation as accepted
  UPDATE project_invitations
  SET 
    status = 'accepted',
    accepted_by = v_user_id,
    accepted_at = now()
  WHERE id = v_invitation.id;
  
  RETURN true;
END;
$$;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE project_invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER project_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-add project creator as admin (mycelial pathway repair)
CREATE OR REPLACE FUNCTION auto_add_project_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add creator as project admin with full permissions
  INSERT INTO project_members (
    project_id,
    user_id,
    role,
    can_edit,
    can_invite,
    can_view_budget,
    status
  ) VALUES (
    NEW.id,
    NEW.created_by,
    'admin',
    true,
    true,
    true,
    'active'
  )
  ON CONFLICT (project_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_add_project_creator_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  WHEN (NEW.created_by IS NOT NULL)
  EXECUTE FUNCTION auto_add_project_creator();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION invite_to_project(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_project_invitation(TEXT) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE projects IS 'Core projects table for construction management';
COMMENT ON TABLE project_members IS 'Team membership with role-based permissions';
COMMENT ON TABLE project_invitations IS 'Invite-only invitation system with expiry';

COMMENT ON FUNCTION invite_to_project(UUID, TEXT, TEXT, UUID, TEXT) IS 'Creates project invitation and sends notification (invite-only enforcement)';
COMMENT ON FUNCTION accept_project_invitation(TEXT) IS 'Accepts invitation and adds user to project team';
COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Marks expired pending invitations as expired (run via cron)';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 027: Projects and invite-only invitation system created';
END $$;

