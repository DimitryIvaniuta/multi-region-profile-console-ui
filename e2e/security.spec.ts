import { expect, test } from '@playwright/test';

test('settings page documents secure handling of API keys', async ({ page }) => {
  await page.goto('/#/settings');

  await expect(page.getByRole('heading', { name: 'Backend connection settings' })).toBeVisible();
  await expect(page.getByText('No API keys in URLs or query strings.')).toBeVisible();
  await page.getByLabel('API key').fill('custom-api-key');
  await page.getByRole('button', { name: 'Save for session' }).click();
  await expect(page.getByText('Settings updated')).toBeVisible();
});
