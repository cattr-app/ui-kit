// Shared test fixture: every test fails on a browser console error, an uncaught page error
// or a Vue warning, so interaction tests catch them too, not only the smoke suite.
import { test as base, expect } from '@playwright/test'

/**
 * Known messages that must not fail the run, matched by exact text.
 * Each entry needs a comment with the reason and the issue that removes it.
 */
const ALLOWED = []

function isProblem(message) {
  const text = message.text()
  if (ALLOWED.includes(text)) return false
  return message.type() === 'error' || text.includes('[Vue warn]')
}

export const test = base.extend({
  consoleProblems: [
    async ({ page }, use) => {
      const problems = []
      page.on('console', message => {
        if (isProblem(message)) problems.push(`console.${message.type()}: ${message.text()}`)
      })
      page.on('pageerror', error => problems.push(`pageerror: ${error.stack || error.message}`))

      await use(problems)

      expect(problems, 'browser console errors and Vue warnings').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/**
 * Opens a docs page (hash router) and waits until its markdown content is rendered.
 * The route component is lazy and wrapped in an out-in transition.
 */
export async function openPage(page, path) {
  await page.goto(`/#${path}`)
  await expect(
    page.locator(path.split('/').length > 2 ? '.at-markdown h1' : 'h1').first(),
  ).toBeVisible()
}

/** The live demo block (`.at-component__sample`) under the given `##` heading of a page. */
export function demo(page, heading) {
  return page
    .locator('.at-markdown h2', { hasText: new RegExp(`^${heading}$`) })
    .locator('xpath=following-sibling::div[contains(@class, "at-component__container")][1]')
    .locator('.at-component__sample')
}
