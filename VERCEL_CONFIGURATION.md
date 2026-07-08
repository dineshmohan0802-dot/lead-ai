# Vercel Configuration for LeadNexus

## Framework Stack

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Router:** React Router 7.6.1
- **Styling:** Tailwind CSS 3.4.19 + PostCSS

### Backend
- **Runtime:** Node.js (ESM)
- **Framework:** Hono 4.8.3 (lightweight web framework)
- **Server:** @hono/node-server 1.14.3
- **API:** tRPC (TypeScript RPC)
- **Database ORM:** Drizzle ORM 0.45.1
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth + JWT

### Package Type
- **Type:** ESM (ES Modules)
- **Node Version:** 18.x or higher (recommend 20.x)

---

## Vercel Configuration

### Build Command
```bash
npm run build
```

**What it does:**
1. Runs `vite build` → Builds React frontend to `dist/public/`
2. Runs `esbuild` → Bundles backend `api/boot.ts` to `dist/boot.js`

### Output Directory
```
dist/
├── public/              # Frontend static files & HTML
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.css
│   │   └── index-*.js
│   └── ...
└── boot.js              # Backend server bundle
```

### Start Command
```bash
NODE_ENV=production node dist/boot.js
```

### Install Command
```bash
npm ci
```
(or `npm install`)

---

## Vercel Settings

### Build & Deployment

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |
| **Node.js Version** | 20.x (recommended) |
| **Root Directory** | `.` (app folder) |

### Framework Detection
- **Auto-detected as:** Other (Custom)
- **Reason:** Hono + React hybrid setup (not standard Next.js)

### Environment Variables
```
# Frontend (exposed via VITE_ prefix)
VITE_SUPABASE_URL=https://ycfvpzlszzyaumepocvg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Backend (server-side only)
SUPABASE_SERVICE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:password@db.host:5432/postgres
NODE_ENV=production
OWNER_USER_ID=optional-user-id
```

---

## Project Structure

```
app/
├── src/                          # React frontend
│   ├── pages/                    # Page components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Leads.tsx
│   │   ├── Outreach.tsx
│   │   └── ...
│   ├── components/               # Shared components
│   │   ├── ui/                   # Radix UI components
│   │   └── AppLayout.tsx
│   ├── hooks/                    # React hooks
│   │   └── useAuth.ts
│   ├── providers/                # Context & providers
│   │   └── trpc.ts
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
│
├── api/                          # Backend (Hono)
│   ├── boot.ts                   # Server entry point
│   ├── router.ts                 # Main router
│   ├── context.ts                # tRPC context
│   ├── middleware.ts             # Auth middleware
│   ├── *-router.ts               # Feature routers
│   │   ├── auth-router.ts
│   │   ├── lead-router.ts
│   │   ├── dashboard-router.ts
│   │   └── ...
│   ├── kimi/                     # Auth integrations
│   │   ├── auth.ts               # Supabase auth
│   │   └── supabase.ts
│   ├── queries/                  # Database queries
│   │   ├── connection.ts
│   │   └── users.ts
│   └── lib/                      # Utilities
│       ├── env.ts
│       ├── cookies.ts
│       ├── http.ts
│       └── vite.ts
│
├── db/                           # Database
│   ├── schema.ts                 # Drizzle ORM schema
│   ├── relations.ts
│   ├── seed.ts
│   └── migrations/
│       ├── 0000_yummy_marvex.sql
│       └── 0001_create_enums.sql
│
├── contracts/                    # Shared types
│   ├── types.ts
│   ├── constants.ts
│   └── errors.ts
│
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind config
├── package.json                  # Dependencies
└── index.html                    # HTML entry point
```

---

## How It Works on Vercel

### 1. **Build Phase**
```
Vercel runs: npm run build

Step 1: vite build
  - Transpiles React + TypeScript
  - Bundles frontend code
  - Outputs to dist/public/

Step 2: esbuild api/boot.ts
  - Bundles backend Hono server
  - Outputs to dist/boot.js
  - Total size: ~1.1MB
```

### 2. **Deployment Phase**
```
Vercel deploys:
  - dist/public/* → CDN (static files)
  - dist/boot.js → Node.js Function
```

### 3. **Runtime Phase**
```
When request arrives at vercel-url.com:

If path matches /api/*:
  → Routes to dist/boot.js (Hono server)
  → Processes tRPC request
  → Queries PostgreSQL via Supabase
  → Returns JSON response

If path matches everything else:
  → Serves from dist/public/ (React app)
  → Loads React SPA in browser
  → Client makes API calls to /api/trpc/*
```

---

## API Routes

All API routes are prefixed with `/api/trpc/`:

### Available Routes
| Route | Purpose |
|-------|---------|
| `/api/trpc/auth.me` | Get current user |
| `/api/trpc/auth.logout` | Sign out |
| `/api/trpc/lead.list` | Fetch leads |
| `/api/trpc/lead.get` | Get lead details |
| `/api/trpc/dashboard.stats` | Dashboard stats |
| `/api/trpc/organization.*` | Org management |
| `/api/trpc/outreach.*` | Message generation |
| And more... | See `api/router.ts` |

### Example API Call
```javascript
// Frontend client
const { data } = trpc.lead.list.useQuery({
  orgId: 1,
  limit: 20,
});

// GET /api/trpc/lead.list?input={"orgId":1,"limit":20}
// POST /api/trpc/lead.list with JSON body
```

---

## Environment Variables in Vercel

### Public Variables (Frontend - `VITE_` prefix)
These are accessible in the browser:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key for auth

### Secret Variables (Backend - no prefix)
These are server-only:
- `SUPABASE_SERVICE_KEY` - Service role key (database access)
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to `production`
- `OWNER_USER_ID` - (optional) First admin user

### Why the VITE_ Prefix?
Vite by default only exposes environment variables prefixed with `VITE_` to the browser bundle. This prevents accidentally leaking secrets.

---

## Build Output Details

### Frontend Bundle
```
dist/public/
├── index.html                     (entry point)
├── assets/
│   ├── index-Dxen0AYh.js         (1.2MB)
│   └── index-C-F4kjAj.css        (91KB)
└── (other static files)

Size: ~1.2MB total (354KB gzipped)
```

### Backend Bundle
```
dist/
├── boot.js                        (1.1MB - bundled server)
└── package.json (copied by Vercel)

Size: ~1.1MB
```

### Total Deployment Size
- **Uncompressed:** ~2.3MB
- **Gzipped:** ~0.5MB
- **Within Vercel limits:** ✅ Yes

---

## Deployment Steps in Vercel

### Step 1: Create New Project
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose: `dineshmohan0802-dot/lead-ai`

### Step 2: Configure Project
- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Root Directory:** `app` (if monorepo) or `.` (if single folder)

### Step 3: Add Environment Variables
```
Environment Variables:
├── VITE_SUPABASE_URL = your-supabase-url
├── VITE_SUPABASE_ANON_KEY = your-anon-key
├── SUPABASE_SERVICE_KEY = your-service-key
├── DATABASE_URL = postgresql://...
└── NODE_ENV = production
```

### Step 4: Deploy
Click "Deploy" and Vercel will:
1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Run build command
4. ✅ Deploy frontend to CDN
5. ✅ Start backend on Node.js runtime
6. ✅ Provide URL (e.g., leadnexus-ai.vercel.app)

---

## Testing After Deployment

### Frontend
```bash
# Should load and show home page
curl https://your-vercel-url.vercel.app/

# Check bundle loaded
# Check console for no errors
```

### Backend
```bash
# Should return pong
curl https://your-vercel-url.vercel.app/api/trpc/ping

# Response: {"result":{"data":{"ok":true,"ts":1234567890}}}
```

### Auth
```bash
# Try signing up
1. Visit /login
2. Enter email and password
3. Should create account in Supabase
4. Should redirect to /dashboard
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check Node.js version, verify env vars, check logs |
| 404 on /api/* | Verify build completed, check router configuration |
| Database connection fails | Check DATABASE_URL, verify IP whitelisting in Supabase |
| Login fails | Check SUPABASE_* variables, verify Supabase project active |
| Blank page | Check browser console, verify frontend bundle size, check network tab |

---

## Performance Optimization

### Vercel CDN
- All files in `dist/public/` cached globally
- Automatic gzip compression
- Edge caching for static assets

### Node.js Runtime
- Cold start: ~500-1000ms (first request)
- Warm requests: <100ms
- Automatic scaling based on traffic

### Database
- Supabase handles connection pooling
- Drizzle ORM manages queries
- Consider read replicas for scale

---

## References

- **Vercel Docs:** https://vercel.com/docs
- **Hono Docs:** https://hono.dev
- **Vite Docs:** https://vitejs.dev
- **Supabase Docs:** https://supabase.com/docs
- **tRPC Docs:** https://trpc.io

---

**Last Updated:** 2025-07-08  
**Status:** ✅ Ready for Vercel  
**Framework:** React + Hono + Vite  
**Output Directory:** `dist`
