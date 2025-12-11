# UX Works - Launch Checklist

## 🎯 Pre-Launch Checklist

### 1. Initial Setup

- [ ] Run `npm install` to install all dependencies
- [ ] Create Supabase account and project
- [ ] Run migration SQL from `supabase/migrations/001_initial_schema.sql`
- [ ] (Optional) Run seed SQL from `supabase/seed.sql` for test data
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add Supabase URL and anon key to `.env.local`
- [ ] Run `npm run dev` and verify app starts

### 2. Local Testing

- [ ] Landing page loads at `http://localhost:3000`
- [ ] Can navigate to create session page
- [ ] Can create a session with features
- [ ] Session link is copied to clipboard
- [ ] Can open session link in new browser window
- [ ] Can join as a player with a name
- [ ] Players appear in realtime for all connected clients
- [ ] Host can start the game
- [ ] All clients redirect to vote page when game starts
- [ ] Can allocate points to features
- [ ] Remaining points counter updates correctly
- [ ] Cannot submit more than 100 points
- [ ] Vote submission works
- [ ] Player vote status updates in realtime
- [ ] Auto-redirect to results when all players vote
- [ ] Results page shows correct rankings
- [ ] Bar chart displays properly
- [ ] Can download CSV with correct data
- [ ] Can copy results link

### 3. Edge Cases

- [ ] Try submitting 0 points (should work)
- [ ] Try submitting 101 points (should fail)
- [ ] Try accessing non-existent session (should show error)
- [ ] Try starting game as non-host (should fail)
- [ ] Try joining with duplicate name (should fail)
- [ ] Try voting after already submitting (should be disabled)
- [ ] Test with only 1 player
- [ ] Test with 5+ players
- [ ] Test on mobile device (responsive design)

### 4. Code Quality

- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm run test:run` - all unit tests pass
- [ ] Run `npm run test:e2e` - all E2E tests pass (optional: requires Playwright setup)
- [ ] All console.error calls only in catch blocks
- [ ] No hardcoded URLs or API keys in code
- [ ] All API routes have proper error handling
- [ ] All user inputs are validated and sanitized

### 5. Database

- [ ] All tables created successfully
- [ ] RLS policies are enabled
- [ ] Indexes are created for performance
- [ ] Cascade deletes work properly
- [ ] Can view data in Supabase Table Editor
- [ ] Realtime is enabled for all tables

### 6. Deployment Preparation

- [ ] Initialize git repository: `git init`
- [ ] Create `.gitignore` (should exclude `.env.local`, `node_modules`, etc.)
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Verify Vercel account is ready
- [ ] Have Supabase credentials ready for Vercel env vars

### 7. Vercel Deployment

- [ ] Import GitHub repository to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` environment variable
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable
- [ ] Trigger deployment
- [ ] Wait for deployment to complete
- [ ] Visit production URL

### 8. Production Testing

- [ ] Landing page loads on production URL
- [ ] Can create a session in production
- [ ] Can share link and join from different device
- [ ] Realtime works in production
- [ ] Can complete full voting flow
- [ ] Can view results
- [ ] Can download CSV
- [ ] No console errors in production
- [ ] Check Vercel function logs for errors

### 9. Performance & UX

- [ ] Page load times are acceptable
- [ ] Animations are smooth
- [ ] Toast notifications appear and disappear
- [ ] Loading states show for async operations
- [ ] Error messages are user-friendly
- [ ] Mobile layout works well
- [ ] Copy to clipboard works on all devices

### 10. Documentation

- [ ] README.md is complete and accurate
- [ ] QUICKSTART.md has correct instructions
- [ ] SETUP.md reflects actual project state
- [ ] Environment variables are documented
- [ ] API endpoints are documented

---

## 🚀 Post-Launch Tasks

### Immediate

- [ ] Share production URL with test users
- [ ] Monitor Vercel analytics for traffic
- [ ] Check Supabase dashboard for database activity
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Add Plausible or Google Analytics tracking

### Short-term (Week 1)

- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Add any missing error handling
- [ ] Improve error messages based on user confusion
- [ ] Add FAQ or help section if needed

### Medium-term (Month 1)

- [ ] Analyze usage patterns
- [ ] Optimize database queries if needed
- [ ] Add new features based on feedback
- [ ] Consider adding user authentication
- [ ] Implement session history

---

## 🐛 Known Limitations (MVP)

These are intentional limitations for the MVP. Consider addressing in future versions:

- No user authentication (sessions are anonymous)
- No edit/delete session functionality
- No time limits on voting
- No session expiration/cleanup
- No email notifications
- No comments or discussion features
- No undo/redo voting
- No real-time vote totals during voting (only after submission)
- No mobile app (web-only)
- No offline support

---

## 📊 Success Metrics

Track these to measure success:

- [ ] Number of sessions created
- [ ] Average players per session
- [ ] Average features per session
- [ ] Session completion rate (lobby → results)
- [ ] Time to complete a session
- [ ] CSV download rate
- [ ] Return user rate

---

## 🆘 Troubleshooting Guide

### If something goes wrong:

1. **Check browser console** for JavaScript errors
2. **Check Vercel logs** for API route errors
3. **Check Supabase logs** for database errors
4. **Verify environment variables** are set correctly
5. **Test locally** to isolate production issues
6. **Check Supabase RLS policies** if data isn't loading
7. **Verify WebSocket connection** for realtime issues

### Common Issues:

| Issue | Solution |
|-------|----------|
| Realtime not working | Check Supabase URL, verify RLS policies |
| API routes 404 | Restart dev server, check file structure |
| Can't submit votes | Check total points ≤ 100, verify player joined |
| Session not found | Verify session ID, check database |
| CSV won't download | Check API route, verify session has votes |

---

## ✅ Final Sign-Off

Before considering the MVP complete:

- [ ] All items in "Local Testing" are checked
- [ ] All items in "Production Testing" are checked
- [ ] No critical bugs remain
- [ ] Documentation is accurate
- [ ] Code is pushed to GitHub
- [ ] Production URL is live and working

---

**Congratulations! Your UX Works MVP is ready to ship! 🎉**

Remember: This is an MVP. Ship it, get feedback, iterate. Don't let perfect be the enemy of good.
