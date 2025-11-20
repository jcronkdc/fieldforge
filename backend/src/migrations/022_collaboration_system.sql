-- Collaboration System for Video Meetings and Real-Time Co-Working
-- Migration: 022_collaboration_system.sql

-- Collaboration rooms (video meetings, screen sharing, cursor control)
CREATE TABLE IF NOT EXISTS collaboration_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    
    -- Room details
    room_name TEXT NOT NULL,
    description TEXT,
    
    -- Daily.co integration
    daily_room_id TEXT UNIQUE,
    daily_room_url TEXT,
    daily_room_name TEXT,
    
    -- Access control (invite-only)
    privacy TEXT CHECK (privacy IN ('private', 'public')) DEFAULT 'private',
    created_by UUID REFERENCES auth.users(id),
    
    -- Room settings
    settings JSONB DEFAULT '{
        "enableCursorControl": true,
        "enableScreenShare": true,
        "enableRecording": true,
        "enableChat": true,
        "maxParticipants": 50,
        "requireKnocking": true
    }'::jsonb,
    
    -- Status
    status TEXT CHECK (status IN ('active', 'ended', 'scheduled')) DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

-- Room participants
CREATE TABLE IF NOT EXISTS collaboration_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Participant details
    user_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('host', 'moderator', 'participant')) DEFAULT 'participant',
    
    -- Permissions
    can_screen_share BOOLEAN DEFAULT true,
    can_record BOOLEAN DEFAULT false,
    can_control_cursor BOOLEAN DEFAULT true,
    is_owner BOOLEAN DEFAULT false,
    
    -- Meeting token (for Daily.co authentication)
    meeting_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Participation tracking
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(room_id, user_id)
);

-- Cursor positions for real-time collaboration
CREATE TABLE IF NOT EXISTS collaboration_cursor_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Cursor data
    x NUMERIC(10, 2),
    y NUMERIC(10, 2),
    document_id UUID, -- Optional reference to a specific document being edited
    action TEXT CHECK (action IN ('move', 'click', 'drag', 'select', 'idle')) DEFAULT 'move',
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(room_id, user_id)
);

-- Room recordings
CREATE TABLE IF NOT EXISTS collaboration_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
    
    -- Recording details
    daily_recording_id TEXT,
    recording_url TEXT,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    shared_with UUID[], -- Array of user IDs who can access
    
    -- Status
    status TEXT CHECK (status IN ('processing', 'ready', 'failed')) DEFAULT 'processing',
    
    -- Metadata
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_collaboration_rooms_project ON collaboration_rooms(project_id);
CREATE INDEX idx_collaboration_rooms_conversation ON collaboration_rooms(conversation_id);
CREATE INDEX idx_collaboration_rooms_status ON collaboration_rooms(status);
CREATE INDEX idx_collaboration_rooms_expires ON collaboration_rooms(expires_at);

CREATE INDEX idx_collaboration_participants_room ON collaboration_room_participants(room_id);
CREATE INDEX idx_collaboration_participants_user ON collaboration_room_participants(user_id);

CREATE INDEX idx_collaboration_cursors_room ON collaboration_cursor_positions(room_id);
CREATE INDEX idx_collaboration_cursors_updated ON collaboration_cursor_positions(updated_at);

CREATE INDEX idx_collaboration_recordings_room ON collaboration_recordings(room_id);
CREATE INDEX idx_collaboration_recordings_status ON collaboration_recordings(status);

-- Automatically clean up expired rooms
CREATE OR REPLACE FUNCTION cleanup_expired_collaboration_rooms()
RETURNS void AS $$
BEGIN
    UPDATE collaboration_rooms
    SET status = 'ended', ended_at = now()
    WHERE status = 'active' 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collaboration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collaboration_rooms_updated_at
    BEFORE UPDATE ON collaboration_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_collaboration_updated_at();

CREATE TRIGGER collaboration_participants_updated_at
    BEFORE UPDATE ON collaboration_room_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_collaboration_updated_at();

CREATE TRIGGER collaboration_cursors_updated_at
    BEFORE UPDATE ON collaboration_cursor_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_collaboration_updated_at();

-- Comments for documentation
COMMENT ON TABLE collaboration_rooms IS 'Video collaboration rooms with Daily.co integration for real-time meetings and cursor control';
COMMENT ON TABLE collaboration_room_participants IS 'Participants in collaboration rooms with their permissions and meeting tokens';
COMMENT ON TABLE collaboration_cursor_positions IS 'Real-time cursor positions for collaborative editing';
COMMENT ON TABLE collaboration_recordings IS 'Meeting recordings stored via Daily.co';



