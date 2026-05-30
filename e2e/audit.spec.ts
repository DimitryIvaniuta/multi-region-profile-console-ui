import { expect, test } from '@playwright/test';
import { mockBackend, profileId } from './mocks';

test('operator activity audit records safe non-PII actions', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/#/read');

  await page.getByLabel('Profile ID').fill(profileId);
  await page.getByRole('button', { name: 'Read profile' }).click();
  await page.getByRole('button', { name: 'Activity Audit' }).click();

  await expect(page.getByRole('heading', { name: 'Operator activity audit' })).toBeVisible();
  await expect(page.getByText('READ_PROFILE')).toBeVisible();
  await expect(page.getByText('alice@example.com')).toHaveCount(0);
});
