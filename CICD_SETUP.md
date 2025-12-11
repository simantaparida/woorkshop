# CI/CD Pipeline Setup Guide

**Last Updated:** 2025-12-11
**Platform:** GitHub Actions + Vercel
**Status:** ✅ Complete and Ready to Configure

---

## Table of Contents

- [Overview](#overview)
- [Workflows Created](#workflows-created)
- [Setup Instructions](#setup-instructions)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Workflow Details](#workflow-details)
- [Badge Setup](#badge-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CI/CD pipeline provides automated testing, quality checks, and deployment for every code change.

### Pipeline Architecture

```
Code Push/PR
    ↓
┌───────────────────────────────────────┐
│  CI Workflow (Parallel)               │
│  - Lint & Type Check                  │
│  - Unit Tests (with coverage)         │
│  - Build Check                        │
│  - Security Audit                     │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  E2E Tests (Parallel)                 │
│  - Smoke Tests (5 min)                │
│  - Chromium Tests                     │
│  - Firefox Tests                      │
│  - Webkit Tests                       │
│  - Mobile Tests                       │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  PR Quality Checks                    │
│  - Title format check                 │
│  - PR size check                      │
│  - Dependency changes alert           │
│  - Test coverage check                │
│  - Merge conflict check               │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  Deploy (main branch only)            │
│  - Pre-deploy checks                  │
│  - Deploy to Vercel                   │
│  - Post-deploy smoke tests            │
└───────────────────────────────────────┘
```

---

## Workflows Created

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Pull requests and pushes to main/develop

**Jobs:**
- ✅ **Lint & Type Check** (5 min)
  - ESLint
  - TypeScript type checking
  - Console.log detection

- ✅ **Unit Tests** (10 min)
  - Run all unit tests
  - Generate coverage report
  - Comment coverage on PR

- ✅ **Build Check** (10 min)
  - Verify production build
  - Check build output

- ✅ **Security Audit** (5 min)
  - npm audit for vulnerabilities
  - Fail on critical vulnerabilities

### 2. E2E Tests Workflow (`.github/workflows/e2e-tests.yml`)

**Triggers:** Pull requests and pushes to main/develop

**Jobs:**
- ✅ **Smoke Tests** (5 min) - Quick verification
- ✅ **Browser Tests** (15 min each)
  - Chromium
  - Firefox
  - Webkit (Safari)
- ✅ **Mobile Tests** (10 min)
  - Mobile Chrome
  - Mobile Safari

**Features:**
- Parallel test execution across browsers
- Test artifacts uploaded (reports, traces)
- Auto-retry on failure (2 retries in CI)

### 3. PR Quality Checks (`.github/workflows/pr-checks.yml`)

**Triggers:** Pull request events (opened, synchronized)

**Checks:**
- ✅ **PR Title Format** - Enforces conventional commits
- ✅ **PR Description** - Warns if too short
- ✅ **PR Size** - Labels PRs by size (S/M/L/XL)
- ✅ **Dependency Changes** - Alerts on package.json changes
- ✅ **Test Coverage** - Warns if no tests added with code
- ✅ **Merge Conflicts** - Detects conflicts

### 4. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:** Pushes to main branch, manual trigger

**Jobs:**
- ✅ **Pre-Deploy Checks**
  - Type check
  - Lint
  - Unit tests
  - Build

- ✅ **Deploy to Production**
  - Pull Vercel environment
  - Build project
  - Deploy to Vercel
  - Comment deployment URL

- ✅ **Post-Deploy Smoke Tests**
  - Run smoke tests against production
  - Verify deployment health

---

## Setup Instructions

### Step 1: Push Workflows to GitHub

The workflow files are already created in `.github/workflows/`. Push them to your repository:

```bash
git add .github/workflows/
git commit -m "chore: add CI/CD workflows"
git push origin main
```

### Step 2: Configure GitHub Secrets

Go to your repository on GitHub:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

---

## GitHub Secrets Configuration

### Required Secrets

#### Supabase Secrets
```
Name: SUPABASE_URL
Value: https://your-project.supabase.co

Name: SUPABASE_ANON_KEY
Value: your-anon-key-here
```

**Where to find:**
1. Go to your Supabase project
2. Click **Settings** → **API**
3. Copy **Project URL** and **anon/public key**

#### Vercel Secrets (for deployment)
```
Name: VERCEL_TOKEN
Value: your-vercel-token

Name: VERCEL_ORG_ID
Value: your-org-id

Name: VERCEL_PROJECT_ID
Value: your-project-id
```

**How to get Vercel secrets:**

1. **VERCEL_TOKEN:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Get token
   vercel token add "GitHub Actions"
   ```
   Copy the token and add to GitHub secrets.

2. **VERCEL_ORG_ID and VERCEL_PROJECT_ID:**
   ```bash
   # Link your project
   vercel link

   # Get IDs from .vercel/project.json
   cat .vercel/project.json
   ```
   Copy `orgId` and `projectId` to GitHub secrets.

### Optional Secrets

#### Test User Credentials (for E2E tests with authentication)
```
Name: TEST_USER_EMAIL
Value: test@example.com

Name: TEST_USER_PASSWORD
Value: testpassword123
```

---

## Workflow Details

### CI Workflow Behavior

**On Pull Request:**
- ✅ Runs all quality checks
- ✅ Comments test coverage on PR
- ✅ Reports status to PR checks

**On Push to Main:**
- ✅ Runs all checks
- ✅ Triggers deployment (if checks pass)

**Failure Handling:**
- ❌ PR cannot be merged if CI fails
- ❌ Deployment blocked if checks fail
- 🔄 E2E tests retry 2 times on failure

### E2E Test Workflow

**Test Execution:**
- Runs in parallel across browsers (faster)
- Smoke tests run separately (quick feedback)
- Mobile tests run independently

**Artifacts:**
- Test reports saved for 30 days
- Trace files saved for 7 days (on failure)
- Download from Actions tab → Artifacts

### PR Quality Workflow

**Automated Checks:**
- Labels PRs by size (size/S, size/M, size/L, size/XL)
- Comments on PRs with helpful information
- Non-blocking (won't prevent merge)

**PR Title Format:**
Must start with:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance
- `perf:` - Performance

Example: `feat: add user dashboard`

### Deploy Workflow

**Deployment Process:**
1. Pre-deployment checks (all must pass)
2. Build and deploy to Vercel
3. Post-deployment smoke tests
4. Comment deployment URL on commit

**Rollback:**
If post-deploy tests fail, manually rollback in Vercel:
```bash
vercel rollback <deployment-url>
```

---

## Badge Setup

Update the badges in README.md with your actual repository:

```markdown
[![CI](https://github.com/USERNAME/REPO/workflows/CI/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/USERNAME/REPO/workflows/E2E%20Tests/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/e2e-tests.yml)
[![Deploy](https://github.com/USERNAME/REPO/workflows/Deploy%20to%20Vercel/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/deploy.yml)
```

Replace `USERNAME` and `REPO` with your GitHub username and repository name.

---

## Workflow Configuration

### Customizing Timeouts

In workflow files, adjust timeouts as needed:

```yaml
jobs:
  test:
    timeout-minutes: 15  # Change this value
```

### Customizing Triggers

Add or remove triggers:

```yaml
on:
  push:
    branches: [main, develop, staging]  # Add branches
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Run weekly
```

### Customizing Matrix

Test on more/fewer browsers:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox]  # Remove webkit
    # OR
    browser: [chromium, firefox, webkit, edge]  # Add edge
```

---

## Local Testing of Workflows

Test workflow syntax:

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act -j lint  # Run lint job
act -j unit-tests  # Run unit tests job
act  # Run all jobs
```

**Note:** E2E tests may not work locally with `act` due to browser requirements.

---

## Monitoring Workflows

### View Workflow Runs

1. Go to your repository on GitHub
2. Click **Actions** tab
3. See all workflow runs

### Check Specific Run

1. Click on a workflow run
2. See jobs and their status
3. Click job to see logs
4. Download artifacts if available

### Email Notifications

GitHub automatically sends email on:
- ❌ Workflow failures (to commit author)
- ✅ Fixed workflows (after failure)

Configure in: **Settings** → **Notifications** → **Actions**

---

## Troubleshooting

### Workflow Not Running

**Issue:** Workflow doesn't trigger

**Solutions:**
1. Check workflow file syntax:
   ```bash
   # Install actionlint
   brew install actionlint

   # Check syntax
   actionlint .github/workflows/*.yml
   ```

2. Verify triggers match your event (push, PR, etc.)

3. Check if workflows are enabled:
   - Go to **Actions** tab
   - Click **Enable Actions** if disabled

### Secrets Not Found

**Issue:** `Error: Secret SUPABASE_URL not found`

**Solutions:**
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is in repository (not organization)
3. For forks: secrets need to be added to fork

### Tests Failing in CI But Passing Locally

**Common causes:**
1. **Environment variables:** Check secrets are set
2. **Timeout issues:** Increase timeout in workflow
3. **Flaky tests:** Add retries or fix race conditions
4. **Dependencies:** Clear cache and reinstall

**Debug:**
```yaml
# Add to workflow
- name: Debug info
  run: |
    echo "Node version: $(node -v)"
    echo "npm version: $(npm -v)"
    echo "Working directory: $(pwd)"
    ls -la
```

### Deployment Fails

**Issue:** Vercel deployment fails

**Solutions:**
1. Verify Vercel secrets are correct
2. Check build logs in workflow
3. Test build locally:
   ```bash
   npm run build
   ```
4. Check Vercel dashboard for errors

### E2E Tests Timeout

**Issue:** E2E tests timeout in CI

**Solutions:**
1. Increase timeout in playwright.config.ts:
   ```typescript
   timeout: 60 * 1000, // 60 seconds
   ```

2. Use fewer workers in CI:
   ```typescript
   workers: process.env.CI ? 1 : undefined,
   ```

3. Run tests sequentially:
   ```yaml
   - name: Run E2E tests
     run: CI=true npx playwright test --workers=1
   ```

---

## Performance Optimization

### Speed Up CI

1. **Use caching:**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'  # Cache node_modules
   ```

2. **Run jobs in parallel:**
   - Already configured in workflows

3. **Use matrix strategically:**
   ```yaml
   strategy:
     matrix:
       browser: [chromium]  # Test one browser in CI, all locally
   ```

4. **Skip unnecessary jobs:**
   ```yaml
   if: github.event_name == 'push' && github.ref == 'refs/heads/main'
   ```

---

## Cost Management

### GitHub Actions Minutes

**Free tier:** 2,000 minutes/month for private repos

**Estimated usage per push:**
- CI: ~10 minutes
- E2E (3 browsers): ~30 minutes
- Deploy: ~15 minutes
- **Total:** ~55 minutes per push

**Optimization tips:**
1. Run E2E only on PRs (not every push)
2. Test single browser for draft PRs
3. Use self-hosted runners for unlimited minutes

### Vercel Deployments

**Hobby plan:** Unlimited deployments
**Pro plan:** $20/month per team member

---

## Next Steps

1. **Push workflows to GitHub** ✅
2. **Add secrets** ⏳
3. **Make a test PR** to verify workflows
4. **Monitor first runs** and adjust as needed
5. **Update badges** in README.md
6. **Set up branch protection** rules

### Branch Protection Rules

Recommended settings:
1. Go to **Settings** → **Branches**
2. Add rule for `main`
3. Enable:
   - ✅ Require status checks to pass
   - ✅ Require CI workflow
   - ✅ Require E2E workflow (optional)
   - ✅ Require pull request reviews
   - ✅ Dismiss stale reviews

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Summary

✅ **4 workflows created and configured**
✅ **Parallel test execution for speed**
✅ **Automated deployment to Vercel**
✅ **PR quality checks**
✅ **Security auditing**
✅ **Test coverage reporting**
✅ **Post-deploy verification**

**Your CI/CD pipeline is production-ready!** 🚀

Add the GitHub secrets and push to see it in action.
