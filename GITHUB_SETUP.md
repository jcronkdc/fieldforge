# GitHub Repository Setup for FieldForge

## Repository: https://github.com/jcronkdc/fieldforge

## 🚀 Quick Setup

### 1. Initialize Git (if not already done)
```bash
git init
git remote add origin https://github.com/jcronkdc/fieldforge.git
```

### 2. Initial Commit
```bash
git add .
git commit -m "Initial FieldForge T&D Construction Management Platform"
git branch -M main
git push -u origin main
```

## ⚙️ Vercel Integration

### Automatic Deployment
- ✅ Already connected to Vercel project: `prj_VxsijypjnqozFi6UeKw2uENCN78c`
- Every push to `main` branch triggers automatic deployment
- Preview deployments created for pull requests

### Environment Variables in Vercel
Make sure these are configured in [Vercel Dashboard](https://vercel.com/dashboard/project/prj_VxsijypjnqozFi6UeKw2uENCN78c/settings/environment-variables):

```env
# Required
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GOOGLE_PLACES_API_KEY
VITE_GOOGLE_MAPS_API_KEY

# Optional but recommended
VITE_API_BASE_URL
VITE_WEATHER_API_KEY
VITE_MAPBOX_TOKEN
```

## 📁 Repository Structure

```
fieldforge/
├── apps/swipe-feed/        # React PWA Frontend
├── backend/                # Node.js API
│   ├── migrations/         # Database schemas
│   └── src/               # API source code
├── docs/                   # Documentation
├── README.md              # Main documentation
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── deploy.sh              # Deployment script
```

## 🔄 Workflow

### Development
1. Create feature branch
```bash
git checkout -b feature/new-feature
```

2. Make changes and commit
```bash
git add .
git commit -m "Add new feature"
```

3. Push feature branch
```bash
git push origin feature/new-feature
```

4. Create Pull Request on GitHub

### Production Deployment
1. Merge PR to main branch
2. Vercel automatically deploys to production
3. Monitor at: https://vercel.com/dashboard

### Quick Deploy Script
```bash
./deploy.sh
```

## 🏷️ Recommended Branch Protection

### Main Branch Rules
1. Go to Settings → Branches
2. Add rule for `main`
3. Enable:
   - Require pull request reviews
   - Dismiss stale pull request approvals
   - Require status checks (Vercel)
   - Require branches to be up to date
   - Include administrators

## 🔖 Git Tags for Releases

### Create Release
```bash
git tag -a v1.0.0 -m "Initial release of FieldForge"
git push origin v1.0.0
```

### Semantic Versioning
- `v1.0.0` - Major release
- `v1.1.0` - Minor features
- `v1.0.1` - Bug fixes

## 📊 GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd apps/swipe-feed
        npm ci
        
    - name: Type check
      run: |
        cd apps/swipe-feed
        npm run type-check
        
    - name: Build
      run: |
        cd apps/swipe-feed
        npm run build
```

## 🔒 Security

### Secrets Management
Never commit:
- API keys
- Database credentials  
- Service keys
- Private tokens

Use environment variables in:
- Vercel dashboard
- GitHub Secrets (for Actions)
- Local `.env` files (gitignored)

### Dependabot
Enable in Settings → Security → Dependabot:
- Dependabot alerts
- Dependabot security updates

## 📝 Commit Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

### Examples
```bash
git commit -m "feat(safety): add JSA digital signature support"
git commit -m "fix(location): resolve Google Places API timeout"
git commit -m "docs(api): update equipment endpoint documentation"
```

## 🚨 Troubleshooting

### Push Rejected
```bash
git pull --rebase origin main
git push origin main
```

### Vercel Build Failed
1. Check build logs in Vercel dashboard
2. Verify environment variables
3. Clear cache and redeploy

### Large Files
Use Git LFS for files > 100MB:
```bash
git lfs track "*.pdf"
git add .gitattributes
```

## 📞 Support

- GitHub Issues: https://github.com/jcronkdc/fieldforge/issues
- Vercel Dashboard: https://vercel.com/dashboard
- Documentation: See README.md

---

Last Updated: November 2025
