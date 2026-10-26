// AtModal (component mode) and the $Modal dialog service: Escape, the mask, the dialog queue.
import { test, expect, openPage, demo } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await openPage(page, '/en/docs/modal')
})

const openModal = page => page.locator('.at-modal:visible')
const message = page => page.locator('.at-message')

test('Escape closes the modal and emits on-cancel', async ({ page }) => {
  await demo(page, 'Component Mode').getByRole('button', { name: 'Show Customize Modal' }).click()
  await expect(openModal(page).locator('.at-modal__title')).toHaveText('Here is title')

  await page.keyboard.press('Escape')
  await expect(openModal(page)).toHaveCount(0)
  await expect(message(page)).toContainText('Cancel')
})

test('a click on the mask closes the modal, OK emits on-confirm', async ({ page }) => {
  const open = () =>
    demo(page, 'Component Mode').getByRole('button', { name: 'Show Customize Modal' }).click()

  await open()
  await expect(openModal(page)).toBeVisible()
  // top-left corner of the viewport: outside the dialog box, on the mask
  await page.mouse.click(5, 5)
  await expect(openModal(page)).toHaveCount(0)

  await open()
  await openModal(page).getByRole('button', { name: 'OK' }).click()
  await expect(openModal(page)).toHaveCount(0)
  await expect(message(page).last()).toContainText('Confirm')
})

test('show-close=false ignores Escape; mask-closable=false ignores the mask', async ({ page }) => {
  const section = demo(page, 'Disable Closable')

  await section.getByRole('button', { name: 'Disabled Close Button and ESC' }).click()
  await expect(openModal(page)).toBeVisible()
  await expect(openModal(page).locator('.at-modal__close')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(openModal(page)).toBeVisible()
  await page.mouse.click(5, 5)
  await expect(openModal(page)).toHaveCount(0)

  await section.getByRole('button', { name: 'Disabled Mask Close' }).click()
  await expect(openModal(page)).toBeVisible()
  await page.mouse.click(5, 5)
  await page.keyboard.press('Escape')
  await expect(openModal(page)).toBeVisible()
  await openModal(page).getByRole('button', { name: 'Cancel' }).click()
  await expect(openModal(page)).toHaveCount(0)
})

test('$Modal.prompt: the input is focused, Enter confirms with the value', async ({ page }) => {
  await demo(page, 'Prompt').getByRole('button', { name: 'Prompt' }).click()
  const input = openModal(page).locator('.at-modal__input input')
  await expect(input).toBeFocused()

  await page.keyboard.type('me@example.com')
  await page.keyboard.press('Enter')
  await expect(openModal(page)).toHaveCount(0)
  await expect(message(page)).toContainText('input value is me@example.com')
})

test('$Modal.confirm: Escape and the close icon reject with "cancel"', async ({ page }) => {
  const button = demo(page, 'Confirm').getByRole('button', { name: 'Confirm' })

  await button.click()
  await expect(openModal(page)).toContainText('Are you sure')
  await page.keyboard.press('Escape')
  await expect(openModal(page)).toHaveCount(0)
  await expect(message(page)).toContainText("Click 'Cancel' Button")

  await button.click()
  await openModal(page).locator('.at-modal__close').click()
  await expect(openModal(page)).toHaveCount(0)
  await expect(message(page)).toHaveCount(2)
})

test('dialogs are queued: the next one opens after the current one closes', async ({ page }) => {
  // call the service the way an app does: $Modal from the global properties of the docs app
  await page.evaluate(() => {
    const { $Modal } = document.querySelector('#app').__vue_app__.config.globalProperties
    window.__dialogs = []
    $Modal
      .alert({ title: 'First', content: 'first dialog' })
      .then(a => window.__dialogs.push(`first:${a}`))
    $Modal.confirm({ title: 'Second', content: 'second dialog' }).then(
      a => window.__dialogs.push(`second:${a}`),
      a => window.__dialogs.push(`second:${a}`),
    )
    $Modal
      .info({ title: 'Third', content: 'third dialog' })
      .then(a => window.__dialogs.push(`third:${a}`))
  })

  await expect(openModal(page)).toHaveCount(1)
  await expect(openModal(page).locator('.at-modal__title')).toHaveText('First')
  await openModal(page).getByRole('button', { name: 'OK' }).click()

  await expect(openModal(page).locator('.at-modal__title')).toHaveText('Second')
  await expect(openModal(page)).toHaveCount(1)
  await page.keyboard.press('Escape')

  // a status dialog closes only with OK
  await expect(openModal(page).locator('.at-modal__title')).toHaveText('Third')
  await page.mouse.click(5, 5)
  await page.keyboard.press('Escape')
  await expect(openModal(page)).toBeVisible()
  await openModal(page).getByRole('button', { name: 'OK' }).click()
  await expect(openModal(page)).toHaveCount(0)

  expect(await page.evaluate(() => window.__dialogs)).toEqual([
    'first:confirm',
    'second:cancel',
    'third:confirm',
  ])
})
