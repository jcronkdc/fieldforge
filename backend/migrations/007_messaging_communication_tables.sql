-- Messaging and Communication Tables for FieldForge T&D/Substation Platform
-- Migration: 007_messaging_communication_tables.sql

-- Message channels for organized communication
CREATE TABLE message_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL,
    channel_type TEXT CHECK (channel_type IN (
        'general', 'safety', 'emergency', 'engineering', 'foreman',
        'inspection', 'commissioning', 'outage', 'weather', 'custom'
    )),
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    emergency_channel BOOLEAN DEFAULT false, -- For critical alerts
    -- Channel settings
    allow_guests BOOLEAN DEFAULT false,
    mute_notifications BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 90,
    -- Members and permissions
    created_by UUID REFERENCES auth.users(id),
    admins UUID[], -- Array of user IDs with admin rights
    members UUID[], -- Array of user IDs with access
    read_only_members UUID[], -- Can read but not post
    -- Pinned items
    pinned_messages UUID[],
    pinned_documents UUID[],
    -- Statistics
    message_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, channel_name)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES message_channels(id) ON DELETE CASCADE,
    parent_message_id UUID REFERENCES messages(id), -- For threading
    sender_id UUID REFERENCES auth.users(id),
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN (
        'text', 'alert', 'safety', 'weather', 'system', 'broadcast'
    )) DEFAULT 'text',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
    -- Mentions and tags
    mentions UUID[], -- Array of mentioned user IDs
    tags TEXT[], -- Hashtags for categorization
    -- Location context
    location_id UUID REFERENCES project_areas(id),
    gps_coords JSONB, -- {lat, lon} for field messages
    -- Related items
    related_equipment UUID[], -- Equipment IDs referenced
    related_structures UUID[], -- Structure IDs referenced
    related_documents UUID[], -- Document IDs attached
    -- Attachments
    attachments JSONB[], -- Array of {type, url, name, size, thumbnail}
    voice_memo_url TEXT, -- For voice messages
    -- Delivery and read status
    delivered_to UUID[], -- Users who received the message
    read_by JSONB[], -- Array of {user_id, read_at}
    -- Reactions
    reactions JSONB[], -- Array of {user_id, emoji, timestamp}
    -- Edit history
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    edited_by UUID REFERENCES auth.users(id),
    edit_history JSONB[], -- Previous versions
    -- Deletion
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id),
    -- Emergency broadcast
    requires_acknowledgment BOOLEAN DEFAULT false,
    acknowledgments JSONB[], -- Array of {user_id, timestamp, note}
    -- Metadata
    sent_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ, -- For time-sensitive messages
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Push notification settings
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    -- Channel notifications
    all_messages BOOLEAN DEFAULT false,
    mentions_only BOOLEAN DEFAULT true,
    emergency_alerts BOOLEAN DEFAULT true,
    safety_alerts BOOLEAN DEFAULT true,
    weather_alerts BOOLEAN DEFAULT true,
    -- Project notifications
    rfi_updates BOOLEAN DEFAULT true,
    submittal_updates BOOLEAN DEFAULT true,
    schedule_changes BOOLEAN DEFAULT true,
    daily_plan_published BOOLEAN DEFAULT true,
    inspection_results BOOLEAN DEFAULT true,
    test_results BOOLEAN DEFAULT true,
    -- Delivery preferences
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '20:00',
    quiet_hours_end TIME DEFAULT '06:00',
    weekend_notifications BOOLEAN DEFAULT false,
    -- Device tokens
    fcm_tokens TEXT[], -- Firebase Cloud Messaging tokens
    apns_tokens TEXT[], -- Apple Push Notification tokens
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Broadcast messages for important announcements
CREATE TABLE broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    broadcast_type TEXT CHECK (broadcast_type IN (
        'safety', 'weather', 'emergency', 'schedule', 'general'
    )),
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    -- Target audience
    target_all BOOLEAN DEFAULT true,
    target_companies UUID[], -- Specific companies
    target_roles TEXT[], -- Specific roles
    target_locations UUID[], -- Specific project areas
    target_users UUID[], -- Specific users
    -- Scheduling
    send_immediately BOOLEAN DEFAULT true,
    scheduled_time TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    -- Tracking
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ,
    delivery_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    acknowledgment_required BOOLEAN DEFAULT false,
    acknowledgments JSONB[],
    -- Attachments
    attachments JSONB[],
    action_required TEXT,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Voice/Video call logs
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    call_type TEXT CHECK (call_type IN ('voice', 'video', 'screen_share')),
    channel_id UUID REFERENCES message_channels(id),
    initiated_by UUID REFERENCES auth.users(id),
    participants JSONB[], -- Array of {user_id, join_time, leave_time, duration}
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    recording_url TEXT,
    transcript_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- File sharing and collaboration
CREATE TABLE shared_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES message_channels(id),
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    description TEXT,
    tags TEXT[],
    -- Permissions
    is_public BOOLEAN DEFAULT false,
    allowed_users UUID[],
    -- Version control
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES shared_files(id),
    -- Analytics
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    last_accessed_by UUID REFERENCES auth.users(id),
    -- Expiration
    expires_at TIMESTAMPTZ,
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Emergency contact list
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contact_type TEXT CHECK (contact_type IN (
        'site_emergency', 'utility_dispatch', 'hospital', 'fire',
        'police', 'environmental', 'management', 'client'
    )),
    name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    primary_phone TEXT NOT NULL,
    secondary_phone TEXT,
    email TEXT,
    radio_channel TEXT,
    available_hours TEXT,
    notes TEXT,
    priority_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication logs for external communications
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    communication_type TEXT CHECK (communication_type IN (
        'phone', 'email', 'meeting', 'site_visit', 'correspondence'
    )),
    direction TEXT CHECK (direction IN ('incoming', 'outgoing')),
    date_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    -- Parties involved
    from_user UUID REFERENCES auth.users(id),
    from_company UUID REFERENCES companies(id),
    from_name TEXT,
    to_user UUID REFERENCES auth.users(id),
    to_company UUID REFERENCES companies(id),
    to_name TEXT,
    -- Content
    subject TEXT,
    summary TEXT,
    action_items JSONB[],
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    -- References
    related_rfi TEXT[],
    related_submittal TEXT[],
    related_documents UUID[],
    -- Attachments
    attachments JSONB[],
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Toolbox talk records
CREATE TABLE toolbox_talks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    talk_date DATE NOT NULL,
    talk_time TIME,
    location_id UUID REFERENCES project_areas(id),
    conducted_by UUID REFERENCES auth.users(id),
    topic TEXT NOT NULL,
    topic_category TEXT CHECK (topic_category IN (
        'electrical_safety', 'fall_protection', 'excavation', 'crane_safety',
        'arc_flash', 'lockout_tagout', 'confined_space', 'ppe',
        'heat_illness', 'cold_stress', 'driving', 'general'
    )),
    duration_minutes INTEGER,
    -- Content
    key_points TEXT[],
    discussion_notes TEXT,
    questions_raised JSONB[],
    -- Attendees
    attendees JSONB[], -- Array of {user_id, name, company, signed}
    attendance_count INTEGER,
    -- Follow up
    action_items JSONB[],
    incidents_discussed JSONB[],
    near_misses_discussed JSONB[],
    -- Documentation
    handout_provided BOOLEAN DEFAULT false,
    video_shown BOOLEAN DEFAULT false,
    demonstration_performed BOOLEAN DEFAULT false,
    attachments JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_channels_project ON message_channels(project_id);
CREATE INDEX idx_channels_type ON message_channels(channel_type);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_messages_priority ON messages(priority) WHERE priority IN ('high', 'emergency');
CREATE INDEX idx_messages_mentions ON messages USING gin(mentions);
CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX idx_broadcast_project ON broadcast_messages(project_id);
CREATE INDEX idx_call_logs_project ON call_logs(project_id);
CREATE INDEX idx_shared_files_project ON shared_files(project_id);
CREATE INDEX idx_shared_files_channel ON shared_files(channel_id);
CREATE INDEX idx_emergency_contacts_project ON emergency_contacts(project_id);
CREATE INDEX idx_communication_logs_project ON communication_logs(project_id);
CREATE INDEX idx_toolbox_talks_project_date ON toolbox_talks(project_id, talk_date);

-- Enable RLS
ALTER TABLE message_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE toolbox_talks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Message channels: Users can see channels they're members of
CREATE POLICY channels_access ON message_channels FOR ALL TO authenticated
    USING (
        project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()) AND
        (NOT is_private OR auth.uid() = ANY(members) OR auth.uid() = ANY(admins))
    );

-- Messages: Users can see messages in channels they have access to
CREATE POLICY messages_access ON messages FOR SELECT TO authenticated
    USING (
        channel_id IN (
            SELECT id FROM message_channels 
            WHERE project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
            AND (NOT is_private OR auth.uid() = ANY(members) OR auth.uid() = ANY(admins))
        )
    );

-- Users can create messages in channels they're members of
CREATE POLICY messages_create ON messages FOR INSERT TO authenticated
    WITH CHECK (
        channel_id IN (
            SELECT id FROM message_channels 
            WHERE auth.uid() = ANY(members) OR auth.uid() = ANY(admins)
        )
    );

-- Users can update their own messages
CREATE POLICY messages_update ON messages FOR UPDATE TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Notification settings: Users can only manage their own
CREATE POLICY notification_settings_own ON notification_settings FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Broadcast messages: All project members can see
CREATE POLICY broadcast_access ON broadcast_messages FOR SELECT TO authenticated
    USING (
        project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
    );

-- Only certain roles can create broadcasts
CREATE POLICY broadcast_create ON broadcast_messages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_team 
            WHERE user_id = auth.uid() 
            AND project_id = broadcast_messages.project_id
            AND role IN ('project_manager', 'superintendent', 'safety_manager', 'foreman')
        )
    );

CREATE POLICY call_logs_project_access ON call_logs FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY shared_files_access ON shared_files FOR ALL TO authenticated
    USING (
        project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()) AND
        (is_public OR uploaded_by = auth.uid() OR auth.uid() = ANY(allowed_users))
    );

CREATE POLICY emergency_contacts_access ON emergency_contacts FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY communication_logs_access ON communication_logs FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY toolbox_talks_access ON toolbox_talks FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
