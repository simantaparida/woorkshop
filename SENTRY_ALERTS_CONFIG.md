# Sentry Alerts Configuration Guide

**Last Updated:** 2025-12-19
**Status:** Ready for Implementation
**Priority:** P0 - Critical for Production

## Overview

This document provides step-by-step instructions for configuring Sentry alerts for the UX Works application. These alerts ensure the team is notified immediately when critical issues occur in production.

---

## Prerequisites

- [ ] Sentry project created: `ux-works`
- [ ] `NEXT_PUBLIC_SENTRY_DSN` configured in Vercel
- [ ] Sentry integration enabled in [sentry.client.config.ts](sentry.client.config.ts) and [sentry.server.config.ts](sentry.server.config.ts)
- [ ] Team members added to Sentry project
- [ ] Slack/Discord webhook configured (optional but recommended)

---

## Alert Configuration Steps

### Step 1: Access Sentry Alert Settings

1. Go to https://sentry.io
2. Navigate to your organization > `ux-works` project
3. Click **Alerts** in the left sidebar
4. Click **Create Alert** button

---

## Critical Alerts (P0) - Page Immediately

### Alert 1: High Error Rate

**When to trigger:** Error rate exceeds acceptable threshold

**Configuration:**
```yaml
Alert Name: "[CRITICAL] High Error Rate - Production"
Environment: production
Metric: Number of errors
Conditions:
  - Error count > 50 in 5 minutes
  - OR
  - Error rate > 10% in 5 minutes (if you have traffic metrics)
Filters:
  - environment: production
  - level: error OR fatal
Actions:
  - Send notification to: #incidents (Slack)
  - Send email to: oncall@yourcompany.com
  - Create PagerDuty incident (if configured)
```

**Steps in Sentry UI:**
1. Alert Name: `[CRITICAL] High Error Rate - Production`
2. Environment: `production`
3. Metric: **Errors**
4. Trigger: When event count for a project is **more than 50** in **5 minutes**
5. Filters: Add filter `level:error OR fatal`
6. Actions:
   - Slack: `#incidents`
   - Email: Team distribution list
7. Save Alert

---

### Alert 2: Critical Error Spike

**When to trigger:** Single error type affects many users

**Configuration:**
```yaml
Alert Name: "[CRITICAL] Error Spike - Single Issue"
Environment: production
Metric: Issue frequency
Conditions:
  - Single issue > 100 events in 1 hour
  - Level: error OR fatal
Filters:
  - environment: production
Actions:
  - Slack: #incidents
  - Email: oncall@yourcompany.com
```

**Steps in Sentry UI:**
1. Alert Name: `[CRITICAL] Error Spike - Single Issue`
2. Environment: `production`
3. Metric: **Issue**
4. Trigger: When an issue is seen **more than 100 times** in **1 hour**
5. Filters: `level:error OR fatal`
6. Actions: Slack + Email
7. Save Alert

---

### Alert 3: Production Deployment Failure

**When to trigger:** New release causes immediate errors

**Configuration:**
```yaml
Alert Name: "[CRITICAL] New Release Error Spike"
Environment: production
Metric: New issues
Conditions:
  - > 10 new issues in first 10 minutes after release
Filters:
  - environment: production
  - first_seen: last 10 minutes
Actions:
  - Slack: #incidents
  - Email: oncall@yourcompany.com
```

**Steps in Sentry UI:**
1. Alert Name: `[CRITICAL] New Release Error Spike`
2. Environment: `production`
3. Metric: **Issues**
4. Trigger: When **more than 10 new issues** appear in **10 minutes**
5. Filters: `first_seen:-10m`
6. Actions: Slack + Email
7. Save Alert

---

## High Priority Alerts (P1) - Notify Team

### Alert 4: Performance Degradation

**When to trigger:** Response times significantly increase

**Configuration:**
```yaml
Alert Name: "[HIGH] Performance Degradation - Slow Transactions"
Environment: production
Metric: Transaction duration
Conditions:
  - p95 duration > 2000ms for 10 minutes
  - Transaction: /api/*
Filters:
  - environment: production
  - transaction.op: http.server
Actions:
  - Slack: #engineering
  - Email: team@yourcompany.com
```

**Steps in Sentry UI:**
1. Alert Name: `[HIGH] Performance Degradation - Slow Transactions`
2. Environment: `production`
3. Metric: **Performance** > **Duration (p95)**
4. Trigger: When p95 is **more than 2000ms** for **10 minutes**
5. Filters: `transaction:/api/*`
6. Actions: Slack `#engineering`
7. Save Alert

---

### Alert 5: Elevated Error Rate (Warning)

**When to trigger:** Error rate increases but not critical

**Configuration:**
```yaml
Alert Name: "[HIGH] Elevated Error Rate"
Environment: production
Metric: Error count
Conditions:
  - 25-50 errors in 10 minutes
Filters:
  - environment: production
Actions:
  - Slack: #engineering
```

**Steps in Sentry UI:**
1. Alert Name: `[HIGH] Elevated Error Rate`
2. Environment: `production`
3. Metric: **Errors**
4. Trigger: When event count is **between 25 and 50** in **10 minutes**
5. Actions: Slack `#engineering`
6. Save Alert

---

### Alert 6: Database Connection Errors

**When to trigger:** Supabase connection issues detected

**Configuration:**
```yaml
Alert Name: "[HIGH] Database Connection Errors"
Environment: production
Metric: Event count
Conditions:
  - Message contains: "supabase" OR "database" OR "connection"
  - Count > 10 in 5 minutes
Filters:
  - environment: production
  - message: *supabase* OR *database* OR *ECONNREFUSED*
Actions:
  - Slack: #incidents
  - Email: oncall@yourcompany.com
```

**Steps in Sentry UI:**
1. Alert Name: `[HIGH] Database Connection Errors`
2. Environment: `production`
3. Metric: **Events**
4. Trigger: When **more than 10 events** match filters in **5 minutes**
5. Filters:
   - Add filter: `message:*supabase* OR *database* OR *ECONNREFUSED*`
6. Actions: Slack + Email
7. Save Alert

---

## Medium Priority Alerts (P2) - Daily Review

### Alert 7: Slow Database Queries

**When to trigger:** Database operations take too long

**Configuration:**
```yaml
Alert Name: "[MEDIUM] Slow Database Queries"
Environment: production
Metric: Span duration
Conditions:
  - Span description contains: "SELECT" OR "INSERT" OR "UPDATE"
  - Duration > 1000ms
  - Count > 5 in 15 minutes
Filters:
  - environment: production
  - span.op: db.query
Actions:
  - Slack: #engineering
```

---

### Alert 8: High Session Replay Volume

**When to trigger:** Unusual number of replays (might indicate user frustration)

**Configuration:**
```yaml
Alert Name: "[MEDIUM] High Session Replay Volume"
Environment: production
Metric: Session Replay count
Conditions:
  - > 50 replays in 1 hour
Filters:
  - environment: production
Actions:
  - Slack: #product
```

---

## Alert Notification Channels

### Slack Integration

1. Go to Sentry > Settings > Integrations
2. Click **Slack**
3. Click **Add Workspace**
4. Authorize Sentry to access your Slack workspace
5. Configure channels:
   - `#incidents` - Critical alerts only
   - `#engineering` - All engineering-related alerts
   - `#product` - Product/UX issues

### Email Notifications

1. Go to Sentry > Settings > Teams
2. Select your team
3. Add team members
4. Configure email notification preferences

### PagerDuty (Optional)

1. Go to Sentry > Settings > Integrations
2. Click **PagerDuty**
3. Follow setup wizard
4. Map Sentry projects to PagerDuty services

---

## Alert Thresholds by Environment

| Alert Type | Production | Staging |
|-----------|-----------|---------|
| Error Rate | > 50 errors/5min | > 100 errors/5min |
| Performance | p95 > 2s | p95 > 5s |
| Single Issue | > 100/hour | > 200/hour |
| New Issues | > 10/10min | > 20/10min |

**Rationale:** Staging can tolerate higher thresholds since it's for testing.

---

## Testing Alerts

### Test Alert Functionality

After configuring alerts, test them:

1. **Trigger Test Error:**
   ```typescript
   // In development or staging
   throw new Error('[TEST ALERT] This is a test error for alert verification');
   ```

2. **Check Sentry:**
   - Go to Sentry Issues
   - Verify test error appears
   - Check if alert triggered
   - Verify Slack notification received

3. **Verify Alert Rules:**
   - Sentry > Alerts
   - Click on each alert
   - Check "Alert History" to see test triggers

4. **Clean Up:**
   - Resolve test issues in Sentry
   - Document that alerts are working

### Manual Test Checklist

- [ ] High Error Rate alert triggers and sends Slack notification
- [ ] Error Spike alert triggers for single issue
- [ ] Performance alert triggers for slow transactions
- [ ] Database connection alert triggers
- [ ] Email notifications delivered
- [ ] PagerDuty integration works (if configured)

---

## Alert Response Workflow

### When Alert Fires

1. **Acknowledge**
   - Someone from team acknowledges in Slack
   - Prevents duplicate responses

2. **Assess Severity**
   - Check Sentry for error details
   - Determine impact (how many users affected?)
   - Classify: P0 (critical), P1 (high), P2 (medium)

3. **Take Action**
   - **P0:** Immediate investigation, consider rollback
   - **P1:** Investigate within 1 hour
   - **P2:** Add to backlog for next sprint

4. **Communicate**
   - Update Slack thread with findings
   - If user-facing, consider status page update
   - Notify stakeholders if severe

5. **Resolve**
   - Fix deployed
   - Verify error rate returns to normal
   - Mark Sentry issues as resolved
   - Write postmortem if P0

### Escalation Path

```
Level 1: Alert fires → Slack notification → On-call engineer acknowledges
Level 2: Not resolved in 15 min → Page engineering lead
Level 3: Not resolved in 30 min → Page CTO/VP Engineering
```

---

## Alert Tuning

### Review Weekly

1. Check for **alert fatigue**:
   - Are alerts firing too frequently?
   - Are they actionable?
   - Adjust thresholds if needed

2. Check for **missed issues**:
   - Were there production issues without alerts?
   - Add new alert rules
   - Tighten thresholds

3. Update alert configs in this document

### Metrics to Track

- **Time to Detect (TTD):** Alert fired to team awareness
- **Time to Acknowledge (TTA):** Alert fired to acknowledgment
- **Time to Resolve (TTR):** Alert fired to resolution
- **False Positive Rate:** Alerts that didn't require action

**Targets:**
- TTD: < 2 minutes
- TTA: < 5 minutes
- TTR: < 30 minutes (P0)
- False Positive Rate: < 10%

---

## Sentry Best Practices

### 1. Release Tracking

Ensure releases are tracked in Sentry:

```typescript
// In sentry.client.config.ts and sentry.server.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
});
```

### 2. User Context

Add user context to errors:

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email, // Only if permitted by privacy policy
});
```

### 3. Custom Tags

Tag errors for better filtering:

```typescript
Sentry.setTag('session_id', sessionId);
Sentry.setTag('player_count', playerCount);
```

### 4. Breadcrumbs

Add breadcrumbs for context:

```typescript
Sentry.addBreadcrumb({
  category: 'voting',
  message: 'User submitted votes',
  level: 'info',
  data: { voteCount: votes.length },
});
```

---

## Production Readiness Checklist

- [ ] All 8 alert rules configured in Sentry
- [ ] Slack integration working
- [ ] Email notifications configured
- [ ] Test alerts verified
- [ ] Team trained on alert response
- [ ] Escalation path documented
- [ ] Weekly alert review scheduled
- [ ] Sentry release tracking enabled
- [ ] Session Replay configured (10% sample rate)
- [ ] Source maps uploaded automatically

---

## Monitoring Dashboard

Create a Sentry dashboard to visualize key metrics:

1. Go to Sentry > Dashboards
2. Create New Dashboard: "Production Health"
3. Add widgets:
   - Error Rate (last 24 hours)
   - p95 Response Time (last 24 hours)
   - Top 10 Errors by frequency
   - Errors by release
   - Session Replay count
   - Affected Users count

---

## References

- **Sentry Documentation:** https://docs.sentry.io/product/alerts/
- **Alert Rules:** https://sentry.io/organizations/YOUR_ORG/alerts/rules/
- **Incident Response:** [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md)
- **Production Readiness:** [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md)

---

**Next Steps:**
1. Create Sentry account (if not already created)
2. Configure all 8 alert rules following this guide
3. Test each alert
4. Train team on alert response
5. Schedule weekly alert review meeting

**Status:** ⚠️ Pending Implementation
**Owner:** DevOps / Engineering Lead
**Deadline:** Before production launch
