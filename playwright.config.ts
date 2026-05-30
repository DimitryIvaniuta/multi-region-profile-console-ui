import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const customChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunchOptions = customChromium && existsSync(customChromium)
  ? {
      launchOptions: {
        executablePath: customChromium,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    }
  : {};

const config = {
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...chromiumLaunchOptions } },
  ],
} satisfies Parameters<typeof defineConfig>[0];

export default defineConfig(process.env.CI ? { ...config, workers: 2 } : config);
