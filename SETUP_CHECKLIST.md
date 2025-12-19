# GitHub Setup Checklist

This checklist will guide you through implementing the new Git Flow workflow with branch protection and CI/CD best practices.

## ✅ Files Created

All necessary files have been created:

- ✅ [GITHUB_SETUP.md](GITHUB_SETUP.md) - Complete setup guide
- ✅ [CONTRIBUTING.md](CONTRIBUTING.md) - Contributor guidelines
- ✅ [.github/dependabot.yml](.github/dependabot.yml) - Automated dependency updates
- ✅ [.github/CODEOWNERS](.github/CODEOWNERS) - Code ownership rules
- ✅ Updated [.github/workflows/deploy.yml](.github/workflows/deploy.yml) - Staging + Production deployments
- ✅ Updated [README.md](README.md) - Links to new documentation

## 📋 Implementation Checklist

Follow these steps in order to implement the new workflow:

### Phase 1: Repository Setup (15 minutes)

- [ ] **1.1 Create `develop` branch**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b develop
  git push -u origin develop
  ```

- [ ] **1.2 Verify GitHub Secrets** (Settings → Secrets and variables → Actions)
  - [ ] `SUPABASE_URL` exists
  - [ ] `SUPABASE_ANON_KEY` exists
  - [ ] `VERCEL_TOKEN` exists
  - [ ] `VERCEL_ORG_ID` exists
  - [ ] `VERCEL_PROJECT_ID` exists

### Phase 2: Branch Protection Rules (20 minutes)

#### Main Branch Protection

- [ ] **2.1 Go to**: Settings → Branches → Add rule
- [ ] **2.2 Branch name pattern**: `main`
- [ ] **2.3 Enable**:
  - [ ] Require a pull request before merging
    - [ ] Require approvals: 1
    - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require status checks to pass before merging
    - [ ] Require branches to be up to date before merging
    - [ ] Add required checks:
      - [ ] `Lint & Type Check`
      - [ ] `Unit Tests`
      - [ ] `Build Check`
      - [ ] `Security Audit`
      - [ ] `All Checks Passed`
  - [ ] Require conversation resolution before merging
  - [ ] Require linear history
  - [ ] Do not allow bypassing the above settings
  - [ ] Restrict who can push to matching branches (admins only)
  - [ ] Allow force pushes: **Disabled**
  - [ ] Allow deletions: **Disabled**
- [ ] **2.4 Click**: Create

#### Develop Branch Protection

- [ ] **2.5 Go to**: Settings → Branches → Add rule
- [ ] **2.6 Branch name pattern**: `develop`
- [ ] **2.7 Enable**:
  - [ ] Require a pull request before merging
    - [ ] Require approvals: 1
    - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require status checks to pass before merging
    - [ ] Require branches to be up to date before merging
    - [ ] Add required checks:
      - [ ] `Lint & Type Check`
      - [ ] `Unit Tests`
      - [ ] `Build Check`
      - [ ] `Security Audit`
  - [ ] Require conversation resolution before merging
  - [ ] Allow force pushes: **Disabled**
  - [ ] Allow deletions: **Disabled**
- [ ] **2.8 Click**: Create

### Phase 3: GitHub Environments (10 minutes)

- [ ] **3.1 Go to**: Settings → Environments → New environment
- [ ] **3.2 Create `staging` environment**:
  - [ ] Environment name: `staging`
  - [ ] Deployment branches: `develop` only
  - [ ] No protection rules needed (auto-deploy)
  - [ ] Save protection rules

- [ ] **3.3 Create `production` environment**:
  - [ ] Environment name: `production`
  - [ ] Deployment branches: `main` only
  - [ ] (Optional) Add required reviewers
  - [ ] Save protection rules

### Phase 4: Vercel Configuration (15 minutes)

- [ ] **4.1 Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] **4.2 Select your project**
- [ ] **4.3 Go to**: Settings → Git
- [ ] **4.4 Configure**:
  - [ ] Production Branch: `main`
  - [ ] Include Preview Deployments: **Enabled**
  - [ ] Automatic Branch Deployments: **All branches**

- [ ] **4.5 (Optional) Environment Variables per Branch**:
  - [ ] If using separate Supabase for staging, add staging variables
  - [ ] Set environment scope: Production, Preview, Development

### Phase 5: Dependabot (5 minutes)

- [ ] **5.1 Go to**: Settings → Code security and analysis
- [ ] **5.2 Enable**: Dependabot alerts
- [ ] **5.3 Enable**: Dependabot security updates
- [ ] **5.4 Verify**: `.github/dependabot.yml` exists in repository

### Phase 6: Test the Workflow (30 minutes)

- [ ] **6.1 Create a test feature branch**:
  ```bash
  git checkout develop
  git checkout -b test/branch-protection-verification
  echo "# Test" >> TEST.md
  git add TEST.md
  git commit -m "test: verify branch protection and CI"
  git push -u origin test/branch-protection-verification
  ```

- [ ] **6.2 Create PR to `develop` on GitHub**
- [ ] **6.3 Verify CI runs automatically**:
  - [ ] Lint & Type Check runs
  - [ ] Unit Tests run
  - [ ] Build Check runs
  - [ ] Security Audit runs
  - [ ] PR checks run (title format, size, etc.)

- [ ] **6.4 Verify branch protection works**:
  - [ ] Cannot merge without approval
  - [ ] Cannot merge if CI fails
  - [ ] Merge button is disabled until checks pass

- [ ] **6.5 Request review and approve**
- [ ] **6.6 Merge the PR** (use "Squash and merge")
- [ ] **6.7 Verify staging deployment**:
  - [ ] Check Actions tab for deployment workflow
  - [ ] Verify deployment to staging succeeds
  - [ ] Check commit comments for deployment URL

- [ ] **6.8 Delete test branch**
- [ ] **6.9 Delete TEST.md file**:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b chore/cleanup-test-file
  git rm TEST.md
  git commit -m "chore: remove test file"
  git push -u origin chore/cleanup-test-file
  ```
  - [ ] Create PR, approve, and merge

### Phase 7: Team Communication (30 minutes)

- [ ] **7.1 Share documentation with team**:
  - [ ] Send link to [GITHUB_SETUP.md](GITHUB_SETUP.md)
  - [ ] Send link to [CONTRIBUTING.md](CONTRIBUTING.md)

- [ ] **7.2 Schedule team walkthrough** (if applicable)
  - [ ] Demonstrate Git Flow workflow
  - [ ] Show how to create feature branches
  - [ ] Explain PR process
  - [ ] Answer questions

- [ ] **7.3 Update team communication channels**:
  - [ ] Announce new workflow
  - [ ] Share timeline for transition
  - [ ] Provide support contact for questions

## 🎯 Post-Implementation

After completing the setup:

- [ ] **Monitor first few PRs** to ensure workflow is smooth
- [ ] **Adjust branch protection rules** if too strict/lenient
- [ ] **Review Dependabot PRs** weekly
- [ ] **Update documentation** based on team feedback
- [ ] **Plan first release** using the release workflow

## 📚 Quick Reference

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Emergency production fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Test additions
- `chore/description` - Maintenance tasks

### Commit Message Format

```
<type>(<scope>): <subject>

<body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

### Workflow Summary

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. Wait for CI and review
5. Merge to `develop` → deploys to staging
6. Test in staging
7. Create PR from `develop` to `main`
8. Merge to `main` → deploys to production

## 🆘 Troubleshooting

If you encounter issues:

1. Check [GITHUB_SETUP.md](GITHUB_SETUP.md) Troubleshooting section
2. Review GitHub Actions logs
3. Check Vercel deployment logs
4. Verify all secrets are set correctly

## 📞 Support

For questions or issues:
- Review documentation in [GITHUB_SETUP.md](GITHUB_SETUP.md)
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for workflow details
- Open a GitHub Discussion or Issue

---

**Estimated Total Time**: ~2 hours

**Difficulty**: Intermediate

**Prerequisites**: Admin access to GitHub repository and Vercel project

---

**Last Updated**: 2025-12-19
