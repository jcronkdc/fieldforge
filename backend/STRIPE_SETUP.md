# 🔐 Stripe Setup Guide for MythaTron

## 📍 Where to Add Your Stripe Keys

### 1. Create the `.env` file in the `backend` folder:
```bash
cd backend
cp .env.example .env
```

### 2. Edit the `.env` file and add your Stripe keys:

```env
# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## 🔑 How to Get Your Stripe Keys

### Step 1: Sign up for Stripe
1. Go to https://stripe.com
2. Click "Sign up"
3. Create your account

### Step 2: Get Your API Keys
1. Log into your Stripe Dashboard: https://dashboard.stripe.com
2. Look for "Developers" in the left sidebar
3. Click on "API keys"
4. You'll see:
   - **Publishable key**: Starts with `pk_test_` (for testing) or `pk_live_` (for production)
   - **Secret key**: Starts with `sk_test_` (for testing) or `sk_live_` (for production)

### Step 3: Set Up Webhook (for automatic payment confirmation)
1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter your webhook URL:
   - Local testing: Use ngrok or similar (e.g., `https://your-ngrok-url.ngrok.io/api/sparks/webhook`)
   - Production: `https://yourdomain.com/api/sparks/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

## 🧪 Testing vs Production Keys

### For Development/Testing:
```env
STRIPE_SECRET_KEY=sk_test_51ABC...xyz
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...xyz
```

### For Production:
```env
STRIPE_SECRET_KEY=sk_live_51ABC...xyz
STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...xyz
```

## 💳 Test Credit Cards (for development)

Use these test cards when in test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Any future date for expiry, any 3 digits for CVC, any 5 digits for ZIP.

## 🚀 Activate Stripe in the Code

Once you've added your keys to `.env`, update the Stripe initialization:

### In `backend/src/sparks/sparksPurchaseRepository.ts`:

Replace:
```typescript
// Initialize Stripe (temporarily disabled - needs configuration)
const stripe = {} as any; // Placeholder until Stripe is configured
```

With:
```typescript
// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});
```

## 🎯 Frontend Configuration

Add the publishable key to your frontend `.env`:

### In `apps/swipe-feed/.env.local`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

## ✅ Verify Setup

1. Restart your backend server:
```bash
cd backend
npm run dev
```

2. Test a purchase:
   - Go to Sparks Store
   - Select a package
   - You should be redirected to Stripe Checkout

## 🆘 Troubleshooting

### "Stripe is not configured"
- Make sure `.env` file exists in `backend` folder
- Check that keys are correctly copied (no extra spaces)
- Restart the backend server after adding keys

### "Invalid API Key"
- Verify you're using the correct environment (test vs live)
- Make sure the full key is copied (they're long!)
- Check you're not mixing test and live keys

### Webhook not working
- For local testing, use ngrok: `ngrok http 4000`
- Make sure webhook secret is correct
- Check that webhook endpoint matches your server URL

## 📧 Support

If you need help with Stripe setup:
- Stripe Support: https://support.stripe.com
- MythaTron Support: mythatron@proton.me
