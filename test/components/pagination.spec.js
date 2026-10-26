import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtPagination from '../../src/components/pagination'

const pageNumbers = wrapper => wrapper.findAll('.at-pagination__item').map(li => li.text())

describe('AtPagination', () => {
  it('renders pages from total and pageSize', async () => {
    const wrapper = mount(AtPagination, { props: { total: 50, pageSize: 10 } })

    expect(wrapper.classes()).toContain('at-pagination')
    expect(pageNumbers(wrapper)).toEqual(['1', '2', '3', '4', '5'])
    expect(wrapper.find('.at-pagination__item--active').text()).toBe('1')

    await wrapper.setProps({ total: 0 })
    expect(pageNumbers(wrapper)).toEqual(['1'])

    await wrapper.setProps({ total: 200, pageSize: 20, current: 5 })
    expect(wrapper.find('.at-pagination__item--active').text()).toBe('5')
    expect(pageNumbers(wrapper)).toEqual(['1', '', '3', '4', '5', '6', '7', '', '10'])
  })

  it('emits page-change and update:current on page click, so v-model:current works', async () => {
    const wrapper = mount({
      data: () => ({ page: 1 }),
      template: '<at-pagination v-model:current="page" :total="50" />',
    })
    const pagination = wrapper.getComponent(AtPagination)

    await wrapper.findAll('.at-pagination__item')[2].trigger('click')

    expect(pagination.emitted('page-change')).toEqual([[3]])
    expect(pagination.emitted('update:current')).toEqual([[3]])
    expect(wrapper.vm.page).toBe(3)
    expect(wrapper.find('.at-pagination__item--active').text()).toBe('3')

    await wrapper.findAll('.at-pagination__item')[2].trigger('click')
    expect(pagination.emitted('page-change')).toHaveLength(1)

    wrapper.vm.page = 5
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.at-pagination__item--active').text()).toBe('5')
  })

  it('disables prev/next on the boundaries', async () => {
    const wrapper = mount(AtPagination, { props: { total: 20, pageSize: 10 } })
    const prev = wrapper.find('.at-pagination__prev')
    const next = wrapper.find('.at-pagination__next')

    expect(prev.classes()).toContain('at-pagination--disabled')
    await prev.trigger('click')
    expect(wrapper.emitted('page-change')).toBeUndefined()

    await next.trigger('click')
    expect(wrapper.emitted('page-change')).toEqual([[2]])
    expect(next.classes()).toContain('at-pagination--disabled')
    expect(prev.classes()).not.toContain('at-pagination--disabled')

    await next.trigger('click')
    expect(wrapper.emitted('page-change')).toEqual([[2]])
  })

  it('clamps the quickjump page to [1, totalPage] on Enter', async () => {
    const wrapper = mount(AtPagination, {
      props: { total: 50, current: 3, showQuickjump: true },
    })
    const input = wrapper.find('.at-pagination__quickjump input')

    await input.setValue('999')
    await input.trigger('keyup', { key: 'Enter' })
    expect(wrapper.emitted('page-change')).toEqual([[5]])
    expect(input.element.value).toBe('5')

    // already on the last page: no event, but the field is still clamped
    await input.setValue('42')
    await input.trigger('keyup', { key: 'Enter' })
    expect(wrapper.emitted('page-change')).toEqual([[5]])
    expect(input.element.value).toBe('5')

    await input.setValue('0')
    await input.trigger('keyup', { key: 'Enter' })
    expect(wrapper.emitted('page-change')).toEqual([[5], [1]])
    expect(wrapper.emitted('update:current')).toEqual([[5], [1]])
    expect(input.element.value).toBe('1')

    const letter = new KeyboardEvent('keydown', { key: 'a', cancelable: true })
    input.element.dispatchEvent(letter)
    expect(letter.defaultPrevented).toBe(true)
    const digit = new KeyboardEvent('keydown', { key: '7', cancelable: true })
    input.element.dispatchEvent(digit)
    expect(digit.defaultPrevented).toBe(false)
  })

  it('simple mode: size class, Enter clamp and arrow keys', async () => {
    const wrapper = mount(AtPagination, {
      props: { total: 30, simple: true, size: 'small' },
      attrs: { class: 'custom' },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'at-pagination',
        'at-pagination--simple',
        'at-pagination--small',
        'custom',
      ]),
    )
    expect(wrapper.find('.at-pagination__paging-total').text()).toBe('3')

    const input = wrapper.find('.at-pagination__simple-paging input')
    input.element.value = '100'
    await input.trigger('keyup', { key: 'Enter' })
    expect(wrapper.emitted('page-change')).toEqual([[3]])
    expect(input.element.value).toBe('3')

    await input.trigger('keyup', { key: 'ArrowDown' })
    expect(wrapper.emitted('page-change')).toEqual([[3], [2]])
    await input.trigger('keyup', { key: 'ArrowUp' })
    expect(wrapper.emitted('page-change')).toEqual([[3], [2], [3]])
    expect(input.element.value).toBe('3')
  })

  it('moves to the last page when total or pageSize shrink below the current page', async () => {
    const wrapper = mount({
      data: () => ({ page: 5, total: 50, size: 10 }),
      template: '<at-pagination v-model:current="page" :total="total" :page-size="size" />',
    })
    const pagination = wrapper.getComponent(AtPagination)

    wrapper.vm.total = 30
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.page).toBe(3)
    expect(pagination.emitted('page-change')).toEqual([[3]])
    expect(wrapper.find('.at-pagination__item--active').text()).toBe('3')
    expect(wrapper.find('.at-pagination__next').classes()).toContain('at-pagination--disabled')

    wrapper.vm.size = 20
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.page).toBe(2)
    expect(pagination.emitted('update:current')).toEqual([[3], [2]])

    // growing does not move the page
    wrapper.vm.total = 500
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.page).toBe(2)
    expect(pagination.emitted('page-change')).toEqual([[3], [2]])
  })

  it('quickjump keydown blocks only printable non-digit characters', () => {
    const wrapper = mount(AtPagination, { props: { total: 50, showQuickjump: true } })
    const input = wrapper.find('.at-pagination__quickjump input').element
    const prevented = init => {
      const evt = new KeyboardEvent('keydown', { cancelable: true, ...init })
      input.dispatchEvent(evt)
      return evt.defaultPrevented
    }

    expect(['a', ' ', '-', '.'].map(key => prevented({ key }))).toEqual([true, true, true, true])
    expect(
      ['1', 'Tab', 'Delete', 'Backspace', 'Home', 'End', 'ArrowLeft', 'Enter'].map(key =>
        prevented({ key }),
      ),
    ).toEqual([false, false, false, false, false, false, false, false])
    expect(prevented({ key: 'a', ctrlKey: true })).toBe(false)
    expect(prevented({ key: 'c', ctrlKey: true })).toBe(false)
    expect(prevented({ key: 'v', metaKey: true })).toBe(false)
  })
})
