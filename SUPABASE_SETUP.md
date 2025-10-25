# 🚀 Supabase Setup Guide - 5 Minutes

Your app is running but needs Supabase to work! Follow these simple steps:

## Step 1: Create Supabase Account (1 min)

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create a New Project (2 min)

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in:
   - **Project name**: `ux-works` (or anything you like)
   - **Database password**: Save this somewhere! (You won't need it for now, but keep it safe)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for setup to complete ☕

## Step 3: Run the Database Migration (1 min)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open this file on your computer: `supabase/migrations/001_initial_schema.sql`
4. Copy ALL the content
5. Paste it into the SQL Editor
6. Click **"Run"** (bottom right)
7. You should see: ✅ Success. No rows returned

## Step 4: Get Your API Credentials (30 seconds)

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxx.supabase.co`)
   - **anon/public key** (long string of characters)

4. **Copy both of these!**

## Step 5: Update Your .env.local File (30 seconds)

1. Open `.env.local` in your project
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. Save the file

## Step 6: Restart Your Dev Server

**I'll do this for you!** Just let me know when you've completed steps 1-5.

---

## ✅ Verify It Works

After restart:
1. Go to http://localhost:3000
2. Click **"Start Game"**
3. Fill in the form and create a session
4. If it works, you'll be redirected to the lobby! 🎉

---

## 🆘 Troubleshooting

### Can't run the migration?
- Make sure you copied the ENTIRE file content
- Check that your project has finished setting up (green checkmark)

### Still getting errors after adding credentials?
- Make sure there are NO spaces before or after the URLs/keys
- Make sure you saved the .env.local file
- Restart the dev server

### Want to see if migration worked?
- In Supabase, click **"Table Editor"** in sidebar
- You should see 4 tables: `sessions`, `features`, `players`, `votes`

---

## 📍 Current Status

- ✅ `.env.local` file created
- ⏳ Waiting for you to add Supabase credentials
- ⏳ Need to restart server after adding credentials

**Start with Step 1 above and let me know when you're done!** 🚀
