# Vercel Environment Variables Setup for FieldForge

## Your Supabase Project Details

I've retrieved your actual Supabase credentials through MCP:
- Project Reference: `lzfzkrylexsarpxypktt`
- Project URL: `https://lzfzkrylexsarpxypktt.supabase.co`

## Required Environment Variables

You need to add these to your Vercel project:

### 1. Supabase Configuration

```bash
VITE_SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZnprcnlsZXhzYXJweHlwa3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzU4NTMsImV4cCI6MjA3ODAxMTg1M30.NkvmFfttYQ-DUpG3KLK10AGrJRS9OlQ-83XXX6CU7cY
```

## How to Get Your Supabase Anon Key

✅ **Already Retrieved!** I've obtained your anon key through the MCP connection.

If you need to access your Supabase Dashboard:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **API** under Configuration
4. Find the **anon public** key (it starts with `eyJ...`)
5. Copy this entire key

## How to Add to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard/project/prj_VxsijypjnqozFi6UeKw2uENCN78c
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - Click **Add New**
   - Enter the Key (e.g., `VITE_SUPABASE_URL`)
   - Enter the Value
   - Select environments (Production, Preview, Development)
   - Click **Save**

### Option 2: Via Vercel CLI

If you have Vercel CLI installed:

```bash
# Set Supabase URL
vercel env add VITE_SUPABASE_URL production
# When prompted, enter: https://lzfzkrylexsarpxypktt.supabase.co

# Set Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production
# When prompted, paste the anon key provided above
```

## All Environment Variables to Add

| Variable Name | Value | Required |
|--------------|-------|----------|
| `VITE_SUPABASE_URL` | `https://lzfzkrylexsarpxypktt.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | See key above (starts with `eyJhbGc...`) | ✅ Yes |
| `VITE_API_BASE_URL` | Leave empty for now | ❌ No |
| `VITE_GOOGLE_PLACES_API_KEY` | Your Google API key (if you have one) | ❌ No |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps key (if you have one) | ❌ No |

## Quick Vercel Dashboard Link

**Direct link to add environment variables:**
https://vercel.com/dashboard/project/prj_VxsijypjnqozFi6UeKw2uENCN78c/settings/environment-variables

## After Adding Variables

1. **Redeploy** your application:
   - Go to Deployments tab in Vercel
   - Click the three dots on the latest deployment
   - Select "Redeploy"
   - Choose "Use existing Build Cache" ❌ (unchecked)
   - Click "Redeploy"

2. **Verify** the deployment:
   - Check build logs for success
   - Visit https://fieldforge.vercel.app
   - The login page should load without errors

## Testing the Connection

Once deployed with proper environment variables:
1. Go to https://fieldforge.vercel.app
2. Try the "Demo Account" button
3. Or create a new account with Sign Up

## Your Anon Key (Retrieved via MCP)

✅ I've already retrieved your anon key. It's included in the configuration above.
Copy the entire key when adding it to Vercel.

---

**Your Supabase Project Dashboard Direct Link:**
https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt
