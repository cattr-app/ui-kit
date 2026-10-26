// Dropdown, Tooltip and Popover: hover/click triggers and the computed popup position.
import { test, expect, openPage, demo } from '../fixtures.js'

/** Asserts that `popup` is rendered on the given side of `anchor`. */
async function expectSide(popup, anchor, side) {
  // measure the final position, not a frame of the enter transition
  // (a running transition can also be cancelled, so poll instead of awaiting `finished`)
  await expect.poll(() => popup.evaluate(el => el.getAnimations().length)).toBe(0)
  await expect(popup).toBeVisible()
  const p = await popup.boundingBox()
  const a = await anchor.boundingBox()
  const checks = {
    top: p.y + p.height <= a.y + 1,
    bottom: p.y >= a.y + a.height - 1,
    left: p.x + p.width <= a.x + 1,
    right: p.x >= a.x + a.width - 1,
  }
  expect(
    checks[side],
    `popup is on the ${side} of the trigger (popup ${JSON.stringify(p)}, trigger ${JSON.stringify(a)})`,
  ).toBe(true)
}

test.describe('Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, '/en/docs/dropdown')
  })

  test('hover opens the menu, it stays open over the menu and closes on leave', async ({
    page,
  }) => {
    const dropdown = demo(page, 'Two Ways to Trigger').locator('.at-dropdown').first()
    const menu = dropdown.locator('.at-dropdown__popover')

    await expect(menu).toBeHidden()
    await dropdown.locator('.at-dropdown__trigger').hover()
    await expect(menu).toBeVisible()
    await expectSide(menu, dropdown.locator('.at-dropdown__trigger'), 'bottom')

    await menu.getByText('Guangzhou').hover()
    await expect(menu).toBeVisible()

    await page.locator('.at-markdown h1').hover()
    await expect(menu).toBeHidden()
  })

  test('click trigger: hover does nothing, click toggles, a click outside closes', async ({
    page,
  }) => {
    const dropdown = demo(page, 'Two Ways to Trigger').locator('.at-dropdown').nth(1)
    const trigger = dropdown.locator('.at-dropdown__trigger')
    const menu = dropdown.locator('.at-dropdown__popover')

    await trigger.hover()
    await page.waitForTimeout(300)
    await expect(menu).toBeHidden()

    await trigger.click()
    await expect(menu).toBeVisible()
    await trigger.click()
    await expect(menu).toBeHidden()

    await trigger.click()
    await expect(menu).toBeVisible()
    await page.locator('.at-markdown h1').click()
    await expect(menu).toBeHidden()
  })

  test('an item click emits the command and closes the menu; a disabled item does not', async ({
    page,
  }) => {
    const dropdown = demo(page, 'Events').locator('.at-dropdown')
    const menu = dropdown.locator('.at-dropdown__popover')

    await dropdown.locator('.at-dropdown__trigger').hover()
    await menu.getByText('Shanghai').click()
    await expect(menu).toBeVisible()
    await expect(page.locator('.at-message')).toHaveCount(0)

    await menu.getByText('Guangzhou').click()
    await expect(menu).toBeHidden()
    await expect(page.locator('.at-message')).toContainText('guangzhou')
  })
})

test.describe('Tooltip', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, '/en/docs/tooltip')
  })

  test('shows on hover above the trigger and hides on leave', async ({ page }) => {
    const tooltip = demo(page, 'Basic').locator('.at-tooltip').first()
    const popper = tooltip.locator('.at-tooltip__popper')

    await expect(popper).toHaveCount(0)
    await tooltip.locator('.at-tooltip__trigger').hover()
    await expect(popper).toHaveText('information')
    await expectSide(popper, tooltip.locator('.at-tooltip__trigger'), 'top')

    await page.locator('.at-markdown h1').hover()
    await expect(popper).toHaveCount(0)
  })

  for (const [label, side] of [
    ['Top Left', 'top'],
    ['Bottom', 'bottom'],
    ['Left Top', 'left'],
    ['Right Bottom', 'right'],
  ]) {
    test(`placement "${label}" puts the popup on the ${side}`, async ({ page }) => {
      const tooltip = demo(page, 'Placement').locator('.at-tooltip', {
        has: page.getByRole('button', { name: label, exact: true }),
      })
      await tooltip.locator('.at-tooltip__trigger').hover()
      const popper = tooltip.locator('.at-tooltip__popper')
      await expect(popper).toHaveText(`${label} Message`)
      await expectSide(popper, tooltip.locator('.at-tooltip__trigger'), side)
    })
  }
})

test.describe('Popover', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page, '/en/docs/popover')
  })

  test('click trigger toggles the popover, a click outside closes it', async ({ page }) => {
    const popover = demo(page, 'Two Ways to Trigger').locator('.at-popover').first()
    const trigger = popover.locator('.at-popover__trigger')
    const popper = popover.locator('.at-popover__popper')

    await trigger.hover()
    await page.waitForTimeout(300)
    await expect(popper).toHaveCount(0)

    await trigger.click()
    await expect(popper).toContainText('Top Placement')
    await expectSide(popper, trigger, 'top')
    await trigger.click()
    await expect(popper).toHaveCount(0)

    await trigger.click()
    await expect(popper).toBeVisible()
    await page.locator('.at-markdown h1').click()
    await expect(popper).toHaveCount(0)
  })

  test('hover trigger shows the title and content, hides on leave', async ({ page }) => {
    const popover = demo(page, 'Two Ways to Trigger').locator('.at-popover').nth(1)
    const popper = popover.locator('.at-popover__popper')

    await popover.locator('.at-popover__trigger').hover()
    await expect(popper.locator('.at-popover__title')).toHaveText('Title')
    await expect(popper.locator('.at-popover__content')).toHaveText('Top Placement')

    await page.locator('.at-markdown h1').hover()
    await expect(popper).toHaveCount(0)
  })

  test('v-model: buttons inside the content close the popover', async ({ page }) => {
    const popover = demo(page, 'Nested Content').locator('.at-popover')
    const popper = popover.locator('.at-popover__popper')

    await popover.getByRole('button', { name: 'Delete' }).click()
    await expect(popper).toContainText('sure to delete it?')
    await popper.getByRole('button', { name: 'Cancel' }).click()
    await expect(popper).toHaveCount(0)

    // opens again after being closed from the parent
    await popover.getByRole('button', { name: 'Delete' }).click()
    await expect(popper).toBeVisible()
    await popper.getByRole('button', { name: 'Sure' }).click()
    await expect(popper).toHaveCount(0)
  })
})
