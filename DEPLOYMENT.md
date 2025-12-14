# Deployment Guide

Complete guide for deploying the UX Works application to Vercel and configuring continuous deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [GitHub Actions Setup](#github-actions-setup)
- [Deployment Workflow](#deployment-workflow)
- [Troubleshooting](#troubleshooting)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ GitHub repository with latest code
- ✅ Vercel account ([sign up here](https://vercel.com/signup))
- ✅ Supabase project ([create one here](https://supabase.com/dashboard))
- ✅ (Optional) Sentry account for error tracking
- ✅ (Optional) Upstash Redis for distributed rate limiting

---

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended for First-Time Setup)

#### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository
5. Click **"Import"**

#### Step 2: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Development Command: npm run dev
```

**Root Directory:** `./` (leave as default)

**Node.js Version:** 18.x (recommended)

#### Step 3: Add Environment Variables

Click **"Environment Variables"** and add the following:

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Optional Variables:**
```env
# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token

# Distributed Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Logging
LOG_LEVEL=info
```

**How to get Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings > API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Visit your deployment URL
4. Test the application

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview (development)
vercel

# Deploy to production
vercel --prod
```

**Pull project configuration:**
```bash
# First time setup
vercel link

# Pull environment variables
vercel env pull .env.local
```

**Build and deploy:**
```bash
# Build for production
vercel build --prod

# Deploy pre-built artifact
vercel deploy --prebuilt --prod
```

---

## Environment Variables

### Required Environment Variables

| Variable | Description | Where to Get | Environment |
|----------|-------------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard > Settings > API | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | Supabase Dashboard > Settings > API | Production, Preview |

### Optional Environment Variables

| Variable | Description | Default | When to Use |
|----------|-------------|---------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | - | Production (recommended) |
| `SENTRY_ORG` | Sentry organization slug | - | Production |
| `SENTRY_PROJECT` | Sentry project slug | - | Production |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | - | Production |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | - | Production (for distributed rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | - | Production |
| `LOG_LEVEL` | Logging verbosity | `info` | All environments |
| `NODE_ENV` | Environment mode | `production` | Auto-set by Vercel |

### Environment Variable Best Practices

1. **Never commit secrets** to git
2. **Use `.env.local`** for local development (already in `.gitignore`)
3. **Reference `.env.local.example`** for required variables
4. **Rotate keys** regularly (especially after suspected exposure)
5. **Use different Supabase projects** for development and production

---

## GitHub Actions Setup

The project includes 4 GitHub Actions workflows for CI/CD:

### 1. CI Workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml))

**Triggers:** On push and PR to `main` or `develop`

**Jobs:**
- ✅ Lint & Type Check
- ✅ Unit Tests (with coverage report)
- ✅ Build Check
- ✅ Security Audit (npm audit)

**Required Secrets:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 2. PR Checks Workflow ([.github/workflows/pr-checks.yml](.github/workflows/pr-checks.yml))

**Triggers:** On PR open, sync, or ready for review

**Jobs:**
- ✅ PR Metadata Check (conventional commits)
- ✅ PR Size Check (auto-labels)
- ✅ Dependency Changes Detection
- ✅ Test Coverage Check
- ✅ Merge Conflict Check

**No secrets required**

### 3. E2E Tests Workflow ([.github/workflows/e2e-tests.yml](.github/workflows/e2e-tests.yml))

**Triggers:** On push/PR to `main` or `develop`, or manual trigger

**Jobs:**
- ✅ E2E Tests (Chromium, Firefox, WebKit)
- ✅ Smoke Tests (Quick validation)
- ✅ Mobile Tests (Mobile Chrome, Mobile Safari)

**Required Secrets:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4. Deploy Workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))

**Triggers:** On push to `main` or manual trigger

**Jobs:**
- ✅ Pre-Deploy Checks (type check, lint, tests, build)
- ✅ Deploy to Production (Vercel)
- ✅ Post-Deploy Smoke Tests
- ✅ Deployment Summary

**Required Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## Configuring GitHub Secrets

### Step 1: Get Vercel Credentials

```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Get your credentials from .vercel/project.json
cat .vercel/project.json
```

**You'll need:**
- `projectId` → `VERCEL_PROJECT_ID`
- `orgId` → `VERCEL_ORG_ID`

**Generate Vercel Token:**
1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name: "GitHub Actions"
4. Scope: "Full Account"
5. Expiration: Custom (1 year recommended)
6. Copy token → `VERCEL_TOKEN`

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **"New repository secret"**
4. Add each secret:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### Step 3: Verify Secrets

Create a test workflow run:
```bash
git checkout -b test-deployment
git commit --allow-empty -m "test: verify deployment workflow"
git push origin test-deployment
```

Check GitHub Actions tab for workflow results.

---

## Deployment Workflow

### Automatic Deployment (Recommended)

**Production Deployment:**
```bash
# Merge PR to main branch
git checkout main
git pull origin main

# Create a release (optional but recommended)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Push to main triggers automatic deployment
```

**The deployment workflow will:**
1. Run all pre-deployment checks
2. Build the application
3. Deploy to Vercel production
4. Run smoke tests on production URL
5. Create deployment comment with URL
6. Notify on success/failure

### Manual Deployment

**Via GitHub Actions:**
1. Go to **Actions > Deploy to Vercel**
2. Click **"Run workflow"**
3. Select branch: `main`
4. Click **"Run workflow"**

**Via Vercel CLI:**
```bash
# Production deployment
vercel --prod

# Preview deployment (for testing)
vercel
```

### Preview Deployments

Vercel automatically creates preview deployments for:
- Every push to a branch
- Every pull request

**Preview URL format:**
```
https://your-app-git-{branch-name}-{team}.vercel.app
```

**Benefits:**
- Test changes before merging
- Share with stakeholders
- Run E2E tests against preview

---

## Vercel Project Configuration

### vercel.json (Optional)

Create `vercel.json` in project root for advanced configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "LOG_LEVEL": "info"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/health"
    }
  ]
}
```

**Note:** Security headers are already configured in [src/middleware.ts](src/middleware.ts), so `vercel.json` headers are optional.

---

## Troubleshooting

### Build Failures

**Issue:** "Module not found" during build

**Solution:**
```bash
# Verify all dependencies are in package.json
npm install

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Commit package-lock.json
git add package-lock.json
git commit -m "fix: update package-lock.json"
```

**Issue:** "Environment variable not found"

**Solution:**
1. Check Vercel Dashboard > Project Settings > Environment Variables
2. Ensure variables are added for "Production" environment
3. Redeploy the project

**Issue:** TypeScript errors during build

**Solution:**
```bash
# Run type check locally
npm run type-check

# Fix errors
# Then commit and push
```

---

### Runtime Errors

**Issue:** "Failed to connect to Supabase"

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check Supabase project is running
3. Verify API keys are valid
4. Check Supabase RLS policies

**Issue:** "Rate limit error"

**Solution:**
1. Check Upstash Redis is configured (if using distributed rate limiting)
2. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Check Redis connection in Vercel logs

**Issue:** 500 errors in production

**Solution:**
1. Check Vercel logs: Project > Deployments > [Latest] > Runtime Logs
2. If Sentry is configured, check Sentry dashboard
3. Review error logs for stack traces
4. Check API route logs

---

### Deployment Issues

**Issue:** GitHub Actions workflow fails

**Solution:**
```bash
# Check workflow logs in GitHub Actions tab

# Verify all secrets are configured
# Settings > Secrets and variables > Actions

# Test locally first
npm ci
npm run type-check
npm run lint
npm run test:run
npm run build
```

**Issue:** Vercel deployment stuck

**Solution:**
1. Check Vercel Dashboard for build logs
2. Cancel and retry deployment
3. Check for concurrent deployments
4. Contact Vercel support if issue persists

---

## Post-Deployment Checklist

### Immediately After Deployment

- [ ] Visit production URL and verify homepage loads
- [ ] Test user authentication (signup/login)
- [ ] Create a test session (voting board)
- [ ] Test real-time features (vote updates)
- [ ] Check health endpoint: `https://your-app.vercel.app/api/health`
- [ ] Review Vercel deployment logs for warnings
- [ ] Check Sentry for any errors (if configured)

### Monitoring Setup

- [ ] Set up Vercel Analytics (Project Settings > Analytics)
- [ ] Configure Sentry error tracking
- [ ] Set up Supabase monitoring/alerts
- [ ] Monitor Upstash Redis usage (if applicable)
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)

### Performance Optimization

- [ ] Enable Vercel Speed Insights
- [ ] Check Lighthouse scores (run from DevTools)
- [ ] Review Web Vitals in Vercel Analytics
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable Redis caching for rate limiting

### Security Hardening

- [ ] Review [SECURITY_AUDIT.md](SECURITY_AUDIT.md)
- [ ] Fix critical security issues before production
- [ ] Remove debug endpoint: [src/app/api/sessions/[id]/debug/route.ts](src/app/api/sessions/[id]/debug/route.ts)
- [ ] Fix vote API transaction issue: [src/app/api/session/[id]/vote/route.ts](src/app/api/session/[id]/vote/route.ts)
- [ ] Rotate Supabase service role key after first deployment
- [ ] Set up Content Security Policy (CSP) reporting
- [ ] Enable Vercel Web Application Firewall (WAF) if available

### Database Setup

- [ ] Run Supabase migrations (if any)
- [ ] Verify RLS policies are active
- [ ] Check database indexes for performance
- [ ] Set up database backups (Supabase auto-backups)
- [ ] Test database connection from production

---

## Continuous Deployment Best Practices

### Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (feature branches → preview deployments)
```

**Workflow:**
1. Create feature branch from `develop`
2. Make changes, commit with conventional commits
3. Push → Vercel creates preview deployment
4. Open PR to `develop` → CI checks run
5. Merge to `develop` → Deploy to staging (optional)
6. Create PR from `develop` to `main`
7. Merge to `main` → Automatic production deployment

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructure
test: add tests
chore: maintenance tasks
perf: performance improvements
```

**Examples:**
```bash
git commit -m "feat: add PDF export for voting results"
git commit -m "fix: resolve vote transaction data loss issue"
git commit -m "docs: update deployment guide with Vercel setup"
```

### Rolling Back Deployments

**Via Vercel Dashboard:**
1. Go to Project > Deployments
2. Find previous successful deployment
3. Click "..." menu
4. Select "Promote to Production"

**Via Vercel CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

---

## Additional Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Monitoring & Analytics
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Supabase Dashboard](https://app.supabase.com)
- [Upstash Redis Console](https://console.upstash.com/)

### Support
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: Create issue in your repository

---

## Quick Reference

### Vercel CLI Commands

```bash
# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Preview deployment
vercel

# Production deployment
vercel --prod

# View logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

### npm Scripts

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run start               # Start production server

# Quality Checks
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript check
npm run test                # Run unit tests (watch mode)
npm run test:run            # Run unit tests (single run)
npm run test:coverage       # Generate coverage report

# E2E Tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Run E2E tests with UI
npm run test:e2e:headed     # Run E2E tests in headed mode
npm run test:e2e:debug      # Debug E2E tests
```

---

**Last Updated:** 2025-12-14

For questions or issues, please refer to the [SECURITY_AUDIT.md](SECURITY_AUDIT.md) or create an issue in the repository.
