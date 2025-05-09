import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test('should navigate to sign-in page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/sign-in');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByPlaceholder('Email').fill('invalid@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for error message to appear
    const errorMessage = await page.getByText(/Invalid email or password/);
    await expect(errorMessage).toBeVisible();
  });
});