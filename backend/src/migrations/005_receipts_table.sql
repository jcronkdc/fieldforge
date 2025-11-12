-- RECEIPT MANAGEMENT SYSTEM FOR EXPENSE TRACKING

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2),
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Materials', 'Equipment', 'Tools', 'Safety', 'Fuel', 'Office', 'Travel', 'Meals', 'Other')),
  description TEXT,
  project_id UUID REFERENCES projects(id),
  receipt_number VARCHAR(100),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_receipts_company_status ON receipts(company_id, status);
CREATE INDEX idx_receipts_project ON receipts(project_id);
CREATE INDEX idx_receipts_date ON receipts(date DESC);
CREATE INDEX idx_receipts_created_by ON receipts(created_by);
CREATE INDEX idx_receipts_vendor ON receipts(vendor_name);

-- Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Users can view all receipts in their company
CREATE POLICY "Users can view company receipts"
  ON receipts FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

-- Users can create receipts
CREATE POLICY "Users can create receipts"
  ON receipts FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  );

-- Users can update their own pending receipts
CREATE POLICY "Users can update own pending receipts"
  ON receipts FOR UPDATE
  USING (
    created_by = auth.uid() AND 
    status = 'pending' AND
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  );

-- Only managers can approve/reject receipts
CREATE POLICY "Managers can approve receipts"
  ON receipts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'supervisor')
      AND company_id = receipts.company_id
    )
  );

-- Users can delete their own pending receipts
CREATE POLICY "Users can delete own pending receipts"
  ON receipts FOR DELETE
  USING (
    created_by = auth.uid() AND 
    status = 'pending'
  );

-- Update trigger
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Receipt summary view
CREATE OR REPLACE VIEW receipt_summary AS
SELECT 
  r.company_id,
  r.project_id,
  p.name as project_name,
  DATE_TRUNC('month', r.date) as month,
  r.category,
  COUNT(*) as receipt_count,
  SUM(r.amount) as total_amount,
  SUM(CASE WHEN r.status = 'approved' THEN r.amount ELSE 0 END) as approved_amount,
  SUM(CASE WHEN r.status = 'pending' THEN r.amount ELSE 0 END) as pending_amount,
  SUM(r.tax_amount) as total_tax
FROM receipts r
LEFT JOIN projects p ON r.project_id = p.id
GROUP BY r.company_id, r.project_id, p.name, DATE_TRUNC('month', r.date), r.category;

-- Grant access to the view
GRANT SELECT ON receipt_summary TO authenticated;

-- Function to get receipt stats
CREATE OR REPLACE FUNCTION get_receipt_stats(p_company_id UUID, p_date_from DATE DEFAULT NULL, p_date_to DATE DEFAULT NULL)
RETURNS TABLE (
  total_receipts BIGINT,
  total_amount NUMERIC,
  approved_amount NUMERIC,
  pending_amount NUMERIC,
  rejected_amount NUMERIC,
  avg_amount NUMERIC,
  categories_used BIGINT,
  top_vendor VARCHAR,
  top_vendor_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total_receipts,
      SUM(amount) as total_amount,
      SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
      SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END) as rejected_amount,
      AVG(amount) as avg_amount,
      COUNT(DISTINCT category) as categories_used
    FROM receipts
    WHERE company_id = p_company_id
      AND (p_date_from IS NULL OR date >= p_date_from)
      AND (p_date_to IS NULL OR date <= p_date_to)
  ),
  top_vendor AS (
    SELECT vendor_name, SUM(amount) as vendor_total
    FROM receipts
    WHERE company_id = p_company_id
      AND (p_date_from IS NULL OR date >= p_date_from)
      AND (p_date_to IS NULL OR date <= p_date_to)
    GROUP BY vendor_name
    ORDER BY vendor_total DESC
    LIMIT 1
  )
  SELECT 
    s.total_receipts,
    s.total_amount,
    s.approved_amount,
    s.pending_amount,
    s.rejected_amount,
    s.avg_amount,
    s.categories_used,
    tv.vendor_name,
    tv.vendor_total
  FROM stats s
  CROSS JOIN top_vendor tv;
END;
$$ LANGUAGE plpgsql;
