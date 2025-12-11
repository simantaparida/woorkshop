import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic Verification
 *
 * Quick tests to verify the application is running and accessible.
 * Run these first to ensure basic setup is working.
 */

test.describe('Smoke Tests', () => {
  test('homepage should load', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify page loaded (check for common elements)
    const hasTitle = await page.locator('h1, h2').count() > 0;
    expect(hasTitle).toBeTruthy();

    // Take screenshot for verification
    await page.screenshot({ path: 'playwright-report/homepage.png', fullPage: true });
  });

  test('tools page should be accessible', async ({ page }) => {
    await page.goto('/tools');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Check if page has content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent!.length).toBeGreaterThan(0);
  });

  test('voting board creation page should redirect to login or load', async ({ page }) => {
    // Try to access voting board creation
    await page.goto('/voting-board/new');

    // Wait for either login redirect or page load
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    // Either we're on the page or redirected to login
    const isOnCorrectPage = currentUrl.includes('/voting-board/new') || currentUrl.includes('/login') || currentUrl.includes('/auth');

    expect(isOnCorrectPage).toBeTruthy();

    console.log(`Voting board page test - redirected to: ${currentUrl}`);
  });

  test('problem framing creation page should redirect to login or load', async ({ page }) => {
    await page.goto('/tools/problem-framing/new');

    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    // Either we're on the page or redirected to login/auth
    const isOnCorrectPage =
      currentUrl.includes('/problem-framing/new') ||
      currentUrl.includes('/login') ||
      currentUrl.includes('/auth');

    expect(isOnCorrectPage).toBeTruthy();

    console.log(`Problem framing page test - redirected to: ${currentUrl}`);
  });

  test('404 page should work for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // Should either get 404 status or redirect to home/error page
    const is404 = response?.status() === 404;
    const hasErrorText = await page.locator('text=/404|not found|page.*not.*exist/i').count() > 0;

    expect(is404 || hasErrorText).toBeTruthy();
  });

  test('API health check', async ({ page }) => {
    // Try to access a simple API endpoint
    const response = await page.goto('/api/health');

    // If no health endpoint, that's okay
    if (response?.status() === 404) {
      console.log('Note: No /api/health endpoint - consider adding one for monitoring');
      return;
    }

    // If health endpoint exists, verify it works
    expect(response?.ok()).toBeTruthy();
  });
});

test.describe('Critical Routes', () => {
  const criticalRoutes = [
    '/',
    '/tools',
    '/login',
    '/projects',
  ];

  for (const route of criticalRoutes) {
    test(`${route} should not return 500 error`, async ({ page }) => {
      const response = await page.goto(route);

      // Should not get server error
      const statusCode = response?.status() || 200;
      expect(statusCode).toBeLessThan(500);

      console.log(`${route} returned status: ${statusCode}`);
    });
  }
});
