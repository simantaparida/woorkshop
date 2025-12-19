# GitHub Setup Guide: Git Flow, Branch Protection & CI/CD

This guide will help you transition from pushing directly to `main` to a professional Git Flow workflow with proper branch protection rules, staging/production environments, and best practices for CI/CD.

## Table of Contents

1. [Overview](#overview)
2. [Git Flow Branching Strategy](#git-flow-branching-strategy)
3. [Initial Setup Steps](#initial-setup-steps)
4. [Branch Protection Rules](#branch-protection-rules)
5. [GitHub Environments Configuration](#github-environments-configuration)
6. [Vercel Deployment Setup](#vercel-deployment-setup)
7. [Dependabot Configuration](#dependabot-configuration)
8. [Developer Workflows](#developer-workflows)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Current State
- All changes pushed directly to `main` branch
- Production deployments happen immediately on push to `main`
- No staging environment for testing before production

### Target State
- Git Flow branching strategy with `main` and `develop` branches
- All changes go through Pull Requests with code review
- Staging environment (`develop` branch) for pre-production testing
- Production environment (`main` branch) with stricter protection
- Automated preview deployments for every PR
- Automated dependency updates via Dependabot

### Benefits
✅ Safer production deployments (tested in staging first)
✅ Code review required before merging
✅ Clear separation between development and production
✅ Easy rollback strategy
✅ Better collaboration through PRs
✅ Automated quality checks before merge

---

## Git Flow Branching Strategy

### Branch Structure

```
main (production-ready code)
  ├── develop (integration branch for staging)
  │   ├── feature/add-user-authentication
  │   ├── feature/voting-timer
  │   ├── feature/export-results-pdf
  │   ├── bugfix/vote-calculation-error
  │   └── refactor/session-state-management
  ├── hotfix/security-vulnerability-fix
  └── release/v1.0.0
```

### Branch Purposes

| Branch Type | Purpose | Base Branch | Merge Target | Lifespan |
|-------------|---------|-------------|--------------|----------|
| `main` | Production-ready code | - | - | Permanent |
| `develop` | Integration/staging | `main` | - | Permanent |
| `feature/*` | New features | `develop` | `develop` | Until merged |
| `bugfix/*` | Bug fixes | `develop` | `develop` | Until merged |
| `hotfix/*` | Emergency production fixes | `main` | `main` + `develop` | Until merged |
| `release/*` | Release preparation | `develop` | `main` + `develop` | Until merged |

### Branch Naming Conventions

**Format**: `<type>/<short-description>`

**Valid Types**:
- `feature/` - New features (e.g., `feature/user-authentication`)
- `bugfix/` - Bug fixes (e.g., `bugfix/voting-calculation-error`)
- `hotfix/` - Emergency production fixes (e.g., `hotfix/xss-vulnerability`)
- `release/` - Release preparation (e.g., `release/v1.0.0`)
- `docs/` - Documentation only (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/session-management`)
- `test/` - Test additions/updates (e.g., `test/e2e-voting-flow`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

**Naming Rules**:
- Use lowercase with hyphens (kebab-case)
- Be descriptive but concise (2-4 words)
- Include issue number if applicable: `feature/123-user-auth`
- Avoid special characters except hyphens and slashes
- Examples:
  - ✅ `feature/voting-timer`
  - ✅ `bugfix/session-timeout`
  - ✅ `hotfix/security-patch`
  - ❌ `my-feature` (missing type prefix)
  - ❌ `feature/Add_User_Auth` (should use kebab-case)

---

## Initial Setup Steps

### Step 1: Create the `develop` Branch

1. Ensure you're on the latest `main` branch:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create and push the `develop` branch:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

3. Verify the branch was created:
   ```bash
   git branch -a
   # Should show both main and develop branches
   ```

### Step 2: Configure GitHub Secrets

Verify that these secrets exist in your GitHub repository:

**Go to**: Repository Settings → Secrets and variables → Actions

**Required Secrets**:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

**Optional Secrets** (if using separate staging Supabase):
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`

**How to Get These Values**:

**Vercel Secrets**:
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# This will create .vercel/project.json with orgId and projectId
# Get your token from: https://vercel.com/account/tokens
```

**Supabase Secrets**:
- Go to your Supabase project dashboard
- Navigate to Project Settings → API
- Copy the project URL and anon/public key

### Step 3: Configure Branch Protection Rules

See [Branch Protection Rules](#branch-protection-rules) section below for detailed steps.

### Step 4: Configure GitHub Environments

See [GitHub Environments Configuration](#github-environments-configuration) section below.

### Step 5: Configure Vercel Deployments

See [Vercel Deployment Setup](#vercel-deployment-setup) section below.

---

## Branch Protection Rules

### Configuring `main` Branch Protection

1. **Navigate to**: Repository Settings → Branches → Add rule

2. **Branch name pattern**: `main`

3. **Enable these settings**:

   ✅ **Require a pull request before merging**
   - Require approvals: `1`
   - Dismiss stale pull request approvals when new commits are pushed: ✅
   - Require review from Code Owners: ☐ (optional - requires CODEOWNERS file)

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging: ✅
   - Status checks that are required:
     - `Lint & Type Check`
     - `Unit Tests`
     - `Build Check`
     - `Security Audit`
     - `All Checks Passed`

   ✅ **Require conversation resolution before merging**

   ✅ **Require linear history** (enforces squash or rebase merge)

   ✅ **Do not allow bypassing the above settings**

   ✅ **Restrict who can push to matching branches**
   - Add only admin users/teams

   ✅ **Allow force pushes**: ❌ Disabled

   ✅ **Allow deletions**: ❌ Disabled

4. Click **Create** to save the rule

### Configuring `develop` Branch Protection

1. **Navigate to**: Repository Settings → Branches → Add rule

2. **Branch name pattern**: `develop`

3. **Enable these settings**:

   ✅ **Require a pull request before merging**
   - Require approvals: `1`
   - Dismiss stale pull request approvals when new commits are pushed: ✅

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging: ✅
   - Status checks that are required:
     - `Lint & Type Check`
     - `Unit Tests`
     - `Build Check`
     - `Security Audit`

   ✅ **Require conversation resolution before merging**

   ✅ **Allow force pushes**: ❌ Disabled

   ✅ **Allow deletions**: ❌ Disabled

4. Click **Create** to save the rule

### Testing Branch Protection

Create a test PR to verify protection rules are working:

```bash
# Create a test branch
git checkout develop
git checkout -b test/branch-protection

# Make a small change
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: verify branch protection"

# Push and create PR
git push -u origin test/branch-protection
```

Then on GitHub:
1. Open a PR to `develop`
2. Verify that merge is blocked until CI passes
3. Verify that merge is blocked until approval is given
4. After testing, close the PR and delete the branch

---

## GitHub Environments Configuration

### What are GitHub Environments?

Environments allow you to configure different deployment targets with specific protection rules and secrets.

### Step 1: Create `staging` Environment

1. **Navigate to**: Repository Settings → Environments → New environment

2. **Environment name**: `staging`

3. **Configure**:
   - **Deployment branches**: `develop` only
   - **Environment secrets**: (if using separate Supabase for staging)
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - **Protection rules**: None (auto-deploy on push to develop)

4. Click **Save protection rules**

### Step 2: Create `production` Environment

1. **Navigate to**: Repository Settings → Environments → New environment

2. **Environment name**: `production`

3. **Configure**:
   - **Deployment branches**: `main` only
   - **Required reviewers** (optional): Add yourself or team members for manual approval
   - **Wait timer** (optional): 0 minutes (or add delay if desired)
   - **Environment secrets**: Production Supabase credentials (if different from staging)

4. Click **Save protection rules**

### Environment URLs

You can add environment URLs after first deployment:

- **Staging**: Your Vercel staging URL (e.g., `https://ux-works-staging.vercel.app`)
- **Production**: Your Vercel production URL (e.g., `https://ux-works.vercel.app`)

---

## Vercel Deployment Setup

### Current Setup

Your project is already connected to Vercel. We'll configure it to support multiple environments.

### Step 1: Create Staging Project in Vercel (Option A)

**Option A: Separate Vercel Project for Staging**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → Project
3. Import the same GitHub repository
4. Configure:
   - **Project Name**: `ux-works-staging`
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Git Branch**: `develop`
5. Add environment variables for staging
6. Deploy

**Option B: Single Vercel Project with Git Integration** (Recommended)

Use Vercel's automatic preview deployments:
1. Go to your Vercel project settings
2. Navigate to Git
3. Enable:
   - ✅ Production Branch: `main`
   - ✅ Preview Branches: All branches (automatic previews for PRs)
   - ✅ Automatic Deployments for `develop` branch
4. Configure environment variables per branch if needed

### Step 2: Configure Preview Deployments

1. In Vercel Project Settings → Git:
   - **Production Branch**: `main`
   - **Include Preview Deployments**: ✅ Enabled
   - **Automatic Branch Deployments**: ✅ All branches

2. In GitHub Actions (already configured in `deploy.yml`):
   - Staging deployment triggers on push to `develop`
   - Production deployment triggers on push to `main`
   - Preview URLs automatically commented on PRs

### Step 3: Environment Variables per Branch

If you need different environment variables for staging/production:

1. Go to Vercel Project Settings → Environment Variables
2. For each variable, specify the environment:
   - **Production**: Only `main` branch
   - **Preview**: Only `develop` and feature branches
   - **Development**: Local development

Example:
```
Variable: NEXT_PUBLIC_SUPABASE_URL
Production Value: https://prod-project.supabase.co
Preview Value: https://staging-project.supabase.co
```

---

## Dependabot Configuration

Dependabot is already configured via `.github/dependabot.yml`. Here's what it does:

### Configuration Overview

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        patterns: ["*"]
        update-types: ["minor", "patch"]
```

### What This Means

- **Weekly checks**: Every Monday, Dependabot checks for dependency updates
- **Grouped PRs**: Minor and patch updates are grouped into a single PR
- **Limit**: Maximum 5 PRs open at once
- **Auto-merge**: Can be configured for low-risk updates

### Managing Dependabot PRs

**Review Process**:
1. Dependabot creates a PR with dependency updates
2. CI automatically runs (lint, test, build, security audit)
3. Review the changelog and breaking changes
4. If CI passes and changes look safe, approve and merge
5. For major version updates, review carefully

**Auto-merge for Safe Updates** (optional):

You can enable auto-merge for minor/patch updates:

```bash
# Enable auto-merge for a specific PR
gh pr merge <PR_NUMBER> --auto --squash

# Or configure Dependabot auto-merge in settings
```

---

## Developer Workflows

### Workflow 1: Adding a New Feature

```bash
# 1. Start from latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/voting-timer

# 3. Make your changes
# ... code, test, commit ...

git add .
git commit -m "feat: add countdown timer to voting phase"

# 4. Push branch
git push -u origin feature/voting-timer

# 5. Create Pull Request on GitHub
# - Base: develop
# - Compare: feature/voting-timer
# - Fill out PR template
# - Wait for CI checks to pass
# - Request review from teammate

# 6. After approval and CI passes, merge via GitHub UI
# - Use "Squash and merge" (recommended)
# - Delete branch after merge

# 7. Pull latest develop
git checkout develop
git pull origin develop

# 8. Delete local branch
git branch -d feature/voting-timer
```

### Workflow 2: Fixing a Bug

```bash
# Same as feature workflow, but use bugfix/ prefix
git checkout develop
git pull origin develop
git checkout -b bugfix/vote-calculation-error

# Make fix, commit, push
git add .
git commit -m "fix: correct vote percentage calculation"
git push -u origin bugfix/vote-calculation-error

# Create PR to develop, get approval, merge
```

### Workflow 3: Emergency Production Hotfix

```bash
# 1. Start from main (production)
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/security-vulnerability

# 3. Make the fix
git add .
git commit -m "fix: patch XSS vulnerability in feature input"

# 4. Push and create PR to main
git push -u origin hotfix/security-vulnerability

# On GitHub:
# - Create PR to main (fast-track review)
# - Label as "priority: critical"
# - Get emergency approval
# - Merge to main → deploys to production

# 5. Also merge hotfix to develop to keep branches in sync
git checkout develop
git pull origin develop
git merge hotfix/security-vulnerability
git push origin develop

# 6. Clean up
git branch -d hotfix/security-vulnerability
git push origin --delete hotfix/security-vulnerability
```

### Workflow 4: Creating a Release

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Prepare release
# - Update version in package.json
npm version 1.0.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: bump version to 1.0.0"

# - Update CHANGELOG.md (if you have one)
# - Run final tests
# - Fix any release-specific issues

# 3. Create PR to main
git push -u origin release/v1.0.0

# On GitHub:
# - Create PR: release/v1.0.0 → main
# - Review and approve
# - Merge to main

# 4. Tag the release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 5. Merge back to develop
git checkout develop
git merge main
git push origin develop

# 6. Clean up
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

### Workflow 5: Reviewing a Pull Request

**As a Reviewer**:

1. **Check CI Status**: Ensure all checks pass (green checkmarks)
2. **Review Code Changes**:
   - Click "Files changed" tab
   - Review line-by-line
   - Leave comments on specific lines if needed
3. **Test Locally** (if needed):
   ```bash
   # Fetch the PR branch
   gh pr checkout <PR_NUMBER>

   # Or manually
   git fetch origin
   git checkout feature/branch-name

   # Run tests
   npm run test
   npm run test:e2e

   # Try the changes locally
   npm run dev
   ```
4. **Check Preview Deployment**: Click Vercel preview URL in PR comments
5. **Submit Review**:
   - Comment: Request changes or ask questions
   - Approve: If everything looks good
   - Request changes: If issues need fixing

**PR Checklist for Reviewers**:
- [ ] Code follows project conventions
- [ ] Tests are included and pass
- [ ] No console.log or debug code
- [ ] TypeScript types are correct
- [ ] Security concerns addressed
- [ ] Performance implications considered
- [ ] Documentation updated if needed

---

## CI/CD Pipeline

### Pipeline Overview

```
Developer → Feature Branch → Push
                ↓
        Create Pull Request
                ↓
        ┌───────────────────┐
        │  CI Checks Run    │
        │  - Lint           │
        │  - Type Check     │
        │  - Unit Tests     │
        │  - Build          │
        │  - Security Audit │
        └───────────────────┘
                ↓
        ┌───────────────────┐
        │  PR Quality       │
        │  - Title format   │
        │  - Description    │
        │  - Size check     │
        │  - Test coverage  │
        └───────────────────┘
                ↓
        ┌───────────────────┐
        │  Vercel Preview   │
        │  Auto-deployed    │
        │  URL in comment   │
        └───────────────────┘
                ↓
        Code Review + Approval
                ↓
        Merge to develop
                ↓
        ┌───────────────────┐
        │  Deploy Staging   │
        │  Vercel staging   │
        │  Smoke tests      │
        └───────────────────┘
                ↓
        Test in staging
                ↓
        Create PR: develop → main
                ↓
        CI + Review + Approval
                ↓
        Merge to main
                ↓
        ┌───────────────────┐
        │  Deploy Prod      │
        │  Vercel prod      │
        │  Smoke tests      │
        │  Monitoring       │
        └───────────────────┘
```

### Workflow Files

Your project has 4 GitHub Actions workflows:

1. **`ci.yml`** - Main CI pipeline
   - Triggers: PRs and pushes to `main` and `develop`
   - Jobs: Lint, Type Check, Unit Tests, Build, Security Audit
   - Outputs: Test coverage report

2. **`pr-checks.yml`** - PR quality validation
   - Triggers: PRs opened, synchronized, reopened
   - Jobs: PR metadata, size check, dependency changes, test coverage validation

3. **`e2e-tests.yml`** - End-to-end testing
   - Triggers: PRs to main/develop, manual trigger
   - Jobs: Playwright tests across multiple browsers

4. **`deploy.yml`** - Deployment pipeline
   - Triggers: Push to `main` (production) and `develop` (staging)
   - Jobs: Pre-deployment checks, Vercel deployment, smoke tests

### Required Status Checks

For `main` branch protection, require these checks:
- ✅ Lint & Type Check
- ✅ Unit Tests
- ✅ Build Check
- ✅ Security Audit
- ✅ All Checks Passed

For `develop` branch protection, require:
- ✅ Lint & Type Check
- ✅ Unit Tests
- ✅ Build Check
- ✅ Security Audit

---

## Troubleshooting

### Issue: Can't push to main or develop

**Symptom**: Error: `refusing to allow an OAuth App to create or update workflow`

**Solution**: Branch protection is working correctly. Create a PR instead:
```bash
# Don't do this anymore:
git push origin main  # ❌ Will fail

# Do this instead:
git checkout -b feature/my-changes
git push -u origin feature/my-changes
# Then create PR on GitHub
```

### Issue: CI checks not running

**Symptom**: PR shows "Some checks haven't completed yet" but nothing runs

**Solutions**:
1. Check GitHub Actions tab for errors
2. Verify workflow files are in `.github/workflows/`
3. Check if Actions are enabled: Settings → Actions → General → Allow all actions
4. Re-run failed workflows manually

### Issue: PR blocked - "Changes requested"

**Symptom**: Can't merge even though you've made requested changes

**Solution**:
1. Request re-review from the reviewer who requested changes
2. They need to "Approve" or "Comment" to clear the block

### Issue: Branch protection conflicts with CI

**Symptom**: Required checks don't match CI job names

**Solution**:
1. Go to Settings → Branches → Edit protection rule for `main`
2. Edit "Require status checks to pass before merging"
3. Search for exact job names from your CI workflow
4. Add them to required checks

To find exact job names:
- Go to Actions tab
- Click on a recent workflow run
- Copy the job names exactly as shown

### Issue: Merge conflicts

**Symptom**: PR shows "This branch has conflicts that must be resolved"

**Solution**:
```bash
# Update your branch with latest develop
git checkout feature/my-branch
git fetch origin
git merge origin/develop

# Resolve conflicts in your editor
# After resolving, commit:
git add .
git commit -m "chore: resolve merge conflicts"
git push origin feature/my-branch
```

### Issue: Accidentally pushed to main before protection was enabled

**Solution**:
```bash
# Revert the commit on main
git checkout main
git revert HEAD
git push origin main

# Create feature branch from the original commit
git checkout -b feature/my-changes HEAD~1
git push -u origin feature/my-changes

# Create proper PR
```

### Issue: Hotfix needs to go out but develop has unreleased changes

**Solution**: This is exactly what hotfix branches are for:
```bash
# Create hotfix from main (not develop)
git checkout main
git checkout -b hotfix/critical-fix

# Make fix, test, commit
git push -u origin hotfix/critical-fix

# Create PR to main (bypassing develop)
# After merge to main, also merge to develop
```

### Issue: Vercel deployment failed

**Symptom**: GitHub Actions shows deployment failure

**Solutions**:
1. Check Vercel dashboard for error details
2. Verify environment variables are set in Vercel
3. Check build logs in GitHub Actions
4. Verify Vercel token hasn't expired
5. Re-run deployment workflow manually

### Issue: Want to bypass branch protection temporarily

**⚠️ Warning**: Only do this in true emergencies

**Solution**:
1. Settings → Branches → Edit protection rule
2. Temporarily disable "Do not allow bypassing the above settings"
3. Make your emergency push
4. **IMMEDIATELY re-enable** the setting
5. Document why this was necessary

**Better approach**: Use the hotfix workflow instead.

---

## Next Steps

After completing this setup:

1. ✅ **Test the workflow**: Create a dummy feature PR and go through the full process
2. ✅ **Document team-specific conventions**: Add any project-specific rules to CONTRIBUTING.md
3. ✅ **Train your team**: Share this guide and walk through an example workflow together
4. ✅ **Monitor and adjust**: Review branch protection rules after a week, adjust if too strict/loose
5. ✅ **Set up monitoring**: Consider adding error tracking and performance monitoring
6. ✅ **Plan first release**: Use the release workflow to tag your first production version

---

## Additional Resources

- [Git Flow Explained](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Vercel Deploy Hooks](https://vercel.com/docs/deployments/deploy-hooks)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Questions?

If you run into issues not covered here:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs for detailed error messages
3. Check Vercel deployment logs
4. Open a GitHub Discussion or issue in this repository

---

**Last Updated**: 2025-12-19
**Maintained By**: UX Works Team
