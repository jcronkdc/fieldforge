# 🚀 **VERCEL ENVIRONMENT VARIABLES - PRODUCTION SETUP**

## **Current Status: PARTIALLY CONFIGURED**
- ✅ **Frontend Variables**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE_URL
- ✅ **Stripe Frontend**: ITE_STRIPE_PUBLISHABLE_KEY (needs rename to VITE_STRIPE_PUBLISHABLE_KEY)
- ✅ **Services**: ABLY keys, XAI_API_KEY, ADMIN_TOKEN
- ❌ **Backend Critical**: DATABASE_URL, SUPABASE_SERVICE_KEY
- ❌ **Payments**: STRIPE_SECRET_KEY, webhook secrets, price IDs
- ❌ **Production Domain**: CORS_ORIGIN, FRONTEND_URL

---

## **🔴 IMMEDIATE ACTION REQUIRED**

### **Execute These Commands to Complete Setup:**

```bash
# 1. Database Connection (Critical for backend)
vercel env add DATABASE_URL
# Value: postgresql://[user]:[password]@[host]:5432/postgres

# 2. Supabase Admin Key (Critical for user management)
vercel env add SUPABASE_SERVICE_KEY
# Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Stripe Secrets (Critical for payments)
vercel env add STRIPE_SECRET_KEY
# Value: sk_live_...

vercel env add STRIPE_WEBHOOK_SECRET
# Value: whsec_...

# 4. Stripe Price IDs (Required for subscriptions)
vercel env add STRIPE_STARTER_PRICE_ID
# Value: price_...

vercel env add STRIPE_PRO_PRICE_ID
# Value: price_...

vercel env add STRIPE_ENTERPRISE_PRICE_ID
# Value: price_...

# 5. Fix Stripe Frontend Key Name (Typo)
vercel env rm ITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# Value: pk_live_...

# 6. Production Domain (Set after domain setup)
vercel env add CORS_ORIGIN
# Value: https://fieldforge.com

vercel env add FRONTEND_URL
# Value: https://fieldforge.com
```

---

## **📋 SETUP INSTRUCTIONS**

### **Step 1: Gather Required Values**
1. **Supabase Service Key**: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/settings/api
2. **Database URL**: Supabase project settings → Database → Connection string
3. **Stripe Keys**: https://dashboard.stripe.com/apikeys
4. **Stripe Price IDs**: Create products in Stripe → Products → Pricing

### **Step 2: Execute Commands**
Run each `vercel env add` command and paste the value when prompted.

### **Step 3: Redeploy**
```bash
vercel --prod
```

### **Step 4: Verify**
```bash
vercel env ls  # Should show all variables
```

---

## **🎯 WHAT THIS UNLOCKS**

**After completing this setup, these features become fully functional:**

### ✅ **Authentication**
- User registration and login
- Password reset functionality
- Session management
- Admin user creation

### ✅ **Database Operations**
- Project creation and management
- User profile management
- Data persistence
- Real-time updates

### ✅ **Payment Processing**
- Subscription management
- Stripe checkout integration
- Customer portal access
- Webhook processing

### ✅ **Admin Features**
- User management
- System administration
- Audit logging
- Service integrations

---

## **🔍 VERIFICATION TESTS**

**After deployment, test these endpoints:**
```bash
# API connectivity
curl https://fieldforge-dtotsf378-justins-projects-d7153a8c.vercel.app/api/projects

# Authentication (after adding demo accounts)
# Visit login page and try demo credentials

# Payments (after Stripe setup)
# Visit pricing page and test checkout flow
```

---

## **🚨 CRITICAL DEPENDENCIES**

**This setup blocks:**
- Demo account creation and testing
- Project creation functionality
- Payment processing
- Admin operations
- Full production readiness

**Must be completed before:**
- Domain setup and SSL
- Production monitoring
- Mobile device testing
- Final launch verification

---

## **🍄 MYCELIAL STATUS**

**The fruiting body is deployed, but the mycelial network lacks critical nutrients.**

- **Frontend**: Connected and breathing
- **Backend**: Starved of database and service connections
- **Payments**: Circuits incomplete
- **Admin**: Power source disconnected

**Complete this setup to restore full mycelial flow.** 🍄⚡🔧