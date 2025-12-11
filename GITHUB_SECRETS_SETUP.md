# GitHub Secrets Setup Checklist

**Repository:** https://github.com/simantaparida/ux-play
**Status:** Workflows pushed ✅, Secrets need to be added

---

## ✅ What's Already Done

- ✅ All workflow files pushed to GitHub
- ✅ Supabase keys configured in .env.local
- ✅ E2E testing infrastructure complete
- ✅ CI/CD pipeline ready

---

## ⏳ Add GitHub Secrets (5 minutes)

### Step 1: Go to Your Repository Settings

1. Open: https://github.com/simantaparida/ux-play/settings/secrets/actions
2. Or navigate: Repository → Settings → Secrets and variables → Actions

### Step 2: Add Required Secrets

Click **"New repository secret"** for each:

#### Secret 1: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://cyqiiywlugosygaevtfv.supabase.co
```
**Source:** From your .env.local file

#### Secret 2: SUPABASE_ANON_KEY
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5cWlpeXdsdWdvc3lnYWV2dGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODMyNTQsImV4cCI6MjA3Njg1OTI1NH0.7iiKJu2_MgIDUIIhkSB9EhmG9kcMavA1EMd-epHpG8U
```
**Source:** From your .env.local file

---

## 🔍 Verify Secrets Were Added

After adding secrets, you should see:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY

Both should show "Updated X seconds ago"

---

## 🧪 Test the Pipeline

### Option 1: Trigger Workflows Manually

1. Go to: https://github.com/simantaparida/ux-play/actions
2. Click on **"CI"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it run!

### Option 2: Create a Test PR

```bash
# Create test branch
git checkout -b test/verify-ci-pipeline

# Make a small change
echo "# CI/CD Pipeline Active ✅" >> PIPELINE_ACTIVE.md

# Commit with conventional format
git add PIPELINE_ACTIVE.md
git commit -m "test: verify CI/CD pipeline is working"

# Push
git push origin test/verify-ci-pipeline
```

Then create a PR on GitHub and watch the workflows run!

---

## ✅ Expected Results

Once secrets are added and you trigger a workflow:

**CI Workflow** (should pass):
- ✅ Lint & Type Check (~1 min)
- ✅ Unit Tests (~2 min)
- ✅ Build Check (~3 min)
- ✅ Security Audit (~1 min)

**E2E Tests Workflow** (should pass):
- ✅ Smoke Tests (~1 min)
- ✅ Browser Tests (~3-5 min each)
- ✅ Mobile Tests (~2 min)

**PR Quality Checks** (should pass):
- ✅ Title Format Check
- ✅ PR Size Labeling
- ✅ Test Coverage Check

---

## 🎯 Success Indicators

You'll know it's working when:

1. **Actions Tab Shows:**
   - ✅ Green checkmarks on workflows
   - ✅ "All checks passed" message
   - ✅ Test artifacts available for download

2. **Pull Request Shows:**
   - ✅ Status checks passing
   - ✅ PR labeled with size (e.g., "size/S")
   - ✅ Coverage report comment (if tests changed)

3. **Workflow Logs Show:**
   - ✅ No "secret not found" errors
   - ✅ Tests running and passing
   - ✅ Build completing successfully

---

## ⚠️ Troubleshooting

### If Workflows Fail with "Secret not found"

**Check:**
1. Secret names are **exact** (case-sensitive)
2. Secrets are in **repository** (not organization)
3. Refresh the GitHub page

**Fix:**
- Delete and re-add the secret
- Make sure there's no extra spaces in the value

### If Tests Timeout

**Possible causes:**
1. Dev server not starting (check logs)
2. Supabase URL/key incorrect
3. Network issues in GitHub Actions

**Fix:**
- Check workflow logs for specific error
- Verify Supabase credentials are correct
- Re-run the workflow

### If E2E Tests Fail

**First time running:**
- E2E tests may take longer on first run
- Playwright needs to install browsers
- Wait for ~10 minutes for first run

**Check:**
- Workflow logs in Actions tab
- Look for specific test failures
- Download test artifacts to see screenshots

---

## 📊 What Happens Next

Once secrets are added and workflows pass:

**On Every PR:**
- ✅ Automatic testing (unit + E2E)
- ✅ Automatic quality checks
- ✅ Blocking if tests fail (safe merge)

**On Merge to Main:**
- ✅ All checks run
- ✅ Ready for deployment (Vercel setup optional)

---

## 🚀 Optional: Add Vercel Deployment Secrets

If you want automated deployment, add these secrets:

### Get Vercel Secrets

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link your project
vercel link

# Get your IDs
cat .vercel/project.json
```

Copy the values:
- `orgId` → VERCEL_ORG_ID
- `projectId` → VERCEL_PROJECT_ID

### Create Vercel Token

```bash
vercel token add "GitHub Actions"
```

Copy the token → VERCEL_TOKEN

### Add to GitHub Secrets

Add these 3 secrets the same way as Supabase secrets:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

---

## 📋 Summary Checklist

- [ ] Open GitHub Secrets page
- [ ] Add SUPABASE_URL secret
- [ ] Add SUPABASE_ANON_KEY secret
- [ ] Verify both secrets show in list
- [ ] Trigger a workflow (manual or PR)
- [ ] Watch workflows run in Actions tab
- [ ] Verify all checks pass
- [ ] (Optional) Add Vercel secrets for deployment

---

## 🆘 Need Help?

**Documentation:**
- [CICD_SETUP.md](CICD_SETUP.md) - Detailed setup guide
- [TESTING_TROUBLESHOOTING.md](TESTING_TROUBLESHOOTING.md) - Test troubleshooting
- [QUICK_START_CICD.md](QUICK_START_CICD.md) - Quick start guide

**GitHub Resources:**
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

**Your Repository:**
- Actions: https://github.com/simantaparida/ux-play/actions
- Secrets: https://github.com/simantaparida/ux-play/settings/secrets/actions
- Workflows: https://github.com/simantaparida/ux-play/tree/main/.github/workflows

---

**Next Step:** Add the 2 secrets above, then trigger a workflow to test! 🚀
