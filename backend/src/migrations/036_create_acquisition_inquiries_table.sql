-- Migration: Create acquisition_inquiries table
-- Date: 2025-11-20
-- Purpose: Add missing table for acquisition inquiry functionality (found via comprehensive testing)

CREATE TABLE IF NOT EXISTS acquisition_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type VARCHAR(50) NOT NULL CHECK (inquiry_type IN ('acquire', 'custom')),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  project_description TEXT NOT NULL,
  timeline VARCHAR(100),
  budget VARCHAR(100),
  submitted_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_email ON acquisition_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_created_at ON acquisition_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acquisition_inquiries_status ON acquisition_inquiries(status);

-- Comments
COMMENT ON TABLE acquisition_inquiries IS 'Stores acquisition and custom project inquiries from landing page';
COMMENT ON COLUMN acquisition_inquiries.inquiry_type IS 'Type of inquiry: acquire (acquisition) or custom (custom project)';
COMMENT ON COLUMN acquisition_inquiries.status IS 'Status: new, contacted, qualified, converted, closed';

