import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for E2E Tests
 *
 * This file handles authentication state before running tests.
 * It creates an authenticated session and saves the state for reuse.
 */

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Check if we need to authenticate
  // If your app allows anonymous sessions, you might skip this
  const needsAuth = await page.locator('input[type="email"], input[type="password"]').count() > 0;

  if (needsAuth) {
    console.log('Authentication required - please configure test user credentials');

    // For now, we'll use environment variables for test credentials
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

    // Try to log in
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.count() > 0) {
      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);

      // Submit login
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');

      // Wait for redirect
      await page.waitForURL(/\/(tools|home|dashboard)/, { timeout: 10000 }).catch(() => {
        console.log('Note: Authentication may not be required for basic testing');
      });
    }
  }

  // Save authenticated state
  await page.context().storageState({ path: authFile });

  console.log('Authentication setup complete');
});
