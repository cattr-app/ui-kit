// AtInputNumber: buttons, arrow keys, typed values, min/max clamping and decimal steps.
import { test, expect, openPage, demo } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await openPage(page, '/en/docs/inputnumber')
})

test('buttons and arrow keys change the value', async ({ page }) => {
  const number = demo(page, 'Basic').locator('.at-input-number').first()
  const input = number.locator('input')

  await expect(input).toHaveValue('2')
  await number.locator('.at-input-number__up').click()
  await expect(input).toHaveValue('3')
  await number.locator('.at-input-number__down').click()
  await number.locator('.at-input-number__down').click()
  await expect(input).toHaveValue('1')

  await input.focus()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(input).toHaveValue('3')
  await page.keyboard.press('ArrowDown')
  await expect(input).toHaveValue('2')
})

test('min/max: buttons are disabled at the limits, typed values are clamped', async ({ page }) => {
  const number = demo(page, 'Basic').locator('.at-input-number').nth(1)
  const input = number.locator('input')
  const up = number.locator('.at-input-number__up')
  const down = number.locator('.at-input-number__down')

  await expect(input).toHaveValue('0')
  await expect(down).toHaveClass(/at-input-number__down--disabled/)
  await down.click()
  await expect(input).toHaveValue('0')

  await input.fill('42')
  await input.press('Enter')
  await expect(input).toHaveValue('5')
  await expect(up).toHaveClass(/at-input-number__up--disabled/)

  await input.fill('-3')
  await input.blur()
  await expect(input).toHaveValue('0')
})

test('decimal step has no float artifacts', async ({ page }) => {
  const number = demo(page, 'Decimals').locator('.at-input-number')
  const input = number.locator('input')

  await expect(input).toHaveValue('1')
  for (let i = 0; i < 3; i++) await number.locator('.at-input-number__up').click()
  await expect(input).toHaveValue('1.9')
  await number.locator('.at-input-number__down').click()
  await expect(input).toHaveValue('1.6')
})

test('a disabled input number hides the buttons and ignores the arrow keys', async ({ page }) => {
  const number = demo(page, 'Disabled').locator('.at-input-number')
  const input = number.locator('input')

  await expect(input).toBeDisabled()
  await expect(number.locator('.at-input-number__handler')).toBeHidden()
  await input.dispatchEvent('keydown', { key: 'ArrowUp' })
  await expect(input).toHaveValue('0')
})
