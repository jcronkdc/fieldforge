# Render Deployment Guide for FieldForge Backend

**⚠️ IMPORTANT**: This is for deploying FieldForge ONLY. This is completely separate from any other projects.

## 🚀 Deploy FieldForge Backend to Render

### Option 1: Deploy with Blueprint (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**: `https://github.com/jcronkdc/fieldforge`
4. **Use the blueprint file**: `backend/render.fieldforge.yaml`
5. **Name your instance**: `fieldforge-backend` (or your preference)

### Option 2: Manual Web Service Creation

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Web Service"**
3. **Connect repository**: 
   - Select or connect: `https://github.com/jcronkdc/fieldforge`
   - Branch: `main`

4. **Configure Service Settings**:
   ```
   Name: fieldforge-backend
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. **Choose Instance Type**:
   - Free tier for testing
   - Starter ($7/month) for production

### 📝 Required Environment Variables

After creating the service, add these environment variables in the Render dashboard:

#### Database Configuration
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
# Get this from Supabase: Settings → Database → Connection string

SUPABASE_URL=https://[project-id].supabase.co
# Your Supabase project URL

SUPABASE_SERVICE_KEY=eyJ...
# Supabase service role key (Settings → API → service_role)
```

#### API Keys
```bash
# Weather Service (optional)
WEATHER_API_KEY=your_openweathermap_key

# Google Places for location services
GOOGLE_PLACES_API_KEY=your_google_places_key

# Real-time messaging (optional)
ABLY_API_KEY=your_ably_key

# Authentication
JWT_SECRET=generate_a_secure_random_string
```

#### CORS Configuration
```bash
CORS_ORIGIN=https://fieldforge.vercel.app
# Or your custom domain
```

### 🔧 Generate JWT Secret

Run this command locally to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 📡 Connect Frontend to Backend

Update your frontend `.env` in Vercel:
```bash
VITE_API_BASE_URL=https://fieldforge-backend.onrender.com
# Replace with your actual Render URL
```

### 🧪 Test the Deployment

1. **Check Service Status**:
   - Go to your service in Render dashboard
   - Check "Events" tab for deployment status
   - Look for "Live" status

2. **Test Health Endpoint**:
   ```bash
   curl https://fieldforge-backend.onrender.com/health
   ```

3. **Check Logs**:
   - In Render dashboard, go to "Logs" tab
   - Look for successful startup messages

### 🚨 Troubleshooting

#### Build Failures
- Check Node version compatibility (should be 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

#### Connection Issues
- Verify DATABASE_URL is correct
- Ensure Supabase allows connections from Render IPs
- Check CORS_ORIGIN matches your frontend URL

#### Environment Variables
- All sensitive values should use "sync: false" in render.yaml
- Add them manually in Render dashboard
- Never commit secrets to Git

### 🔄 Auto-Deploy Setup

Render automatically deploys when you push to GitHub:
1. Push to `main` branch
2. Render detects changes
3. Automatically rebuilds and deploys
4. Zero-downtime deployment

### 📊 Monitoring

1. **Set up Health Checks**:
   - Path: `/health`
   - Expected response: 200 OK

2. **Configure Alerts**:
   - Go to service settings
   - Set up email/Slack alerts for failures

3. **View Metrics**:
   - CPU and Memory usage in dashboard
   - Response times and error rates

### 🎯 Production Checklist

- [ ] Upgrade from free tier to at least Starter
- [ ] Set up custom domain (optional)
- [ ] Configure auto-scaling (Team plan)
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Test all API endpoints
- [ ] Verify CORS settings
- [ ] Check rate limiting

### 📝 Notes

- **Free Tier Limitations**: Spins down after 15 mins of inactivity
- **Starter Tier**: Always on, better for production
- **Database**: Using Supabase (external) not Render's PostgreSQL
- **File Storage**: Use Supabase Storage, not local filesystem

### 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Service URL: https://fieldforge-backend.onrender.com (after deployment)
- GitHub Repo: https://github.com/jcronkdc/fieldforge

---

**Remember**: This is a completely separate deployment for FieldForge only. Do not mix with other projects.
