# Deployment Setup for MythaTron (Swipe Feed)

## Automatic Deployment Configuration

### Current Setup
- **Production URL**: https://mythatron.com
- **Alternative URL**: https://www.mythatron.com
- **Vercel Project**: mythaforge
- **GitHub Repository**: https://github.com/jcronkdc/greatest

### GitHub Actions Deployment (Recommended)

To ensure automatic deployments work correctly, you need to set up the following GitHub secrets:

1. Go to https://github.com/jcronkdc/greatest/settings/secrets/actions

2. Add the following secrets:

   - **VERCEL_ORG_ID**: `team_WeBoOSXWzKGtRgHXfRURkxyZ`
   - **VERCEL_PROJECT_ID**: `prj_aMFQM92BOICkLRGYPurYrMqeQjAi`
   - **VERCEL_TOKEN**: (Get this from Vercel)
     1. Go to https://vercel.com/account/tokens
     2. Click "Create Token"
     3. Name it "GitHub Actions Deploy"
     4. Copy the token and save it as the GitHub secret

### How It Works

1. **Automatic Trigger**: When you push to the `main` branch and changes are detected in `apps/swipe-feed/`, the deployment automatically starts.

2. **Build & Deploy**: GitHub Actions will:
   - Install dependencies
   - Build the project
   - Deploy to Vercel
   - Automatically update mythatron.com and www.mythatron.com to point to the new deployment

3. **No Manual Steps**: Once configured, you never need to manually update domain aliases again.

### Manual Deployment (Backup Method)

If you need to deploy manually:

```bash
cd apps/swipe-feed
vercel --prod --yes
```

Then update the aliases (replace URL with the deployment URL):
```bash
vercel alias set [deployment-url] mythatron.com
vercel alias set [deployment-url] www.mythatron.com
```

### Troubleshooting

- **Deployment not triggering**: Check that changes were made in `apps/swipe-feed/` directory
- **Build failures**: Check GitHub Actions logs at https://github.com/jcronkdc/greatest/actions
- **Domain not updating**: Verify the VERCEL_TOKEN has proper permissions

### Benefits of This Setup

✅ **Automatic**: No manual intervention needed after pushing to GitHub
✅ **Consistent**: Domains always point to the latest successful deployment
✅ **Reliable**: GitHub Actions provides clear logs and error messages
✅ **Fast**: Deployments complete in ~1-2 minutes
✅ **Safe**: Only deploys when build succeeds
