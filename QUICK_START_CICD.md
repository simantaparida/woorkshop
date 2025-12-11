# Quick Start: CI/CD Pipeline

**Time Required:** 15 minutes
**Goal:** Get your CI/CD pipeline running on GitHub

---

## ⚡ 5-Minute Setup

### Step 1: Push Workflows (1 min)

```bash
# Make sure you're on main branch
git checkout main

# Add all workflow files
git add .github/workflows/

# Commit
git commit -m "chore: add CI/CD pipeline with E2E testing"

# Push to GitHub
git push origin main
```

### Step 2: Add GitHub Secrets (5 min)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

#### For Testing (Required)
```
Name: SUPABASE_URL
Value: https://your-project.supabase.co
```

```
Name: SUPABASE_ANON_KEY
Value: your-anon-key-from-supabase
```

**Find these:** Supabase Dashboard → Settings → API

#### For Deployment (Optional, can add later)
```
Name: VERCEL_TOKEN
Value: (run: vercel token add "GitHub Actions")
```

```
Name: VERCEL_ORG_ID
Value: (from: .vercel/project.json after running vercel link)
```

```
Name: VERCEL_PROJECT_ID
Value: (from: .vercel/project.json)
```

### Step 3: Test the Pipeline (5 min)

Create a test PR:

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# CI/CD Pipeline Active" >> CICD_ACTIVE.md

# Commit with conventional commit format
git add .
git commit -m "docs: add CI/CD status indicator"

# Push
git push origin test/ci-pipeline
```

Go to GitHub and create a pull request from this branch.

### Step 4: Watch It Run! (4 min)

1. Go to your repository
2. Click **Actions** tab
3. See workflows running:
   - ✅ CI (30 seconds)
   - ✅ E2E Tests (2-3 minutes)
   - ✅ PR Quality Checks (30 seconds)

---

## ✅ Verify Success

You should see:
- ✅ Green checkmarks on your PR
- ✅ PR labeled with size (probably "size/S")
- ✅ Test coverage comment (if you added tests)
- ✅ All checks passing in ~4 minutes

---

## 🎉 You're Done!

Your CI/CD pipeline is now active and will:

**On Every PR:**
- Run lint & type checks
- Run unit tests
- Run E2E tests (smoke + full suite)
- Check PR quality
- Comment test coverage

**On Merge to Main:**
- Run all checks
- Deploy to Vercel (if secrets configured)
- Run post-deploy tests

---

## 🚀 Next Steps

### Update README Badges (1 min)

Edit README.md and replace `YOUR_USERNAME` and `YOUR_REPO`:

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)]...
```

### Enable Branch Protection (2 min)

1. **Settings** → **Branches**
2. Add rule for `main`
3. Check:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Select: CI, E2E Tests
4. Save

### Configure Deployment (5 min)

If you haven't added Vercel secrets yet:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Get secrets
cat .vercel/project.json
# Copy orgId and projectId

# Create token
vercel token add "GitHub Actions"
# Copy token

# Add all 3 to GitHub secrets
```

---

## 📚 Documentation

**Quick References:**
- [CICD_SUMMARY.md](CICD_SUMMARY.md) - Overview
- [CICD_SETUP.md](CICD_SETUP.md) - Detailed guide
- [E2E_TESTING.md](E2E_TESTING.md) - Testing guide

**Full Update:**
- [PRODUCTION_READINESS_UPDATE.md](PRODUCTION_READINESS_UPDATE.md) - Everything accomplished

---

## 🆘 Troubleshooting

### Workflow Not Running
- Check workflows are enabled: **Actions** tab
- Verify YAML syntax (no errors in file)
- Make sure files are in `.github/workflows/`

### Tests Failing
- Check secrets are added correctly
- View logs in Actions tab
- Run tests locally: `npm run test:e2e`

### Need Help?
- See [TESTING_TROUBLESHOOTING.md](TESTING_TROUBLESHOOTING.md)
- Check workflow logs in Actions tab
- Review [CICD_SETUP.md](CICD_SETUP.md#troubleshooting)

---

## ⏱️ Timeline

**Completed Today:**
- ✅ E2E testing setup (1.5 hours)
- ✅ CI/CD pipeline setup (1 hour)
- ✅ Documentation (0.5 hours)

**Just Now:**
- ✅ Push workflows (1 min)
- ✅ Add secrets (5 min)
- ✅ Test pipeline (5 min)
- ✅ Verify working (4 min)
- **Total: 15 minutes**

**Your production readiness:** 65 → 80/100 🎉

---

**🎊 Congratulations! Your CI/CD pipeline is live!**

Every code change is now automatically tested and deployed safely.
