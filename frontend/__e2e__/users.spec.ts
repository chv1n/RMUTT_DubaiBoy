import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test('should load users list', async ({ page }) => {
    // Navigate to users page
    await page.goto('/super-admin/users');

    // Check title
    await expect(page.getByRole('heading', { name: /Users Management/i })).toBeVisible();

    // Check if table is visible
    // Depending on mock data, we might see rows
    // await expect(page.getByRole('table')).toBeVisible();
  });

  test('should open create user modal', async ({ page }) => {
    await page.goto('/super-admin/users');

    // Click create button
    await page.getByRole('button', { name: /Create User/i }).click();

    // Check modal title
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Create User/i, level: 2 })).toBeVisible(); // Modal header usually h2 or labeled
  });
});
