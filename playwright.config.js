// Browser tests (Playwright) against the documentation site: test/e2e/{smoke,components,visual}.
//
//   pnpm test:e2e          run all suites (starts `pnpm dev` unless a server is already up)
//   pnpm test:e2e smoke    run one suite (path filter)
//   pnpm test:e2e:update   re-take the visual baseline (only inside the Playwright docker image)
//
// DOCS_PORT changes the dev server port (default 7200, as in vite.docs.config.js).
import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.DOCS_PORT || 7200)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: 'test/e2e',
  testMatch: '**/*.e2e.js',
  outputDir: 'test-results',
  // Screenshots are taken only in the Playwright docker image (locally and in CI),
  // so the file name carries neither the platform nor the project.
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileDir}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI
    ? [['list'], ['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
