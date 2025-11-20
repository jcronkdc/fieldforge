-- Add Stripe subscription tracking to company_settings
-- Migration: 025_stripe_subscription_tracking.sql
-- Adds fields for tracking Stripe customer/subscription IDs and updates subscription data

-- Add Stripe-specific columns to company_settings if they don't exist
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Create index for faster lookups by Stripe IDs
CREATE INDEX IF NOT EXISTS idx_company_stripe_customer ON company_settings(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_company_stripe_subscription ON company_settings(stripe_subscription_id);

-- Function to update company subscription from Stripe webhook
CREATE OR REPLACE FUNCTION update_company_subscription(
  p_company_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_plan TEXT,
  p_status TEXT,
  p_current_period_end BIGINT,
  p_cancel_at_period_end BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE company_settings
  SET 
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_status = p_status,
    current_period_end = to_timestamp(p_current_period_end),
    cancel_at_period_end = p_cancel_at_period_end,
    settings = jsonb_set(
      settings,
      '{subscription}',
      jsonb_build_object(
        'plan', p_plan,
        'status', p_status,
        'currentPeriodEnd', to_timestamp(p_current_period_end),
        'seats', COALESCE((settings->'subscription'->>'seats')::int, 25),
        'usedSeats', COALESCE((settings->'subscription'->>'usedSeats')::int, 0)
      )
    ),
    updated_at = now()
  WHERE company_id = p_company_id;
  
  -- Log the update
  RAISE NOTICE 'Updated subscription for company % to % (status: %)', 
    p_company_id, p_plan, p_status;
END;
$$;

-- Function to find company by Stripe customer ID
CREATE OR REPLACE FUNCTION get_company_by_stripe_customer(
  p_stripe_customer_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT company_id INTO v_company_id
  FROM company_settings
  WHERE stripe_customer_id = p_stripe_customer_id;
  
  RETURN v_company_id;
END;
$$;

-- Function to cancel company subscription
CREATE OR REPLACE FUNCTION cancel_company_subscription(
  p_company_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE company_settings
  SET 
    subscription_status = 'canceled',
    settings = jsonb_set(
      settings,
      '{subscription,status}',
      '"canceled"'::jsonb
    ),
    settings = jsonb_set(
      settings,
      '{subscription,plan}',
      '"free"'::jsonb
    ),
    updated_at = now()
  WHERE company_id = p_company_id;
  
  RAISE NOTICE 'Canceled subscription for company %', p_company_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_company_subscription(UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_by_stripe_customer(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_company_subscription(UUID) TO authenticated;

-- Comments
COMMENT ON COLUMN company_settings.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN company_settings.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN company_settings.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN company_settings.current_period_end IS 'When current billing period ends';
COMMENT ON COLUMN company_settings.cancel_at_period_end IS 'Whether subscription will cancel at period end';

COMMENT ON FUNCTION update_company_subscription(UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, BOOLEAN) IS 'Updates company subscription data from Stripe webhook events';
COMMENT ON FUNCTION get_company_by_stripe_customer(TEXT) IS 'Finds company ID by Stripe customer ID';
COMMENT ON FUNCTION cancel_company_subscription(UUID) IS 'Marks company subscription as canceled';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 025: Stripe subscription tracking added to company_settings';
END $$;



