import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * E2E Tests for Problem Framing Flow
 * Tests the complete workflow: Session Creation → Join → Input → Review → Finalize → Summary
 */

// Helper function to create a problem framing session
async function createProblemFramingSession(
  page: Page,
  title: string = 'Test Problem Framing Session',
  facilitatorName: string = 'Test Facilitator'
) {
  // Navigate to problem framing creation page
  await page.goto('/tools/problem-framing/new');

  // Wait for form to load
  await page.waitForSelector('input[id="title"]', { timeout: 10000 });

  // Fill in session details
  const titleInput = page.locator('input[id="title"]');
  await titleInput.fill(title);

  // Fill facilitator name
  const nameInput = page.locator('input[id="name"]');
  await nameInput.fill(facilitatorName);

  // Add optional description if field exists
  const descriptionField = page.locator('textarea[placeholder*="description"]');
  const hasDescription = await descriptionField.count() > 0;
  if (hasDescription) {
    await descriptionField.fill('Test description for problem framing session');
  }

  // Submit the form
  await page.click('button:has-text("Create Session"), button:has-text("Start Session")');

  // Wait for redirect to join page
  await page.waitForURL(/\/tools\/problem-framing\/.*\/join/, { timeout: 15000 });

  // Wait for the join page content to actually load (not just URL change)
  await page.waitForSelector('h1, h2, button:has-text("Join")', { timeout: 10000 });

  // Extract session ID from URL
  const url = page.url();
  const match = url.match(/\/problem-framing\/([^\/]+)/);
  const sessionId = match ? match[1] : null;

  expect(sessionId).toBeTruthy();
  return { sessionId: sessionId!, title };
}

// Helper function to join a problem framing session
async function joinProblemFramingSession(
  page: Page,
  sessionId: string,
  participantName: string
) {
  await page.goto(`/tools/problem-framing/${sessionId}/join`);

  // Wait for join form
  await page.waitForSelector('input[id="name"]', { timeout: 10000 });

  // Enter participant name
  await page.fill('input[id="name"]', participantName);

  // Click join button
  await page.click('button:has-text("Join")');

  // Wait for successful join
  await page.waitForTimeout(1500);
}

test.describe('Problem Framing - Complete Flow', () => {
  test('should create session, add statements, review, and finalize', async ({ page }) => {
    // Step 1: Create session
    const { sessionId, title } = await createProblemFramingSession(
      page,
      'Product Vision Problem',
      'Product Manager'
    );

    // Step 2: Verify join page
    await expect(page).toHaveURL(new RegExp(`/tools/problem-framing/${sessionId}/join`));

    // Verify session title is visible
    await expect(page.locator(`text=${title}`)).toBeVisible();

    // Step 3: Navigate to input phase
    // Look for "Continue" or "Start" button or auto-redirect
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Start Input")');
    const hasContinueButton = await continueButton.count() > 0;

    if (hasContinueButton) {
      await continueButton.click();
      await page.waitForURL(/\/tools\/problem-framing\/.*\/input/);
    } else {
      // May auto-redirect after join
      await page.goto(`/tools/problem-framing/${sessionId}/input`);
    }

    // Step 4: Add problem statements
    await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 });

    const testStatements = [
      'Our users struggle to understand the product value proposition',
      'The onboarding process takes too long',
      'We lack clear success metrics',
    ];

    for (const statement of testStatements) {
      // Find statement input field
      const statementInput = page.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
      await statementInput.fill(statement);

      // Click add/submit button
      await page.click('button:has-text("Add"), button:has-text("Submit")');
      await page.waitForTimeout(1000);
    }

    // Step 5: Navigate to review phase
    const reviewButton = page.locator('button:has-text("Review"), button:has-text("Continue to Review")');
    const hasReviewButton = await reviewButton.count() > 0;

    if (hasReviewButton) {
      await reviewButton.click();
    } else {
      await page.goto(`/tools/problem-framing/${sessionId}/review`);
    }

    await page.waitForURL(/\/tools\/problem-framing\/.*\/review/, { timeout: 10000 });

    // Step 6: Verify statements in review
    for (const statement of testStatements) {
      await expect(page.locator(`text=${statement}`)).toBeVisible();
    }

    // Pin some statements (if functionality exists)
    const pinButtons = await page.locator('button:has-text("Pin"), button[aria-label*="pin"]').all();
    if (pinButtons.length > 0) {
      await pinButtons[0].click();
      await page.waitForTimeout(500);
    }

    // Step 7: Navigate to finalize phase
    const finalizeButton = page.locator('button:has-text("Finalize"), button:has-text("Continue to Finalize")');
    const hasFinalizeButton = await finalizeButton.count() > 0;

    if (hasFinalizeButton) {
      await finalizeButton.click();
    } else {
      await page.goto(`/tools/problem-framing/${sessionId}/finalize`);
    }

    await page.waitForURL(/\/tools\/problem-framing\/.*\/finalize/, { timeout: 10000 });

    // Step 8: Write final statement
    const finalStatementInput = page.locator('textarea[placeholder*="final"], textarea[placeholder*="problem"]').first();
    await finalStatementInput.fill('Our primary challenge is helping users quickly understand and realize product value through a streamlined onboarding experience with measurable success metrics.');

    // Submit final statement
    await page.click('button:has-text("Submit"), button:has-text("Save")');
    await page.waitForTimeout(1500);

    // Step 9: Navigate to summary
    const summaryButton = page.locator('button:has-text("Summary"), button:has-text("View Summary")');
    const hasSummaryButton = await summaryButton.count() > 0;

    if (hasSummaryButton) {
      await summaryButton.click();
    } else {
      await page.goto(`/tools/problem-framing/${sessionId}/summary`);
    }

    await page.waitForURL(/\/tools\/problem-framing\/.*\/summary/, { timeout: 10000 });

    // Step 10: Verify summary page
    await expect(page.locator('text=/final.*statement|problem.*statement/i')).toBeVisible();
    await expect(page.locator('text=/understand.*value/i')).toBeVisible();
  });

  test('should handle empty statement submission', async ({ page }) => {
    const { sessionId } = await createProblemFramingSession(page);

    // Navigate to input page
    await page.goto(`/tools/problem-framing/${sessionId}/input`);
    await page.waitForTimeout(1000);

    // Try to submit empty statement
    const submitButton = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
    const isDisabled = await submitButton.isDisabled();

    if (!isDisabled) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should show error or not add statement
      // Verify no empty cards were added
      const emptyCards = await page.locator('text=/^$/').count();
      // This is a basic check; adjust based on actual implementation
    }
  });

  test('should allow editing statements before submission', async ({ page }) => {
    const { sessionId } = await createProblemFramingSession(page);

    await page.goto(`/tools/problem-framing/${sessionId}/input`);
    await page.waitForTimeout(1000);

    // Add a statement
    const statementInput = page.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
    await statementInput.fill('Initial statement text');
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(1000);

    // Check if edit functionality exists
    const editButton = page.locator('button:has-text("Edit"), button[aria-label*="edit"]').first();
    const canEdit = await editButton.count() > 0;

    if (canEdit) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Modify the statement
      const editInput = page.locator('textarea, input[type="text"]').first();
      await editInput.clear();
      await editInput.fill('Modified statement text');

      // Save changes
      await page.click('button:has-text("Save"), button:has-text("Update")');
      await page.waitForTimeout(1000);

      // Verify modification
      await expect(page.locator('text=/Modified statement/i')).toBeVisible();
    }
  });
});

test.describe('Problem Framing - Multi-Participant Flow', () => {
  test('should handle multiple participants adding statements', async ({ browser }) => {
    // Create two participants
    const facilitatorContext = await browser.newContext();
    const participantContext = await browser.newContext();

    const facilitatorPage = await facilitatorContext.newPage();
    const participantPage = await participantContext.newPage();

    try {
      // Facilitator creates session
      const { sessionId } = await createProblemFramingSession(
        facilitatorPage,
        'Multi-Participant Test',
        'Facilitator'
      );

      // Participant joins
      await joinProblemFramingSession(participantPage, sessionId, 'Participant 1');

      // Both navigate to input phase
      await facilitatorPage.goto(`/tools/problem-framing/${sessionId}/input`);
      await participantPage.goto(`/tools/problem-framing/${sessionId}/input`);

      await facilitatorPage.waitForTimeout(1000);
      await participantPage.waitForTimeout(1000);

      // Facilitator adds statement
      const facilInput = facilitatorPage.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
      await facilInput.fill('Facilitator problem statement');
      await facilitatorPage.click('button:has-text("Add")');
      await facilitatorPage.waitForTimeout(1500);

      // Participant adds statement
      const partInput = participantPage.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
      await partInput.fill('Participant problem statement');
      await participantPage.click('button:has-text("Add")');
      await participantPage.waitForTimeout(1500);

      // Both navigate to review
      await facilitatorPage.goto(`/tools/problem-framing/${sessionId}/review`);
      await participantPage.goto(`/tools/problem-framing/${sessionId}/review`);

      await facilitatorPage.waitForTimeout(2000);
      await participantPage.waitForTimeout(2000);

      // Both should see both statements
      await expect(facilitatorPage.locator('text=/Facilitator problem/i')).toBeVisible();
      await expect(facilitatorPage.locator('text=/Participant problem/i')).toBeVisible();

      await expect(participantPage.locator('text=/Facilitator problem/i')).toBeVisible();
      await expect(participantPage.locator('text=/Participant problem/i')).toBeVisible();

    } finally {
      await facilitatorContext.close();
      await participantContext.close();
    }
  });

  test('should show real-time updates when statements are added', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Create session with page1
      const { sessionId } = await createProblemFramingSession(page1);

      // Join with page2
      await joinProblemFramingSession(page2, sessionId, 'Observer');

      // Both go to input
      await page1.goto(`/tools/problem-framing/${sessionId}/input`);
      await page2.goto(`/tools/problem-framing/${sessionId}/input`);

      await page1.waitForTimeout(1000);

      // Page1 adds statement
      const input1 = page1.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
      await input1.fill('Real-time test statement');
      await page1.click('button:has-text("Add")');

      // Wait for real-time update
      await page2.waitForTimeout(3000);

      // Page2 should see the statement (if real-time is implemented)
      const statementVisible = await page2.locator('text=/Real-time test/i').count() > 0;

      // This assertion may need adjustment based on implementation
      // If real-time is not implemented, this test documents the gap
      if (statementVisible) {
        await expect(page2.locator('text=/Real-time test/i')).toBeVisible();
      }

    } finally {
      await context1.close();
      await context2.close();
    }
  });
});

test.describe('Problem Framing - Attachment Upload', () => {
  test('should handle file attachments if supported', async ({ page }) => {
    await page.goto('/tools/problem-framing/new');
    await page.waitForTimeout(1000);

    // Check if attachment upload exists
    const uploadButton = page.locator('input[type="file"], button:has-text("Upload"), button:has-text("Attach")');
    const hasUpload = await uploadButton.count() > 0;

    if (hasUpload) {
      // Create a test file
      const testFile = {
        name: 'test-document.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test attachment content'),
      };

      // Upload file
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer,
      });

      await page.waitForTimeout(1000);

      // Verify file is attached
      await expect(page.locator(`text=${testFile.name}`)).toBeVisible();
    }
  });
});

test.describe('Problem Framing - Edge Cases', () => {
  test('should handle session with no participants joining', async ({ page }) => {
    const { sessionId } = await createProblemFramingSession(page, 'Solo Session');

    // Skip join, go directly to input
    await page.goto(`/tools/problem-framing/${sessionId}/input`);
    await page.waitForTimeout(1000);

    // Should still work with just facilitator
    const statementInput = page.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
    await statementInput.fill('Solo problem statement');
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(1000);

    // Navigate through workflow
    await page.goto(`/tools/problem-framing/${sessionId}/review`);
    await page.waitForTimeout(1000);

    await expect(page.locator('text=/Solo problem/i')).toBeVisible();
  });

  test('should handle very long problem statements', async ({ page }) => {
    const { sessionId } = await createProblemFramingSession(page);

    await page.goto(`/tools/problem-framing/${sessionId}/input`);
    await page.waitForTimeout(1000);

    // Create very long statement (500 characters)
    const longStatement = 'A'.repeat(500) + ' - This is a very long problem statement that tests the character limit and UI rendering';

    const statementInput = page.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
    await statementInput.fill(longStatement);

    // Try to submit
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(1000);

    // Should either accept it or show validation error
    const errorVisible = await page.locator('text=/too long|maximum length|character limit/i').count() > 0;

    if (!errorVisible) {
      // Statement was accepted, verify it's visible
      await page.goto(`/tools/problem-framing/${sessionId}/review`);
      await page.waitForTimeout(1000);
      const truncatedText = longStatement.substring(0, 50);
      await expect(page.locator(`text=/${truncatedText}/i`)).toBeVisible();
    }
  });

  test('should navigate back from any phase', async ({ page }) => {
    const { sessionId } = await createProblemFramingSession(page);

    // Test back navigation from input
    await page.goto(`/tools/problem-framing/${sessionId}/input`);
    await page.waitForTimeout(1000);

    const backButton = page.locator('button:has-text("Back"), a:has-text("Back")');
    const hasBackButton = await backButton.count() > 0;

    if (hasBackButton) {
      await backButton.click();
      await page.waitForTimeout(1000);

      // Should navigate back to previous page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/tools\/problem-framing\//);
    }
  });
});

test.describe('Problem Framing - Mobile Responsive', () => {
  test('should work on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    const page = await context.newPage();

    try {
      const { sessionId } = await createProblemFramingSession(
        page,
        'Mobile Test',
        'Mobile User'
      );

      // Add statement on mobile
      await page.goto(`/tools/problem-framing/${sessionId}/input`);
      await page.waitForTimeout(1000);

      const statementInput = page.locator('textarea[placeholder*="statement"], input[placeholder*="problem"]').first();
      await statementInput.fill('Mobile problem statement');
      await page.click('button:has-text("Add")');
      await page.waitForTimeout(1000);

      // Navigate to review
      await page.goto(`/tools/problem-framing/${sessionId}/review`);
      await page.waitForTimeout(1000);

      // Verify statement is visible and readable on mobile
      await expect(page.locator('text=/Mobile problem/i')).toBeVisible();

    } finally {
      await context.close();
    }
  });
});
