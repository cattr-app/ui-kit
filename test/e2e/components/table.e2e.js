// AtTable: sorting, pagination and row selection on the docs demos.
import { test, expect, openPage, demo } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await openPage(page, '/en/docs/table')
})

/** Text of one column (1-based, selection column included) of the visible body rows. */
const column = (table, n) => table.locator(`.at-table__tbody tr td:nth-child(${n})`)

test('sorting cycles desc → asc → original order; the arrows sort directly', async ({ page }) => {
  const table = demo(page, 'Sort').locator('.at-table')
  const header = table.locator('.at-table__thead th', { hasText: 'Age' })
  const sorter = header.locator('.at-table__column-sorter')
  const ages = column(table, 2)

  await expect(ages).toHaveText(['18', '25', '24', '22'])

  await header.click()
  await expect(ages).toHaveText(['25', '24', '22', '18'])
  await expect(sorter).toHaveClass(/sort-desc/)

  await header.click()
  await expect(ages).toHaveText(['18', '22', '24', '25'])
  await expect(sorter).toHaveClass(/sort-asc/)

  await header.click()
  await expect(ages).toHaveText(['18', '25', '24', '22'])
  await expect(sorter).not.toHaveClass(/sort-(asc|desc)/)

  await sorter.locator('.at-table__column-sorter-down').click()
  await expect(ages).toHaveText(['25', '24', '22', '18'])
  await sorter.locator('.at-table__column-sorter-up').click()
  await expect(ages).toHaveText(['18', '22', '24', '25'])
})

test('pagination switches pages and sorting applies to the whole data set', async ({ page }) => {
  const table = demo(page, 'Pagination').locator('.at-table')
  const pager = table.locator('.at-pagination')
  const names = column(table, 1)
  const ages = column(table, 2)

  await expect(names).toHaveCount(10)
  await expect(names.first()).toHaveText('Stephen Curry')
  await expect(pager.locator('.at-pagination__item')).toHaveText(['1', '2', '3', '4', '5'])

  await pager.locator('.at-pagination__item', { hasText: '2' }).click()
  await expect(pager.locator('.at-pagination__item--active')).toHaveText('2')
  await expect(names.first()).toHaveText('Lebron James')

  await pager.locator('.at-pagination__next').click()
  await expect(pager.locator('.at-pagination__item--active')).toHaveText('3')
  await pager.locator('.at-pagination__prev').click()
  await expect(pager.locator('.at-pagination__item--active')).toHaveText('2')

  // 45 rows, five per age 26 and ten per age 25: sorted globally, not per page
  await table.locator('.at-table__thead th', { hasText: 'Age' }).click()
  await expect(pager.locator('.at-pagination__item--active')).toHaveText('2')
  await expect(ages).toHaveText([...Array(5).fill('25'), ...Array(5).fill('24')])
  await pager.locator('.at-pagination__item', { hasText: '1' }).click()
  await expect(ages).toHaveText([...Array(5).fill('26'), ...Array(5).fill('25')])

  // 45 rows: the last page holds the remaining five
  await pager.locator('.at-pagination__item', { hasText: '5' }).click()
  await expect(names).toHaveCount(5)
  await expect(pager.locator('.at-pagination__next')).toHaveClass(/at-pagination--disabled/)
})

test('row selection: select all, single rows, header state', async ({ page }) => {
  const table = demo(page, 'Multiple Choices').locator('.at-table')
  const all = table.locator('.at-table__thead .at-checkbox')
  const rows = table.locator('.at-table__tbody .at-checkbox')

  await expect(rows).toHaveCount(4)
  await all.click()
  for (const row of await rows.all()) await expect(row).toHaveClass(/at-checkbox--checked/)
  await expect(all).toHaveClass(/at-checkbox--checked/)

  await rows.nth(1).click()
  await expect(rows.nth(1)).not.toHaveClass(/at-checkbox--checked/)
  await expect(all).not.toHaveClass(/at-checkbox--checked/)

  await rows.nth(1).click()
  await expect(all).toHaveClass(/at-checkbox--checked/)

  await all.click()
  for (const row of await rows.all()) await expect(row).not.toHaveClass(/at-checkbox--checked/)
})

test('the selection column keeps the header aligned with the body', async ({ page }) => {
  const table = demo(page, 'Multiple Choices').locator('.at-table')
  const headerCells = table.locator('.at-table__thead th')
  const bodyCells = table.locator('.at-table__tbody tr').first().locator('td')

  await expect(headerCells).toHaveCount(4)
  for (let i = 0; i < 4; i++) {
    const h = await headerCells.nth(i).boundingBox()
    const b = await bodyCells.nth(i).boundingBox()
    expect(Math.abs(h.x - b.x), `column ${i} left edge`).toBeLessThanOrEqual(1)
    expect(Math.abs(h.width - b.width), `column ${i} width`).toBeLessThanOrEqual(1)
  }
})
