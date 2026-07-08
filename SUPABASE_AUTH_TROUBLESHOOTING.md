# Supabase Authentication Troubleshooting

## 400 Bad Request Error

### What This Means
The Supabase auth API rejected the sign-up request. Common causes:

1. **Email confirmation is disabled** - Supabase might be configured to require email confirmation
2. **Invalid password** - Password doesn't meet minimum requirements (usually 6+ chars)
3. **Invalid email format** - The email address is invalid
4. **Request malformed** - Missing required fields

### Solutions

#### Solution 1: Check Supabase Email Configuration
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers**
3. Check **Email/Password** configuration:
   - Is it enabled?
   - Check "Confirm email" setting
   - If "Confirm email" is ON, you need to verify email before signing in

#### Solution 2: Disable Email Confirmation (for testing)
1. In Supabase Dashboard
2. **Authentication** → **Providers** → **Email/Password**
3. **Toggle off** "Confirm email" to disable it (easier for development)
4. Save changes

#### Solution 3: Test with Valid Credentials
- Email: Use a valid email format (e.g., `test@example.com`)
- Password: Minimum 6 characters
- Try: `password123`

#### Solution 4: Enable Email Templating (if using confirmation)
If you want email confirmation to work:
1. In Supabase Dashboard
2. **Authentication** → **Email Templates**
3. Make sure "Confirm signup" template is configured
4. Test email service might need setup

## 429 Too Many Requests Error

### What This Means
Supabase rate limiting kicked in. You've made too many auth requests in a short time.

### Solutions
1. **Wait a few minutes** before trying again
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check browser console** for previous errors that might have caused retry loops

## Testing the Connection

Visit `http://localhost:3001/test-auth` to run diagnostics:
- Checks if Supabase URL and keys are valid
- Tests the auth connection
- Attempts a test sign-up
- Shows detailed error messages

## Manual Testing Steps

### Step 1: Check Environment Variables
```bash
# In your terminal, verify .env has:
echo $env:VITE_SUPABASE_URL
echo $env:VITE_SUPABASE_ANON_KEY
```

Should show:
- `VITE_SUPABASE_URL=https://ycfvpzlszzyaumepocvg.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJ...` (long JWT token)

### Step 2: Test in Browser Console
Open DevTools (F12) and run:
```javascript
// Check if Supabase is loaded
console.log(window.location);

// Test with a simple request
fetch('https://ycfvpzlszzyaumepocvg.supabase.co/auth/v1/settings', {
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY_HERE',
    'apikey': 'YOUR_ANON_KEY_HERE'
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

### Step 3: Check Supabase Project Settings
1. Go to Supabase Dashboard
2. **Settings** → **General**
3. Verify:
   - URL matches your .env file
   - Project is active (not paused)
   - Region is correct

## Expected Behavior

### Sign Up Flow (with email confirmation OFF)
1. User enters email and password
2. Account is created immediately
3. Redirected to home page
4. Check Supabase: **Authentication** → **Users** to see new account

### Sign Up Flow (with email confirmation ON)
1. User enters email and password
2. Confirmation email sent
3. User must click link in email
4. Account is activated
5. User can then sign in

### Sign In Flow
1. User enters credentials
2. Session is created
3. User redirected to home
4. useAuth hook shows user as authenticated

## Next Steps

1. **Visit the test page**: http://localhost:3001/test-auth
2. **Check the console output** for detailed error messages
3. **Adjust Supabase settings** based on errors
4. **Retry sign up** once settings are configured

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-based)
- [Common Auth Issues](https://supabase.com/docs/reference/auth-js/signupoptions)

## Quick Fix Checklist

- [ ] Verify Supabase URL in .env matches project
- [ ] Verify anon key is correct (starts with `eyJ`)
- [ ] Check if email confirmation is disabled in Supabase
- [ ] Test with valid email (e.g., test@example.com)
- [ ] Test with password 6+ characters
- [ ] Visit `/test-auth` to run diagnostics
- [ ] Check browser DevTools console (F12) for detailed errors
- [ ] Clear browser cache and cookies
- [ ] Restart dev server (`npm run dev`)
