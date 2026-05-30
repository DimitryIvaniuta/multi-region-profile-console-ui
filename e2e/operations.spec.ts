import { expect, test } from '@playwright/test';
import { mockBackend } from './mocks';

test('operator can inspect operations and replay outbox', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/#/ops');

  await page.getByRole('button', { name: 'Refresh operations' }).click();
  await expect(page.getByText('profile.changes.v1').first()).toBeVisible();
  await expect(page.getByText('Invalid payload')).toBeVisible();

  await page.getByRole('button', { name: 'Replay outbox' }).click();
  await expect(page.getByText('Submitted 1 events from requested limit 100.')).toBeVisible();
});
