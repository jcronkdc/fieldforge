-- COMPLETE DOCUMENT MANAGEMENT SYSTEM FOR END-TO-END FUNCTIONALITY

-- Document Categories
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES document_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES document_categories(id),
  project_id UUID REFERENCES projects(id),
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- in bytes
  file_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL, -- S3 or storage URL
  thumbnail_url TEXT, -- For previews
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id), -- For version tracking
  uploaded_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  tags TEXT[],
  metadata JSONB, -- Flexible metadata (author, revision date, etc.)
  is_public BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Access Permissions
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  permission_type VARCHAR(50) CHECK (permission_type IN ('view', 'download', 'edit', 'delete', 'share')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, user_id, permission_type)
);

-- Document Shares (for external sharing)
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  share_code VARCHAR(100) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  password_hash TEXT, -- Optional password protection
  max_downloads INTEGER,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Comments
CREATE TABLE IF NOT EXISTS document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES document_comments(id),
  user_id UUID REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  mentioned_users UUID[],
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Activity Log
CREATE TABLE IF NOT EXISTS document_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL, -- viewed, downloaded, edited, shared, commented
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drawing Annotations (for drawing viewer)
CREATE TABLE IF NOT EXISTS drawing_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  annotation_type VARCHAR(50), -- arrow, rectangle, circle, text, measurement
  annotation_data JSONB NOT NULL, -- Coordinates, text, style, etc.
  page_number INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittals
CREATE TABLE IF NOT EXISTS submittals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submittal_number VARCHAR(100) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  spec_section VARCHAR(100),
  submitted_by UUID REFERENCES auth.users(id),
  submitted_to VARCHAR(255), -- Contractor/consultant name
  due_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'resubmit')),
  review_comments TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittal Documents (many-to-many)
CREATE TABLE IF NOT EXISTS submittal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submittal_id UUID REFERENCES submittals(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  document_type VARCHAR(100), -- shop_drawing, product_data, samples, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submittal_id, document_id)
);

-- Default Document Categories
INSERT INTO document_categories (name, description, icon) VALUES 
  ('Drawings', 'Technical drawings and blueprints', 'file-blueprint'),
  ('Specifications', 'Project specifications and standards', 'file-text'),
  ('Contracts', 'Legal contracts and agreements', 'file-contract'),
  ('Permits', 'Building and work permits', 'file-shield'),
  ('Reports', 'Inspection and progress reports', 'file-report'),
  ('Photos', 'Site photos and documentation', 'camera'),
  ('Manuals', 'Equipment and operation manuals', 'book'),
  ('Submittals', 'Contractor submittals', 'file-check')
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittal_documents ENABLE ROW LEVEL SECURITY;

-- Document Categories - Everyone can view
CREATE POLICY "All users can view document categories"
  ON document_categories FOR SELECT
  TO authenticated
  USING (true);

-- Documents Policies
CREATE POLICY "Users can view documents in their company"
  ON documents FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) OR
    is_public = true OR
    EXISTS (SELECT 1 FROM document_permissions WHERE document_id = documents.id AND user_id = auth.uid() AND permission_type = 'view')
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update their documents"
  ON documents FOR UPDATE
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM document_permissions WHERE document_id = documents.id AND user_id = auth.uid() AND permission_type = 'edit')
  );

CREATE POLICY "Users can delete their documents"
  ON documents FOR DELETE
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM document_permissions WHERE document_id = documents.id AND user_id = auth.uid() AND permission_type = 'delete')
  );

-- Document Permissions Policies
CREATE POLICY "Users can view their permissions"
  ON document_permissions FOR SELECT
  USING (user_id = auth.uid() OR granted_by = auth.uid());

CREATE POLICY "Document owners can grant permissions"
  ON document_permissions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE id = document_permissions.document_id AND uploaded_by = auth.uid())
  );

-- Document Comments Policies
CREATE POLICY "Users can view comments on accessible documents"
  ON document_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_comments.document_id
      AND (
        d.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) OR
        d.is_public = true OR
        EXISTS (SELECT 1 FROM document_permissions WHERE document_id = d.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create comments"
  ON document_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_document_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO document_activity_log (document_id, user_id, action, metadata)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_ARGV[0],
    jsonb_build_object('trigger_op', TG_OP, 'timestamp', NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_documents_project ON documents(project_id) WHERE status = 'active';
CREATE INDEX idx_documents_category ON documents(category_id) WHERE status = 'active';
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_document_permissions_user ON document_permissions(user_id);
CREATE INDEX idx_document_shares_code ON document_shares(share_code) WHERE is_active = true;
CREATE INDEX idx_submittals_project ON submittals(project_id);
CREATE INDEX idx_submittals_status ON submittals(status) WHERE status != 'approved';

-- Triggers for activity logging
CREATE TRIGGER log_document_view
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_document_activity('uploaded');

-- Update triggers
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_document_comments_updated_at BEFORE UPDATE ON document_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_submittals_updated_at BEFORE UPDATE ON submittals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
