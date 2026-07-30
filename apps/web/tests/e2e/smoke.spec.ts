import { expect, test, type Page } from '@playwright/test';

const SESSION_STORAGE_KEY = 'erms-auth-session';

async function seedSession(page: Page) {
  const sessionJson = JSON.stringify({
    userId: 'smoke-user',
    tenantId: 'smoke-tenant',
    accessToken: 'x',
    refreshToken: 'y',
    expiresAt: new Date(Date.now() + 900_000).toISOString(),
  });

  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => window.localStorage.setItem(key, value),
    { key: SESSION_STORAGE_KEY, value: sessionJson },
  );
}

test('dashboard redirects to /login when no session exists', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/login');
  await expect(page.getByText('Sign in to ERMS (local dev)')).toBeVisible();
});

test('dashboard renders the app shell once a session is stored', async ({ page }) => {
  await seedSession(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(page.getByText('smoke-tenant')).toBeVisible();
});

test('command palette opens via the keyboard shortcut', async ({ page }) => {
  await seedSession(page);
  await page.goto('/');

  await page.keyboard.press('Control+k');
  await expect(page.getByPlaceholder('Type a command or search…')).toBeVisible();
});

test('user menu opens and offers sign out', async ({ page }) => {
  await seedSession(page);
  await page.goto('/');

  await page.getByRole('button', { name: /Account menu/ }).click();
  await expect(page.getByText('Sign out')).toBeVisible();
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
  await page.goto('/login');
  await expect(page.locator('div[dir]').first()).toHaveAttribute('dir', 'ltr');
});
