# GDAL Installation for FieldForge (Vercel Deployment)

## ⚠️ **CRITICAL: GDAL Cannot Run on Vercel Serverless**

**Problem**: GDAL requires native binaries (C++ libraries) that cannot run in Vercel's Node.js serverless environment.

**Why**: Vercel Functions are isolated, read-only environments without system package managers (apt-get, yum, etc.).

---

## 🎯 **Solution: Deploy Backend Separately with GDAL**

### **Option A: Render.com (Recommended - Easy)**

1. **Create Render Account**: https://render.com
2. **New Web Service**: Connect GitHub repo
3. **Settings**:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add `apt-packages.txt`:
     ```
     gdal-bin
     libgdal-dev
     ```
4. **Deploy**: Render auto-installs GDAL
5. **Update Frontend**: Point `VITE_API_BASE_URL` to Render URL

**Pros**: Auto-installs GDAL, $7/month, simple  
**Cons**: Separate deployment from Vercel

---

### **Option B: Railway.app (Alternative)**

1. **Create Railway Account**: https://railway.app
2. **New Project**: Connect GitHub
3. **Add Build Pack**: `heroku/gdal`
4. **Deploy**: Railway handles GDAL

**Pros**: Modern, good DX  
**Cons**: $5/month, separate deployment

---

### **Option C: Docker Container (Most Control)**

1. **Create Dockerfile**:
```dockerfile
FROM node:22-alpine

# Install GDAL
RUN apk add --no-cache gdal gdal-dev

# Copy backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Start
CMD ["npm", "start"]
```

2. **Deploy to**: Railway, Render, Fly.io, or any Docker host

**Pros**: Full control, any host  
**Cons**: More complex setup

---

### **Option D: Separate GIS Service (Microservice)**

Keep GIS import on separate service, everything else on Vercel:

1. **Deploy GIS Service** (Render/Railway with GDAL)
   - Endpoints: `/import`, `/export`, `/transform`
   - Only handles GDAL operations

2. **Vercel Backend** calls GIS service:
   ```typescript
   // In gisRoutes.ts
   const gisServiceUrl = process.env.GIS_SERVICE_URL;
   const response = await fetch(`${gisServiceUrl}/import`, {
     method: 'POST',
     body: formData
   });
   ```

**Pros**: Vercel stays serverless, GIS service scales independently  
**Cons**: Two deployments, latency between services

---

## 🚀 **RECOMMENDED APPROACH**

**For FieldForge**: Use **Option A (Render)** for backend

**Why**:
1. Simple: One `apt-packages.txt` file
2. Auto-installs GDAL on every deploy
3. $7/month (affordable)
4. Works with existing code (no changes)
5. Still use Vercel for frontend (fast CDN)

**Architecture**:
```
Frontend (Vercel) → https://fieldforge.vercel.app
  ↓
Backend (Render) → https://fieldforge-api.onrender.com
  ↓
Database (Neon) → PostgreSQL with PostGIS
```

---

## 📝 **Deployment Steps (Render)**

1. **Sign up**: https://render.com/signup
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect GitHub**: Authorize Render
4. **Select Repo**: `FieldForge`
5. **Settings**:
   - **Name**: `fieldforge-api`
   - **Region**: Oregon (or closest to users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
6. **Add apt-packages.txt** to `/backend` directory:
   ```
   gdal-bin
   libgdal-dev
   postgresql-client
   ```
7. **Environment Variables**: Copy from Vercel
   - DATABASE_URL
   - DAILY_API_KEY
   - ABLY_API_KEY
   - ANTHROPIC_API_KEY
   - etc.
8. **Deploy**: Click "Create Web Service"
9. **Update Frontend**: In Vercel dashboard
   - Environment Variable: `VITE_API_BASE_URL` = `https://fieldforge-api.onrender.com`
   - Redeploy frontend

**Done!** Backend with GDAL on Render, frontend on Vercel.

---

## ⏱️ **Time Estimate**

- Render Setup: 15 minutes
- First Deploy: 5 minutes
- Update Frontend URL: 2 minutes
- **Total**: ~25 minutes

---

## 🧪 **Verification**

After deployment:
```bash
curl https://fieldforge-api.onrender.com/api/gis/gdal/check
```

Expected response:
```json
{
  "available": true,
  "message": "GDAL/OGR is installed and ready"
}
```

---

## 📊 **Cost Comparison**

| Service | Backend | GDAL | Cost/Month |
|---------|---------|------|------------|
| Vercel Only | ✅ | ❌ | $20 (Pro) |
| Vercel + Render | ✅ | ✅ | $27 ($20 + $7) |
| Railway | ✅ | ✅ | $5 |
| All on Render | ✅ | ✅ | $7 |

**Recommendation**: Vercel (frontend) + Render (backend) = Best UX

---

**⚠️ CURRENT STATUS**: GDAL **NOT** installed on Vercel (cannot be installed). File import will fail until backend deployed to GDAL-capable host.


