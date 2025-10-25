# UX Works - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the migration**:
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and click "Run"

3. **(Optional) Add test data**:
   - Copy the contents of `supabase/seed.sql`
   - Run it in the SQL Editor
   - This creates a test session at: `http://localhost:3000/session/550e8400-e29b-41d4-a716-446655440000`

4. **Get your API credentials**:
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

### Step 3: Configure Environment

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Test the Complete Flow

### Option A: Use Seed Data

If you ran the seed script:
1. Open: `http://localhost:3000/session/550e8400-e29b-41d4-a716-446655440000`
2. Join as a player
3. Test the flow

### Option B: Create a New Session

1. **Open 3 browser windows** (or use incognito mode for separate sessions)

2. **Window 1 (Host)**:
   - Go to `http://localhost:3000`
   - Click "Start Game"
   - Fill in:
     - Your Name: "Alice"
     - Project Name: "Mobile App Redesign"
     - Add 3-5 features
   - Click "Create Session"
   - Link will be copied to clipboard

3. **Window 2 (Player 1)**:
   - Paste the session link
   - Enter name: "Bob"
   - Click "Join"

4. **Window 3 (Player 2)**:
   - Paste the session link
   - Enter name: "Carol"
   - Click "Join"

5. **Back to Window 1 (Host)**:
   - You should see Bob and Carol in the player list
   - Click "Start Game"

6. **All Windows**:
   - You'll be redirected to the voting page
   - Allocate 100 points across features
   - Click "Submit Votes"

7. **Watch the Magic**:
   - See realtime progress indicators
   - When all players submit, auto-redirect to results
   - View charts and rankings
   - Try downloading CSV
   - Copy the results link to share

---

## 📁 Project Structure Overview

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/page.tsx             # Session creation
│   └── session/[id]/
│       ├── lobby/page.tsx          # Player lobby
│       ├── vote/page.tsx           # Voting interface
│       └── results/page.tsx        # Results display
│
├── components/
│   ├── ui/                         # Base UI components
│   ├── FeatureCard.tsx             # Voting card
│   ├── PlayerList.tsx              # Player list with realtime
│   ├── ProgressIndicator.tsx       # Vote progress
│   ├── ResultsChart.tsx            # Bar chart visualization
│   └── FeatureForm.tsx             # Dynamic feature form
│
└── lib/
    ├── supabase/                   # Database clients
    ├── hooks/                      # Realtime hooks
    └── utils/                      # Helpers & validation
```

---

## 🔍 Troubleshooting

### Problem: "Missing Supabase environment variables"
**Solution**: Make sure `.env.local` exists and has both variables set.

### Problem: Can't see realtime updates
**Solution**:
- Check browser console for WebSocket errors
- Verify Supabase RLS policies are set (they should be from the migration)
- Make sure you're using the correct Supabase URL

### Problem: Session not found
**Solution**:
- Verify the session was created (check Supabase dashboard > Table Editor > sessions)
- Try creating a new session
- Make sure you ran the migrations

### Problem: API routes returning 404
**Solution**:
- Restart the dev server: `npm run dev`
- Check that all route files are named `route.ts` (not `routes.ts`)

### Problem: Votes not saving
**Solution**:
- Check that total points don't exceed 100
- Verify you've joined the session as a player
- Check browser console for errors

---

## 🚢 Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: UX Works MVP"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Update Supabase Settings**:
   - Go to Supabase dashboard
   - Project Settings > API
   - Add your Vercel URL to "URL Configuration" if needed

4. **Test Production**:
   - Visit your Vercel URL
   - Create a test session
   - Verify realtime works
   - Test CSV export

---

## ✅ What's Included

- ✅ Complete session management
- ✅ Realtime player synchronization
- ✅ Point allocation voting system
- ✅ Live progress tracking
- ✅ Results visualization with charts
- ✅ CSV export functionality
- ✅ Mobile-responsive design
- ✅ Type-safe with TypeScript
- ✅ Input validation (client + server)
- ✅ Error handling & toast notifications
- ✅ Animated UI with Framer Motion

---

## 📚 Next Steps

Now that your MVP is running:

1. **Customize**: Edit the landing page copy, colors, or add your logo
2. **Analytics**: Integrate Plausible or Google Analytics (placeholder in `useAnalytics.ts`)
3. **Features**: Add time limits, comments, or voting weights
4. **Polish**: Add loading skeletons, better error messages, or onboarding
5. **Scale**: Upgrade Supabase plan for more concurrent users

---

## 🆘 Need Help?

- **Documentation**: Check `README.md` and `SETUP.md`
- **Database**: View tables in Supabase dashboard > Table Editor
- **API Logs**: Check Vercel dashboard > Functions > Logs
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Inspect API calls and responses

---

Happy prioritizing! 🎉
