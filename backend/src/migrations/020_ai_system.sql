-- AI System Tables - FieldForge Intelligence Platform

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  message_type VARCHAR(10) CHECK (message_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  category VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights - Proactive intelligence
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('warning', 'suggestion', 'prediction', 'success')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact VARCHAR(20) CHECK (impact IN ('high', 'medium', 'low')),
  category VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Training Data - Pattern learning
CREATE TABLE ai_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category VARCHAR(100),
  patterns JSONB NOT NULL,
  outcome JSONB,
  accuracy_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Reports - Generated documentation
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  report_type VARCHAR(100),
  title VARCHAR(255),
  content JSONB NOT NULL,
  parameters JSONB,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Actions - Automated responses
CREATE TABLE ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  action_type VARCHAR(100),
  action_data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  executed_at TIMESTAMPTZ,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Knowledge Base - Accumulated wisdom
CREATE TABLE ai_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category VARCHAR(100),
  topic VARCHAR(255),
  content TEXT,
  source VARCHAR(255),
  confidence_score NUMERIC(5,2),
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Predictions - Forecasting
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  prediction_type VARCHAR(100),
  target_date DATE,
  predicted_value JSONB,
  confidence NUMERIC(5,2),
  actual_value JSONB,
  accuracy NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Voice Commands - Speech processing
CREATE TABLE ai_voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  transcript TEXT,
  command_type VARCHAR(100),
  parameters JSONB,
  execution_result JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_project ON ai_conversations(project_id);
CREATE INDEX idx_ai_conversations_created ON ai_conversations(created_at);
CREATE INDEX idx_ai_insights_project ON ai_insights(project_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(type);
CREATE INDEX idx_ai_insights_impact ON ai_insights(impact);
CREATE INDEX idx_ai_knowledge_category ON ai_knowledge_base(category);
CREATE INDEX idx_ai_knowledge_usage ON ai_knowledge_base(usage_count);
CREATE INDEX idx_ai_predictions_project ON ai_predictions(project_id);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(prediction_type);

-- Add RLS policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_commands ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
    AND company_id = ai_conversations.company_id
  ));

CREATE POLICY "Users can create conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view project insights"
  ON ai_insights FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM project_assignments
    WHERE user_id = auth.uid()
    AND project_id = ai_insights.project_id
  ) OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
    AND company_id = ai_insights.company_id
  ));

CREATE POLICY "Managers can acknowledge insights"
  ON ai_insights FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
    AND company_id = ai_insights.company_id
  ));

-- Knowledge base policies
CREATE POLICY "Company users can view knowledge"
  ON ai_knowledge_base FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND company_id = ai_knowledge_base.company_id
  ));

CREATE POLICY "Admins can manage knowledge"
  ON ai_knowledge_base FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND company_id = ai_knowledge_base.company_id
  ));

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_ai_knowledge
  BEFORE UPDATE ON ai_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
