import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { mount } from '../helpers/mount.js'
import AtTable from '../../src/components/table'

const columns = [
  { title: 'Name', key: 'name' },
  { title: 'Age', key: 'age' },
]

const data = [
  { name: 'Ann', age: 30 },
  { name: 'Bob', age: 20 },
  { name: 'Cid', age: 40 },
]

const cellTexts = wrapper =>
  wrapper.findAll('tbody tr').map(tr => tr.findAll('td').map(td => td.text()))

describe('AtTable', () => {
  let warn

  afterEach(() => {
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  function mountTable(props) {
    warn = vi.spyOn(console, 'warn')
    return mount(AtTable, { props: { columns, data, ...props }, attachTo: document.body })
  }

  it('renders a row per item and a cell per column', () => {
    const wrapper = mountTable()

    expect(wrapper.classes()).toContain('at-table')
    expect(wrapper.findAll('thead th').map(th => th.text())).toEqual(['Name', 'Age'])
    expect(cellTexts(wrapper)).toEqual([
      ['Ann', '30'],
      ['Bob', '20'],
      ['Cid', '40'],
    ])
    wrapper.unmount()
  })

  it('calls column render with { item, column, index } where index is the row index', () => {
    const render = vi.fn(({ item, index }) => h('b', item.name + index))
    const wrapper = mountTable({
      columns: [...columns, { title: 'Custom', render }],
    })

    expect(wrapper.findAll('tbody td b').map(b => b.text())).toEqual(['Ann0', 'Bob1', 'Cid2'])
    expect(render.mock.calls[0]).toHaveLength(1)
    expect(render.mock.calls[0][0].column.title).toBe('Custom')
    wrapper.unmount()
  })

  it('emits rowClick with the native event on row click', async () => {
    const wrapper = mountTable()

    await wrapper.findAll('tbody tr')[1].trigger('click')

    expect(wrapper.emitted('rowClick')).toHaveLength(1)
    expect(wrapper.emitted('rowClick')[0][0]).toBeInstanceOf(Event)
    wrapper.unmount()
  })

  it('sorts rows by a sortable column and emits on-sort-change', async () => {
    const wrapper = mountTable({
      columns: [columns[0], { ...columns[1], sortType: 'normal' }],
    })

    await wrapper.find('.at-table__column-sorter-up').trigger('click')
    expect(cellTexts(wrapper).map(row => row[1])).toEqual(['20', '30', '40'])

    await wrapper.find('.at-table__column-sorter-down').trigger('click')
    expect(cellTexts(wrapper).map(row => row[1])).toEqual(['40', '30', '20'])

    expect(wrapper.emitted('on-sort-change').map(([e]) => [e.key, e.order])).toEqual([
      ['age', 'asc'],
      ['age', 'desc'],
    ])
    wrapper.unmount()
  })

  describe('sorting', () => {
    const numColumns = [{ title: 'N', key: 'n', sortType: 'normal' }]
    // 0..n-1, rotated so that the original order is not sorted
    const rows = n => Array.from({ length: n }, (_, i) => ({ n: (i + (n >> 1)) % n }))
    const shown = wrapper => cellTexts(wrapper).map(row => Number(row[0]))
    const range = (from, to) =>
      Array.from({ length: Math.abs(to - from) + 1 }, (_, i) => (from > to ? from - i : from + i))
    const goToPage = (wrapper, page) =>
      wrapper
        .findAll('.at-pagination__item')
        .find(li => li.text() === String(page))
        .trigger('click')

    it('sorts the whole data set, not only the current page', async () => {
      const wrapper = mountTable({ columns: numColumns, data: rows(25), pagination: true })

      await wrapper.find('.at-table__column-sorter-down').trigger('click')
      expect(shown(wrapper)).toEqual(range(24, 15))

      await goToPage(wrapper, 2)
      expect(shown(wrapper)).toEqual(range(14, 5))
      wrapper.unmount()
    })

    it('keeps the selected sort when data changes', async () => {
      const wrapper = mountTable({ columns: numColumns, data: rows(5) })

      await wrapper.find('.at-table__column-sorter-down').trigger('click')
      await wrapper.setProps({ data: rows(7) })

      expect(shown(wrapper)).toEqual(range(6, 0))
      expect(wrapper.find('.at-table__column-sorter').classes()).toContain('sort-desc')
      wrapper.unmount()
    })

    it('applies an initial sortType and restores the original order on normal', async () => {
      const wrapper = mountTable({
        columns: [{ title: 'N', key: 'n', sortType: 'asc' }],
        data: [{ n: 2 }, { n: 3 }, { n: 1 }],
      })
      expect(shown(wrapper)).toEqual([1, 2, 3])

      // asc -> normal
      await wrapper.find('thead th').trigger('click')
      expect(shown(wrapper)).toEqual([2, 3, 1])
      expect(wrapper.find('.at-table__column-sorter').classes()).not.toContain('sort-asc')
      expect(wrapper.emitted('on-sort-change')[0][0].order).toBe('normal')
      wrapper.unmount()
    })

    it('shows the sort arrow only on the last sorted column', async () => {
      const wrapper = mountTable({
        columns: [
          { title: 'Name', key: 'name', sortType: 'normal' },
          { title: 'Age', key: 'age', sortType: 'normal' },
        ],
      })
      const sorters = () => wrapper.findAll('.at-table__column-sorter')

      await sorters()[0].find('.at-table__column-sorter-up').trigger('click')
      await sorters()[1].find('.at-table__column-sorter-down').trigger('click')

      expect(sorters()[0].classes()).not.toContain('sort-asc')
      expect(sorters()[1].classes()).toContain('sort-desc')
      expect(cellTexts(wrapper).map(row => row[1])).toEqual(['40', '30', '20'])
      wrapper.unmount()
    })
  })

  it('emits on-selection-change with selected rows from row and select-all checkboxes', async () => {
    const wrapper = mountTable({ optional: true })

    await wrapper.findAll('tbody input[type="checkbox"]')[1].setValue(true)
    expect(wrapper.emitted('on-selection-change')).toEqual([[[data[1]]]])

    await wrapper.find('thead .at-checkbox').trigger('click')
    expect(wrapper.emitted('on-select-all')).toEqual([[data]])
    expect(wrapper.emitted('on-selection-change')[1]).toEqual([data])
    expect(wrapper.find('thead .at-checkbox').classes()).toContain('at-checkbox--checked')
    wrapper.unmount()
  })

  it('applies stripe, border and size classes', () => {
    const wrapper = mountTable({ stripe: true, border: true, size: 'small' })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['at-table--stripe', 'at-table--border', 'at-table--small']),
    )
    wrapper.unmount()
  })

  it('shows the empty text when there is no data', () => {
    const wrapper = mountTable({ data: [] })

    expect(wrapper.find('.at-table__cell--nodata').exists()).toBe(true)
    wrapper.unmount()
  })
})
