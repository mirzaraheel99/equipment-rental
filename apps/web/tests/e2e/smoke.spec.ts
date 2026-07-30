import { expect, test } from '@playwright/test';

test('home page loads and confirms setup', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /project bootstrap/i })).toBeVisible();
});

test('theme can switch between light and dark', async ({ page }) => {
  await page.goto('/dev/components');
  const html = page.locator('html');

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Dark' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Light' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('root layout renders with the default language direction', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('div[dir]').first()).toHaveAttribute('dir', 'ltr');
});
