import { test, expect } from '@playwright/test';

test.describe('Workforce Analytics Platform - Smoke Tests', () => {
  test('should load the authentication or dashboard page', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads with a document title
    await expect(page).toHaveTitle(/Workforce Analytics/i);

    // Verify main interactive elements exist on page
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to login page directly', async ({ page }) => {
    await page.goto('/login');

    // Verify login view renders
    await expect(page.locator('body')).toBeVisible();
  });
});
