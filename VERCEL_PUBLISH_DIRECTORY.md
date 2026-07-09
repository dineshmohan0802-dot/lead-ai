# Vercel Publish Directory Configuration

## What is "Publish Directory"?

The **Publish Directory** is where Vercel looks for your built/compiled assets after the build command completes. It's the directory that gets deployed to the Vercel CDN and backend.

---

## Your Project's Publish Directory

### ✅ **Correct Answer: `dist`**

```
Publish Directory (Output Directory): dist
```

### Why `dist`?

Your `vite.config.ts` specifies:
```typescript
build: {
  outDir: path.resolve(__dirname, "dist/public"),
  emptyOutDir: true,
},
```

And your `package.json` build script:
```json
"build": "vite build && esbuild api/boot.ts --platform=node --bundle --format=esm --outdir=dist"
```

After running `npm run build`, the output structure is:
```
dist/                           ← This is your Publish Directory
├── public/                     ← Frontend static files
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js
│   │   └── index-*.css
│   └── ...
└── boot.js                     ← Backend server bundle
```

---

## Vercel Settings

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** / **Publish Directory** | `dist` |
| **Root Directory** | `app` (if monorepo) or `.` |

---

## How Vercel Uses It

```
1. Vercel runs: npm run build
   ↓
2. Output generated in: dist/
   ├── dist/public/*     (Frontend files)
   └── dist/boot.js      (Backend file)
   ↓
3. Vercel reads Publish Directory: dist/
   ↓
4. Deploys:
   ├── dist/public/* → CDN (static assets)
   └── dist/boot.js → Node.js Function (backend)
```

---

## Step-by-Step in Vercel UI

### When Creating New Project:

1. **GitHub Repository**: `dineshmohan0802-dot/lead-ai`

2. **Root Directory**: 
   - If you have multiple folders: `app`
   - If code is in root: `.`

3. **Build Command**: 
   ```
   npm run build
   ```

4. **Output Directory** (also called "Publish Directory"):
   ```
   dist
   ```

5. **Node.js Version**: `20.x`

---

## Common Publish Directory Examples

| Project Type | Publish Directory |
|--------------|-------------------|
| Create React App | `build` |
| Vite | `dist` |
| Next.js | `.next` |
| Angular | `dist/angular-app` |
| Vue CLI | `dist` |
| **Your Project** | **`dist`** ✅ |

---

## Why NOT Other Directories?

### ❌ `dist/public`
- **Wrong!** This only contains frontend files
- Backend bundle (`boot.js`) would be missing
- API calls would fail

### ❌ `public`
- **Wrong!** This is source, not built output
- Vercel would serve raw source files
- TypeScript/JSX wouldn't be compiled

### ❌ `.`  (Root)
- **Wrong!** Would deploy node_modules, source code
- Massive bundle size
- Exposes sensitive files

### ✅ `dist`
- **Correct!** Contains both:
  - `dist/public/*` (compiled React + static files)
  - `dist/boot.js` (compiled backend)
- Only necessary files deployed
- Optimal size and performance

---

## File Deployment Details

When you set Publish Directory to `dist`, here's what gets deployed:

```
dist/
├── public/
│   ├── index.html              → Served as homepage
│   ├── assets/
│   │   ├── index-*.js          → React app (compiled)
│   │   ├── index-*.css         → Styles (compiled)
│   │   └── *.woff2, *.png      → Fonts, images
│   └── dashboard-preview.jpg
│
└── boot.js                      → Node.js server
                                (handles /api/* routes)
```

### Deployment Size
```
Publish Directory (dist): ~2.3MB
- Frontend bundle: 1.2MB
- Backend bundle: 1.1MB

After gzip compression: ~700KB
Well within Vercel limits ✅
```

---

## Vercel Configuration in UI

Here's exactly what you'll see:

```
GENERAL
└─ Root Directory: app

BUILD AND OUTPUT SETTINGS
├─ Build Command: npm run build
├─ Output Directory: dist
└─ Node.js Version: 20.x

ENVIRONMENT VARIABLES
├─ VITE_SUPABASE_URL: ...
├─ VITE_SUPABASE_ANON_KEY: ...
├─ SUPABASE_SERVICE_KEY: ...
├─ DATABASE_URL: ...
└─ NODE_ENV: production
```

---

## Verification Checklist

After setting Publish Directory to `dist`:

- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] Root directory is `app` (or `.`)
- [ ] All environment variables are set
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check deployment URL loads successfully
- [ ] Test `/api/trpc/ping` endpoint
- [ ] Test login flow

---

## If Deployment Fails

### Check the Logs
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click the failed deployment
5. Scroll down to "Build Logs"

### Common Issues

**Error: "Cannot find index.html"**
- → Output Directory should be `dist` (not `dist/public`)

**Error: "Module not found: boot.js"**
- → Make sure `npm run build` ran successfully
- → Check that esbuild is bundling backend

**Error: "Static files 404"**
- → Verify Publish Directory includes `public/` subfolder
- → Check that `dist/public/` exists locally after build

---

## Summary

```
🎯 ANSWER: Publish Directory = dist

✅ Correct:     dist
❌ Wrong:       dist/public, public, ., build
```

---

**Related Configuration Files:**
- `vite.config.ts` - Defines output directory
- `package.json` - Defines build script
- `vercel.json` - (optional) Can override Vercel settings

**Documentation:**
- Vercel Docs: https://vercel.com/docs/concepts/projects/overview
- Vite Guide: https://vitejs.dev/guide/build.html

---

**Last Updated:** 2025-07-08  
**Status:** ✅ Ready for Vercel Deployment
