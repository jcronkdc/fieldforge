# 🚀 DEPLOY BACKEND IN 5 MINUTES!

## ✨ ONE-CLICK DEPLOY TO RENDER

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jcronkdc/greatest)

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Click Deploy Button
Click the blue "Deploy to Render" button above (or go to https://render.com)

### Step 2: Sign Up/Login
- Use GitHub to sign up (easiest)
- Or create account with email

### Step 3: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account
3. Select the **`greatest`** repository
4. Fill in these settings:

**Service Settings:**
- **Name:** `mythatron-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free` ($0/month)

### Step 4: Add Environment Variables
Click "Advanced" and add these environment variables:

```env
DATABASE_URL=postgresql://[YOUR_SUPABASE_CONNECTION_STRING]
AI_PROVIDER_API_KEY=sk-ant-api03-[YOUR_CLAUDE_KEY]
AI_PROVIDER_URL=https://api.anthropic.com/v1
AI_PROVIDER_MODEL=claude-3-haiku-20240307
NODE_ENV=production
PORT=4000
```

**Optional (add later if you have them):**
```env
STRIPE_SECRET_KEY=sk_test_[YOUR_STRIPE_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
ABLY_API_KEY=[YOUR_ABLY_KEY]
```

### Step 5: Click "Create Web Service"
- Render will start building your backend
- Takes about 5-10 minutes
- You'll get a URL like: `https://mythatron-backend.onrender.com`

### Step 6: Update Frontend to Use Backend URL
In your Vercel project settings, add environment variable:
```env
VITE_API_BASE_URL=https://mythatron-backend.onrender.com
```

Then redeploy frontend on Vercel.

## 🔍 WHERE TO FIND YOUR KEYS

### Database URL (Supabase):
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → Database
4. Connection string → URI (copy this)

### Claude API Key:
1. Go to https://console.anthropic.com
2. Settings → API Keys
3. Copy your key (starts with `sk-ant-`)

### Your Backend URL (after deployment):
Will be: `https://mythatron-backend.onrender.com`

## ✅ VERIFY IT'S WORKING

1. **Check backend health:**
   Visit: `https://mythatron-backend.onrender.com/health`
   Should see: `{"status":"ok","timestamp":"..."}`

2. **Check frontend connection:**
   - Go to your app
   - Try creating an account
   - Should work without errors

## 🆘 TROUBLESHOOTING

### "Build failed"
- Check logs in Render dashboard
- Usually missing environment variable

### "Cannot connect to database"
- Verify DATABASE_URL is correct
- Check Supabase is running

### "AI features not working"
- Verify AI_PROVIDER_API_KEY is set
- Check you have credits in your Anthropic account

## 📊 WHAT HAPPENS AFTER DEPLOYMENT

Once deployed, your backend will:
- ✅ Handle all API requests from frontend
- ✅ Connect to Supabase database
- ✅ Process AI requests with Claude
- ✅ Handle user authentication
- ✅ Process Sparks purchases (when Stripe is configured)
- ✅ Auto-restart if it crashes
- ✅ Auto-deploy when you push to GitHub

## 🎯 QUICK COPY-PASTE SETUP

Just copy these values into Render:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Root Directory:**
```
backend
```

## 💡 FINAL STEP

After backend is deployed, update your frontend:

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add: `VITE_API_BASE_URL` = `https://mythatron-backend.onrender.com`
4. Redeploy

**That's it! Your app is now FULLY DEPLOYED!** 🎉
