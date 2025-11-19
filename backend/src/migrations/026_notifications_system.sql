-- Notifications System for Collaborative Features
-- Migration: 026_notifications_system.sql
-- Persistent notifications for collaboration events (messages, invites, mentions)

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  type TEXT NOT NULL CHECK (type IN (
    'message',           -- New message in conversation
    'mention',           -- User mentioned in message
    'room_invite',       -- Invited to collaboration room
    'room_started',      -- Collaboration room started
    'project_invite',    -- Invited to project
    'team_invite',       -- Invited to team
    'emergency_alert',   -- Emergency broadcast
    'system'             -- System notification
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Links and actions
  action_url TEXT,      -- Where to go when clicked
  action_label TEXT,    -- Button text (e.g., "Join Room", "View Message")
  
  -- Related entities (for filtering and queries)
  related_entity_type TEXT,  -- 'conversation', 'room', 'project', etc.
  related_entity_id UUID,    -- ID of the related entity
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Status
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,   -- Auto-delete old notifications
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification Delivery Tracking (for push/email)
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  -- Delivery channel
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'sms')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  
  -- Delivery details
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX idx_notifications_sender ON notifications(sender_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_notification_deliveries_notification ON notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Notifications
-- Users can only see their own notifications
CREATE POLICY notifications_own_access ON notifications FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can see delivery status of their own notifications
CREATE POLICY notification_deliveries_own_access ON notification_deliveries FOR SELECT TO authenticated
  USING (
    notification_id IN (
      SELECT id FROM notifications WHERE user_id = auth.uid()
    )
  );

-- Function to create notification for user
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_sender_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    action_label,
    related_entity_type,
    related_entity_id,
    sender_id,
    metadata,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_action_label,
    p_related_entity_type,
    p_related_entity_id,
    p_sender_id,
    p_metadata,
    -- Most notifications expire after 30 days
    CASE 
      WHEN p_type = 'emergency_alert' THEN now() + INTERVAL '7 days'
      ELSE now() + INTERVAL '30 days'
    END
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notifications
  SET read_at = now()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND read_at IS NULL;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read_at = now()
  WHERE user_id = p_user_id
    AND user_id = auth.uid()
    AND read_at IS NULL;
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to clean up expired notifications (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < now();
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE notifications IS 'Persistent notifications for collaborative features (messages, invites, collaboration events)';
COMMENT ON TABLE notification_deliveries IS 'Tracks delivery of notifications via email, push, SMS';

COMMENT ON COLUMN notifications.type IS 'Type of notification: message, mention, room_invite, room_started, project_invite, team_invite, emergency_alert, system';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate to when notification clicked';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity (conversation, room, project) for filtering';
COMMENT ON COLUMN notifications.expires_at IS 'Auto-delete old notifications after this time';

COMMENT ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID, JSONB) IS 'Creates a new notification for a user';
COMMENT ON FUNCTION mark_notification_read(UUID) IS 'Marks a notification as read';
COMMENT ON FUNCTION mark_all_notifications_read(UUID) IS 'Marks all notifications as read for a user';
COMMENT ON FUNCTION cleanup_expired_notifications() IS 'Removes expired notifications (run via cron job)';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 026: Notifications system created for collaborative features';
END $$;


