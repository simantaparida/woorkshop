# UX Works - Complete Setup Guide

## End-to-End Flow Example

### Host Creates Session

1. **Host visits** `/` (landing page)
2. **Clicks** "Start Game"
3. **Redirected to** `/create`
4. **Fills form**:
   - Host name: "Alice"
   - Project name: "Mobile App Redesign"
   - Features:
     - "Dark mode support" (effort: 3, impact: 8)
     - "Push notifications" (effort: 5, impact: 9)
     - "Offline mode" (effort: 8, impact: 7)
5. **Submits** → API creates session + features + host player
6. **Receives** `sessionId` + `hostToken`
7. **Redirected to** `/session/{sessionId}` (or lobby)
8. **Link auto-copied** to clipboard

### Players Join

9. **Bob opens link** → `/session/{sessionId}`
10. **Prompted for name** → enters "Bob"
11. **API creates player** record
12. **Sees lobby** with:
    - Project name
    - List of features (read-only)
    - List of players (realtime)
    - "Waiting for host to start..." message
13. **Carol joins** same way → lobby updates in realtime for all

### Host Starts Game

14. **Alice (host) clicks** "Start Game"
15. **API verifies** `hostToken` and updates `session.status = 'playing'`
16. **All clients receive** realtime update
17. **All redirected to** `/session/{sessionId}/vote`

### Voting Phase

18. **Each player sees**:
    - Feature cards with point input
    - Remaining points (starts at 100)
    - Submit button
19. **Alice allocates**:
    - Dark mode: 30
    - Push notifications: 50
    - Offline mode: 20
20. **Clicks Submit** → votes saved
21. **Bob allocates**:
    - Dark mode: 25
    - Push notifications: 40
    - Offline mode: 35
22. **Clicks Submit**
23. **Carol allocates and submits**
24. **Progress indicator** shows who has voted (realtime)
25. **When last player submits** → auto-transition to results

### Results Phase

26. **All clients see** `/session/{sessionId}/results`:
    - Bar chart of aggregated points
    - Ranked list with medals (🥇🥈🥉)
    - Total votes per feature
    - "Download CSV" button
    - "Copy Link" button for sharing
27. **Results are public** (no auth required to view)

---

## Step-by-Step Implementation Guide

### Phase 1: Foundation (COMPLETED)

- [x] Project scaffolding
- [x] Database schema
- [x] TypeScript types
- [x] Supabase client setup
- [x] API routes
- [x] Base UI components
- [x] Utility functions

### Phase 2: Core Components (NEXT)

- [ ] FeatureCard component
- [ ] PlayerList component
- [ ] ProgressIndicator component
- [ ] ResultsChart component
- [ ] FeatureForm component

### Phase 3: Pages

- [ ] Landing page (`/`)
- [ ] Create session page (`/create`)
- [ ] Session orchestrator (`/session/[id]`)
- [ ] Lobby page (`/session/[id]/lobby`)
- [ ] Vote page (`/session/[id]/vote`)
- [ ] Results page (`/session/[id]/results`)

### Phase 4: Testing & Polish

- [ ] Test realtime with multiple clients
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Mobile responsiveness

### Phase 5: Deployment

- [ ] Vercel deployment
- [ ] Environment variables
- [ ] Production testing
- [ ] Documentation

---

## Current File Structure

```
✅ package.json
✅ tsconfig.json
✅ tailwind.config.ts
✅ next.config.js
✅ .env.local.example
✅ .gitignore

✅ supabase/
   ✅ migrations/001_initial_schema.sql
   ✅ seed.sql

✅ src/
   ✅ types/index.ts

   ✅ lib/
      ✅ supabase/
         ✅ client.ts
         ✅ server.ts
      ✅ hooks/
         ✅ useSession.ts
         ✅ usePlayers.ts
         ✅ useAnalytics.ts
      ✅ utils/
         ✅ validation.ts
         ✅ helpers.ts
      ✅ constants.ts

   ✅ app/
      ✅ globals.css
      ✅ api/
         ✅ session/
            ✅ route.ts (POST)
            ✅ [id]/
               ✅ join/route.ts
               ✅ start/route.ts
               ✅ vote/route.ts
               ✅ results/route.ts
               ✅ results/csv/route.ts

   ✅ components/
      ✅ ui/
         ✅ Button.tsx
         ✅ Card.tsx
         ✅ Input.tsx
         ✅ Toast.tsx

⏳ TO CREATE:
   - app/layout.tsx
   - app/page.tsx
   - app/create/page.tsx
   - app/session/[id]/page.tsx
   - app/session/[id]/lobby/page.tsx
   - app/session/[id]/vote/page.tsx
   - app/session/[id]/results/page.tsx

   - components/FeatureCard.tsx
   - components/PlayerList.tsx
   - components/ProgressIndicator.tsx
   - components/ResultsChart.tsx
   - components/FeatureForm.tsx
```

---

## Next Steps

1. **Install dependencies**: `npm install`
2. **Create remaining components** (feature-specific)
3. **Create all pages**
4. **Test locally** with seed data
5. **Deploy to Vercel**

---

## Testing Checklist

### Local Testing

- [ ] Create session with 3+ features
- [ ] Copy link and open in 2 other browsers
- [ ] Join as 2 different players
- [ ] Verify realtime player list updates
- [ ] Start game as host
- [ ] Verify all clients redirect to vote page
- [ ] Each player submits votes
- [ ] Verify progress indicator updates
- [ ] Verify auto-redirect to results
- [ ] Check results chart accuracy
- [ ] Download CSV and verify data
- [ ] Test error cases (invalid votes, wrong host token, etc.)

### Edge Cases

- [ ] Submit with 0 points allocated
- [ ] Submit with exactly 100 points
- [ ] Submit with > 100 points (should fail)
- [ ] Join with duplicate name
- [ ] Start game without features
- [ ] Access session that doesn't exist
- [ ] Non-host tries to start game

---

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: UX Works MVP"
   git branch -M main
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Import GitHub repository
   - Add environment variables
   - Deploy

3. **Configure Supabase**
   - Add Vercel URL to allowed origins
   - Verify RLS policies

4. **Test Production**
   - Create test session
   - Verify realtime works
   - Check CSV export

---

## Common Issues & Solutions

### Realtime not working

- Check Supabase URL and anon key
- Verify RLS policies allow reads
- Check browser console for WebSocket errors

### 404 on API routes

- Verify Next.js app directory structure
- Check file naming (route.ts not routes.ts)
- Restart dev server

### Votes not saving

- Check vote validation logic
- Verify feature IDs match
- Check Supabase logs

### Styling issues

- Ensure Tailwind is configured correctly
- Check globals.css is imported
- Verify component classes

---

Ready to continue building! Next: Create feature-specific components.
