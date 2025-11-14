# FieldForge Stripe Integration Setup

## Backend Environment Variables

Add these environment variables to your `.env` file in the backend:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: Pre-configured Price IDs
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

## Frontend Environment Variables

Add these environment variables to your `.env` file in `apps/swipe-feed`:

```env
# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Getting Your Stripe Keys

1. Sign up for a Stripe account at https://stripe.com
2. Go to the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Copy your test API keys:
   - **Secret key**: Starts with `sk_test_`
   - **Publishable key**: Starts with `pk_test_` (we'll add this to frontend later)

## Setting Up Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to your Stripe account: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:4000/api/webhook/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) to your `.env` file

## Testing Payments

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Requires auth**: 4000 0025 0000 3155  
- **Declined**: 4000 0000 0000 9995

Any future expiry date, any 3-digit CVC, any postal code.

## Pricing Plans

FieldForge offers three pricing tiers:

### Starter Plan - $49/month
- Up to 5 team members
- Basic project management
- Safety compliance tracking
- Email support

### Professional Plan - $149/month
- Up to 20 team members
- Advanced analytics
- Equipment management
- Time tracking & payroll
- Priority support
- API access

### Enterprise Plan - $499/month
- Unlimited team members
- Custom integrations
- Advanced 3D visualization
- AI-powered insights
- Dedicated account manager
- SLA guarantee
- On-premise deployment option

All plans include a 14-day free trial.

## API Endpoints

- `POST /api/payments/create-checkout-session` - Create a Stripe Checkout session
- `POST /api/payments/create-portal-session` - Create a customer portal session
- `GET /api/payments/subscription-status` - Get current subscription status
- `POST /api/webhook/stripe/webhook` - Webhook endpoint for Stripe events

## Production Deployment

1. Switch to live keys in production:
   - Use `sk_live_` secret key
   - Use `pk_live_` publishable key
2. Set up production webhook endpoint in Stripe Dashboard
3. Update `FRONTEND_URL` to your production domain
4. Enable SSL/TLS for secure payments

## Integration Details

### Checkout Flow

1. User visits `/pricing` page
2. Selects a plan and clicks "Start Free Trial"
3. If not logged in, redirected to signup with plan pre-selected
4. Creates Stripe Checkout session via API
5. Redirects to Stripe-hosted checkout page
6. After payment, redirects to `/payment-success`
7. Webhook confirms payment and activates subscription

### Subscription Management

- Users can manage their subscription from Settings > Billing
- Opens Stripe Customer Portal for:
  - Updating payment methods
  - Downloading invoices
  - Canceling subscription
  - Viewing billing history

### Webhook Events Handled

- `checkout.session.completed` - Activates subscription
- `customer.subscription.created/updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription
- `invoice.payment_succeeded` - Sends receipt
- `invoice.payment_failed` - Sends failure notification

## Testing the Integration

1. **Start the backend with Stripe environment variables:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend with Stripe publishable key:**
   ```bash
   cd apps/swipe-feed
   npm run dev
   ```

3. **Set up webhook forwarding (in a separate terminal):**
   ```bash
   stripe listen --forward-to http://localhost:4000/api/webhook/stripe/webhook
   ```

4. **Test the payment flow:**
   - Go to http://localhost:3000/pricing
   - Select a plan
   - Use test card 4242 4242 4242 4242
   - Complete checkout
   - Verify redirect to success page
   - Check webhook events in Stripe CLI

5. **Test subscription management:**
   - Go to Settings > Billing
   - Click "Open Billing Portal"
   - Verify portal opens with subscription details
