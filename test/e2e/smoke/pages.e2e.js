// Every page of the documentation site opens without console errors, page errors and Vue
// warnings (checked by the shared fixture), and every demo compiled.
import { test, expect, openPage } from '../fixtures.js'
import { allPages } from '../pages.js'

for (const { path } of allPages) {
  test(`opens ${path}`, async ({ page }) => {
    await openPage(page, path)
    await expect(page.locator('.demo-error')).toHaveCount(0)
    // let mount-time timers and lazy chunks of the page settle before the console check
    await page.waitForLoadState('networkidle')
  })
}
