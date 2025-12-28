# GitHub Setup Verification Checklist

Use this checklist to verify that all GitHub configurations are correctly set up.

## ✅ Completed Items (Confirmed)

Based on your local repository:

- ✅ **`develop` branch created and pushed** to GitHub
- ✅ **All documentation files committed** to the repository
- ✅ **Updated workflows** (deploy.yml) committed and pushed
- ✅ **Working tree is clean** - no uncommitted changes

---

## 🔍 Items to Verify on GitHub

Please manually verify these items on GitHub:

### 1. Branch Protection Rules

#### Main Branch Protection
Go to: `https://github.com/simantaparida/ux-play/settings/branch_protection_rules`

**For `main` branch**, verify these settings are enabled:

- [ ] **Require a pull request before merging**
  - [ ] Require approvals: **1**
  - [ ] Dismiss stale pull request approvals when new commits are pushed: **✓**

- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging: **✓**
  - [ ] Required status checks (select these):
    - [ ] `Lint & Type Check`
    - [ ] `Unit Tests`
    - [ ] `Build Check`
    - [ ] `Security Audit`
    - [ ] `All Checks Passed`

- [ ] **Require conversation resolution before merging**: **✓**
- [ ] **Require linear history**: **✓**
- [ ] **Do not allow bypassing the above settings**: **✓**
- [ ] **Restrict who can push to matching branches**: **✓** (Admins only)
- [ ] **Allow force pushes**: **✗** (Disabled)
- [ ] **Allow deletions**: **✗** (Disabled)

#### Develop Branch Protection
**For `develop` branch**, verify these settings are enabled:

- [ ] **Require a pull request before merging**
  - [ ] Require approvals: **1**
  - [ ] Dismiss stale pull request approvals when new commits are pushed: **✓**

- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging: **✓**
  - [ ] Required status checks:
    - [ ] `Lint & Type Check`
    - [ ] `Unit Tests`
    - [ ] `Build Check`
    - [ ] `Security Audit`

- [ ] **Require conversation resolution before merging**: **✓**
- [ ] **Allow force pushes**: **✗** (Disabled)
- [ ] **Allow deletions**: **✗** (Disabled)

---

### 2. GitHub Environments

Go to: `https://github.com/simantaparida/ux-play/settings/environments`

- [ ] **`staging` environment exists**
  - [ ] Deployment branches: `develop` only
  - [ ] No required reviewers (auto-deploy)

- [ ] **`production` environment exists**
  - [ ] Deployment branches: `main` only
  - [ ] (Optional) Required reviewers configured

---

### 3. GitHub Secrets

Go to: `https://github.com/simantaparida/ux-play/settings/secrets/actions`

Verify these secrets exist:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

**Optional** (if using separate staging Supabase):
- [ ] `STAGING_SUPABASE_URL`
- [ ] `STAGING_SUPABASE_ANON_KEY`
- [ ] `STAGING_SUPABASE_SERVICE_ROLE_KEY`

---

### 4. Dependabot

Go to: `https://github.com/simantaparida/ux-play/settings/security_analysis`

- [ ] **Dependabot alerts**: Enabled
- [ ] **Dependabot security updates**: Enabled
- [ ] **Dependabot version updates**: Should show "Active" (from `.github/dependabot.yml`)

---

### 5. GitHub Actions Workflows

Go to: `https://github.com/simantaparida/ux-play/actions`

Verify these workflows exist:

- [ ] **CI** - Should trigger on PRs and pushes to `main` and `develop`
- [ ] **E2E Tests** - Should trigger on PRs
- [ ] **PR Quality Checks** - Should trigger on PRs
- [ ] **Deploy to Vercel** - Should trigger on push to `main` and `develop`

---

### 6. Vercel Configuration

Go to: `https://vercel.com/dashboard` → Select your project → Settings → Git

- [ ] **Production Branch**: `main`
- [ ] **Preview Deployments**: Enabled
- [ ] **Automatic Branch Deployments**: All branches

**Environment Variables** (Settings → Environment Variables):
- [ ] Variables configured for Production, Preview, and Development scopes

---

## 🧪 Test Your Setup

After verifying the above, test the workflow:

### Test 1: Create a Feature Branch and PR

```bash
# 1. Pull latest develop
git checkout develop
git pull origin develop

# 2. Create test branch
git checkout -b test/verify-setup

# 3. Make a small change
echo "# Test Setup" >> TEST_VERIFICATION.md
git add TEST_VERIFICATION.md
git commit -m "test: verify branch protection and CI/CD setup"

# 4. Push and create PR
git push -u origin test/verify-setup
```

Then on GitHub:
- [ ] Create PR from `test/verify-setup` to `develop`
- [ ] Verify CI workflows run automatically
- [ ] Verify merge is blocked until CI passes
- [ ] Verify merge is blocked until approval
- [ ] Request review (if you have team members) or approve yourself
- [ ] Verify "Squash and merge" button becomes available
- [ ] Merge the PR
- [ ] Verify deployment to staging triggers automatically
- [ ] Check Actions tab for deployment status
- [ ] Verify deployment comment appears on commit

### Test 2: Verify Staging Deployment

After Test 1 completes:
- [ ] Go to Actions tab
- [ ] Find "Deploy to Vercel" workflow run
- [ ] Verify it shows "Staging" environment
- [ ] Check the deployment URL in the logs or commit comment
- [ ] Visit the staging URL to verify it's live

### Test 3: Clean Up Test Files

```bash
git checkout develop
git pull origin develop
git checkout -b chore/cleanup-test-files
git rm TEST_VERIFICATION.md
git commit -m "chore: remove test verification file"
git push -u origin chore/cleanup-test-files
```

- [ ] Create PR to `develop`
- [ ] Approve and merge
- [ ] Delete test branches

---

## 🚨 Common Issues and Solutions

### Issue: Can't find required status checks

**Problem**: When setting up branch protection, the status check names don't appear in the search.

**Solution**:
1. The status checks only appear after they've run at least once
2. Create a test PR first (like Test 1 above)
3. Let CI run completely
4. Then the check names will appear in branch protection settings

### Issue: Merge button still disabled after approval

**Problem**: PR is approved but can't merge.

**Solution**: Check that:
1. All required status checks have passed (green checkmarks)
2. Branch is up to date with base branch
3. All conversations are resolved
4. You have the required permissions

### Issue: Deployment not triggering

**Problem**: Push to `develop` or `main` doesn't trigger deployment.

**Solution**:
1. Check Actions tab for workflow runs
2. Verify deploy.yml workflow file is in `.github/workflows/`
3. Check workflow triggers include your branch
4. Verify GitHub Actions are enabled (Settings → Actions → General)

### Issue: Dependabot PRs not appearing

**Problem**: No Dependabot PRs created after a week.

**Solution**:
1. Verify `.github/dependabot.yml` file exists and is valid
2. Check Settings → Code security and analysis
3. Enable Dependabot alerts and security updates
4. Wait until Monday (configured schedule day)
5. Check Insights → Dependency graph → Dependabot

---

## ✅ Success Criteria

Your setup is complete when:

- ✅ Cannot push directly to `main` or `develop` (requires PR)
- ✅ All PRs must pass CI checks before merging
- ✅ All PRs require at least 1 approval
- ✅ Push to `develop` triggers staging deployment
- ✅ Push to `main` triggers production deployment
- ✅ Dependabot creates PRs for dependency updates
- ✅ All documentation is accessible in the repository

---

## 📊 Quick Status Check

Fill this out to track your progress:

**Branch Protection:**
- Main branch: ⬜ Not set / ⬜ Partially set / ⬜ Fully configured
- Develop branch: ⬜ Not set / ⬜ Partially set / ⬜ Fully configured

**GitHub Environments:**
- Staging: ⬜ Not created / ⬜ Created
- Production: ⬜ Not created / ⬜ Created

**Secrets:**
- Required secrets: ⬜ Missing some / ⬜ All configured

**Workflows:**
- CI workflow: ⬜ Not tested / ⬜ Tested and working
- Deploy workflow: ⬜ Not tested / ⬜ Tested and working

**Dependabot:**
- Configuration: ⬜ Not enabled / ⬜ Enabled

**Testing:**
- Feature branch workflow: ⬜ Not tested / ⬜ Tested successfully
- Staging deployment: ⬜ Not tested / ⬜ Tested successfully

---

## 📞 Next Steps

After verification:

1. **If everything is configured**:
   - Start using the workflow for real development
   - Share [GITHUB_SETUP.md](GITHUB_SETUP.md) with your team
   - Monitor first few PRs to ensure smooth operation

2. **If issues found**:
   - Refer to [GITHUB_SETUP.md](GITHUB_SETUP.md) troubleshooting section
   - Check GitHub Actions logs for detailed errors
   - Review Vercel deployment logs

3. **Optional improvements**:
   - Add CODEOWNERS teams for different parts of the codebase
   - Set up GitHub Projects for task tracking
   - Configure issue templates
   - Add PR templates
   - Set up status badges in README

---

## 📚 Resources

- [GITHUB_SETUP.md](GITHUB_SETUP.md) - Complete setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Implementation checklist
- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Environments Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

---

**Last Updated**: 2025-12-19
