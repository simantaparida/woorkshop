# E2E Testing Troubleshooting Guide

## Quick Diagnosis

### Issue: "Failed to load resource: 404 (Not Found)"

This error typically occurs when:
1. The dev server isn't running
2. The base URL is incorrect
3. Authentication is required but not set up
4. A route doesn't exist yet

---

## Step-by-Step Troubleshooting

### 1. Verify Dev Server is Running

**Check if the server is running:**
```bash
# Open a new terminal and run:
npm run dev
```

**Expected output:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001

✓ Ready in 2.3s
```

**Note:** The default port is 3001 (not 3000). This is configured in your project.

---

### 2. Run Smoke Tests First

Before running full E2E tests, verify basic functionality:

```bash
# Run smoke tests to check if app is accessible
npx playwright test smoke.spec.ts
```

This will test:
- Homepage loads
- Tools page is accessible
- Authentication redirects work
- API endpoints respond
- Critical routes don't error

**If smoke tests fail**, fix those issues first before running full E2E tests.

---

### 3. Check Authentication Requirements

Some pages require authentication. There are two approaches:

#### Option A: Test Without Authentication (Recommended for Initial Setup)

Temporarily modify tests to skip authentication:

```typescript
// In voting-board.spec.ts or problem-framing.spec.ts
test.describe.skip('Voting Board - Complete Flow', () => {
  // Tests skipped for now
});
```

Or test only public routes first.

#### Option B: Set Up Test User Credentials

1. **Create a test user account** in your Supabase project
2. **Set environment variables:**

```bash
# Create .env.test
echo "TEST_USER_EMAIL=test@example.com" >> .env.test
echo "TEST_USER_PASSWORD=testpassword123" >> .env.test
```

3. **Use auth setup in tests:**

```typescript
// In playwright.config.ts
export default defineConfig({
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Test projects depend on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

### 4. Verify Routes Exist

Check if the routes being tested actually exist:

```bash
# Check voting board route
curl http://localhost:3001/voting-board/new
# Should return HTML or redirect to login

# Check problem framing route
curl http://localhost:3001/tools/problem-framing/new
# Should return HTML or redirect to login
```

**If you get 404**, the route might not exist or requires different authentication.

---

### 5. Update Test Selectors

If authentication or page structure changed, update test selectors:

```typescript
// Old selector (might not work)
await page.fill('input[placeholder*="Q1 Feature"]', sessionName);

// More flexible selector
await page.fill('input[name="projectName"], input[placeholder*="Feature"], input[type="text"]', sessionName);
```

---

## Common Fixes

### Fix 1: Dev Server Not Running

**Problem:** Tests timeout waiting for server

**Solution:**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:e2e
```

Or let Playwright start the server automatically (already configured):
```typescript
// In playwright.config.ts (already set)
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3001',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

### Fix 2: Wrong Port Number

**Problem:** Tests try to access localhost:3000 but server runs on 3001

**Solution:** Check `playwright.config.ts`:
```typescript
use: {
  baseURL: 'http://localhost:3001', // ✅ Correct port
}
```

### Fix 3: Authentication Required

**Problem:** Pages redirect to login, tests fail

**Solution A - Skip auth pages temporarily:**
```bash
# Test only public routes
npx playwright test smoke.spec.ts
```

**Solution B - Mock authentication:**
```typescript
test.beforeEach(async ({ page }) => {
  // Set auth cookies/localStorage
  await page.context().addCookies([
    {
      name: 'supabase-auth-token',
      value: 'mock-token',
      domain: 'localhost',
      path: '/',
    },
  ]);
});
```

### Fix 4: Missing Environment Variables

**Problem:** Tests fail due to missing Supabase credentials

**Solution:** Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart dev server after adding env vars.

---

## Recommended Testing Order

1. **Start Simple:**
   ```bash
   npm run dev  # Terminal 1
   npx playwright test smoke.spec.ts  # Terminal 2
   ```

2. **Test Public Routes:**
   ```bash
   npx playwright test -g "homepage"
   npx playwright test -g "tools page"
   ```

3. **Test Authentication Flow:**
   ```bash
   npx playwright test -g "login"
   ```

4. **Test Full Workflows:**
   ```bash
   npm run test:e2e:chromium  # Single browser for speed
   ```

5. **Test All Browsers:**
   ```bash
   npm run test:e2e  # All browsers and mobile
   ```

---

## Debug Mode

When tests fail, use debug mode to see what's happening:

```bash
# Interactive debugging
npm run test:e2e:debug

# Or with headed browser
npm run test:e2e:headed
```

**Debug commands:**
- Press `F10` to step over
- Press `F11` to step into
- Click elements to inspect
- View console logs
- Take screenshots

---

## Temporary Test Modifications

### Skip Tests That Require Auth

```typescript
// Skip entire test suite
test.describe.skip('Voting Board - Complete Flow', () => {
  // ...
});

// Skip individual test
test.skip('should create a session', async ({ page }) => {
  // ...
});

// Run only specific test
test.only('should load homepage', async ({ page }) => {
  // ...
});
```

### Add Debugging Output

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');

  // Log current URL
  console.log('Current URL:', page.url());

  // Log page title
  console.log('Page title:', await page.title());

  // Take screenshot
  await page.screenshot({ path: 'debug.png' });

  // Log all visible text
  const text = await page.locator('body').textContent();
  console.log('Page text:', text?.substring(0, 200));
});
```

---

## Quick Health Check Script

Create a quick test to verify everything works:

```bash
# Create test file
cat > e2e/health-check.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('health check', async ({ page }) => {
  console.log('🔍 Testing server accessibility...');

  await page.goto('/');
  console.log('✅ Homepage loaded');

  await page.goto('/tools');
  console.log('✅ Tools page loaded');

  const title = await page.title();
  console.log('📄 Page title:', title);

  expect(title.length).toBeGreaterThan(0);
});
EOF

# Run it
npx playwright test health-check.spec.ts --headed
```

---

## Still Having Issues?

### Check These:

1. **Node version:** `node -v` (should be 18+)
2. **Dependencies installed:** `npm install`
3. **Playwright installed:** `npx playwright --version`
4. **Browsers installed:** `npx playwright install`
5. **Port available:** `lsof -i :3001` (should show node process)
6. **Supabase env vars:** Check `.env.local` exists and has values

### Get More Info:

```bash
# Verbose test output
npx playwright test --debug

# With trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Clean Slate:

```bash
# Remove all test artifacts
rm -rf playwright-report test-results .playwright

# Reinstall
npm install
npx playwright install

# Try again
npm run test:e2e:ui
```

---

## Expected Test Run

**Successful test run should look like:**

```
Running 7 tests using 1 worker

  ✓ smoke.spec.ts:10:3 › Smoke Tests › homepage should load (2.3s)
  ✓ smoke.spec.ts:19:3 › Smoke Tests › tools page should be accessible (1.8s)
  ✓ smoke.spec.ts:28:3 › Smoke Tests › voting board creation page (1.5s)
  ...

  7 passed (12.3s)

To open last HTML report run:
  npx playwright show-report
```

---

## Need More Help?

1. Check [E2E_TESTING.md](E2E_TESTING.md) for complete documentation
2. Review [Playwright docs](https://playwright.dev/docs/troubleshooting)
3. Run smoke tests first: `npx playwright test smoke.spec.ts`
4. Use debug mode: `npm run test:e2e:debug`
5. Check if dev server is running: `curl http://localhost:3001`

**Pro tip:** Start with smoke tests, then gradually enable more complex tests as you verify each component works.
