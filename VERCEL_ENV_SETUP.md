# Vercel Environment Variables Setup

## Required Environment Variables

You need to add these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
1. Navigate to your project
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar

### 2. Add These Variables

| Variable Name | Description | Where to Find It |
|--------------|-------------|------------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Settings → API |
| `VITE_GOOGLE_PLACES_API_KEY` | Google Places API key | Google Cloud Console |

### 3. Example Values Format

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_PLACES_API_KEY=AIzaSy...
```

## Important Notes

⚠️ **VITE_ Prefix Required**: All client-side environment variables in Vite must be prefixed with `VITE_`

⚠️ **Apply to All Environments**: Make sure to add these variables for:
- Production
- Preview
- Development

## After Adding Variables

1. **Redeploy your project** for changes to take effect
2. **Verify routes work** by visiting `/test-routing` on your deployed site
3. **Test authentication** by trying to log in with the demo account:
   - Email: `demo@fieldforge.com`
   - Password: `FieldForge2025!Demo`

## Troubleshooting

### If routes return 404:
- Verify `vercel.json` exists with proper rewrites
- Check that the build output directory is `dist`

### If authentication fails:
- Verify Supabase URL and anon key are correct
- Check that the values don't have extra spaces or quotes
- Ensure variables are prefixed with `VITE_`

### If the app shows blank page:
- Check browser console for errors
- Verify all environment variables are set
- Check build logs in Vercel dashboard

## Build Command Verification

In Vercel project settings, ensure:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` or leave as auto-detected
- **Output Directory**: `dist`
- **Install Command**: `npm install` or leave as auto-detected

## Test URLs After Deployment

Once deployed, test these URLs:
- `/` - Should show futuristic landing page
- `/test-routing` - Should show route testing page
- `/login` - Should show login page
- `/signup` - Should show signup page
- `/dashboard` - Should redirect to `/` if not logged in

## Support

If issues persist after following this guide:
1. Check Vercel build logs for errors
2. Verify all environment variables are correctly set
3. Test locally with the same environment variables
4. Clear browser cache and try again