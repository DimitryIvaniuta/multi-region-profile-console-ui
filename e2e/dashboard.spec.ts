import { expect, test } from '@playwright/test';
import { mockBackend } from './mocks';

test('dashboard displays regional SLA and lag telemetry', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Regional profile health overview' })).toBeVisible();
  await expect(page.getByText('Worst observed lag')).toBeVisible();
  await expect(page.getByText('Within SLA').first()).toBeVisible();
});
