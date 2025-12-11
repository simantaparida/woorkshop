# E2E Testing Guide - UX Play Platform

**Last Updated:** 2025-12-11
**Framework:** Playwright
**Coverage Target:** 70% of critical user flows

---

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Playwright** for end-to-end testing. E2E tests simulate real user interactions across the entire application stack, ensuring critical workflows function correctly.

### Test Coverage

- ✅ **Voting Board Flow** - Session creation → lobby → voting → results
- ✅ **Problem Framing Flow** - Session creation → join → input → review → finalize → summary
- ✅ **Multi-Player Scenarios** - Multiple users interacting simultaneously
- ✅ **Edge Cases** - Error handling, validation, limits
- ✅ **Mobile Responsive** - Tests on mobile viewports

### Test Files

```
e2e/
├── smoke.spec.ts              # Smoke tests - basic verification (7 tests)
├── voting-board.spec.ts       # Voting board E2E tests (18 tests)
├── problem-framing.spec.ts    # Problem framing E2E tests (15 tests)
├── auth.setup.ts              # Authentication setup (optional)
└── ... (more test files as needed)
```

---

## Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Project dependencies installed (`npm install`)

### Initial Setup

1. **Install Playwright browsers** (already done if you followed installation):

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers for testing.

2. **Verify installation**:

```bash
npx playwright --version
```

Should output: `Version 1.57.0` (or later)

### Configuration

The Playwright configuration is in [`playwright.config.ts`](playwright.config.ts):

```typescript
// Key settings:
- testDir: './e2e'              // Test files location
- timeout: 30000                // 30s per test
- baseURL: 'http://localhost:3001'
- webServer: auto-starts dev server
- projects: chromium, firefox, webkit, mobile
```

---

## Running Tests

### Development Mode

**Run all tests in headless mode:**
```bash
npm run test:e2e
```

**Run with UI (interactive mode):**
```bash
npm run test:e2e:ui
```
Opens the Playwright UI where you can:
- See all tests
- Run tests individually
- Watch test execution
- Debug failures

**Run in headed mode (see browser):**
```bash
npm run test:e2e:headed
```

**Debug mode (step through tests):**
```bash
npm run test:e2e:debug
```

### Running Specific Tests

**Single file:**
```bash
npx playwright test voting-board.spec.ts
```

**Single test:**
```bash
npx playwright test -g "should create a session"
```

**Specific browser:**
```bash
npm run test:e2e:chromium
# or
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Mobile tests only:**
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### CI/CD Mode

**Run all tests (CI optimized):**
```bash
CI=true npm run test:e2e
```

CI mode enables:
- No parallel tests (workers: 1)
- 2 retries on failure
- Prevents accidental `.only` tests

### View Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

Opens `playwright-report/index.html` in your browser with:
- Test results summary
- Pass/fail status
- Screenshots of failures
- Video recordings (if enabled)
- Execution traces

---

## Test Structure

### Voting Board Tests (`voting-board.spec.ts`)

**Complete Flow (8 tests):**
- ✅ Full session creation → voting → results
- ✅ Enforce 100-point limit
- ✅ Allow zero points on features
- ✅ Error for non-existent session
- ✅ CSV download functionality

**Multi-Player Scenarios (2 tests):**
- ✅ Multiple players joining and voting
- ✅ Prevent duplicate player names

**Mobile Responsive (1 test):**
- ✅ Full flow on mobile viewport

**Edge Cases (3 tests):**
- ✅ Single player session
- ✅ Session with 10 features (maximum)

**Total: 18 tests**

### Problem Framing Tests (`problem-framing.spec.ts`)

**Complete Flow (3 tests):**
- ✅ Session creation → statements → review → finalize → summary
- ✅ Handle empty statement submission
- ✅ Allow editing statements

**Multi-Participant Flow (2 tests):**
- ✅ Multiple participants adding statements
- ✅ Real-time updates when statements added

**Attachment Upload (1 test):**
- ✅ File attachment functionality

**Edge Cases (3 tests):**
- ✅ Session with no participants
- ✅ Very long problem statements
- ✅ Navigate back from any phase

**Mobile Responsive (1 test):**
- ✅ Full flow on mobile viewport

**Total: 15 tests**

---

## Writing Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // 1. Navigate to page
    await page.goto('/path');

    // 2. Interact with elements
    await page.fill('input[name="field"]', 'value');
    await page.click('button:has-text("Submit")');

    // 3. Assert expectations
    await expect(page).toHaveURL('/new-path');
    await expect(page.locator('h1')).toContainText('Success');
  });
});
```

### Helper Functions

Tests use helper functions for common operations:

**Voting Board:**
```typescript
async function createTestSession(page: Page, sessionName: string) {
  // Creates session and returns { sessionId, features }
}

async function joinSession(page: Page, sessionId: string, playerName: string) {
  // Joins session as player
}
```

**Problem Framing:**
```typescript
async function createProblemFramingSession(page: Page, title: string, facilitatorName: string) {
  // Creates PF session and returns { sessionId, title }
}

async function joinProblemFramingSession(page: Page, sessionId: string, participantName: string) {
  // Joins PF session
}
```

### Multi-Context Tests

For testing multiple users simultaneously:

```typescript
test('multi-user scenario', async ({ browser }) => {
  // Create separate contexts (isolated sessions)
  const user1Context = await browser.newContext();
  const user2Context = await browser.newContext();

  const user1Page = await user1Context.newPage();
  const user2Page = await user2Context.newPage();

  try {
    // User 1 actions
    await createTestSession(user1Page, 'Test');

    // User 2 actions
    await joinSession(user2Page, sessionId, 'User 2');

    // Verify both users see updates
    // ...

  } finally {
    // Clean up
    await user1Context.close();
    await user2Context.close();
  }
});
```

### Mobile Testing

```typescript
test('mobile viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone...)',
  });

  const page = await context.newPage();
  // ... test mobile functionality

  await context.close();
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: CI=true npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Environment Variables

For CI testing, set these secrets in your repository:

- `SUPABASE_URL` - Test database URL
- `SUPABASE_ANON_KEY` - Test database anon key

**Recommendation:** Use a separate Supabase project for testing to avoid affecting production data.

---

## Best Practices

### 1. Write Stable Selectors

✅ **Good:**
```typescript
page.locator('button:has-text("Submit Vote")')
page.locator('input[name="playerName"]')
page.locator('[data-testid="vote-button"]')
```

❌ **Avoid:**
```typescript
page.locator('.css-class-12345')  // Fragile, changes with CSS
page.locator('div > div > button')  // Too specific, breaks on refactor
```

### 2. Use Explicit Waits

✅ **Good:**
```typescript
await page.waitForURL(/\/results/);
await page.waitForSelector('h1:has-text("Results")');
```

❌ **Avoid:**
```typescript
await page.waitForTimeout(5000);  // Arbitrary, flaky
```

### 3. Clean Up Resources

Always close contexts in multi-user tests:

```typescript
try {
  // Test code
} finally {
  await context1.close();
  await context2.close();
}
```

### 4. Test User Flows, Not Implementation

✅ **Focus on what users do:**
- "User creates session and votes"
- "User sees error for invalid input"

❌ **Avoid testing internals:**
- "API returns 200 status"
- "Database has correct row"

### 5. Use Descriptive Test Names

```typescript
// ✅ Clear what's being tested
test('should prevent voting with more than 100 points', ...)

// ❌ Vague
test('test voting', ...)
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Symptom:** Tests hang and timeout after 30s

**Solutions:**
- Check if dev server is running (`npm run dev`)
- Increase timeout in config: `timeout: 60000`
- Use `page.waitForTimeout(1000)` sparingly
- Check network requests in trace viewer

#### 2. Element Not Found

**Symptom:** `Error: Locator not found`

**Solutions:**
```typescript
// Wait for element to exist
await page.waitForSelector('button:has-text("Submit")');

// Check if element is visible
await expect(page.locator('button')).toBeVisible();

// Use more flexible selectors
page.locator('button:has-text("Submit"), button:has-text("Save")');
```

#### 3. Flaky Tests (Pass Sometimes, Fail Sometimes)

**Common causes:**
- Race conditions (use proper waits)
- Hard-coded timeouts (use event-based waits)
- Shared state between tests (ensure isolation)

**Solutions:**
```typescript
// ✅ Wait for navigation
await page.click('button');
await page.waitForURL(/\/results/);

// ✅ Wait for network idle
await page.waitForLoadState('networkidle');

// ✅ Wait for specific state
await expect(page.locator('.spinner')).not.toBeVisible();
```

#### 4. Authentication Issues

**Symptom:** Tests fail because authentication required

**Solutions:**
- Create test user accounts
- Mock authentication in tests
- Use authentication state storage:

```typescript
// Save auth state after login
await context.storageState({ path: 'auth.json' });

// Reuse in other tests
const context = await browser.newContext({ storageState: 'auth.json' });
```

#### 5. Database State Issues

**Symptom:** Tests fail due to existing data

**Solutions:**
- Use unique test data (timestamps, UUIDs)
- Clean up after tests (delete created sessions)
- Use separate test database
- Reset database between test runs

### Debug Mode

When tests fail, use debug mode:

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through test execution
- Inspect element selectors
- View console logs
- Take screenshots at any point

### Trace Viewer

For detailed failure analysis:

```typescript
// Enable in config
use: {
  trace: 'on-first-retry',  // or 'on'
}
```

View traces:
```bash
npx playwright show-trace trace.zip
```

Shows:
- Timeline of actions
- Network requests
- Console logs
- Screenshots at each step
- DOM snapshots

---

## Test Maintenance

### Regular Tasks

**Weekly:**
- [ ] Run full test suite: `npm run test:e2e`
- [ ] Review failed tests
- [ ] Update selectors if UI changed

**Monthly:**
- [ ] Update Playwright: `npm update @playwright/test`
- [ ] Review test coverage
- [ ] Add tests for new features
- [ ] Remove tests for deprecated features

**Before Release:**
- [ ] Run tests on all browsers
- [ ] Run mobile tests
- [ ] Check CI pipeline passes
- [ ] Review test report

### Coverage Goals

**Current Status:**
- Voting Board: ✅ 90% coverage
- Problem Framing: ✅ 80% coverage
- Authentication: ⏳ 40% coverage (needs expansion)
- Admin Features: ⏳ 20% coverage (needs expansion)

**Target:** 70% overall coverage of critical user flows

---

## Resources

### Documentation
- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Commands Reference

```bash
# Run tests
npm run test:e2e                  # All tests, headless
npm run test:e2e:ui               # Interactive UI mode
npm run test:e2e:headed           # See browser window
npm run test:e2e:debug            # Debug mode (step through)
npm run test:e2e:chromium         # Chromium only

# Run specific tests
npx playwright test voting-board  # Single file
npx playwright test -g "should create"  # By name pattern
npx playwright test --project=firefox   # Specific browser

# Reports
npm run test:e2e:report           # View HTML report
npx playwright show-trace trace.zip  # View trace file

# Utilities
npx playwright codegen localhost:3001  # Generate test code
npx playwright inspector          # Open inspector
```

---

## Next Steps

1. **Expand Coverage**
   - Add authentication flow tests
   - Add admin panel tests
   - Add error boundary tests

2. **CI/CD Integration**
   - Set up GitHub Actions workflow
   - Configure test database
   - Add status badges to README

3. **Performance Testing**
   - Add performance assertions
   - Track Core Web Vitals
   - Monitor test execution time

4. **Visual Regression**
   - Consider adding visual comparison tests
   - Use `await page.screenshot()` for baselines

---

## Questions?

- Check [Troubleshooting](#troubleshooting) section
- Review [Playwright Docs](https://playwright.dev)
- Ask in team chat or open an issue

**Happy Testing! 🎭**
