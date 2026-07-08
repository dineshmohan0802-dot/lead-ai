# Quick Netlify Setup - 5 Minutes ⚡

## Step 1: Build Locally (2 mins)

```bash
cd "d:\Kimi_Agent_AI Lead Intelligence Platform\app"
npm run build
```

✓ Should see: `dist/` folder created with your build

## Step 2: Initialize Git (1 min)

```bash
# If not already done
git init
git add .
git commit -m "Initial commit - ready for Netlify"
```

## Step 3: Push to GitHub (2 mins)

1. Go to https://github.com/new
2. Create new repository (name: `leadnexus` or similar)
3. Copy the HTTPS URL
4. Run in terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/leadnexus.git
git branch -M main
git push -u origin main
```

Wait for upload to complete.

## Step 4: Deploy to Netlify (Automatic)

1. Go to https://netlify.com
2. Click **Sign up** (use GitHub option)
3. Authorize Netlify to access your GitHub
4. Click **New site from Git**
5. Choose your repository
6. Configure:
   - Base directory: `app`
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click **Save**
8. Wait for build to complete (~2 minutes)

✓ Your site is now live! You'll get a URL like `https://xxx.netlify.app`

## Step 5: Add Environment Variables (1 min)

1. In Netlify, click **Site settings** → **Build & deploy** → **Environment**
2. Click **Add environment variables**
3. Add these two variables:

```
VITE_SUPABASE_URL
https://ycfvpzlszzyaumepocvg.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZnZwemxzenp5YXVtZXBvY3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDM4NzMsImV4cCI6MjA5OTA3OTg3M30.4WIaN7FdI58w0T4oHzPfbB2-vk8zFKk85CDLLhhaclE
```

4. Go to **Deploys** tab
5. Click **Trigger deploy** → **Deploy site**
6. Wait for build (~3 minutes)

✓ Now your site has the environment variables loaded!

## Step 6: Update Supabase OAuth (1 min)

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your Netlify URL (from step 4):
   - `https://your-site.netlify.app`
   - `https://your-site.netlify.app/login`
4. Save

## Step 7: Test! (1 min)

1. Visit your Netlify URL
2. Click **Sign up**
3. Enter email and password
4. Should work! ✓

If issues:
- Check browser console (F12)
- Visit `/test-auth` for diagnostics
- See troubleshooting guide below

---

## That's It! 🎉

Your site is now:
- ✓ Deployed on Netlify (free)
- ✓ Connected to Supabase (free)
- ✓ Auto-updates on git push
- ✓ HTTPS enabled
- ✓ Global CDN

## Quick Reference

| Item | Location |
|------|----------|
| Your Site URL | Netlify Dashboard → Site overview |
| Build Logs | Netlify Dashboard → Deploys → Recent Deploy |
| Environment Vars | Netlify Dashboard → Site settings → Build & deploy → Environment |
| Git Repo | GitHub → Your Repository |
| Database | Supabase Dashboard → SQL Editor |
| Auth Users | Supabase Dashboard → Authentication → Users |

## Next Steps

1. **Share your URL** - Send `https://your-site.netlify.app` to friends
2. **Set up custom domain** (optional) - Netlify Settings → Domain management
3. **Enable email confirmation** (optional) - Supabase Auth settings
4. **Configure OAuth** (optional) - Supabase Providers

## Troubleshooting

### Site Won't Load
- [ ] Check Netlify build succeeded (green checkmark on Deploys)
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check site settings are correct

### Sign Up Fails
- [ ] Check `/test-auth` page for diagnostics
- [ ] Disable "Confirm email" in Supabase (for testing)
- [ ] Check console (F12) for errors

### Can't Sign In
- [ ] Use same email/password you signed up with
- [ ] Verify email confirmation is disabled in Supabase
- [ ] Check browser console (F12)

### Environment Variables Not Working
- [ ] Add to Netlify Site settings
- [ ] Trigger new deploy
- [ ] Wait 2 minutes for propagation

## Getting Help

1. **Check logs** - Netlify Dashboard → Deploys → Click deploy
2. **Browser console** - F12 → Console tab
3. **Test page** - Visit `/test-auth`
4. **Supabase status** - https://status.supabase.com

---

**Deployment Time:** 5-10 minutes total  
**Cost:** FREE 💰  
**Result:** Your site is live on the internet! 🌍

Congratulations! Your app is now deployed! 🚀
