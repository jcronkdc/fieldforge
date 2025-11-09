# 🚀 VERCEL DEPLOYMENT GUIDE FOR FIELDFORGE

## ⚡ QUICK DEPLOYMENT STEPS

### 1. Connect GitHub Repository
If not already connected:
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import from GitHub
4. Select `jcronkdc/fieldforge` repository

### 2. Configure Build Settings
In Vercel project settings, set:

**Framework Preset:** Vite
**Root Directory:** `./`
**Build Command:** `cd apps/swipe-feed && npm install && npm run build`
**Output Directory:** `apps/swipe-feed/dist`
**Install Command:** `cd apps/swipe-feed && npm install`

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://sxjydbukmknnmncyqsff.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anlkYnVrbWtubW1uY3lxc2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwNzY1NjksImV4cCI6MjA0NjY1MjU2OX0.p2i0FpyKzwNkVJdV8BfJMCNhIpKdHZRnSLNgPsFejxE
```

### 4. Deploy
1. Click "Deploy" button
2. Wait for build to complete
3. Visit your deployment URL

## 🔧 TROUBLESHOOTING

### If deployment fails:

#### Check Build Logs
1. Go to Vercel Dashboard
2. Click on failed deployment
3. Check "Build Logs" for errors

#### Common Issues:

**Issue: Module not found errors**
- Solution: Ensure all dependencies are in package.json
- Try: `cd apps/swipe-feed && npm install --save [missing-package]`

**Issue: Build timeout**
- Solution: Optimize build or increase timeout in settings

**Issue: 404 on routes**
- Solution: Verify vercel.json rewrites are configured

**Issue: Environment variables not working**
- Solution: Redeploy after adding env vars
- Make sure to use VITE_ prefix for client-side vars

## 📋 VERIFICATION CHECKLIST

- [ ] GitHub repo connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Landing page loads
- [ ] Login works
- [ ] Routes work (no 404s)

## 🔗 IMPORTANT URLS

**Your GitHub Repo:** https://github.com/jcronkdc/fieldforge
**Vercel Dashboard:** https://vercel.com/dashboard
**Deployment URL:** [Your Vercel URL will appear here after deployment]

## 🎯 MANUAL DEPLOYMENT TRIGGER

To manually trigger a deployment:
1. Push to GitHub main branch, OR
2. In Vercel Dashboard, click "Redeploy"

## 📝 NOTES

- Vercel automatically deploys on every push to main branch
- Preview deployments created for pull requests
- Build cache speeds up subsequent deployments
- Free tier includes 100GB bandwidth/month

---

Last Updated: November 2024
Status: Production Ready
