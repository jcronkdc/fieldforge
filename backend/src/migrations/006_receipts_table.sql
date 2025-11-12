-- Create receipts table for expense tracking
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    merchant_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'materials', 'equipment', 'fuel', 'tools', 'safety', 
        'permits', 'meals', 'lodging', 'travel', 'other'
    )),
    description TEXT,
    receipt_date DATE NOT NULL,
    project_id INTEGER REFERENCES projects(id),
    payment_method VARCHAR(50) CHECK (payment_method IN (
        'cash', 'credit_card', 'debit_card', 'check', 'company_card', 'other'
    )),
    image_data BYTEA, -- Store receipt image
    
    -- Workflow
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by UUID REFERENCES auth.users(id) NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,
    rejection_reason TEXT,
    
    -- Company isolation
    company_id UUID NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_receipts_company_status ON receipts(company_id, status);
CREATE INDEX idx_receipts_project ON receipts(project_id);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);
CREATE INDEX idx_receipts_submitted_by ON receipts(submitted_by);

-- View for receipt summary with user details
CREATE OR REPLACE VIEW receipt_summary AS
SELECT 
    r.*,
    p.name as project_name,
    u1.raw_user_meta_data->>'full_name' as submitted_by_name,
    u2.raw_user_meta_data->>'full_name' as approved_by_name
FROM receipts r
LEFT JOIN projects p ON r.project_id = p.id
LEFT JOIN auth.users u1 ON r.submitted_by = u1.id
LEFT JOIN auth.users u2 ON r.approved_by = u2.id;

-- Function to get receipt statistics
CREATE OR REPLACE FUNCTION get_receipt_stats(
    p_company_id UUID,
    p_project_id INTEGER DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_submitted INTEGER,
    total_approved INTEGER,
    total_rejected INTEGER,
    total_pending INTEGER,
    amount_approved DECIMAL,
    amount_pending DECIMAL,
    amount_rejected DECIMAL,
    avg_approval_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_submitted,
        COUNT(*) FILTER (WHERE status = 'approved')::INTEGER as total_approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER as total_rejected,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as total_pending,
        COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) as amount_approved,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as amount_pending,
        COALESCE(SUM(amount) FILTER (WHERE status = 'rejected'), 0) as amount_rejected,
        AVG(approved_at - created_at) FILTER (WHERE approved_at IS NOT NULL) as avg_approval_time
    FROM receipts
    WHERE company_id = p_company_id
        AND (p_project_id IS NULL OR project_id = p_project_id)
        AND (p_start_date IS NULL OR receipt_date >= p_start_date)
        AND (p_end_date IS NULL OR receipt_date <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all receipts in their company
CREATE POLICY receipts_view ON receipts
    FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM auth.users WHERE id = auth.uid()
    ));

-- Policy: Users can insert their own receipts
CREATE POLICY receipts_insert ON receipts
    FOR INSERT
    WITH CHECK (
        submitted_by = auth.uid() AND
        company_id IN (
            SELECT company_id FROM auth.users WHERE id = auth.uid()
        )
    );

-- Policy: Users can update their own pending receipts
CREATE POLICY receipts_update_own ON receipts
    FOR UPDATE
    USING (
        submitted_by = auth.uid() AND 
        status = 'pending' AND
        company_id IN (
            SELECT company_id FROM auth.users WHERE id = auth.uid()
        )
    );

-- Policy: Managers can approve/reject receipts
CREATE POLICY receipts_approve ON receipts
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM auth.users WHERE id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data->>'role' IN ('manager', 'admin'))
        )
    );

-- Policy: Users can delete their own pending receipts
CREATE POLICY receipts_delete ON receipts
    FOR DELETE
    USING (
        submitted_by = auth.uid() AND 
        status = 'pending' AND
        company_id IN (
            SELECT company_id FROM auth.users WHERE id = auth.uid()
        )
    );
