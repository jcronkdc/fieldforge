# 🔧 MythaTron Troubleshooting Guide

## Fixed Issues

### ✅ "Oops! Something went wrong" Error on Landing Page
**Problem:** ErrorBoundary was catching an error due to duplicate AuthContext files and mismatched imports.

**Solution:**
1. Consolidated all imports to use `/context/AuthContext` (singular)
2. Removed duplicate `/contexts/` folder
3. Fixed all import paths across 7 files

**Files Fixed:**
- `components/feedback/FeedbackWidget.tsx`
- `components/angry-lips/EnhancedAngryLips.tsx`
- `components/notifications/NotificationCenter.tsx`
- `components/sparks/SparksPurchase.tsx`
- `components/das/DasPreferencesPanel.tsx`
- `components/das/DasTransparencyDashboard.tsx`
- `components/das/DasVotingPanel.tsx`

---

## Common Issues & Solutions

### 🔴 Backend Not Connected
**Symptoms:** API calls fail, no data loads

**Solution:**
1. Deploy backend to Render
2. Set `VITE_API_BASE_URL` in Vercel environment variables
3. Redeploy frontend without cache

### 🔴 Supabase Connection Issues
**Symptoms:** Can't log in, profile doesn't load

**Check:**
1. Supabase URL and anon key in `.env.local`
2. RLS policies are enabled
3. User profiles table exists

### 🔴 Build Failures
**Common Causes:**
1. Missing dependencies → Run `npm install`
2. TypeScript errors → Run `npm run build:strict` locally
3. Import errors → Check file paths

### 🔴 Real-time Features Not Working
**Cause:** Ably not configured

**Solution:**
1. Get Ably API key
2. Add to backend `.env`
3. Features work without it, just not real-time

---

## Testing Checklist

### Local Testing
```bash
# Frontend
cd apps/swipe-feed
npm install
npm run dev
# Visit http://localhost:5173

# Backend
cd backend
npm install
npm run dev
# API at http://localhost:3001
```

### Production Testing
1. Visit https://www.mythatron.com
2. Open browser console (F12)
3. Check for red errors
4. Test login flow
5. Test Angry Lips creation

---

## Environment Variables

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx (optional)
```

### Backend (Render)
```env
DATABASE_URL=your_supabase_connection_string
AI_PROVIDER_API_KEY=your_openrouter_key
AI_PROVIDER_URL=https://openrouter.ai/api/v1
AI_PROVIDER_MODEL=anthropic/claude-3-haiku
STRIPE_SECRET_KEY=sk_test_xxx (optional)
ABLY_API_KEY=xxx (optional)
```

---

## Debug Commands

### Check what's deployed
```bash
git log --oneline -5  # Recent commits
git status            # Local changes
npm list             # Installed packages
```

### Test API endpoints
```bash
# Health check
curl https://your-backend.onrender.com/health

# Test Supabase
curl https://your-project.supabase.co/rest/v1/user_profiles
```

---

## Getting Help

1. **Check browser console** for specific errors
2. **Check Vercel logs** at vercel.com/dashboard
3. **Check Render logs** at dashboard.render.com
4. **Check Supabase logs** in Supabase dashboard

## Success Indicators

✅ No red errors in browser console
✅ Can create account and log in
✅ Profile loads after login
✅ Can create Angry Lips session
✅ Feed displays (even if empty)
✅ No ErrorBoundary crashes
