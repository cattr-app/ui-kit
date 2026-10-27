// AtTabs: switching panes, disabled tabs, closing/adding tabs and nav scrolling (layout-based).
import { test, expect, openPage, demo } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await openPage(page, '/en/docs/tabs')
})

const nav = (tabs, label) =>
  tabs.locator('.at-tabs-nav__item', { hasText: new RegExp(`^\\s*${label}\\s*$`) })

test('a click switches the active tab and slides its pane into view', async ({ page }) => {
  const tabs = demo(page, 'Basic').locator('.at-tabs')

  await expect(nav(tabs, 'Tab1')).toHaveClass(/at-tabs-nav__item--active/)
  await expect(tabs.getByText('Content of Tab Pane 1', { exact: true })).toBeInViewport()
  await expect(tabs.getByText('Content of Tab Pane 3', { exact: true })).not.toBeInViewport()

  await nav(tabs, 'Tab3').click()
  await expect(nav(tabs, 'Tab3')).toHaveClass(/at-tabs-nav__item--active/)
  await expect(nav(tabs, 'Tab1')).not.toHaveClass(/at-tabs-nav__item--active/)
  await expect(tabs.getByText('Content of Tab Pane 3', { exact: true })).toBeInViewport()
  await expect(tabs.getByText('Content of Tab Pane 1', { exact: true })).not.toBeInViewport()
})

test('a disabled tab cannot be activated', async ({ page }) => {
  const tabs = demo(page, 'Disabled').locator('.at-tabs')

  await nav(tabs, 'Tab3').click()
  await expect(nav(tabs, 'Tab3')).not.toHaveClass(/at-tabs-nav__item--active/)
  await expect(nav(tabs, 'Tab1')).toHaveClass(/at-tabs-nav__item--active/)
})

test('closable tabs: close and add; the nav scrolls when tabs overflow', async ({ page }) => {
  const tabs = demo(page, 'Add & close tab').locator('.at-tabs')
  const items = tabs.locator('.at-tabs-nav__item')

  await expect(items).toHaveCount(6)
  await expect(nav(tabs, 'Tab6')).toHaveClass(/at-tabs-nav__item--active/)
  // the first tab is not closable
  await expect(nav(tabs, 'Tab1').locator('.at-tabs-nav__close')).toHaveCount(0)

  await nav(tabs, 'Tab3').locator('.at-tabs-nav__close').click()
  await expect(items).toHaveText(['Tab1', 'Tab2', 'Tab4', 'Tab5', 'Tab6'])

  const add = tabs.getByRole('button', { name: 'Add' })
  const next = tabs.locator('.at-tabs__next')
  const prev = tabs.locator('.at-tabs__prev')
  for (let i = 0; i < 20 && !(await next.isVisible()); i++) await add.click()
  await expect(next).toBeVisible()
  await expect(prev).toHaveClass(/at-tabs__prev--disabled/)

  const lastTab = items.last()
  await expect(lastTab).not.toBeInViewport({ ratio: 1 })
  await next.click()
  await expect(prev).not.toHaveClass(/at-tabs__prev--disabled/)
  await prev.click()
  await expect(prev).toHaveClass(/at-tabs__prev--disabled/)
  await expect(nav(tabs, 'Tab1')).toBeInViewport({ ratio: 1 })
})
