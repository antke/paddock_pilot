import { defineConfig, devices } from '@playwright/test'
import { e2eEnv } from './e2e/support/env'

const ci = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  // Not *.spec.ts, so vitest's default glob never runs these.
  testMatch: '**/*.e2e.ts',
  outputDir: './e2e/.results',
  globalSetup: './e2e/global-setup.ts',
  // Journeys share one seeded deployment; files run in parallel, steps in order.
  fullyParallel: false,
  workers: ci ? 2 : 4,
  retries: ci ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: ci
    ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]]
    : [['list'], ['html', { open: 'on-failure', outputFolder: 'e2e/.report' }]],
  use: {
    baseURL: e2eEnv.baseURL,
    locale: 'en-GB',
    timezoneId: 'Europe/Warsaw',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
      grepInvert: /@mobile-only/,
    },
    {
      // Only journeys tagged @mobile: the rest mutate shared seed data once.
      name: 'mobile',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
      grep: /@mobile/,
    },
  ],
  webServer: {
    command: `pnpm exec vite dev --port ${e2eEnv.port} --strictPort`,
    url: e2eEnv.baseURL,
    reuseExistingServer: !ci,
    timeout: 120_000,
    env: {
      VITE_CONVEX_URL: e2eEnv.convexUrl,
      VITE_CONVEX_SITE_URL: e2eEnv.convexSiteUrl,
      VITE_POSTHOG_KEY: '',
      TANSTACK_DEVTOOLS_EVENT_BUS: '0',
    },
  },
})
