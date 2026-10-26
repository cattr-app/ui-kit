import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtPagination from '../../src/components/pagination'
import AtSelect from '../../src/components/select'

// Cross-component links that were migrated in parallel tasks and could not be
// tested inside a single component's worktree.
describe('integration: Table + Pagination', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ name: `row-${i + 1}` }))
  const columns = [{ title: 'Name', key: 'name' }]

  it('renders the pagination footer and switches pages', async () => {
    const wrapper = mount({
      data: () => ({ rows, columns, pages: [] }),
      template: `
        <at-table :data="rows" :columns="columns" pagination :page-size="10"
          @on-page-change="pages.push($event)" />`,
    })
    await nextTick()

    expect(wrapper.find('.at-pagination').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('row-1')

    const pagination = wrapper.getComponent(AtPagination)
    const page2 = pagination.findAll('.at-pagination__item').find(li => li.text() === '2')
    await page2.trigger('click')

    expect(pagination.emitted('page-change')).toEqual([[2]])
    expect(wrapper.vm.pages).toEqual([2])
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('row-11')
  })
})

describe('integration: Pagination + Select (page sizer)', () => {
  it('changes page size through the embedded select', async () => {
    const wrapper = mount({
      data: () => ({ sizes: [] }),
      template: `
        <at-pagination :total="100" :page-size="10" show-sizer
          @pagesize-change="sizes.push($event)" />`,
    })
    await nextTick()

    const select = wrapper.getComponent(AtSelect)
    expect(select.exists()).toBe(true)

    await select.find('.at-select__selection').trigger('click')
    const options = select.findAll('.at-select__option')
    expect(options.length).toBeGreaterThan(1)

    await options[1].trigger('click')
    const pagination = wrapper.getComponent(AtPagination)
    expect(wrapper.vm.sizes).toHaveLength(1)
    expect(pagination.emitted('update:pageSize')).toHaveLength(1)
    expect(pagination.emitted('update:pageSize')[0]).toEqual([wrapper.vm.sizes[0]])
  })
})
