import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for E2E Tests
 *
 * This file handles authentication state before running tests.
 * It creates an authenticated session and saves the state for reuse.
 */

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page (correct route)
  await page.goto('/auth/login');

  // Wait for page to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Get test credentials from environment or use defaults
  const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

  console.log(`Logging in with: ${testEmail}`);

  // Fill in credentials
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  // Submit login form
  await page.click('button[type="submit"]');

  // Wait for successful redirect after login
  // The app redirects to /home or /tools after successful auth
  await page.waitForURL(/\/(home|tools|dashboard|profile)/, { timeout: 15000 });

  console.log('Login successful, saving authentication state');

  // Save authenticated state to file for reuse in tests
  await page.context().storageState({ path: authFile });

  console.log('Authentication setup complete');
});
