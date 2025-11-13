-- Drawings Table (Extension of documents for CAD/technical drawings)
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  document_id UUID REFERENCES documents(id),
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(10) CHECK (file_type IN ('pdf', 'dwg', 'dxf', 'png', 'jpg', 'jpeg')) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  sheet_count INTEGER DEFAULT 1,
  annotations JSONB DEFAULT '[]'::jsonb,
  sheets JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) CHECK (status IN ('draft', 'review', 'approved', 'superseded')) DEFAULT 'draft',
  discipline VARCHAR(100),
  drawing_number VARCHAR(100),
  scale VARCHAR(50),
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_drawings_project_id ON drawings(project_id);
CREATE INDEX idx_drawings_status ON drawings(status);
CREATE INDEX idx_drawings_discipline ON drawings(discipline);
CREATE INDEX idx_drawings_drawing_number ON drawings(drawing_number);
CREATE INDEX idx_drawings_uploaded_by ON drawings(uploaded_by);

-- Enable RLS
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view drawings for projects in their company"
  ON drawings
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can upload drawings for their projects"
  ON drawings
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update drawings they uploaded"
  ON drawings
  FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Drawing Annotations Table
CREATE TABLE IF NOT EXISTS drawing_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
  sheet_id VARCHAR(100),
  type VARCHAR(50) CHECK (type IN ('rectangle', 'circle', 'text', 'freehand', 'arrow', 'cloud', 'dimension')) NOT NULL,
  x DECIMAL NOT NULL,
  y DECIMAL NOT NULL,
  width DECIMAL,
  height DECIMAL,
  radius DECIMAL,
  points JSONB, -- For freehand/polyline
  text TEXT,
  color VARCHAR(7) DEFAULT '#FF0000',
  stroke_width INTEGER DEFAULT 2,
  font_size INTEGER DEFAULT 14,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_drawing_annotations_drawing ON drawing_annotations(drawing_id);
CREATE INDEX idx_drawing_annotations_sheet ON drawing_annotations(sheet_id);
CREATE INDEX idx_drawing_annotations_created_by ON drawing_annotations(created_by);

-- Enable RLS
ALTER TABLE drawing_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for annotations
CREATE POLICY "Users can view annotations on accessible drawings"
  ON drawing_annotations
  FOR SELECT
  USING (
    drawing_id IN (
      SELECT id FROM drawings d
      JOIN projects p ON d.project_id = p.id
      WHERE p.company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create annotations"
  ON drawing_annotations
  FOR INSERT
  WITH CHECK (
    drawing_id IN (
      SELECT id FROM drawings d
      JOIN projects p ON d.project_id = p.id
      WHERE p.company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own annotations"
  ON drawing_annotations
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own annotations"
  ON drawing_annotations
  FOR DELETE
  USING (created_by = auth.uid());

-- Drawing Revisions Table
CREATE TABLE IF NOT EXISTS drawing_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  revision_date DATE NOT NULL,
  description TEXT,
  revised_by UUID REFERENCES auth.users(id) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drawing_revisions_drawing ON drawing_revisions(drawing_id);
CREATE INDEX idx_drawing_revisions_date ON drawing_revisions(revision_date);

-- Enable RLS
ALTER TABLE drawing_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revisions for accessible drawings"
  ON drawing_revisions
  FOR SELECT
  USING (
    drawing_id IN (
      SELECT id FROM drawings d
      JOIN projects p ON d.project_id = p.id
      WHERE p.company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_drawings_updated_at 
  BEFORE UPDATE ON drawings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drawing_annotations_updated_at 
  BEFORE UPDATE ON drawing_annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create view for drawing statistics
CREATE OR REPLACE VIEW drawing_statistics AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  COUNT(DISTINCT d.id) as total_drawings,
  COUNT(DISTINCT CASE WHEN d.status = 'approved' THEN d.id END) as approved_drawings,
  COUNT(DISTINCT CASE WHEN d.status = 'review' THEN d.id END) as review_drawings,
  COUNT(DISTINCT CASE WHEN d.status = 'draft' THEN d.id END) as draft_drawings,
  COUNT(DISTINCT da.id) as total_annotations,
  COUNT(DISTINCT d.discipline) as disciplines
FROM projects p
LEFT JOIN drawings d ON p.id = d.project_id
LEFT JOIN drawing_annotations da ON d.id = da.drawing_id
GROUP BY p.id, p.name;
