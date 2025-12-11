import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Tests for Voting Board Flow
 * Tests the complete user journey: Session Creation → Lobby → Voting → Results
 */

// Helper function to create a test session
async function createTestSession(page: Page, sessionName: string = 'Test Session') {
  // Navigate to voting board creation page
  await page.goto('/voting-board/new');

  // Wait for authentication check to complete
  await page.waitForSelector('input[placeholder*="Q1 Feature"]', { timeout: 10000 });

  // Fill in session details
  await page.fill('input[placeholder*="Q1 Feature"]', sessionName);

  // Add test features
  const features = [
    { title: 'User Authentication', description: 'Add login and signup functionality' },
    { title: 'Dashboard Analytics', description: 'Real-time metrics and charts' },
    { title: 'Export to PDF', description: 'Download reports as PDF' },
  ];

  for (let i = 0; i < features.length; i++) {
    const feature = features[i];

    // If not the first feature, click "Add Feature"
    if (i > 0) {
      await page.click('button:has-text("Add Feature")');
      await page.waitForTimeout(300);
    }

    // Fill feature title and description
    const featureInputs = await page.locator('input[placeholder*="feature"]').all();
    await featureInputs[i].fill(feature.title);

    const descriptionInputs = await page.locator('textarea[placeholder*="description"]').all();
    if (descriptionInputs[i]) {
      await descriptionInputs[i].fill(feature.description);
    }
  }

  // Submit the form
  await page.click('button:has-text("Create Voting Board")');

  // Wait for redirect to lobby
  await page.waitForURL(/\/session\/.*\/lobby/, { timeout: 15000 });

  // Extract session ID from URL
  const url = page.url();
  const match = url.match(/\/session\/([^\/]+)/);
  const sessionId = match ? match[1] : null;

  expect(sessionId).toBeTruthy();
  return { sessionId: sessionId!, features };
}

// Helper function to join session as a player
async function joinSession(page: Page, sessionId: string, playerName: string) {
  await page.goto(`/session/${sessionId}/lobby`);

  // Wait for join form
  await page.waitForSelector('input[placeholder*="name"]', { timeout: 10000 });

  // Enter player name
  await page.fill('input[placeholder*="name"]', playerName);

  // Click join button
  await page.click('button:has-text("Join Session")');

  // Wait for successful join (player appears in list or join form disappears)
  await page.waitForTimeout(1000);
}

test.describe('Voting Board - Complete Flow', () => {
  test('should create a session, join as player, vote, and see results', async ({ page }) => {
    // Step 1: Create session
    const { sessionId, features } = await createTestSession(page, 'E2E Test Session');

    // Step 2: Verify lobby page
    await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/lobby`));
    await expect(page.locator('h1, h2')).toContainText(/lobby|waiting/i);

    // Verify features are displayed
    for (const feature of features) {
      await expect(page.locator(`text=${feature.title}`)).toBeVisible();
    }

    // Step 3: Start the session (as host)
    await page.click('button:has-text("Start")');

    // Wait for redirect to voting page
    await page.waitForURL(new RegExp(`/session/${sessionId}/vote`), { timeout: 10000 });

    // Step 4: Allocate points
    await expect(page.locator('text=/100 points/i')).toBeVisible();

    // Find all point input fields and allocate points
    const pointInputs = await page.locator('input[type="number"]').all();
    expect(pointInputs.length).toBeGreaterThanOrEqual(features.length);

    // Allocate points: 50, 30, 20
    const pointAllocations = [50, 30, 20];
    for (let i = 0; i < Math.min(pointInputs.length, pointAllocations.length); i++) {
      await pointInputs[i].fill(pointAllocations[i].toString());
      await page.waitForTimeout(200);
    }

    // Verify remaining points
    await expect(page.locator('text=/0.*remaining|remaining.*0/i')).toBeVisible();

    // Step 5: Submit votes
    await page.click('button:has-text("Submit Vote")');

    // Wait for redirect to results
    await page.waitForURL(new RegExp(`/session/${sessionId}/results`), { timeout: 15000 });

    // Step 6: Verify results page
    await expect(page.locator('h1, h2')).toContainText(/result/i);

    // Verify features are ranked
    for (const feature of features) {
      await expect(page.locator(`text=${feature.title}`)).toBeVisible();
    }

    // Verify top feature has highest points (50)
    await expect(page.locator('text=/50.*point/i')).toBeVisible();

    // Verify CSV download button exists
    await expect(page.locator('button:has-text("Download CSV")')).toBeVisible();
  });

  test('should enforce 100-point limit', async ({ page }) => {
    // Create session
    const { sessionId } = await createTestSession(page, 'Point Limit Test');

    // Start session
    await page.click('button:has-text("Start")');
    await page.waitForURL(new RegExp(`/session/${sessionId}/vote`));

    // Try to allocate more than 100 points
    const pointInputs = await page.locator('input[type="number"]').all();

    if (pointInputs.length >= 2) {
      await pointInputs[0].fill('60');
      await pointInputs[1].fill('50'); // Total = 110

      // Try to submit
      await page.click('button:has-text("Submit Vote")');

      // Should show error or prevent submission
      // Wait a bit to see if redirect happens (it shouldn't)
      await page.waitForTimeout(1000);

      // Should still be on voting page
      await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/vote`));
    }
  });

  test('should allow zero points on features', async ({ page }) => {
    // Create session
    const { sessionId } = await createTestSession(page, 'Zero Points Test');

    // Start session
    await page.click('button:has-text("Start")');
    await page.waitForURL(new RegExp(`/session/${sessionId}/vote`));

    // Allocate all points to first feature only
    const pointInputs = await page.locator('input[type="number"]').all();

    if (pointInputs.length >= 1) {
      await pointInputs[0].fill('100');

      // Submit votes
      await page.click('button:has-text("Submit Vote")');

      // Should successfully redirect to results
      await page.waitForURL(new RegExp(`/session/${sessionId}/results`), { timeout: 10000 });
      await expect(page.locator('h1, h2')).toContainText(/result/i);
    }
  });

  test('should show error for non-existent session', async ({ page }) => {
    // Try to access non-existent session
    await page.goto('/session/nonexistent-id-12345/lobby');

    // Should show error message or redirect
    await page.waitForTimeout(2000);

    // Check for error indicators
    const hasError = await page.locator('text=/error|not found|doesn\'t exist/i').count() > 0;
    const isRedirected = !page.url().includes('nonexistent-id-12345');

    expect(hasError || isRedirected).toBeTruthy();
  });

  test('should handle CSV download', async ({ page }) => {
    // Create session and complete voting flow
    const { sessionId } = await createTestSession(page, 'CSV Download Test');

    // Start and complete voting
    await page.click('button:has-text("Start")');
    await page.waitForURL(new RegExp(`/session/${sessionId}/vote`));

    // Quick vote allocation
    const pointInputs = await page.locator('input[type="number"]').all();
    if (pointInputs.length >= 1) {
      await pointInputs[0].fill('100');
    }

    await page.click('button:has-text("Submit Vote")');
    await page.waitForURL(new RegExp(`/session/${sessionId}/results`));

    // Setup download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click download button
    await page.click('button:has-text("Download CSV")');

    // Wait for download
    const download = await downloadPromise;

    // Verify filename contains session info
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});

test.describe('Voting Board - Multi-Player Scenarios', () => {
  test('should handle multiple players joining and voting', async ({ browser }) => {
    // Create two browser contexts (two users)
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    try {
      // Host creates session
      const { sessionId, features } = await createTestSession(hostPage, 'Multi-Player Test');

      // Player joins session
      await joinSession(playerPage, sessionId, 'Test Player');

      // Verify player appears in lobby on host's page
      await hostPage.waitForTimeout(2000);
      await expect(hostPage.locator('text=/Test Player/i')).toBeVisible();

      // Host starts the session
      await hostPage.click('button:has-text("Start")');

      // Both should redirect to voting page
      await hostPage.waitForURL(new RegExp(`/session/${sessionId}/vote`));
      await playerPage.waitForURL(new RegExp(`/session/${sessionId}/vote`), { timeout: 10000 });

      // Both players vote
      const hostInputs = await hostPage.locator('input[type="number"]').all();
      const playerInputs = await playerPage.locator('input[type="number"]').all();

      if (hostInputs.length >= 1) await hostInputs[0].fill('100');
      if (playerInputs.length >= 2) {
        await playerInputs[0].fill('40');
        await playerInputs[1].fill('60');
      }

      // Submit votes
      await hostPage.click('button:has-text("Submit Vote")');
      await playerPage.click('button:has-text("Submit Vote")');

      // Both should see results
      await hostPage.waitForURL(new RegExp(`/session/${sessionId}/results`), { timeout: 15000 });
      await playerPage.waitForURL(new RegExp(`/session/${sessionId}/results`), { timeout: 15000 });

      // Verify results show combined votes
      await expect(hostPage.locator('text=/result/i')).toBeVisible();
      await expect(playerPage.locator('text=/result/i')).toBeVisible();

    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });

  test('should prevent duplicate player names', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Create session
      const { sessionId } = await createTestSession(page1, 'Duplicate Name Test');

      // First player joins
      await page2.goto(`/session/${sessionId}/lobby`);
      await page2.waitForSelector('input[placeholder*="name"]');
      await page2.fill('input[placeholder*="name"]', 'John Doe');
      await page2.click('button:has-text("Join")');
      await page2.waitForTimeout(1000);

      // Try to join with same name in another context
      const page3 = await context1.newPage();
      await page3.goto(`/session/${sessionId}/lobby`);
      await page3.waitForSelector('input[placeholder*="name"]');
      await page3.fill('input[placeholder*="name"]', 'John Doe');
      await page3.click('button:has-text("Join")');

      // Should show error
      await page3.waitForTimeout(1000);
      const errorVisible = await page3.locator('text=/already taken|duplicate/i').count() > 0;

      // If no error message, check that join didn't succeed
      if (!errorVisible) {
        const stillShowingJoinForm = await page3.locator('input[placeholder*="name"]').count() > 0;
        expect(stillShowingJoinForm).toBeTruthy();
      }

      await page3.close();
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});

test.describe('Voting Board - Mobile Responsive', () => {
  test('should work on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE size
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    const page = await context.newPage();

    try {
      // Create session on mobile
      const { sessionId } = await createTestSession(page, 'Mobile Test');

      // Verify lobby is visible and scrollable
      await expect(page.locator('h1, h2')).toBeVisible();

      // Start session
      await page.click('button:has-text("Start")');
      await page.waitForURL(new RegExp(`/session/${sessionId}/vote`));

      // Vote on mobile
      const pointInputs = await page.locator('input[type="number"]').all();
      if (pointInputs.length >= 1) {
        await pointInputs[0].fill('100');
      }

      // Submit
      await page.click('button:has-text("Submit Vote")');
      await page.waitForURL(new RegExp(`/session/${sessionId}/results`));

      // Verify results are visible
      await expect(page.locator('text=/result/i')).toBeVisible();

    } finally {
      await context.close();
    }
  });
});

test.describe('Voting Board - Edge Cases', () => {
  test('should handle single player session', async ({ page }) => {
    const { sessionId } = await createTestSession(page, 'Single Player Test');

    // Start immediately (only host)
    await page.click('button:has-text("Start")');
    await page.waitForURL(new RegExp(`/session/${sessionId}/vote`));

    // Vote
    const pointInputs = await page.locator('input[type="number"]').all();
    if (pointInputs.length >= 1) {
      await pointInputs[0].fill('100');
    }

    await page.click('button:has-text("Submit Vote")');

    // Should still show results with single voter
    await page.waitForURL(new RegExp(`/session/${sessionId}/results`), { timeout: 10000 });
    await expect(page.locator('text=/result/i')).toBeVisible();
  });

  test('should handle session with many features (10 features)', async ({ page }) => {
    await page.goto('/voting-board/new');
    await page.waitForSelector('input[placeholder*="Q1 Feature"]');

    // Fill session name
    await page.fill('input[placeholder*="Q1 Feature"]', 'Many Features Test');

    // Add 10 features
    for (let i = 0; i < 10; i++) {
      if (i > 0) {
        await page.click('button:has-text("Add Feature")');
        await page.waitForTimeout(200);
      }

      const featureInputs = await page.locator('input[placeholder*="feature"]').all();
      await featureInputs[i].fill(`Feature ${i + 1}`);
    }

    // Try to add 11th feature (should be prevented or limited)
    const addButtonDisabled = await page.locator('button:has-text("Add Feature")').isDisabled();

    // Create session
    await page.click('button:has-text("Create Voting Board")');
    await page.waitForURL(/\/session\/.*\/lobby/);

    // Start and vote
    await page.click('button:has-text("Start")');
    await page.waitForURL(/\/session\/.*\/vote/);

    // Allocate 10 points to each feature
    const pointInputs = await page.locator('input[type="number"]').all();
    for (let i = 0; i < Math.min(pointInputs.length, 10); i++) {
      await pointInputs[i].fill('10');
      await page.waitForTimeout(100);
    }

    await page.click('button:has-text("Submit Vote")');
    await page.waitForURL(/\/session\/.*\/results/);

    // Verify all features in results
    await expect(page.locator('text=/Feature/i')).toBeVisible();
  });
});
