-- Migration: 021_acquisition_inquiries.sql
-- Description: Create acquisition_inquiries table for acquisition and custom development inquiries
-- Date: December 2024

-- Create acquisition_inquiries table
CREATE TABLE IF NOT EXISTS acquisition_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_type VARCHAR(20) NOT NULL CHECK (inquiry_type IN ('acquire', 'custom')),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    project_description TEXT NOT NULL,
    timeline VARCHAR(50),
    budget VARCHAR(50),
    submitted_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed'))
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_email ON acquisition_inquiries(email);

-- Create index on inquiry_type for filtering
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_type ON acquisition_inquiries(inquiry_type);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_status ON acquisition_inquiries(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_created_at ON acquisition_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE acquisition_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can insert (for form submissions)
CREATE POLICY "Public can insert acquisition inquiries"
    ON acquisition_inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- RLS Policy: Only authenticated users can read (admin access)
CREATE POLICY "Authenticated users can read acquisition inquiries"
    ON acquisition_inquiries
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Only authenticated users can update (admin access)
CREATE POLICY "Authenticated users can update acquisition inquiries"
    ON acquisition_inquiries
    FOR UPDATE
    TO authenticated
    USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_acquisition_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER acquisition_inquiries_updated_at
    BEFORE UPDATE ON acquisition_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_acquisition_inquiries_updated_at();

-- Add comment to table
COMMENT ON TABLE acquisition_inquiries IS 'Stores acquisition and custom development inquiries from the /acquisition-inquiry page';

