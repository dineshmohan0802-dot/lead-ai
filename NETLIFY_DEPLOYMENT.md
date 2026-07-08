# Deploy to Netlify

## Option 1: Frontend-Only Deployment (Recommended for Now)

Since your app uses Supabase for the backend, you can deploy just the frontend to Netlify while keeping the backend calls to Supabase.

### Prerequisites
- Netlify account (free at https://netlify.com)
- GitHub account with your repo (or Netlify Git integration)
- Supabase project already set up

### Step 1: Prepare Your Project

```bash
# From your project directory
cd d:\Kimi_Agent_AI\ Lead\ Intelligence\ Platform\app

# Make sure everything is built
npm run build

# Verify build output exists in dist/
```

### Step 2: Create .env.production

The Vite environment variables need to be exposed for the frontend build:

```bash
# Create .env.production in your app directory
VITE_SUPABASE_URL=https://ycfvpzlszzyaumepocvg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZnZwemxzenp5YXVtZXBvY3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDM4NzMsImV4cCI6MjA5OTA3OTg3M30.4WIaN7FdI58w0T4oHzPfbB2-vk8zFKk85CDLLhhaclE
```

### Step 3: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - ready for Netlify deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 4: Connect to Netlify

**Option A: Via Netlify UI (Easiest)**

1. Go to https://netlify.com
2. Sign in with GitHub
3. Click **"New site from Git"**
4. Choose **GitHub** as your Git provider
5. Select your repository
6. Configure build settings:
   - **Base directory:** `app` (or `.` if app is root)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
7. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://ycfvpzlszzyaumepocvg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
8. Click **Deploy site**

**Option B: Via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# From your app directory
cd app

# Deploy
netlify deploy --prod --dir=dist --functions=dist
```

### Step 5: Configure Environment Variables in Netlify

1. Go to your site on Netlify dashboard
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Add these environment variables:
   ```
   VITE_SUPABASE_URL=https://ycfvpzlszzyaumepocvg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Deploy site**

### Step 6: Update Supabase OAuth Settings

In Supabase Dashboard, add your Netlify URL to OAuth redirect URIs:

1. Go to **Authentication** → **URL Configuration**
2. Add your Netlify URL:
   ```
   https://your-site-name.netlify.app
   https://your-site-name.netlify.app/login
   ```
3. Save changes

### Step 7: Test Your Deployment

1. Visit your Netlify URL (e.g., https://your-site-name.netlify.app)
2. Try signing up with email/password
3. Try signing in
4. Test Google/GitHub OAuth if enabled

## Option 2: Full-Stack Deployment (Advanced)

If you want to deploy both frontend AND backend to Netlify, use Netlify Functions:

### Benefits
- Single deployment for frontend + backend
- API routes handled by Netlify Functions
- Database still on Supabase

### Challenges
- Requires restructuring the code
- PostgreSQL connection strings need to be secure
- More complex configuration

### Implementation
[See Netlify Functions setup below]

## Troubleshooting

### Build Fails
```
Error: Cannot find module 'postgres'
```
**Solution:** Add to package.json devDependencies:
```json
"postgres": "^3.4.4"
```

### 404 on Page Refresh
**Solution:** netlify.toml includes SPA fallback redirect. Ensure it's configured.

### Environment Variables Not Loading
**Solution:** 
1. Restart deploy after adding env vars
2. Check Netlify site settings
3. Rebuild: **Deploys** → **Trigger deploy**

### CORS Errors
**Solution:**
1. Check Supabase CORS settings
2. Add Netlify domain to allowed origins
3. Update OAuth redirect URIs

### Authentication Not Working
**Solution:**
1. Verify VITE_ prefixed env vars are exposed to frontend
2. Check Supabase auth is enabled
3. Verify email confirmation is disabled (for testing)
4. Check browser console (F12) for detailed errors

## Monitoring Your Site

### View Logs
1. Netlify Dashboard → **Deploys**
2. Click latest deploy
3. View build logs and runtime logs

### Monitor Errors
1. **Analytics** tab shows traffic and errors
2. **Functions** tab shows API call logs
3. Browser console shows client-side errors

## Updating Your Site

### Automatic Deploys (via Git)
```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main
# Netlify automatically rebuilds!
```

### Manual Redeploy
1. Netlify Dashboard → **Deploys** → **Trigger deploy**

## Accessing Build Artifacts

1. **Netlify Dashboard** → Your Site
2. **Deploys** tab shows all deployments
3. Click any deploy to see:
   - Build logs
   - Deployment info
   - Site snapshot

## Next Steps

1. **Create GitHub repo** with your code
2. **Sign up for Netlify** (free tier is fine)
3. **Connect your repository** to Netlify
4. **Add environment variables**
5. **Deploy!**
6. **Test thoroughly** before sharing URL

## Environment Variables Reference

### Frontend (VITE_ prefix - exposed to browser)
```
VITE_SUPABASE_URL=https://ycfvpzlszzyaumepocvg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Backend (No prefix - kept secret on server)
```
SUPABASE_SERVICE_KEY=eyJ...
DATABASE_URL=postgresql://...
```

Note: Only VITE_ prefixed variables are sent to the browser. Others stay secret on the server.

## Cost

- **Netlify Free Tier:** 
  - 300 build minutes per month
  - Unlimited deployments
  - FREE! 🎉
- **Supabase Free Tier:**
  - 500MB database storage
  - Up to 2 concurrent connections
  - FREE! 🎉

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Forums](https://community.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)

Your site will be live in minutes! 🚀
