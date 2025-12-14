# GitHub Actions & CI/CD Guide

Complete documentation for the GitHub Actions workflows configured in this project.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Required Secrets](#required-secrets)
- [Workflow Details](#workflow-details)
- [Status Badges](#status-badges)
- [Troubleshooting](#troubleshooting)
- [Customization](#customization)

---

## Overview

This project uses **4 GitHub Actions workflows** for continuous integration and deployment:

| Workflow | File | Purpose | Triggers |
|----------|------|---------|----------|
| **CI** | [ci.yml](.github/workflows/ci.yml) | Lint, test, build, security audit | Push/PR to main/develop |
| **PR Checks** | [pr-checks.yml](.github/workflows/pr-checks.yml) | PR quality validation | PR open/sync/ready |
| **E2E Tests** | [e2e-tests.yml](.github/workflows/e2e-tests.yml) | End-to-end testing | Push/PR to main/develop, manual |
| **Deploy** | [deploy.yml](.github/workflows/deploy.yml) | Production deployment | Push to main, manual |

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Workflow                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Push/Commit  │    │  Pull Request│    │Push to main  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  CI Workflow │    │  PR Checks   │    │Deploy Workflow│
│              │    │  CI Workflow │    │              │
│  • Lint      │    │  E2E Tests   │    │  • Pre-deploy│
│  • Type Check│    │              │    │  • Deploy    │
│  • Unit Tests│    │  • Metadata  │    │  • Smoke Test│
│  • Build     │    │  • Size Check│    │              │
│  • Security  │    │  • Coverage  │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Required Secrets

### Repository Secrets

Configure these in **Settings > Secrets and variables > Actions**:

| Secret | Description | Where to Get | Required For |
|--------|-------------|--------------|--------------|
| `SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com) > Settings > API | All workflows |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API | All workflows |
| `VERCEL_TOKEN` | Vercel authentication token | [Vercel Account](https://vercel.com/account/tokens) | Deploy workflow |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` after `vercel link` | Deploy workflow |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` after `vercel link` | Deploy workflow |

### How to Add Secrets

```bash
# 1. Get Vercel credentials
npm install -g vercel
vercel login
vercel link
cat .vercel/project.json

# 2. Get Supabase credentials
# Visit https://app.supabase.com > Your Project > Settings > API
```

**Add to GitHub:**
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add name and value
5. Click **"Add secret"**

---

## Workflows

### 1. CI Workflow

**File:** [.github/workflows/ci.yml](.github/workflows/ci.yml)

#### Trigger Conditions
```yaml
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]
```

#### Jobs

##### Job 1: Lint & Type Check
**Duration:** ~2 minutes

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (npm ci)
4. Run ESLint
5. Run TypeScript type check
6. Check for console.log statements (warning only)
```

**Success Criteria:**
- ✅ No ESLint errors
- ✅ No TypeScript type errors
- ⚠️ Warning if console.log found (doesn't fail)

##### Job 2: Unit Tests
**Duration:** ~3 minutes

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run unit tests (vitest)
5. Generate coverage report
6. Upload coverage artifact
7. Comment coverage on PR (if PR)
```

**Success Criteria:**
- ✅ All unit tests pass
- ✅ Coverage threshold met (70% lines, statements, functions, branches)

**Coverage Report Example:**
```markdown
## 📊 Test Coverage Report

| Metric | Coverage |
|--------|----------|
| **Lines** | 75% |
| **Statements** | 76% |
| **Functions** | 72% |
| **Branches** | 71% |

✅ Overall coverage: 75%
```

##### Job 3: Build Check
**Duration:** ~4 minutes

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Build application (next build)
5. Verify .next directory exists
```

**Success Criteria:**
- ✅ Build completes without errors
- ✅ `.next` directory created

##### Job 4: Security Audit
**Duration:** ~1 minute

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Run npm audit (moderate level)
4. Check for critical/high vulnerabilities
5. Fail if critical vulnerabilities found
```

**Success Criteria:**
- ✅ No critical vulnerabilities
- ⚠️ High vulnerabilities logged but don't fail build

##### Job 5: All Checks Passed
**Duration:** <1 minute

**Summary job** that requires all previous jobs to succeed. Creates a summary in GitHub Actions UI.

#### Example Summary Output

```markdown
## ✅ All Checks Passed

- ✅ Linting & Type Check
- ✅ Unit Tests
- ✅ Build Check
- ✅ Security Audit
```

#### Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Behavior:** If a new push occurs while CI is running, the previous run is cancelled to save resources.

---

### 2. PR Checks Workflow

**File:** [.github/workflows/pr-checks.yml](.github/workflows/pr-checks.yml)

#### Trigger Conditions
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
```

**Note:** Only runs on non-draft PRs

#### Jobs

##### Job 1: PR Metadata Check
**Duration:** <1 minute

**Validates:**
- ✅ PR title follows [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ PR description is not too short (<20 chars)

**Valid PR Title Prefixes:**
```
feat:      - New feature
fix:       - Bug fix
docs:      - Documentation changes
style:     - Formatting, missing semicolons, etc.
refactor:  - Code refactoring
test:      - Adding tests
chore:     - Maintenance tasks
perf:      - Performance improvements
```

**Example PR Titles:**
```
✅ feat: add PDF export for voting results
✅ fix: resolve vote transaction data loss
✅ docs: update deployment guide
❌ Add new feature (missing prefix)
❌ feature: add export (wrong prefix)
```

**Auto-comment if invalid:**
```markdown
❌ **PR Title Format**

Your PR title should follow conventional commits format:

- `feat:`
- `fix:`
- `docs:`
...

Example: `feat: add user dashboard`
```

##### Job 2: PR Size Check
**Duration:** <1 minute

**Categorizes PR size:**

| Size | Additions + Deletions | Changed Files | Label | Emoji |
|------|----------------------|---------------|-------|-------|
| Small | <200 | <10 | `size/S` | 🟢 |
| Medium | 200-500 | 10-20 | `size/M` | 🟡 |
| Large | 500-1000 | 20-30 | `size/L` | 🟠 |
| Extra Large | >1000 | >30 | `size/XL` | 🔴 |

**Auto-labels PR** with size label

**Warns on XL PRs:**
```markdown
🔴 **Large PR Detected**

This PR is quite large (+1200/-300 lines, 45 files).

Consider:
- Breaking it into smaller PRs
- Reviewing the scope
- Adding comprehensive tests

Large PRs are harder to review and more likely to introduce bugs.
```

##### Job 3: Dependency Check
**Duration:** <1 minute

**Detects changes to:**
- `package.json`
- `package-lock.json`

**Auto-comment if changed:**
```markdown
## 📦 Dependency Changes Detected

The following dependency files were modified:
- `package.json`
- `package-lock.json`

**Please ensure:**
- [ ] Dependencies are necessary for the feature/fix
- [ ] No security vulnerabilities introduced (`npm audit`)
- [ ] Package versions are pinned appropriately
- [ ] Lock file is committed (`package-lock.json`)

**Reviewer:** Pay special attention to new dependencies.
```

##### Job 4: Test Coverage Check
**Duration:** ~2 minutes

**Validates:**
- Source files changed
- Test files added/updated

**Warns if:**
- Source files changed BUT no test files updated

**Auto-comment:**
```markdown
⚠️ **Test Coverage Check**

5 source file(s) were modified, but no test files were added or updated.

Consider adding tests for:
- `src/app/api/session/[id]/vote/route.ts`
- `src/components/FeatureCard.tsx`
- `src/lib/hooks/useSession.ts`
...
```

##### Job 5: Conflict Check
**Duration:** <1 minute

**Checks for merge conflicts** with base branch

**Auto-comment if conflicts:**
```markdown
❌ **Merge Conflicts Detected**

This PR has merge conflicts with the base branch.

To resolve:
\`\`\`bash
git checkout feature-branch
git merge origin/main
# Resolve conflicts
git push
\`\`\`
```

##### Job 6: PR Summary
**Duration:** <1 minute

**Creates summary** of all PR checks:
```markdown
## 🔍 PR Quality Checks Summary

- ✅ PR Metadata: success
- ✅ Size Check: success
- ✅ Dependency Check: success
- ⚠️ Test Coverage: warning
- ✅ Conflict Check: success
```

---

### 3. E2E Tests Workflow

**File:** [.github/workflows/e2e-tests.yml](.github/workflows/e2e-tests.yml)

#### Trigger Conditions
```yaml
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]
  workflow_dispatch: # Manual trigger
```

#### Jobs

##### Job 1: E2E Tests (Multi-browser)
**Duration:** ~5-8 minutes per browser

**Test Matrix:**
```yaml
strategy:
  fail-fast: false
  matrix:
    browser: [chromium, firefox, webkit]
```

**Runs in parallel** across 3 browsers

**Steps:**
```yaml
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Install Playwright browser
5. Run E2E tests for browser
6. Upload test results (artifact)
7. Upload traces (on failure)
```

**Test Files:** All `.spec.ts` files in `e2e/` directory

**Artifacts Uploaded:**
- `playwright-report-{browser}` (30 days retention)
- `playwright-traces-{browser}` (7 days retention, on failure)

##### Job 2: Smoke Tests
**Duration:** ~2 minutes

**Quick validation tests** (Chromium only)

**Purpose:** Fast feedback for critical paths
- Homepage loads
- Health endpoint responds
- Basic navigation works

**Test File:** `e2e/smoke.spec.ts`

##### Job 3: Mobile Tests
**Duration:** ~4 minutes

**Test Matrix:**
```yaml
Projects:
  - Mobile Chrome (Android)
  - Mobile Safari (iOS)
```

**Validates:**
- Responsive design
- Touch interactions
- Mobile-specific features

**Artifact:** `playwright-mobile-report` (7 days retention)

##### Job 4: Test Summary
**Duration:** <1 minute

**Creates summary** with downloadable artifacts:
```markdown
## 🎭 E2E Test Results

### Test Jobs Status

- **Smoke Tests**: success
- **Chromium Tests**: success
- **Mobile Tests**: success

📊 Test artifacts are available in the Actions tab.
```

#### Viewing Test Results

**In GitHub Actions:**
1. Go to **Actions** tab
2. Click on workflow run
3. Scroll to **Artifacts** section
4. Download `playwright-report-{browser}`
5. Extract and open `index.html`

**Locally:**
```bash
# Run E2E tests
npm run test:e2e

# Open report
npm run test:e2e:report

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

---

### 4. Deploy Workflow

**File:** [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

#### Trigger Conditions
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger
```

**Note:** Only deploys from `main` branch (production)

#### Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false # Don't cancel production deployments
```

**Important:** Production deployments are **NOT** cancelled to prevent partial deployments.

#### Jobs

##### Job 1: Pre-Deploy Checks
**Duration:** ~5 minutes

**Runs all quality checks:**
```yaml
1. TypeScript type check
2. ESLint
3. Unit tests
4. Build check
```

**Uploads:** Production build artifact (`.next/` directory, 7 days retention)

**Fail-fast:** If any check fails, deployment is aborted

##### Job 2: Deploy to Production
**Duration:** ~3-5 minutes

**Environment:** `production` (GitHub environment)

**Steps:**
```yaml
1. Checkout code
2. Install Vercel CLI
3. Pull Vercel environment info
4. Build project artifacts
5. Deploy to Vercel production
6. Create deployment comment
```

**Vercel Deployment Process:**
```bash
# Pull environment configuration
vercel pull --yes --environment=production

# Build for production
vercel build --prod

# Deploy pre-built artifacts
vercel deploy --prebuilt --prod
```

**Output:** Deployment URL (e.g., `https://your-app.vercel.app`)

**Auto-comment on commit:**
```markdown
## 🚀 Deployment Successful

**Environment:** Production
**URL:** https://your-app.vercel.app
**Commit:** 9578a9c - fix: resolve TypeScript errors
**Branch:** main
**Deployed by:** @username

**Quick Links:**
- 🌐 [Visit Site](https://your-app.vercel.app)
- 📊 [Vercel Dashboard](https://vercel.com/dashboard)
- 📈 [Analytics](https://your-app.vercel.app/api/analytics)

---
Deployed at: 2025-12-14T10:30:00Z
```

##### Job 3: Post-Deploy Smoke Tests
**Duration:** ~2 minutes

**Validates production deployment:**
```yaml
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Install Playwright Chromium
5. Run smoke tests against production URL
6. Upload test results
```

**Tests against:** Live production URL from previous job

**Purpose:** Ensure deployment is functional before marking as complete

**Artifact:** `post-deploy-smoke-tests` (7 days retention)

##### Job 4: Deploy Summary
**Duration:** <1 minute

**Creates deployment summary:**
```markdown
## 🚀 Deployment Pipeline Summary

### Jobs Status

- **Pre-Deploy Checks**: success
- **Production Deploy**: success
- **Post-Deploy Tests**: success

✅ **Deployment successful!**

🌐 Visit: https://your-app.vercel.app
```

**On Failure:**
```markdown
❌ **Deployment failed**

Check the logs above for details.
```

**Auto-comment on failure:**
```markdown
❌ **Deployment Failed**

The deployment pipeline failed. Check the [workflow run](...) for details.
```

---

## Status Badges

Add these badges to your `README.md`:

### CI Status
```markdown
[![CI](https://github.com/your-username/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/ci.yml)
```

### E2E Tests Status
```markdown
[![E2E Tests](https://github.com/your-username/your-repo/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/e2e-tests.yml)
```

### Deployment Status
```markdown
[![Deploy](https://github.com/your-username/your-repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/deploy.yml)
```

### All Badges
```markdown
![CI](https://github.com/your-username/your-repo/actions/workflows/ci.yml/badge.svg)
![E2E](https://github.com/your-username/your-repo/actions/workflows/e2e-tests.yml/badge.svg)
![Deploy](https://github.com/your-username/your-repo/actions/workflows/deploy.yml/badge.svg)
```

**Result:**

![CI](https://img.shields.io/badge/CI-passing-brightgreen)
![E2E](https://img.shields.io/badge/E2E%20Tests-passing-brightgreen)
![Deploy](https://img.shields.io/badge/Deploy-success-brightgreen)

---

## Troubleshooting

### Common Issues

#### 1. CI Workflow Fails on Type Check

**Error:**
```
Error: Type check failed
```

**Solution:**
```bash
# Run type check locally
npm run type-check

# Fix TypeScript errors
# Then commit and push
```

#### 2. Unit Tests Fail with Coverage Error

**Error:**
```
Error: Coverage threshold not met
Expected: 70%, Actual: 65%
```

**Solution:**
```bash
# Run tests with coverage locally
npm run test:coverage

# Add tests to increase coverage
# Or adjust thresholds in vitest.config.ts
```

#### 3. Build Fails with Missing Environment Variables

**Error:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**Solution:**
1. Add secrets to GitHub repository
2. Settings > Secrets and variables > Actions
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`

#### 4. E2E Tests Timeout

**Error:**
```
Error: Test timeout of 30000ms exceeded
```

**Solution:**
```typescript
// Increase timeout in test file
test('should load page', async ({ page }) => {
  await page.goto('/', { timeout: 60000 });
});

// Or in playwright.config.ts
export default defineConfig({
  timeout: 60000,
});
```

#### 5. Vercel Deployment Fails

**Error:**
```
Error: Failed to deploy to Vercel
```

**Solution:**
1. Verify Vercel secrets are correct:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
2. Check Vercel CLI authentication:
   ```bash
   vercel whoami
   ```
3. Regenerate Vercel token if expired

#### 6. PR Checks Fail on Title Format

**Error:**
```
PR title should start with one of: feat:, fix:, docs:, ...
```

**Solution:**
```bash
# Rename PR title to follow conventional commits
# Example: "feat: add user authentication"

# Or close and reopen PR with correct title
```

---

## Customization

### Modifying Workflows

#### Change Node.js Version

**In all workflow files:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Changed from 18 to 20
```

#### Add New Job to CI

**Edit:** `.github/workflows/ci.yml`

```yaml
jobs:
  # ... existing jobs

  custom-check:
    name: Custom Check
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run custom script
        run: npm run custom-check

  all-checks:
    name: All Checks Passed
    needs: [lint, unit-tests, build, security, custom-check]  # Add custom-check
    # ... rest of job
```

#### Adjust Coverage Thresholds

**Edit:** `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,      // Changed from 70
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

#### Change Deployment Branch

**Edit:** `.github/workflows/deploy.yml`

```yaml
on:
  push:
    branches: [main, production]  # Added production branch
```

#### Add Staging Deployment

**Create:** `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: ${{ steps.deploy.outputs.url }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Preview)
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
        # ... rest of deployment
```

#### Skip CI on Specific Commits

**In commit message:**
```bash
git commit -m "docs: update README [skip ci]"
```

**Or configure in workflow:**
```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '**.md'
```

---

## Workflow Performance

### Average Execution Times

| Workflow | Average Duration | Billable Minutes |
|----------|------------------|------------------|
| CI | 8-12 minutes | ~12 min |
| PR Checks | 2-4 minutes | ~4 min |
| E2E Tests | 15-20 minutes | ~20 min (parallel) |
| Deploy | 10-15 minutes | ~15 min |

**Total per PR:** ~35-50 minutes of CI/CD time

### Optimization Tips

1. **Cache Dependencies:**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       cache: 'npm'  # Caches node_modules
   ```

2. **Run Jobs in Parallel:**
   ```yaml
   jobs:
     lint:
       # runs independently
     test:
       # runs independently (parallel with lint)
   ```

3. **Skip Unnecessary Runs:**
   ```yaml
   on:
     pull_request:
       paths-ignore:
         - 'docs/**'
   ```

4. **Use Smaller Runners:**
   ```yaml
   runs-on: ubuntu-latest  # Free tier
   # vs
   runs-on: ubuntu-latest-4-cores  # Paid tier, faster
   ```

---

## Best Practices

### 1. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add new feature
fix: resolve bug
docs: update documentation
test: add missing tests
chore: update dependencies
```

### 2. PR Workflow

1. Create feature branch
2. Make changes with conventional commits
3. Push to GitHub
4. Open PR with proper title and description
5. Wait for all checks to pass
6. Request review
7. Merge after approval

### 3. Handling Failed Checks

**If CI fails:**
1. Check GitHub Actions logs
2. Fix issues locally
3. Run checks locally before pushing:
   ```bash
   npm run lint
   npm run type-check
   npm run test:run
   npm run build
   ```
4. Commit and push fixes

**If E2E tests fail:**
1. Download test artifacts
2. Review screenshots/traces
3. Fix issues
4. Run tests locally:
   ```bash
   npm run test:e2e
   ```

### 4. Managing Secrets

1. **Never commit secrets** to repository
2. **Rotate secrets regularly** (quarterly recommended)
3. **Use least privilege** for tokens
4. **Audit secret usage** in Actions logs
5. **Delete unused secrets**

### 5. Monitoring Workflows

1. Enable **email notifications** (Settings > Notifications)
2. Review **workflow runs** regularly
3. Check for **failed runs** and investigate
4. Monitor **Action minutes** usage (Settings > Billing)

---

## Advanced Topics

### Custom Runners

**Use self-hosted runners** for:
- Faster builds
- Access to internal resources
- Cost optimization

**Setup:**
1. Settings > Actions > Runners
2. Add self-hosted runner
3. Follow setup instructions
4. Update workflows:
   ```yaml
   runs-on: self-hosted
   ```

### Reusable Workflows

**Create:** `.github/workflows/reusable-test.yml`

```yaml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm test
```

**Use in other workflows:**
```yaml
jobs:
  call-reusable:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
```

### Matrix Builds

**Test multiple versions:**
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, macos-latest, windows-latest]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)

---

**Last Updated:** 2025-12-14

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
For security information, see [SECURITY_AUDIT.md](SECURITY_AUDIT.md).
