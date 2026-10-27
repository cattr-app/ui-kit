// Visual baseline of every component demo page: the page content (`.at-markdown`, the whole
// element even below the fold) at a fixed viewport with animations off. Header, sidebar and
// footer are left out, so a new docs page does not change every baseline. The content column
// is a flex item stretched to the sidebar height; it is pinned to its own height, otherwise a
// longer navigation grows the screenshot of every page shorter than the sidebar.
// Baselines live in test/e2e/__screenshots__ and are taken only in the Playwright docker
// image (see README, Development): font rendering differs between systems.
import { test, expect, openPage } from '../fixtures.js'
import { demoPages } from '../pages.js'

for (const { path, name } of demoPages) {
  test(`${name} demo page`, async ({ page }) => {
    await openPage(page, path)
    await page.addStyleTag({ content: '.at-markdown { align-self: flex-start; }' })
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)

    await expect(page.locator('.at-markdown')).toHaveScreenshot(`${name.toLowerCase()}.png`)
  })
}
