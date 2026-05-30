import { expect, test } from '@playwright/test';
import { mockBackend, profileId } from './mocks';

test('operator creates and reads a regional profile view', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/#/create');

  await page.getByRole('button', { name: 'Create profile' }).click();
  await expect(page.getByText(profileId)).toBeVisible();

  await page.getByRole('button', { name: 'Regional Read' }).click();
  await page.getByLabel('Profile ID').fill(profileId);
  await page.getByLabel('Minimum version').fill('1');
  await page.getByRole('button', { name: 'Read profile' }).click();

  await expect(page.getByText('Regional profile view')).toBeVisible();
  await expect(page.getByText('Within SLA').last()).toBeVisible();
});

test('operator updates and deactivates profile in primary region', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/#/update');

  await page.getByLabel('Profile ID').fill(profileId);
  await page.getByRole('button', { name: 'Update profile' }).click();
  await expect(page.getByText('Alice Updated')).toBeVisible();

  await page.getByRole('button', { name: 'Deactivate profile' }).click();
  await expect(page.getByText('INACTIVE')).toBeVisible();
});
