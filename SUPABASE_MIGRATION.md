# Kimi OAuth → Supabase Authentication Migration

## Summary
This document outlines the migration from Kimi OAuth to Supabase authentication. All changes have been implemented to replace Kimi's custom OAuth flow with Supabase's built-in authentication system.

## Changes Made

### 1. Environment Variables (.env, .env.example)
**Removed:**
- `APP_ID` - Kimi application ID
- `APP_SECRET` - JWT signing secret
- `VITE_KIMI_AUTH_URL` - Kimi auth server URL
- `VITE_APP_ID` - OAuth app ID
- `KIMI_AUTH_URL` - Backend auth URL
- `KIMI_OPEN_URL` - Kimi Open Platform URL
- `OWNER_UNION_ID` - Kimi user ID for admin role

**Added:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public Supabase anonymous key (frontend)
- `SUPABASE_SERVICE_KEY` - Service role key (backend only, secret)
- `OWNER_USER_ID` - Supabase user UUID for admin role

### 2. Backend Authentication (api/kimi/auth.ts)
**Changes:**
- Replaced Kimi OAuth token exchange with Supabase JWT verification
- Updated `verifySupabaseToken()` to validate Supabase tokens
- Updated `authenticateRequest()` to support both:
  - Authorization header (Bearer token) for API calls
  - Session cookie for browser-based requests
- Removed Kimi-specific code:
  - `exchangeAuthCode()` - Kimi OAuth code exchange
  - `verifyAccessToken()` - Kimi JWKS verification
  - `kimiUsers.getProfile()` - Kimi user profile fetch
- Kept `createOAuthCallbackHandler()` as a stub for future OAuth flows

**New Files:**
- `api/kimi/supabase.ts` - Supabase client initialization for backend

### 3. Database Schema (db/schema.ts)
**Changes:**
- Replaced `unionId` with `supabaseId` as the unique identifier
- `supabaseId`: UUID string (36 chars) from Supabase auth.users.id
- Removed dependency on Kimi's union ID system
- Schema now aligns with Supabase's user management

### 4. User Queries (api/queries/users.ts)
**Changes:**
- Added `findUserBySupabaseId()` - New function to find users by Supabase UUID
- Updated `upsertUser()` to use `supabaseId` instead of `unionId`
- Updated admin role assignment to use `OWNER_USER_ID` env var
- Kept `findUserByUnionId()` as deprecated function for reference

### 5. Frontend Login Page (src/pages/Login.tsx)
**Major Changes:**
- Replaced "Continue with Kimi" button with OAuth options:
  - Google OAuth (via Supabase)
  - GitHub OAuth (via Supabase)
- Implemented email/password authentication form:
  - Sign up flow with email confirmation
  - Sign in flow with email and password
  - Real-time error handling and loading states
- Removed Kimi OAuth URL generation and callback logic
- Added form validation and user feedback

**Features:**
- Email/password sign-up with confirmation email
- Email/password sign-in
- Google and GitHub OAuth options
- Loading states and error messages
- Toggle between sign-up and sign-in modes

### 6. Authentication Hook (src/hooks/useAuth.ts)
**Complete Rewrite:**
- Replaced tRPC-based auth queries with Supabase real-time listeners
- Uses `supabase.auth.onAuthStateChange()` for session management
- Direct Supabase session handling without API roundtrip
- Updated `logout()` to call `supabase.auth.signOut()`
- Maintains same interface for components (user, isAuthenticated, isLoading, error, logout)

**Benefits:**
- Real-time auth state updates
- Automatic session refresh
- No dependency on backend auth queries

### 7. Session Cookie (contracts/constants.ts)
**Changes:**
- Updated cookie name from `kimi_sid` to `sb-session`
- Session still uses 365-day expiration (can be adjusted)

## Database Migration Steps

If you have existing data with `unionId` field, follow these steps:

```sql
-- 1. Add the new supabaseId column
ALTER TABLE users ADD COLUMN supabaseId VARCHAR(36) UNIQUE;

-- 2. Migrate data if you have Supabase users that should map to existing records
-- You'll need to manually match union IDs to Supabase user IDs based on email
UPDATE users 
SET supabaseId = '<supabase-uuid>' 
WHERE email = '<user-email>';

-- 3. Make supabaseId required and remove unionId
ALTER TABLE users MODIFY supabaseId VARCHAR(36) NOT NULL;
ALTER TABLE users DROP COLUMN unionId;

-- 4. Create an index for faster lookups (if not exists)
CREATE INDEX idx_users_supabase_id ON users(supabaseId);
```

## Remaining Backend Work

The following files may still reference Kimi and can be updated for cleanliness:

1. **api/kimi/platform.ts** - Contains Kimi Open Platform client (can be removed if not used)
2. **api/kimi/types.ts** - Contains `SessionPayload` with `unionId` (can be updated)
3. **api/kimi/session.ts** - Custom JWT signing (can be kept for other uses or removed)
4. Tests and documentation that reference Kimi

## Testing Checklist

- [ ] Sign up with email/password
- [ ] Receive confirmation email and verify account
- [ ] Sign in with email/password
- [ ] Sign in with Google
- [ ] Sign in with GitHub
- [ ] User data is correctly stored in database with Supabase UUID
- [ ] Logout works correctly
- [ ] Protected routes redirect to login when not authenticated
- [ ] Role-based access (admin/user) works correctly
- [ ] Session persists across page refreshes

## Environment Setup

Make sure your `.env` file has:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
OWNER_USER_ID=your-supabase-user-uuid
```

## Dependencies Added

- `@supabase/supabase-js` ^2.38.4 - Supabase JavaScript client library

## Notes

- Supabase authentication is now client-side (frontend) managed via the JS client
- Backend still validates tokens from Authorization headers for API security
- Sessions are managed by Supabase, with optional cookie fallback
- Admin role assignment now uses `OWNER_USER_ID` (Supabase user UUID)
- All Kimi-specific code has been removed or replaced

## Next Steps

1. Update your Supabase project with the env variables
2. Set up Supabase OAuth providers (Google, GitHub) in Supabase dashboard
3. Enable email authentication in Supabase settings
4. Run database migration if you have existing users
5. Test the login flow end-to-end
6. Deploy to production
