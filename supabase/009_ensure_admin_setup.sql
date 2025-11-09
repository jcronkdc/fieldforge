-- Ensure admin account setup is complete
-- This migration ensures all necessary tables and permissions are in place

-- First, ensure user_profiles table has all required columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Ensure companies table has type column that allows parent/subsidiary
DO $$
BEGIN
  -- Check if the constraint exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'companies_type_check' 
    AND conrelid = 'companies'::regclass
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE companies DROP CONSTRAINT companies_type_check;
  END IF;
  
  -- Add the new constraint with parent and subsidiary types
  ALTER TABLE companies 
  ADD CONSTRAINT companies_type_check 
  CHECK (type IN ('utility', 'contractor', 'subcontractor', 'supplier', 'engineering', 'parent', 'subsidiary'));
END $$;

-- Add parent_company_id if it doesn't exist
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES companies(id);

-- Ensure companies can be identified uniquely by name
DO $$
BEGIN
  -- Check if unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'companies_name_unique' 
    AND conrelid = 'companies'::regclass
  ) THEN
    -- Add unique constraint on name
    ALTER TABLE companies 
    ADD CONSTRAINT companies_name_unique UNIQUE (name);
  END IF;
END $$;

-- Create or update Cronk Companies structure
WITH parent_company AS (
  INSERT INTO companies (name, type, address, phone, email, website)
  VALUES (
    'Cronk Companies LLC',
    'parent',
    jsonb_build_object(
      'street', '13740 10th Ave South',
      'city', 'Zimmerman',
      'state', 'MN',
      'zip', '55398'
    ),
    '6123103241',
    'admin@cronkcompanies.com',
    'https://cronkcompanies.com'
  )
  ON CONFLICT (name) 
  DO UPDATE SET
    type = 'parent',
    address = EXCLUDED.address,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO companies (name, type, parent_company_id, address, phone, email, website)
SELECT
  'Brink Constructors',
  'subsidiary',
  parent_company.id,
  jsonb_build_object(
    'street', '123 Construction Way',
    'city', 'Minneapolis',
    'state', 'MN',
    'zip', '55401'
  ),
  '6125551234',
  'info@brinkconstructors.com',
  'https://brinkconstructors.com'
FROM parent_company
ON CONFLICT (name)
DO UPDATE SET
  type = 'subsidiary',
  parent_company_id = EXCLUDED.parent_company_id,
  address = EXCLUDED.address,
  updated_at = NOW();

-- Create company cost codes for Brink Constructors
INSERT INTO company_cost_codes (company_id, code, description, category)
SELECT 
  c.id,
  v.code,
  v.description,
  v.category
FROM companies c
CROSS JOIN (
  VALUES 
    ('98-1300', 'Meals (50%) - Business meals with customers, trips, conventions, work sites', 'Expenses'),
    ('98-1500', 'Lodging - Cable, Internet, Cleaning, Electricity, Lawn care, Water, Furniture, Supplies, Hotel', 'Expenses'),
    ('98-1550', 'Land/Apt Lease - Rent (Land, House, Apartment), Yard rental', 'Expenses'),
    ('98-1600', 'Plane/Train Expense - Tickets, Parking', 'Travel'),
    ('98-1650', 'Taxi/Car Expense - Taxi fare, Car rental, Uber', 'Travel'),
    ('98-1700', 'Performance Bonds', 'Bonds'),
    ('98-1900', 'Freight', 'Logistics'),
    ('98-2100', 'Gas & Oil - Anti-gel, Bulk oil, Diesel, DEF, Gas', 'Equipment'),
    ('98-2300', 'Insurance', 'Insurance'),
    ('98-2400', 'Property Damage Claims (Not Insured)', 'Claims'),
    ('98-2500', 'Job Office Expense - Chairs, Garbage, Markers, Modem, Paper, Pens, Printer, Table, Whiteboard', 'Office'),
    ('98-2700', 'Miscellaneous Expense - Ice, Water, Injuries', 'Misc'),
    ('98-2900', 'Direct Equipment Rentals', 'Equipment'),
    ('98-3100', 'Equipment Consumables - Fluids, Lights, Mirrors, Mud flaps, Washer fluid, Wiper blades', 'Equipment'),
    ('98-3150', 'Equipment Damage - Job Repairs, Tire repair', 'Repairs'),
    ('98-3200', 'Job-Related Tool Repair', 'Repairs'),
    ('98-3300', 'Professional & Technical Fees - Surveyors, ROW contractor, Testing, Engineering', 'Professional'),
    ('98-3500', 'Rentals (Non-Equipment) - Office, Storage unit', 'Rentals'),
    ('98-3700', 'Right of Way Damages - Animals, Fence, Gate, Mailbox, Ruts, Seed', 'Damages'),
    ('98-3900', 'Taxes & Permits - Long loads, Overweight, Pilot cars, Toll fees, Weigh tickets', 'Permits'),
    ('98-4100', 'Penalties and Fines', 'Fines'),
    ('98-4300', 'Telephone/Internet - Internet, Phone, Security cameras', 'Communications'),
    ('98-4400', 'Job Drug Screen', 'Safety'),
    ('98-4500', 'Small Tools - Battery cables, Charger, Banding, Bull ropes, Chain, Chokers, etc.', 'Tools'),
    ('98-4900', 'Utilities - Electricity, Toilet', 'Utilities'),
    ('98-4950', 'Cell Phones - Service, Case, Charger', 'Communications'),
    ('98-5500', 'Garbage', 'Waste'),
    ('98-6000', 'Safety Supplies - Gloves, Safety glasses, Ear plugs, First aid', 'Safety')
) AS v(code, description, category)
WHERE c.name = 'Brink Constructors'
ON CONFLICT (company_id, code) 
DO UPDATE SET 
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Create receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  company_id UUID REFERENCES companies(id),
  receipt_date DATE NOT NULL,
  vendor_name TEXT,
  amount DECIMAL(10, 2),
  cost_code TEXT,
  description TEXT,
  image_url TEXT,
  stamped_image_url TEXT,
  ocr_data JSONB,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS for receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Users can see their own receipts and receipts from their projects
CREATE POLICY receipts_select ON receipts FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
);

-- Users can insert their own receipts
CREATE POLICY receipts_insert ON receipts FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own receipts
CREATE POLICY receipts_update ON receipts FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON receipts TO authenticated;

-- Create storage bucket for receipts if needed
-- Note: This needs to be done via Supabase Dashboard or API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', false)
-- ON CONFLICT DO NOTHING;

-- Final message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin setup migration complete!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Create admin user in Supabase Auth with email: justincronk@pm.me';
  RAISE NOTICE '2. Use password: Junuh2014!';
  RAISE NOTICE '3. The user profile will be automatically created with admin privileges';
  RAISE NOTICE '4. Company structure: Cronk Companies LLC > Brink Constructors';
  RAISE NOTICE '5. All cost codes for Brink Constructors have been added';
END $$;
