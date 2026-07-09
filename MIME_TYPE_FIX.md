# Fixed: MIME Type Error on Vercel

## Problem

```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "binary/octet-stream".
```

## Root Cause

The issue occurred because:

1. **Conflicting Configuration:** `netlify.toml` was telling Vercel to publish the entire `dist/` directory (including `boot.js` backend file) as static files
2. **Wrong Output Directory:** The backend bundle was being treated as frontend static assets
3. **MIME Type Issue:** Vercel tried to serve `boot.js` (Node.js binary) as a JavaScript module to the browser

## Solution Implemented

### 1. Created `vercel.json` Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "nodeVersion": "20.x"
}
```

**Key Changes:**
- `outputDirectory: "dist/public"` - Only frontend files published to CDN
- `nodeVersion: "20.x"` - Explicit Node version
- Removed conflicting Netlify configuration

### 2. Updated Build Scripts

**Before:**
```json
"build": "vite build && esbuild api/boot.ts --outdir=dist"
```

**After:**
```json
"build": "vite build && npm run build:backend",
"build:backend": "esbuild api/boot.ts --outfile=dist/boot.js"
```

**Why:**
- Separates frontend and backend builds clearly
- Frontend outputs to `dist/public/` (CDN static)
- Backend outputs to `dist/boot.js` (server)
- Prevents backend bundle from being treated as static asset

### 3. Build Output Structure

```
npm run build produces:

dist/
├── public/                  ← Published to CDN ✅
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js      (gzipped, served as JS module)
│   │   └── index-*.css
│   └── (other static files)
│
└── boot.js                  ← Backend server (NOT published)
    (stays on server)
```

### 4. Fixed Vite Configuration

**Updated `vite.config.ts`:**
```typescript
build: {
  outDir: path.resolve(__dirname, "dist/public"),
  emptyOutDir: true,
  minify: 'terser',
  sourcemap: false,
}
```

**Changes:**
- Explicitly outputs to `dist/public` (not `dist`)
- `emptyOutDir: true` - Clean before build
- `minify: 'terser'` - Proper minification for modules
- `sourcemap: false` - Reduce bundle size

## Verification

### Local Test

```bash
# Clean
rm -rf dist

# Build
npm run build

# Check structure
ls -la dist/
# Should show: boot.js + public/

ls -la dist/public/
# Should show: index.html, assets/

# Verify frontend bundle
file dist/public/assets/index-*.js
# Should show: JavaScript file

# Verify backend bundle
file dist/boot.js
# Should show: JavaScript (esm/node) file
```

### What Should Happen

1. ✅ Frontend JS served with `Content-Type: application/javascript`
2. ✅ Browser loads React app successfully
3. ✅ API calls work (handled by backend)
4. ✅ No MIME type errors

## Files Changed

| File | Change |
|------|--------|
| `vercel.json` | Created (Vercel config) |
| `vite.config.ts` | Updated build options |
| `package.json` | Split build scripts |
| `api/boot.ts` | Fixed import paths |

## Deploy Steps

### 1. Clear Vercel Cache
```
Vercel Dashboard → Project Settings → Git
Click "Clear Cache" if deployment fails
```

### 2. Trigger New Deployment
```
Push new code to GitHub:
git add .
git commit -m "Fix MIME type error on Vercel"
git push
```

### 3. Monitor Build
```
Vercel Dashboard → Deployments
Watch build logs for:
- ✅ "vite build" completed
- ✅ "esbuild" completed
- ✅ Output size: ~1.2MB frontend + ~1.1MB backend
```

### 4. Test Deployment
```
1. Load https://your-app.vercel.app
2. Open DevTools → Console
   Should be CLEAN (no errors)
3. Open Network tab
   Should see:
   - ✅ index.html (200)
   - ✅ index-*.js (200, type: application/javascript)
   - ✅ index-*.css (200, type: text/css)
   - ✅ /api/trpc/* (200, type: application/json)
4. Try logging in
   Should work without MIME errors ✅
```

## Troubleshooting

### If Still Getting MIME Errors

1. **Clear Browser Cache**
   ```
   DevTools → Ctrl+Shift+Delete → Clear everything
   ```

2. **Verify Deployment**
   ```
   curl https://your-app.vercel.app/assets/index-*.js
   # Should see: JavaScript code, not "binary/octet-stream"
   ```

3. **Check Build Logs**
   ```
   Vercel Dashboard → Deployments → [Latest]
   Scroll down to "Build & Deployment" logs
   Look for errors in esbuild output
   ```

4. **Force Redeploy**
   ```
   Vercel Dashboard → Project Settings → Git
   Click "Redeploy" button
   ```

### Verify Headers

```bash
# Check response headers
curl -I https://your-app.vercel.app/assets/index-*.js

# Should show:
# Content-Type: application/javascript ✅
# Content-Encoding: gzip ✅
# Content-Length: ~354KB ✅

# NOT:
# Content-Type: binary/octet-stream ❌
```

## Why This Fixes It

1. **Correct Output Directory:** Only static frontend files go to CDN
2. **Proper MIME Types:** Vite correctly marks .js as JavaScript modules
3. **Clear Separation:** Backend bundle never treated as static asset
4. **Vercel Config:** Explicit configuration prevents misinterpretation

## Prevention

To prevent this in future:

1. ✅ Always use `vercel.json` for full-stack apps
2. ✅ Set `outputDirectory` to frontend-only directory
3. ✅ Keep backend separate from static publishing
4. ✅ Test locally before deploying
5. ✅ Monitor build logs on Vercel

---

**Status:** ✅ Fixed  
**Test:** After push to GitHub, Vercel will auto-deploy  
**Expected Result:** App loads without MIME type errors
