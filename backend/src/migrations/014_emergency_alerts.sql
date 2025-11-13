-- Emergency Alert System
-- Real-time emergency broadcasts with acknowledgment tracking

-- Emergency Alerts Table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Alert Details
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('info', 'warning', 'danger', 'evacuation')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Location Information
  location VARCHAR(255),
  affected_zones TEXT[],
  assembly_point VARCHAR(255),
  coordinates JSONB,
  
  -- Targeting
  affected_crews TEXT[],
  
  -- Instructions and Contact
  instructions TEXT[],
  contact_number VARCHAR(50),
  
  -- Delivery Configuration
  delivery_channels TEXT[] NOT NULL DEFAULT ARRAY['app'],
  requires_acknowledgment BOOLEAN NOT NULL DEFAULT true,
  
  -- Timing
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Resolution
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Acknowledgments Table
CREATE TABLE IF NOT EXISTS emergency_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Response Details
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_location JSONB,
  response VARCHAR(20) CHECK (response IN ('safe', 'need_help', 'evacuating')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one acknowledgment per user per alert
  UNIQUE(alert_id, user_id)
);

-- Alert Recipients Table (for tracking who should receive alerts)
CREATE TABLE IF NOT EXISTS alert_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Delivery Status
  delivery_channel VARCHAR(20) NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(alert_id, user_id, delivery_channel)
);

-- Create indexes for performance
CREATE INDEX idx_emergency_alerts_active ON emergency_alerts(expires_at, status);
CREATE INDEX idx_emergency_alerts_type ON emergency_alerts(alert_type);
CREATE INDEX idx_emergency_alerts_priority ON emergency_alerts(priority);
CREATE INDEX idx_emergency_alerts_issued_at ON emergency_alerts(issued_at DESC);
CREATE INDEX idx_emergency_alerts_location ON emergency_alerts USING GIN(affected_zones);

CREATE INDEX idx_emergency_acks_alert ON emergency_acknowledgments(alert_id);
CREATE INDEX idx_emergency_acks_user ON emergency_acknowledgments(user_id);
CREATE INDEX idx_emergency_acks_response ON emergency_acknowledgments(response);

CREATE INDEX idx_alert_recipients_alert ON alert_recipients(alert_id);
CREATE INDEX idx_alert_recipients_user ON alert_recipients(user_id);
CREATE INDEX idx_alert_recipients_status ON alert_recipients(delivery_status);

-- Add triggers for updated_at
CREATE TRIGGER update_emergency_alerts_updated_at BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically expire old alerts
CREATE OR REPLACE FUNCTION expire_old_alerts() RETURNS void AS $$
BEGIN
  UPDATE emergency_alerts
  SET status = 'resolved',
      resolution_notes = 'Auto-expired',
      resolved_at = NOW()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE emergency_alerts IS 'Stores emergency broadcast alerts for site-wide notifications';
COMMENT ON TABLE emergency_acknowledgments IS 'Tracks user acknowledgments of emergency alerts';
COMMENT ON TABLE alert_recipients IS 'Tracks delivery status of alerts to individual recipients';

COMMENT ON COLUMN emergency_alerts.alert_type IS 'Type of alert: info, warning, danger, evacuation';
COMMENT ON COLUMN emergency_alerts.priority IS 'Alert priority level affecting delivery and display';
COMMENT ON COLUMN emergency_alerts.delivery_channels IS 'Array of delivery methods: app, sms, email, siren';
COMMENT ON COLUMN emergency_acknowledgments.response IS 'User response: safe, need_help, evacuating';
