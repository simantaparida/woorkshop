# Test User Guide

## Quick Test User Creation

### Option 1: Using the Script (Recommended)

1. **Make sure you have the service role key** (optional but recommended):
   - Go to Supabase Dashboard > Settings > API
   - Copy the `service_role` key (keep this secret!)
   - Add it to `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
     ```

2. **Run the script**:
   ```bash
   node scripts/create-test-user.js
   ```

3. **Sign in**:
   - Go to http://localhost:3000/auth/login
   - Email: `test@example.com`
   - Password: `testpassword123`

### Option 2: Manual Sign Up (No Service Role Key Needed)

1. **Go to the signup page**:
   - Navigate to http://localhost:3000/auth/signup

2. **Create an account**:
   - Enter your email (e.g., `test@example.com`)
   - Enter a password (at least 6 characters)
   - Confirm password
   - Click "Create account"

3. **Email confirmation** (if required):
   - Check your email for a confirmation link
   - Click the link to confirm your account
   - You'll be redirected back to the app

4. **Sign in**:
   - Go to http://localhost:3000/auth/login
   - Use the email and password you just created

### Option 3: Google OAuth (Easiest)

1. **Go to the login page**:
   - Navigate to http://localhost:3000/auth/login

2. **Click "Sign in with Google"**:
   - This will redirect you to Google
   - Sign in with your Google account
   - You'll be redirected back automatically

## Testing the Voting Board Creation

After signing in:

1. **Navigate to create voting board**:
   - Go to http://localhost:3000/voting-board/new
   - You should see your name automatically populated in the "Facilitator Name" field

2. **Fill in the form**:
   - Voting Board Name: e.g., "Q1 Feature Prioritization"
   - Add items to vote on
   - Click "Create Voting Board"

3. **Verify**:
   - You should be redirected to the lobby
   - Your name should appear as the facilitator/host

## Troubleshooting

### "Auth session missing" Error

This means you're not signed in. Solutions:

1. **Sign in first**:
   - Go to http://localhost:3000/auth/login
   - Sign in with your account
   - Then try accessing `/voting-board/new` again

2. **Check your session**:
   - Open browser DevTools > Application > Local Storage
   - Look for keys starting with `sb-` (Supabase session)
   - If none exist, you need to sign in

3. **Clear and retry**:
   - Clear your browser's localStorage
   - Sign in again
   - Try accessing the page

### Email Confirmation Required

If Supabase is configured to require email confirmation:

1. **Check your email** (including spam folder)
2. **Click the confirmation link**
3. **Sign in again**

To disable email confirmation (for development):
- Go to Supabase Dashboard > Authentication > Settings
- Disable "Enable email confirmations"
- Save changes

### Service Role Key Not Found

If the script says "Service role key not found":

1. **Option A**: Get the service role key (see Option 1 above)
2. **Option B**: Use manual signup (Option 2) - no service role key needed
3. **Option C**: Use Google OAuth (Option 3) - easiest option

## Default Test User Credentials

If you used the script:
- **Email**: test@example.com
- **Password**: testpassword123
- **Name**: Test User

⚠️ **Note**: Change these credentials in production!

