-- MATERIAL INVENTORY MANAGEMENT SYSTEM

-- Material Inventory table
CREATE TABLE IF NOT EXISTS material_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- Each, Box, Feet, Meters, etc.
  quantity_in_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255) NOT NULL,
  supplier_part_number VARCHAR(100),
  location VARCHAR(255) NOT NULL, -- Storage location
  notes TEXT,
  qr_code VARCHAR(255),
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES material_inventory(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_number VARCHAR(100), -- PO#, Invoice#, Job#
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Usage by Project
CREATE TABLE IF NOT EXISTS project_material_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  material_id UUID REFERENCES material_inventory(id),
  quantity_used INTEGER NOT NULL,
  used_date DATE NOT NULL,
  task_description TEXT,
  crew_id UUID REFERENCES crews(id),
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders (for tracking incoming materials)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery DATE,
  actual_delivery DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled')),
  total_amount DECIMAL(10,2),
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Order Line Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES material_inventory(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE material_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_material_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Material Inventory Policies
CREATE POLICY "Company users can view materials"
  ON material_inventory FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized users can create materials"
  ON material_inventory FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'supervisor'))
  );

CREATE POLICY "Authorized users can update materials"
  ON material_inventory FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'supervisor'))
  );

-- Stock Movement Policies
CREATE POLICY "Users can view stock movements"
  ON stock_movements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM material_inventory m
    WHERE m.id = stock_movements.material_id
    AND m.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can record stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM material_inventory m
    WHERE m.id = material_id
    AND m.company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  ));

-- Indexes for performance
CREATE INDEX idx_material_inventory_company ON material_inventory(company_id);
CREATE INDEX idx_material_inventory_category ON material_inventory(category);
CREATE INDEX idx_material_inventory_low_stock ON material_inventory(company_id, quantity_in_stock, minimum_stock);
CREATE INDEX idx_stock_movements_material ON stock_movements(material_id, created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_project_material_usage ON project_material_usage(project_id, used_date DESC);

-- Function to get material status
CREATE OR REPLACE FUNCTION get_material_stock_status(material_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_material RECORD;
  v_percentage NUMERIC;
BEGIN
  SELECT quantity_in_stock, minimum_stock, maximum_stock
  INTO v_material
  FROM material_inventory
  WHERE id = material_id;
  
  IF v_material.quantity_in_stock = 0 THEN
    RETURN 'out_of_stock';
  ELSIF v_material.quantity_in_stock < v_material.minimum_stock THEN
    RETURN 'low_stock';
  ELSIF v_material.quantity_in_stock > v_material.maximum_stock THEN
    RETURN 'overstocked';
  ELSE
    RETURN 'in_stock';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate inventory value
CREATE OR REPLACE FUNCTION calculate_inventory_value(p_company_id UUID)
RETURNS TABLE (
  total_value DECIMAL,
  total_items BIGINT,
  total_units BIGINT,
  categories_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(quantity_in_stock * unit_cost) as total_value,
    COUNT(*) as total_items,
    SUM(quantity_in_stock) as total_units,
    COUNT(DISTINCT category) as categories_count
  FROM material_inventory
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_material_inventory_updated_at
  BEFORE UPDATE ON material_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
