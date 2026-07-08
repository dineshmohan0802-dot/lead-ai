# Netlify Deployment Checklist

## Pre-Deployment (Do These First)

### Code Preparation
- [ ] Run `npm run build` locally and verify it succeeds
- [ ] Check `dist/` folder exists with your built files
- [ ] Run `npm run check` to verify TypeScript builds
- [ ] Run `npm run lint` to check for errors
- [ ] Test locally: `npm run dev` and verify login works

### Git Setup
- [ ] Initialize Git: `git init`
- [ ] Add files: `git add .`
- [ ] Create initial commit: `git commit -m "Initial commit"`
- [ ] Create GitHub/GitLab/Bitbucket account (if not already done)
- [ ] Create new repository on GitHub
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
- [ ] Push to main: `git push -u origin main`

### Netlify Account Setup
- [ ] Create Netlify account at https://netlify.com (free)
- [ ] Connect your GitHub account to Netlify
- [ ] Verify email

## Deployment

### Connect Repository
- [ ] Go to Netlify Dashboard
- [ ] Click "New site from Git"
- [ ] Choose GitHub
- [ ] Select your repository
- [ ] Confirm repository access

### Configure Build Settings
- [ ] Base directory: `app` (or blank if app is root)
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18 or higher (check in package.json)

### Add Environment Variables
In Netlify Site Settings → Environment:
- [ ] `VITE_SUPABASE_URL=https://ycfvpzlszzyaumepocvg.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete (usually 2-5 minutes)
- [ ] Check build logs for errors
- [ ] Verify site is live

## Post-Deployment

### Basic Testing
- [ ] Visit your Netlify URL
- [ ] Check that app loads (no 404s)
- [ ] Test page navigation
- [ ] Open Developer Console (F12) - no errors should appear
- [ ] Test responsive design on mobile

### Authentication Testing
- [ ] Navigate to /login page
- [ ] Test sign-up with valid email (e.g., test@example.com)
- [ ] Check for errors
- [ ] If successful, try signing in
- [ ] Test sign-in with wrong password (should fail)
- [ ] Test Google OAuth (if configured)
- [ ] Test GitHub OAuth (if configured)

### Database Testing
- [ ] After sign-up, check Supabase:
  - Go to Supabase Dashboard
  - Authentication → Users
  - Verify new user appears
  - SQL Editor: `SELECT * FROM users` - verify profile created

### Environment Variables
- [ ] Supabase auth is working
- [ ] No "undefined" environment variables in console
- [ ] API calls to Supabase succeed

### Analytics
- [ ] Check Netlify Analytics dashboard
- [ ] Verify traffic is being recorded
- [ ] Check for 404 errors

## Configuration Updates

### Supabase OAuth Configuration
In Supabase Dashboard → Authentication → URL Configuration:
- [ ] Add your Netlify URL: `https://your-site.netlify.app`
- [ ] Add login path: `https://your-site.netlify.app/login`
- [ ] Add dashboard path: `https://your-site.netlify.app/dashboard`

### Email Confirmation (if using)
- [ ] Disable "Confirm email" for testing
- [ ] Set up email templates if keeping it enabled
- [ ] Test email flow if using custom domain

## Continuous Deployment Setup

### Automatic Deploys
- [ ] Every `git push` to main automatically deploys
- [ ] Check Netlify Deploys tab for build history
- [ ] Verify each deploy succeeds

### Manual Redeploy
- [ ] If needed, trigger deploy from Netlify Dashboard
- [ ] Or push a new commit to trigger

## Performance & Security

### Performance
- [ ] Check Lighthouse score (should be 80+)
- [ ] Test on mobile connection (slow 3G)
- [ ] Check build time (should be < 5 minutes)
- [ ] Monitor bundle size

### Security
- [ ] Anon key is only used client-side (safe)
- [ ] Service key is NOT in repository (only in server env)
- [ ] DATABASE_URL is NOT exposed to frontend
- [ ] No secrets in git history
- [ ] Enable "Auto enable HTTPS" in Netlify

### Monitoring
- [ ] Enable Netlify Analytics
- [ ] Set up error tracking
- [ ] Monitor Supabase usage
- [ ] Check rate limits

## Troubleshooting

### Build Fails
Error: `Cannot find module`
- [ ] Check npm install succeeded: `npm install`
- [ ] Verify dependencies in package.json
- [ ] Check Node version matches locally

### Site Shows 404
- [ ] Check dist/ folder contains index.html
- [ ] Verify netlify.toml has SPA redirect
- [ ] Check Netlify site settings → routing

### Authentication Not Working
- [ ] Verify VITE_SUPABASE_URL is set correctly
- [ ] Verify VITE_SUPABASE_ANON_KEY is set correctly
- [ ] Check browser console (F12) for errors
- [ ] Check Supabase auth is enabled
- [ ] Test `/test-auth` page for diagnostics

### Environment Variables Not Loading
- [ ] Rebuild after adding env vars: trigger deploy
- [ ] Wait 1-2 minutes for propagation
- [ ] Check Site settings → Build & deploy → Environment
- [ ] Verify variable names exactly match code

## Monitoring & Maintenance

### Daily
- [ ] Check site is accessible
- [ ] Monitor error logs
- [ ] Check Supabase usage

### Weekly
- [ ] Review analytics
- [ ] Check for security updates
- [ ] Update dependencies: `npm outdated`

### Monthly
- [ ] Run full test suite: `npm run test`
- [ ] Review build logs
- [ ] Check performance metrics
- [ ] Backup database

## Rollback (If Needed)

### Revert to Previous Deploy
1. Netlify Dashboard → Deploys
2. Find previous working deploy
3. Click "Publish deploy"
4. Site reverts to that version

### Revert Code
```bash
git revert HEAD
git push origin main
# Netlify automatically redeploys
```

## Going Live

### Pre-Launch
- [ ] All tests passing
- [ ] Email confirmation working or disabled
- [ ] OAuth configured (Google, GitHub)
- [ ] Custom domain set up (optional)
- [ ] SSL certificate generated (automatic on Netlify)
- [ ] Analytics enabled
- [ ] Backup strategy in place

### Launch
- [ ] Share Netlify URL
- [ ] Monitor for errors
- [ ] Support any user issues
- [ ] Keep monitoring dashboard open

### Post-Launch
- [ ] Collect user feedback
- [ ] Monitor performance
- [ ] Fix any issues
- [ ] Plan feature updates

## Useful Commands

```bash
# Local testing
npm run dev              # Start dev server
npm run build            # Build for production
npm run check            # TypeScript check
npm run lint             # Lint code

# Git
git add .                # Stage changes
git commit -m "message"  # Commit
git push origin main     # Push to GitHub

# Deployment
npm install -g netlify-cli  # Install Netlify CLI
netlify login               # Login to Netlify
netlify deploy --prod       # Deploy from CLI
```

## Support Resources

- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)

---

**Total Time to Deploy:** ~30 minutes  
**Cost:** FREE (both Netlify and Supabase free tiers)

You're almost there! 🚀
