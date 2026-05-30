import { expect, test } from '@playwright/test';
import { mockBackend, profileId } from './mocks';

test('operator compares profile versions across all regions', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/#/compare');

  await page.getByLabel('Profile ID').fill(profileId);
  await page.getByLabel('Minimum version').fill('1');
  await page.getByRole('button', { name: 'Compare regions' }).click();

  await expect(page.getByRole('heading', { name: 'Regional comparison matrix' })).toBeVisible();
  await expect(page.getByText('Primary Write Region')).toBeVisible();
  await expect(page.getByText('Version skew')).toBeVisible();
});
