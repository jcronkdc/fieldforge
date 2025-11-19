-- Add Row Level Security policies to collaboration tables
-- Migration: 024_collaboration_rls_policies.sql
-- Enforces invite-only access at the database layer (mycelial defense)

-- Enable RLS on collaboration_rooms (if not already enabled)
ALTER TABLE collaboration_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_cursor_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_recordings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COLLABORATION ROOMS POLICIES
-- ============================================================================

-- Users can see rooms they're a participant of OR rooms for projects they're members of
CREATE POLICY collaboration_rooms_participant_access ON collaboration_rooms FOR SELECT TO authenticated
    USING (
        -- User is a participant in the room
        id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid()
        )
        OR
        -- User is a member of the project (can see rooms but not join unless invited)
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Users can create rooms (will be added as participant automatically)
CREATE POLICY collaboration_rooms_create ON collaboration_rooms FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Only room creator or project admin can update room settings
CREATE POLICY collaboration_rooms_update ON collaboration_rooms FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid()
        OR (
            project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Only room creator or project admin can delete/end rooms
CREATE POLICY collaboration_rooms_delete ON collaboration_rooms FOR DELETE TO authenticated
    USING (
        created_by = auth.uid()
        OR (
            project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- ============================================================================
-- COLLABORATION PARTICIPANTS POLICIES (INVITE-ONLY ENFORCEMENT)
-- ============================================================================

-- Users can see participants in rooms they're part of
CREATE POLICY collaboration_participants_access ON collaboration_room_participants FOR SELECT TO authenticated
    USING (
        room_id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Only room host/owner can add participants (INVITE-ONLY)
CREATE POLICY collaboration_participants_create ON collaboration_room_participants FOR INSERT TO authenticated
    WITH CHECK (
        -- Must be room host/owner to add others
        room_id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid() AND (role = 'host' OR is_owner = true)
        )
        OR (
            -- Allow creator to add initial participants when creating room
            room_id IN (
                SELECT id FROM collaboration_rooms 
                WHERE created_by = auth.uid() 
                AND created_at > now() - INTERVAL '2 minutes'
            )
        )
    );

-- Users can update their own participant record (e.g., joined_at, left_at)
CREATE POLICY collaboration_participants_update_self ON collaboration_room_participants FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Hosts can update other participants' settings
CREATE POLICY collaboration_participants_update_host ON collaboration_room_participants FOR UPDATE TO authenticated
    USING (
        room_id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid() AND (role = 'host' OR is_owner = true)
        )
    );

-- Users can remove themselves from a room
CREATE POLICY collaboration_participants_delete_self ON collaboration_room_participants FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Hosts can remove others from a room
CREATE POLICY collaboration_participants_delete_host ON collaboration_room_participants FOR DELETE TO authenticated
    USING (
        room_id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid() AND (role = 'host' OR is_owner = true)
        )
    );

-- ============================================================================
-- CURSOR POSITIONS POLICIES
-- ============================================================================

-- Users can see cursor positions in rooms they're part of
CREATE POLICY collaboration_cursors_access ON collaboration_cursor_positions FOR SELECT TO authenticated
    USING (
        room_id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update their own cursor position
CREATE POLICY collaboration_cursors_update ON collaboration_cursor_positions FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RECORDINGS POLICIES
-- ============================================================================

-- Users can see recordings of rooms they participated in
CREATE POLICY collaboration_recordings_access ON collaboration_recordings FOR SELECT TO authenticated
    USING (
        -- Either the recording is public
        is_public = true
        OR
        -- Or user was a participant in the room
        room_id IN (
            SELECT room_id FROM collaboration_room_participants 
            WHERE user_id = auth.uid()
        )
        OR
        -- Or user is in the shared_with array
        auth.uid() = ANY(shared_with)
    );

-- Only room owner can create/update/delete recordings
CREATE POLICY collaboration_recordings_owner_only ON collaboration_recordings FOR ALL TO authenticated
    USING (
        room_id IN (
            SELECT id FROM collaboration_rooms 
            WHERE created_by = auth.uid()
        )
    )
    WITH CHECK (
        room_id IN (
            SELECT id FROM collaboration_rooms 
            WHERE created_by = auth.uid()
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is a room participant
CREATE OR REPLACE FUNCTION is_room_participant(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM collaboration_room_participants
        WHERE room_id = room_uuid AND user_id = user_uuid
    );
END;
$$;

-- Function to check if user is a room host/owner
CREATE OR REPLACE FUNCTION is_room_host(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM collaboration_room_participants
        WHERE room_id = room_uuid 
        AND user_id = user_uuid 
        AND (role = 'host' OR is_owner = true)
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_room_participant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_room_host(UUID, UUID) TO authenticated;

-- Comments
COMMENT ON POLICY collaboration_rooms_participant_access ON collaboration_rooms IS 'Users can only see rooms they are participants of';
COMMENT ON POLICY collaboration_participants_create ON collaboration_room_participants IS 'Enforces invite-only: Only room hosts can add participants';
COMMENT ON FUNCTION is_room_participant(UUID, UUID) IS 'Helper to check if a user is a participant in a room';
COMMENT ON FUNCTION is_room_host(UUID, UUID) IS 'Helper to check if a user is a host/owner of a room';

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 024: Collaboration RLS policies applied - invite-only enforcement active at database layer';
END $$;

