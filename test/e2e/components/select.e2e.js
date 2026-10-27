import { test, expect, openPage, demo } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await openPage(page, '/en/docs/select')
})

function parts(select) {
  return {
    trigger: select.locator('.at-select__selection'),
    dropdown: select.locator('.at-select__dropdown'),
    option: name => select.locator('.at-select__option', { hasText: name }),
  }
}

test('keyboard: arrows move the focus, Enter selects, Escape closes', async ({ page }) => {
  const select = demo(page, 'Basic').locator('.at-select').first()
  const { trigger, dropdown, option } = parts(select)

  await trigger.click()
  await expect(dropdown).toBeVisible()

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(option('Guangzhou')).toHaveClass(/at-select__option--focus/)
  // wraps around from the first option to the last one
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(option('chengdu')).toHaveClass(/at-select__option--focus/)

  await page.keyboard.press('Enter')
  await expect(dropdown).toBeHidden()
  await expect(select.locator('.at-select__selected')).toHaveText('chengdu')

  await trigger.click()
  await expect(dropdown).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Escape')
  await expect(dropdown).toBeHidden()
  await expect(select.locator('.at-select__selected')).toHaveText('chengdu')
})

test('a click outside closes the dropdown without changing the value', async ({ page }) => {
  const select = demo(page, 'Basic').locator('.at-select').nth(1)
  const { trigger, dropdown } = parts(select)

  await expect(select.locator('.at-select__selected')).toHaveText('Guangzhou')
  await trigger.click()
  await expect(dropdown).toBeVisible()

  await page.locator('.at-markdown h1').click()
  await expect(dropdown).toBeHidden()
  await expect(select.locator('.at-select__selected')).toHaveText('Guangzhou')
})

test('a disabled select does not open', async ({ page }) => {
  const select = demo(page, 'Basic').locator('.at-select--disabled')
  await select.locator('.at-select__selection').click({ force: true })
  await expect(select.locator('.at-select__dropdown')).toBeHidden()
})

test('option groups: a disabled option cannot be picked', async ({ page }) => {
  const select = demo(page, 'Option Group').locator('.at-select')
  const { trigger, dropdown, option } = parts(select)

  await trigger.click()
  await option('chengdu').click()
  await expect(dropdown).toBeVisible()
  await expect(select.locator('.at-select__selection')).not.toContainText('chengdu')
  await option('kunming').click()
  await expect(dropdown).toBeHidden()
  await expect(select.locator('.at-select__selected')).toHaveText('kunming')
})

test('clearable: the clear icon resets the value', async ({ page }) => {
  const select = demo(page, 'Clearable').locator('.at-select')
  const { trigger, option } = parts(select)

  await trigger.click()
  await option('Beijing').click()
  await expect(select.locator('.at-select__selected')).toHaveText('Beijing')

  await select.hover()
  await select.locator('.at-select__clear').click()
  await expect(select.locator('.at-select__placeholder')).toBeVisible()
})

test('filterable: typing filters the options, Enter picks the first match', async ({ page }) => {
  const select = demo(page, 'Searchable').locator('.at-select')
  const { dropdown, option } = parts(select)
  const input = select.locator('.at-select__input')

  await input.click()
  await input.pressSequentially('zhou')
  await expect(dropdown).toBeVisible()
  await expect(select.locator('.at-select__option:visible')).toHaveText(['Guangzhou', 'hangzhou'])

  await page.keyboard.press('Enter')
  await expect(dropdown).toBeHidden()
  await expect(input).toHaveValue('Guangzhou')

  await input.fill('')
  await input.pressSequentially('nothing')
  await expect(select.locator('.at-select__not-found')).toHaveText('No matching data')
  await expect(option('Shenzhen')).toBeHidden()
})

test('multiple: options toggle tags, the dropdown stays open, a tag can be removed', async ({
  page,
}) => {
  const select = demo(page, 'Multiple').locator('.at-select')
  const { trigger, dropdown, option } = parts(select)
  const tags = select.locator('.at-tag__text')

  await trigger.click()
  await option('Shenzhen').click()
  await option('Shanghai').click()
  await expect(dropdown).toBeVisible()
  await expect(tags).toHaveText(['Shenzhen', 'Shanghai'])

  // clicking a selected option again deselects it
  await option('Shenzhen').click()
  await expect(tags).toHaveText(['Shanghai'])

  await page.locator('.at-markdown h1').click()
  await expect(dropdown).toBeHidden()

  await select.locator('.at-tag', { hasText: 'Shanghai' }).locator('.at-tag__close').click()
  await expect(tags).toHaveCount(0)
  await expect(dropdown).toBeHidden()
})

// The demo server answers in 400 ms: too short to poll for the loading state reliably on a busy
// machine, so the select records every loading text it shows (empty list and the row under it).
async function recordLoading(select) {
  await select.evaluate(el => {
    el.seenLoading = []
    const record = () => {
      const empty = el.querySelector('.at-select__not-found')
      const row = el.querySelector('.at-select__loading')
      if (empty && empty.style.display !== 'none') el.seenLoading.push(empty.textContent.trim())
      if (row) el.seenLoading.push(row.textContent.trim())
    }
    new MutationObserver(record).observe(el, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    })
  })
  return () => select.evaluate(el => el.seenLoading)
}

test('remote: search, loading, load more on scroll, pick, reopen', async ({ page }) => {
  const select = demo(page, 'Remote').locator('.at-select').first()
  const { dropdown, option } = parts(select)
  const input = select.locator('.at-select__input')
  const options = select.locator('.at-select__option')
  const footer = select.locator('.at-select__footer')

  // the selected task is not loaded: its label comes from fallback-label
  await expect(input).toHaveValue('Task 42')
  const seenLoading = await recordLoading(select)

  await input.click()
  await expect(dropdown).toBeVisible()
  await expect(options).toHaveCount(15)
  expect(await seenLoading()).toContain('Loading tasks…')
  await expect(footer).toHaveText('15 of 95 loaded')

  // typing replaces the results after the debounce and the server delay
  await input.fill('')
  await input.pressSequentially('1')
  await expect(footer).toHaveText('15 of 19 loaded')
  await expect(options.first()).toHaveText('Task 1')
  await expect(options.nth(1)).toHaveText('Task 10')

  // scrolling to the end loads the next page
  await dropdown.hover()
  await page.mouse.wheel(0, 2000)
  await expect(footer).toHaveText('19 of 19 loaded')
  expect(await seenLoading()).toContain('Loading')
  await expect(options).toHaveCount(19)

  await option(/^Task 91$/).click()
  await expect(dropdown).toBeHidden()
  await expect(input).toHaveValue('Task 91')

  // reopening searches again from the start; the picked task is not in the first page
  await select.locator('.at-select__selection').click()
  await expect(dropdown).toBeVisible()
  await expect(footer).toHaveText('15 of 95 loaded')
  await expect(option(/^Task 91$/)).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(dropdown).toBeHidden()
  await expect(input).toHaveValue('Task 91')
})

test('remote multiple: picks from two searches keep their tags', async ({ page }) => {
  const select = demo(page, 'Remote Multiple').locator('.at-select')
  const { dropdown, option } = parts(select)
  const input = select.locator('.at-select__input')
  const tags = select.locator('.at-tag__text')

  await input.click()
  await input.pressSequentially('Task 7')
  await expect(select.locator('.at-select__option')).toHaveCount(11)
  await option(/^Task 7$/).click()
  await option(/^Task 77$/).click()
  await expect(dropdown).toBeVisible()
  await expect(input).toHaveValue('Task 7')

  await input.fill('')
  await input.pressSequentially('Task 3')
  await expect(option(/^Task 7$/)).toHaveCount(0)
  await option(/^Task 35$/).click()
  await expect(tags).toHaveText(['Task 7', 'Task 77', 'Task 35'])

  await page.locator('.at-markdown h1').click()
  await expect(dropdown).toBeHidden()
  await expect(tags).toHaveText(['Task 7', 'Task 77', 'Task 35'])
})
