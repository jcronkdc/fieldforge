-- Conversations Structure for Messaging System
-- Migration: 023_conversations_structure.sql
-- Extends the messaging system with conversations (complements message_channels)

-- Conversations (direct, group, project)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('direct', 'group', 'project')) NOT NULL,
    name TEXT,
    description TEXT,
    avatar_url TEXT,
    
    -- Project association (for project-specific conversations)
    project_type TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Creator
    created_by UUID REFERENCES auth.users(id),
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_message_at TIMESTAMPTZ
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role (admin can add/remove people, member can only chat)
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    
    -- Tracking
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_read_at TIMESTAMPTZ,
    notifications_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(conversation_id, user_id)
);

-- Update messages table to optionally reference conversations
-- (Keep existing channel_id, add conversation_id for new system)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL, -- emoji or reaction type
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(message_id, user_id, reaction)
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT now(),
    
    PRIMARY KEY(conversation_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(role);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_updated ON typing_indicators(started_at);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Conversations
-- Users can see conversations they're a participant of
CREATE POLICY conversations_participant_access ON conversations FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Users can create conversations
CREATE POLICY conversations_create ON conversations FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Only admins can update conversation settings
CREATE POLICY conversations_update ON conversations FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Conversation Participants
-- Users can see participants in conversations they're part of
CREATE POLICY participants_access ON conversation_participants FOR SELECT TO authenticated
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can add participants (INVITE-ONLY ENFORCEMENT)
CREATE POLICY participants_create ON conversation_participants FOR INSERT TO authenticated
    WITH CHECK (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        OR (
            -- Allow creator to add initial participants when creating conversation
            conversation_id IN (
                SELECT id FROM conversations 
                WHERE created_by = auth.uid() 
                AND created_at > now() - INTERVAL '1 minute'
            )
        )
    );

-- Users can remove themselves
CREATE POLICY participants_delete_self ON conversation_participants FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Admins can remove others
CREATE POLICY participants_delete_admin ON conversation_participants FOR DELETE TO authenticated
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Message Reactions
-- Users can see reactions in conversations they're part of
CREATE POLICY reactions_access ON message_reactions FOR SELECT TO authenticated
    USING (
        message_id IN (
            SELECT id FROM messages 
            WHERE conversation_id IN (
                SELECT conversation_id FROM conversation_participants 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can add their own reactions
CREATE POLICY reactions_create ON message_reactions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can remove their own reactions
CREATE POLICY reactions_delete ON message_reactions FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for Typing Indicators
-- Users can see typing indicators in their conversations
CREATE POLICY typing_access ON typing_indicators FOR SELECT TO authenticated
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update their own typing status
CREATE POLICY typing_update ON typing_indicators FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Function to create or get direct conversation
CREATE OR REPLACE FUNCTION create_or_get_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_id UUID;
    current_user_id UUID := auth.uid();
BEGIN
    -- Check if a direct conversation already exists between these two users
    SELECT c.id INTO conversation_id
    FROM conversations c
    WHERE c.type = 'direct'
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp1
        WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
    )
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = c.id AND cp2.user_id = other_user_id
    )
    AND (
        SELECT COUNT(*) FROM conversation_participants cp
        WHERE cp.conversation_id = c.id
    ) = 2;
    
    -- If conversation doesn't exist, create it
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (type, created_by)
        VALUES ('direct', current_user_id)
        RETURNING id INTO conversation_id;
        
        -- Add both participants
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        VALUES 
            (conversation_id, current_user_id, 'admin'),
            (conversation_id, other_user_id, 'admin');
    END IF;
    
    RETURN conversation_id;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversation_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

CREATE TRIGGER conversation_participants_updated_at
    BEFORE UPDATE ON conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Update conversation's last_message_at when a message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE conversations
        SET last_message_at = NEW.created_at
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
    WHEN (NEW.conversation_id IS NOT NULL)
    EXECUTE FUNCTION update_conversation_last_message();

-- Grant permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON message_reactions TO authenticated;
GRANT ALL ON typing_indicators TO authenticated;
GRANT EXECUTE ON FUNCTION create_or_get_direct_conversation(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE conversations IS 'Conversations for direct messages, group chats, and project discussions';
COMMENT ON TABLE conversation_participants IS 'Participants in conversations with invite-only enforcement (only admins can add)';
COMMENT ON TABLE message_reactions IS 'Emoji reactions to messages';
COMMENT ON TABLE typing_indicators IS 'Real-time typing status for conversation participants';
COMMENT ON FUNCTION create_or_get_direct_conversation(UUID) IS 'Creates or retrieves a direct conversation between two users';

