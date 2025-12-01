# Google Authentication Setup Guide

## ✅ What's Been Implemented

I've successfully created a login/signup page with Google Auth and updated all "Get started" buttons to redirect to the login page.

### Files Created:
1. **`/src/app/auth/login/page.tsx`** - Login/signup page with Google Auth button
2. **`/src/app/auth/callback/page.tsx`** - OAuth callback handler

### Files Updated:
1. **`/src/lib/constants.ts`** - Added LOGIN, SIGNUP, and AUTH_CALLBACK routes
2. **`/src/components/Hero.tsx`** - Updated "Let's Padool it" button to redirect to `/auth/login`
3. **`/src/components/Navbar.tsx`** - Updated "Start Free Session" button to redirect to `/auth/login`
4. **`/src/app/page.tsx`** - Updated Final CTA "Start Free Session" button to redirect to `/auth/login`

## 🔧 Supabase Configuration Required

To enable Google OAuth, you need to configure it in your Supabase dashboard:

### Step 1: Enable Google Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** (in the left sidebar)
3. Find **Google** in the list of providers
4. Toggle it **ON**

### Step 2: Configure Google OAuth Credentials

You'll need to create OAuth credentials in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted
6. Choose **Web application** as the application type
7. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
   - **Also add Supabase's redirect URL**: `https://[your-project-ref].supabase.co/auth/v1/callback`

8. Copy the **Client ID** and **Client Secret**

### Step 3: Add Credentials to Supabase

1. Back in Supabase dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Optionally customize the scopes (default is fine)
4. Click **Save**

### Step 4: Update Supabase Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your redirect URLs:
   - **Site URL**: `http://localhost:3000` (for dev) or `https://your-domain.com` (for production)
   - **Redirect URLs**: Add:
     - `http://localhost:3000/auth/callback` (for dev)
     - `https://your-domain.com/auth/callback` (for production)
     - `https://[your-project-ref].supabase.co/auth/v1/callback` (already there)

## 🧪 Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click any "Get started" or "Start Free Session" button
4. You should be redirected to `/auth/login`
5. Click "Continue with Google"
6. You should be redirected to Google's sign-in page
7. After signing in, you'll be redirected back to `/home`

## 📝 Notes

- The login page automatically checks if a user is already logged in and redirects them
- The callback page handles OAuth redirects and manages session creation
- After successful authentication, users are redirected to `/home` (or the `redirect` query parameter if provided)
- The login page supports both sign-in and sign-up flows (toggled via UI)

## 🚀 Next Steps

After setting up Google OAuth:

1. Test the complete flow end-to-end
2. Consider adding email/password authentication as an alternative
3. Implement protected routes that require authentication
4. Add user profile management
5. Store user data in a `profiles` table linked to Supabase Auth users

