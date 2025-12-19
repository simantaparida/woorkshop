# Incident Response Runbook

**Last Updated:** 2025-12-19
**Version:** 1.0
**Status:** Ready for Production

## Overview

This runbook provides step-by-step procedures for responding to production incidents in the UX Works application. Follow these procedures to minimize downtime and quickly restore service.

---

## Table of Contents

1. [Incident Severity Levels](#incident-severity-levels)
2. [General Incident Response Flow](#general-incident-response-flow)
3. [Common Incidents & Solutions](#common-incidents--solutions)
4. [Monitoring Dashboards](#monitoring-dashboards)
5. [Rollback Procedures](#rollback-procedures)
6. [Communication Templates](#communication-templates)
7. [Post-Incident Review](#post-incident-review)

---

## Incident Severity Levels

### SEV1 (Critical) - Complete Outage
- **Definition:** Service completely unavailable or major data loss
- **Examples:**
  - Application returns 500 errors for all users
  - Database completely unreachable
  - Authentication system down
  - Data corruption or loss
- **Response Time:** Immediate (< 5 minutes)
- **Escalation:** Page on-call immediately, notify CTO
- **Communication:** Status page update, user notification

### SEV2 (High) - Major Functionality Broken
- **Definition:** Core feature unavailable, affecting majority of users
- **Examples:**
  - Voting system not working
  - Session creation failing
  - Real-time updates not working
  - Error rate > 10%
- **Response Time:** < 15 minutes
- **Escalation:** Notify engineering lead
- **Communication:** Internal Slack update

### SEV3 (Medium) - Minor Functionality Impacted
- **Definition:** Secondary feature affected, workaround available
- **Examples:**
  - CSV export failing
  - Some UI components not rendering
  - Slow response times (> 5s)
  - Error rate 5-10%
- **Response Time:** < 1 hour
- **Escalation:** Assign to on-call engineer
- **Communication:** Log in tracking system

### SEV4 (Low) - Cosmetic Issues
- **Definition:** Minor visual bugs, no functional impact
- **Examples:**
  - Styling inconsistencies
  - Typos
  - Minor UI glitches
- **Response Time:** < 24 hours
- **Escalation:** Add to backlog
- **Communication:** Optional

---

## General Incident Response Flow

### Phase 1: Detection (0-2 minutes)

**Incident Detected Via:**
- [ ] Sentry alert triggered
- [ ] Vercel deployment notification
- [ ] User report
- [ ] Monitoring dashboard
- [ ] Health check failure

**Immediate Actions:**
1. **Acknowledge the incident**
   - Post in `#incidents` Slack channel
   - Assign incident commander (first responder)
   - Create incident thread for communication

2. **Gather initial information**
   - What is broken?
   - When did it start?
   - How many users affected?
   - What was the last deployment?

### Phase 2: Assessment (2-5 minutes)

**Check Key Systems:**

1. **Vercel Dashboard**
   - URL: https://vercel.com/your-team/ux-works
   - Check: Recent deployments, build status, function logs

2. **Sentry Dashboard**
   - URL: https://sentry.io/organizations/YOUR_ORG/projects/ux-works/
   - Check: Error spike, affected users, stack traces

3. **Supabase Dashboard**
   - URL: https://app.supabase.com/project/YOUR_PROJECT
   - Check: Database status, connection pool, slow queries

4. **Upstash Redis** (if using)
   - URL: https://console.upstash.com/
   - Check: Redis availability, rate limit stats

**Document in Incident Thread:**
```
🚨 INCIDENT: [Brief description]
Severity: SEV[1-4]
Started: [Timestamp]
Affected: [Number of users / % of traffic]
Last Deploy: [Deployment URL or git commit]
Error: [Primary error message from Sentry]
```

### Phase 3: Containment (5-15 minutes)

**Decision Tree:**

**Is this from a recent deployment?**
- YES → Consider immediate rollback (see [Rollback Procedures](#rollback-procedures))
- NO → Continue investigation

**Is database down?**
- YES → Check Supabase status, verify network, escalate to Supabase support
- NO → Continue

**Is error rate increasing?**
- YES → Consider rollback or traffic throttling
- NO → Investigate specific error

**Can we implement a quick fix?**
- YES → Deploy hotfix (if < 10 min to implement)
- NO → Rollback to last known good state

### Phase 4: Resolution (15-60 minutes)

**Fix Options (in priority order):**

1. **Rollback** (fastest, 2-5 min)
   - Revert to last known good deployment
   - Verify fix
   - Monitor for 15 minutes

2. **Hotfix** (fast, 10-30 min)
   - Create fix on hotfix branch
   - Deploy to staging first
   - Quick verification
   - Deploy to production
   - Monitor for 15 minutes

3. **Configuration Change** (medium, 5-15 min)
   - Update environment variable in Vercel
   - Redeploy or restart functions
   - Verify fix

4. **Database Fix** (slower, 30-60 min)
   - Run migration or manual fix
   - Test in staging first if possible
   - Apply to production with backup

### Phase 5: Recovery Verification (10-15 minutes)

**Post-Fix Checklist:**
- [ ] Error rate back to baseline (< 1%)
- [ ] Sentry shows resolution
- [ ] Vercel logs show healthy requests
- [ ] Database connections normal
- [ ] Manually test affected functionality
- [ ] Monitor for 15 minutes (ensure no regression)

### Phase 6: Communication (5-10 minutes)

**Internal:**
- [ ] Update `#incidents` thread with resolution
- [ ] Notify stakeholders (if SEV1/SEV2)
- [ ] Update status page (if applicable)

**External (if needed):**
- [ ] Post status update
- [ ] Email affected users (if data loss)
- [ ] Social media update (if major outage)

### Phase 7: Post-Incident (24-48 hours)

- [ ] Schedule postmortem meeting
- [ ] Write incident report
- [ ] Create action items to prevent recurrence
- [ ] Update runbook with learnings

---

## Common Incidents & Solutions

### 1. High Error Rate (>5%)

**Symptoms:**
- Sentry alert: "High Error Rate"
- Multiple error types or single recurring error
- Users reporting issues

**Diagnosis:**
```bash
# 1. Check Sentry for top errors
Go to Sentry > Issues > Sort by Frequency

# 2. Check recent deployments
Go to Vercel > Deployments > Check last 3 deployments

# 3. Check Vercel function logs
Go to Vercel > [Deployment] > Runtime Logs
Filter by time period of incident
```

**Common Causes & Fixes:**

**Cause: Recent deployment introduced bug**
```bash
# Solution: Rollback
cd /path/to/project
vercel rollback [previous-deployment-url]

# Verify
curl https://your-app.vercel.app/api/health
```

**Cause: Supabase connection issues**
```bash
# Check Supabase status
Open: https://status.supabase.com/

# Check connection pool
Go to Supabase Dashboard > Database > Connection Pooling

# If pool exhausted, restart Vercel functions
vercel redeploy --prod
```

**Cause: Environment variable missing/incorrect**
```bash
# Check environment variables
vercel env ls

# Pull current config
vercel env pull .env.local

# Verify critical variables exist
grep "NEXT_PUBLIC_SUPABASE" .env.local
grep "SUPABASE_SERVICE_ROLE_KEY" .env.local
```

---

### 2. Slow Response Times (p95 > 2s)

**Symptoms:**
- Sentry performance alert
- User reports of slow loading
- Vercel analytics show high p95

**Diagnosis:**
```bash
# 1. Check Vercel Analytics
Go to Vercel > Analytics > Performance

# 2. Check Sentry Performance
Go to Sentry > Performance > Transactions
Sort by: p95 Duration

# 3. Identify slow API routes
Look for /api/* transactions with duration > 2s
```

**Common Causes & Fixes:**

**Cause: Slow database queries**
```bash
# Check Supabase query performance
Go to Supabase > Database > Query Performance
Look for queries taking > 1s

# Potential fixes:
# 1. Add missing indexes
# 2. Optimize SELECT * to select specific columns
# 3. Add database connection pooling
```

**Cause: Cold start issues**
```
# Serverless functions cold starting
# Solution: Implement keep-warm ping or upgrade Vercel plan
```

**Cause: External API slowness**
```bash
# Check third-party status pages:
# - Supabase: https://status.supabase.com/
# - Vercel: https://www.vercel-status.com/
# - Sentry: https://status.sentry.io/

# If external service is slow:
# 1. Implement timeout
# 2. Add fallback/caching
# 3. Queue non-critical operations
```

---

### 3. Authentication / Session Issues

**Symptoms:**
- Users can't log in
- Sessions timing out immediately
- "Unauthorized" errors

**Diagnosis:**
```bash
# 1. Check Supabase Auth logs
Go to Supabase > Authentication > Logs

# 2. Check cookie configuration
# Verify HTTPS is enforced
# Verify SameSite and Secure flags are set

# 3. Test auth flow manually
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Common Causes & Fixes:**

**Cause: Supabase Auth service down**
```bash
# Check Supabase status
curl https://YOUR_PROJECT.supabase.co/auth/v1/health

# If down, wait for Supabase resolution
# Check: https://status.supabase.com/
```

**Cause: Cookie configuration issue**
```typescript
// Verify cookie settings in middleware
// Should have:
// - httpOnly: true
// - secure: true (in production)
// - sameSite: 'lax' or 'strict'
// - path: '/'
```

**Cause: Token expiration**
```bash
# Check token refresh logic
# Verify middleware refreshes tokens before expiry
# See: src/middleware.ts
```

---

### 4. Database Connection Errors

**Symptoms:**
- Errors: "ECONNREFUSED", "Connection timeout"
- Sentry alert: "Database Connection Errors"
- All database operations failing

**Diagnosis:**
```bash
# 1. Check Supabase project status
Go to Supabase Dashboard > Project Overview

# 2. Check connection pool
Go to Supabase > Database > Connection Pooling
Look for: Active connections vs Max connections

# 3. Test connection manually
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT].supabase.co:5432/postgres"
```

**Common Causes & Fixes:**

**Cause: Connection pool exhausted**
```typescript
// Current limit: 20 connections (free tier)
// Fix options:
// 1. Implement connection pooling in code
// 2. Upgrade Supabase plan
// 3. Optimize queries to reduce connection duration
// 4. Restart application (forces connection reset)

// Quick fix: Redeploy to reset connections
vercel redeploy --prod
```

**Cause: Supabase network issue**
```bash
# Check Supabase status
curl https://status.supabase.com/

# If network issue, wait for resolution
# ETA typically: 5-30 minutes
```

**Cause: Invalid credentials**
```bash
# Verify environment variables
vercel env ls

# Check if SUPABASE_SERVICE_ROLE_KEY is set
# Rotate key if compromised:
# 1. Go to Supabase > Settings > API
# 2. Generate new service_role key
# 3. Update Vercel environment variable
# 4. Redeploy
```

---

### 5. Real-Time Updates Not Working

**Symptoms:**
- Players not seeing other players join
- Votes not updating in real-time
- Session status changes not propagating

**Diagnosis:**
```bash
# 1. Check Supabase Realtime status
Go to Supabase > Database > Replication
Verify: Realtime is enabled

# 2. Check WebSocket connection
# Open browser DevTools > Network > WS
# Look for WebSocket connection to Supabase

# 3. Check Supabase Realtime logs
Go to Supabase > Database > Logs
Filter: Realtime errors
```

**Common Causes & Fixes:**

**Cause: Realtime not enabled on table**
```sql
-- Enable realtime on affected table
ALTER PUBLICATION supabase_realtime ADD TABLE sessions_unified;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

**Cause: RLS policies blocking realtime**
```sql
-- Verify RLS policies allow SELECT
-- See: supabase/RLS_POLICIES.md
-- All tables should have public SELECT policy for realtime
```

**Cause: WebSocket connection blocked**
```bash
# Check if corporate firewall blocks WebSocket
# Workaround: Use long-polling fallback (Supabase handles automatically)
# Inform users to check network/firewall
```

---

### 6. Vote Submission Failures

**Symptoms:**
- Players can't submit votes
- 100-point validation failing incorrectly
- Votes not saving to database

**Diagnosis:**
```bash
# 1. Check vote API route
Go to Sentry > Issues > Filter: /api/session/[id]/vote

# 2. Check database function
Go to Supabase > Database > Functions
Verify: submit_votes function exists

# 3. Test vote submission manually
curl -X POST https://your-app.vercel.app/api/session/[SESSION_ID]/vote \
  -H "Content-Type: application/json" \
  -d '{"playerId":"PLAYER_ID","votes":[{"featureId":"FEATURE_ID","points":50}]}'
```

**Common Causes & Fixes:**

**Cause: submit_votes function missing**
```bash
# Apply migration
# File: supabase/migrations/035_add_submit_votes_function.sql
# Go to Supabase > SQL Editor > Paste migration > Run

# Verify function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'submit_votes';
```

**Cause: Session not in "playing" state**
```bash
# Check session status
SELECT id, status FROM sessions_unified WHERE id = '[SESSION_ID]';

# If stuck in wrong state, manual fix:
UPDATE sessions_unified SET status = 'playing' WHERE id = '[SESSION_ID]';
```

**Cause: Player not found in session**
```bash
# Verify player exists
SELECT * FROM players WHERE id = '[PLAYER_ID]' AND session_id = '[SESSION_ID]';

# If player missing, re-join:
# Have user refresh and rejoin session
```

---

## Monitoring Dashboards

### Primary Dashboards (Keep Open During Incidents)

**1. Sentry Issues Dashboard**
```
URL: https://sentry.io/organizations/YOUR_ORG/issues/
What to watch:
- Error spike graph
- Top errors by frequency
- Affected users count
- Recent errors (last 15 min)
```

**2. Vercel Deployment Dashboard**
```
URL: https://vercel.com/YOUR_TEAM/ux-works/deployments
What to watch:
- Latest deployment status
- Function logs (Runtime Logs)
- Build errors
- Deployment timeline
```

**3. Supabase Project Dashboard**
```
URL: https://app.supabase.com/project/YOUR_PROJECT
What to watch:
- Database connection count
- API requests per minute
- Auth requests
- Storage usage
```

**4. Vercel Analytics**
```
URL: https://vercel.com/YOUR_TEAM/ux-works/analytics
What to watch:
- Request count
- p95 response time
- Error rate %
- Top paths by traffic
```

### Secondary Dashboards

**5. Upstash Redis** (if configured)
```
URL: https://console.upstash.com/redis/YOUR_DB
What to watch:
- Connection status
- Rate limit hits
- Memory usage
```

**6. Sentry Performance Dashboard**
```
URL: https://sentry.io/organizations/YOUR_ORG/performance/
What to watch:
- Transaction duration (p50, p75, p95, p99)
- Slow API endpoints
- Database query performance
```

---

## Rollback Procedures

### Option 1: Vercel Dashboard Rollback (Fastest)

**Time:** 2-3 minutes

1. Go to https://vercel.com/YOUR_TEAM/ux-works/deployments
2. Find the last successful deployment (before the issue)
3. Click the "..." menu next to the deployment
4. Click **"Promote to Production"**
5. Confirm the rollback
6. Monitor Sentry for 5 minutes to verify errors stopped

### Option 2: Vercel CLI Rollback

**Time:** 3-5 minutes

```bash
# 1. List recent deployments
vercel ls

# Output shows:
# Age  Deployment                    URL
# 5m   ux-works-abc123.vercel.app   [Current Production]
# 30m  ux-works-xyz789.vercel.app   [Previous Good]

# 2. Rollback to previous deployment
vercel rollback ux-works-xyz789.vercel.app

# 3. Verify rollback
curl https://your-app.vercel.app/api/health

# 4. Check Sentry
# Errors should stop within 1-2 minutes
```

### Option 3: Git Revert + Redeploy

**Time:** 5-10 minutes (use only if Options 1 & 2 unavailable)

```bash
# 1. Find problematic commit
git log --oneline -10

# 2. Revert the commit
git revert [COMMIT_SHA]

# 3. Push to main
git push origin main

# 4. Vercel auto-deploys
# Monitor deployment in Vercel dashboard

# 5. Verify fix
curl https://your-app.vercel.app/api/health
```

### Post-Rollback Actions

- [ ] Update `#incidents` thread: "Rolled back to [deployment]"
- [ ] Monitor Sentry for 15 minutes
- [ ] Verify error rate returns to baseline
- [ ] Create hotfix branch to properly fix the issue
- [ ] Schedule postmortem

---

## Communication Templates

### Internal Slack Announcement (Incident Start)

```
🚨 INCIDENT: [Brief description]

Severity: SEV[1-4]
Started: [Time]
Affected: [X users / X% of traffic]
Status: Investigating

Incident Commander: @[name]
Thread: [Link to incident thread]

Updates will be posted in this thread.
```

### Slack Update (During Investigation)

```
UPDATE [TIME]:
- Root cause: [What we found]
- Current status: [What we're doing]
- ETA: [Expected resolution time]
- Workaround: [If available]
```

### Slack Resolution

```
✅ RESOLVED [TIME]:

Incident duration: [X minutes]
Root cause: [Summary]
Fix applied: [What was done]
Verification: Error rate back to baseline

Postmortem scheduled for: [Date/Time]
Action items: [Link to tracking]

Thank you to: @[contributors]
```

### User-Facing Status Update (if needed)

```
Subject: [Status Update] Service Temporarily Unavailable

Hi,

We experienced a brief service interruption today from [START] to [END].

What happened:
[Brief, non-technical explanation]

What we did:
[What was fixed]

Current status:
The issue is resolved and the service is fully operational.

We apologize for any inconvenience.

If you continue to experience issues, please contact support@yourapp.com.

- The UX Works Team
```

---

## Post-Incident Review

### Incident Report Template

```markdown
# Incident Report: [Brief Title]

**Date:** [YYYY-MM-DD]
**Duration:** [Start time] - [End time] ([X minutes])
**Severity:** SEV[1-4]
**Incident Commander:** [Name]

## Summary
[2-3 sentence summary of what happened]

## Impact
- Users affected: [Number or %]
- Functionality impacted: [What was broken]
- Data loss: [Yes/No, details]
- Revenue impact: [If applicable]

## Timeline (all times in UTC)

| Time | Event |
|------|-------|
| 14:32 | Sentry alert fires: High error rate |
| 14:34 | Incident acknowledged, investigation started |
| 14:38 | Root cause identified: [X] |
| 14:42 | Fix deployed: [Y] |
| 14:45 | Verification: Error rate returned to baseline |
| 14:50 | Incident closed |

## Root Cause
[Detailed explanation of what caused the incident]

## Resolution
[What was done to fix it]

## What Went Well
- Quick detection via Sentry alerts
- Fast acknowledgment and response
- Clear communication in Slack
- [Other positives]

## What Could Be Improved
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

## Action Items

| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Fix X to prevent recurrence] | @engineer | [Date] | P0 |
| [Improve monitoring for Y] | @devops | [Date] | P1 |
| [Update runbook with Z] | @lead | [Date] | P2 |

## Lessons Learned
[Key takeaways for the team]
```

### Postmortem Meeting Agenda

1. **Review Timeline** (5 min)
   - What happened and when

2. **Root Cause Analysis** (10 min)
   - Why did it happen?
   - Contributing factors

3. **Response Evaluation** (10 min)
   - What went well?
   - What could be improved?

4. **Action Items** (10 min)
   - Preventive measures
   - Monitoring improvements
   - Runbook updates

5. **Assign Owners & Due Dates** (5 min)

**No Blame Culture:** Focus on systems and processes, not individuals.

---

## Appendix

### Quick Reference Commands

```bash
# Check Vercel deployment status
vercel ls

# View Vercel logs
vercel logs [deployment-url]

# Rollback deployment
vercel rollback [deployment-url]

# Check Supabase connection
psql "postgres://[CONNECTION_STRING]"

# Run database migration
supabase db push

# Check environment variables
vercel env ls
```

### Emergency Contacts

| Role | Name | Slack | Phone | Email |
|------|------|-------|-------|-------|
| On-Call Engineer | [TBD] | @oncall | [Phone] | oncall@company.com |
| Engineering Lead | [TBD] | @lead | [Phone] | lead@company.com |
| CTO | [TBD] | @cto | [Phone] | cto@company.com |
| Supabase Support | N/A | N/A | N/A | support@supabase.com |

### External Support

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/docs/support
- **Sentry Support:** https://sentry.io/support/

---

**Document Version:** 1.0
**Last Updated:** 2025-12-19
**Next Review:** After first production incident
**Owner:** Engineering Team

---

This runbook should be updated after each incident with new learnings and procedures.
