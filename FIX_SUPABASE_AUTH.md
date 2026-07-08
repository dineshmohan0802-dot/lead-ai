# Fix Supabase Authentication 400/429 Errors

## The Problem
You're getting:
- **400 Bad Request** - Supabase auth signup is failing
- **429 Too Many Requests** - Rate limiting triggered

## The Root Cause
Supabase has **email confirmation enabled by default**, which means:
1. Sign-ups are blocked until email is confirmed
2. OR the auth API is misconfigured
3. OR CORS/validation issue with the request

## Quick Fix (Choose One)

### Option A: Disable Email Confirmation (For Development)
**Best for testing/development**

1. Go to [Supabase Dashboard](https://supabase.com)
2. Click your project: `ycfvpzlszzyaumepocvg`
3. Click **Authentication** in sidebar
4. Click **Providers**
5. Find **Email/Password**
6. **Toggle OFF** the switch that says "Confirm email" or "Require email verification"
7. **Save** changes
8. **Wait 1-2 minutes** for changes to propagate
9. Go back to http://localhost:3001/login and try signing up again

### Option B: Keep Email Confirmation (For Production)
**Best for production**

If you want email confirmation:
1. Same steps as above but KEEP "Confirm email" ON
2. Users must click the confirmation link in their email
3. New accounts appear in Supabase auth as "unconfirmed" until email is verified
4. Signing in will fail if email not confirmed

## Testing Steps

### Test 1: Run Diagnostics
1. Open http://localhost:3001/test-auth
2. Check the output for detailed errors
3. Take note of any error messages

### Test 2: Try Signing Up
1. Go to http://localhost:3001/login
2. Click "Sign up" tab
3. Enter:
   - Email: `testuser@example.com` (use a real format)
   - Password: `Password123!` (6+ characters)
4. Click "Create account"
5. Check the error message

### Test 3: Check Supabase Console
1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Look for your test user
4. Note the status (Active, Unconfirmed, etc.)

## What Changed in the Code

I updated the Login component to:
✓ Handle email confirmation scenarios
✓ Provide better error messages (400 → "Invalid email or password")
✓ Clear sensitive errors (429 → "Too many attempts")
✓ Support both confirmation-on and confirmation-off modes
✓ Log detailed errors to browser console

## After Fixing

Once authentication works:

### For Each Signup:
- New user account appears in Supabase auth.users table
- A user profile should be created in your app's users table
- User can sign in on next visit

### To See It Working:
1. Sign up with test email
2. Check Supabase → Authentication → Users (you should see the new user)
3. Check Supabase → SQL Editor → Run: `SELECT * FROM users`
4. You should see the linked profile

## Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Email confirmation required or invalid password | Disable confirmation OR use valid password |
| 429 Too Many Requests | Rate limited | Wait 5 minutes, clear cache, restart dev server |
| Invalid email or password | Wrong credentials or unconfirmed email | Use correct credentials or confirm email |
| Already registered | Email already has account | Sign in instead of sign up |

## Browser Console Debugging

Open DevTools (F12) and check **Console** tab for detailed error logs:

```
[Your App Log] Auth error: {
  status: 400,
  message: "User already registered"
}
```

These logs will tell you exactly what's wrong.

## Testing Checklist

- [ ] Visit http://localhost:3001/test-auth
- [ ] Check for error details
- [ ] Disable email confirmation in Supabase
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Restart dev server (`npm run dev`)
- [ ] Try signing up with test@example.com / Password123
- [ ] Check browser console (F12) for error details
- [ ] Check Supabase Authentication → Users for new accounts
- [ ] Try signing in with same credentials

## Stuck?

1. **Check .env file** - Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
2. **Restart dev server** - `npm run dev`
3. **Clear browser cache** - Ctrl+Shift+Delete
4. **Check browser console** - F12 → Console tab
5. **Visit test page** - http://localhost:3001/test-auth
6. **Disable email confirmation** - Supabase Dashboard → Authentication → Providers

## Still Need Help?

1. Take screenshot of error message
2. Note the HTTP status code (400, 429, etc.)
3. Copy error from browser console (F12)
4. Check Supabase project settings
5. Verify email confirmation setting is OFF

The most common fix is **disabling email confirmation** in Supabase while developing.
