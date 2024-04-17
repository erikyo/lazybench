// @ts-check
import {defineConfig, devices} from "@playwright/test";


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Timeout per test */
  timeout: 60 * 1000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:4200/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome - Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Chrome - Moto G4',
      use: { ...devices['Moto G4'] },
    },
    {
      name: 'Samsung',
      use: { ...devices['Galaxy S5'], ...devices['Galaxy S III'] },
    },
    {
      name: 'Mobile Safari - iPhone 12 - Slow 3G',
      use: { ...devices['iPhone 12'] },
      network: 'Slow 3G',
    },
    {
      name: 'Mobile Safari - iPhone 12 - Fast 3G',
      use: { ...devices['iPhone 12'] },
      network: 'Fast 3G',
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run serve',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env.CI,
  },
});

