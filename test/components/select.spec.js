import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtSelect from '../../src/components/select'

const OPTIONS = `
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2" label="Guangzhou"><b>Guangzhou</b> city</at-option>
  <at-option value="3" disabled>Shanghai</at-option>`

let wrapper

async function mountSelect(attrs = '', value = '', options = OPTIONS, data = {}) {
  wrapper = mount(
    {
      data: () => ({ value, ...data }),
      template: `<at-select v-model="value" ${attrs}>${options}</at-select>`,
    },
    { attachTo: document.body },
  )
  await nextTick()
  return wrapper
}

const select = () => wrapper.getComponent(AtSelect)
const dropdown = () => wrapper.find('.at-select__dropdown')
const isOpen = () => dropdown().element.style.display !== 'none'
const options = () => wrapper.findAll('.at-select__option')
const visibleLabels = () =>
  options()
    .filter(o => o.element.style.display !== 'none')
    .map(o => o.text())

async function open() {
  await wrapper.find('.at-select__selection').trigger('click')
}

describe('AtSelect + AtOption', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('renders options, opens on trigger click and shows the selected label', async () => {
    await mountSelect('', '2')

    expect(wrapper.find('.at-select').classes()).toContain('at-select--single')
    expect(options()).toHaveLength(3)
    expect(wrapper.find('.at-select__selected').text()).toBe('Guangzhou')
    expect(options()[1].classes()).toContain('at-select__option--selected')
    expect(isOpen()).toBe(false)

    await open()
    expect(isOpen()).toBe(true)
    expect(wrapper.find('.at-select').classes()).toContain('at-select--visible')
  })

  it('emits update:modelValue and on-change on option click and closes', async () => {
    await mountSelect()
    await open()

    await options()[0].trigger('click')

    expect(select().emitted('update:modelValue')).toEqual([['1']])
    expect(select().emitted('on-change')).toEqual([['1']])
    expect(wrapper.vm.value).toBe('1')
    expect(wrapper.find('.at-select__selected').text()).toBe('Shenzhen')
    expect(isOpen()).toBe(false)
  })

  it('emits value with label when valueWithLabel is set; external change emits nothing', async () => {
    await mountSelect('value-with-label')
    await open()
    await options()[1].trigger('click')

    expect(select().emitted('on-change')).toEqual([[{ value: '2', label: 'Guangzhou' }]])

    wrapper.vm.value = '1'
    await nextTick()
    expect(wrapper.find('.at-select__selected').text()).toBe('Shenzhen')
    expect(select().emitted('on-change')).toHaveLength(1)
  })

  it('accumulates an array in multiple mode, renders tags and removes them', async () => {
    await mountSelect('multiple', [])
    await open()

    await options()[0].trigger('click')
    await options()[1].trigger('click')

    expect(wrapper.vm.value).toEqual(['1', '2'])
    expect(isOpen()).toBe(true)
    expect(wrapper.findAll('.at-tag__text').map(t => t.text())).toEqual(['Shenzhen', 'Guangzhou'])

    await wrapper.findAll('.at-tag__close')[0].trigger('click')

    expect(wrapper.vm.value).toEqual(['2'])
    expect(select().emitted('on-change')).toEqual([[['1']], [['1', '2']], [['2']]])
    expect(wrapper.findAll('.at-tag')).toHaveLength(1)
  })

  it('filters options by query and shows notFound text', async () => {
    await mountSelect('filterable not-found-text="Nothing"')
    const input = wrapper.find('.at-select__input')

    await input.setValue('shen')
    expect(isOpen()).toBe(true)
    expect(visibleLabels()).toEqual(['Shenzhen'])
    expect(wrapper.find('.at-select__not-found').element.style.display).toBe('none')

    await input.setValue('zzz')
    expect(visibleLabels()).toEqual([])
    expect(wrapper.find('.at-select__not-found').element.style.display).toBe('')
    expect(wrapper.find('.at-select__not-found').text()).toBe('Nothing')
  })

  it('clearing a filterable single select also resets the active filter', async () => {
    await mountSelect('filterable clearable not-found-text="Nothing"', '1')
    const input = wrapper.find('.at-select__input')

    await input.setValue('zzz')
    expect(isOpen()).toBe(true)
    expect(visibleLabels()).toEqual([])
    expect(wrapper.find('.at-select__not-found').element.style.display).toBe('')

    await wrapper.find('.at-select__clear').trigger('click')
    expect(wrapper.vm.value).toBe('')
    expect(input.element.value).toBe('')
    expect(visibleLabels()).toHaveLength(options().length)
    expect(wrapper.find('.at-select__not-found').element.style.display).toBe('none')
  })

  it('clears the value with the clear icon and ignores disabled options', async () => {
    await mountSelect('clearable', '1')

    await wrapper.find('.at-select__clear').trigger('click')
    expect(wrapper.vm.value).toBe('')
    expect(select().emitted('on-change')).toEqual([['']])
    expect(wrapper.find('.at-select__placeholder').text()).toBe('Select')

    await open()
    await options()[2].trigger('click')
    expect(wrapper.vm.value).toBe('')
    expect(select().emitted('update:modelValue')).toHaveLength(1)
    expect(isOpen()).toBe(true)
  })

  it('handles keyboard: arrows move focus, Enter selects, Escape closes', async () => {
    await mountSelect()
    await open()

    const key = async k => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
      await nextTick()
    }

    await key('ArrowDown')
    await key('ArrowDown')
    expect(options()[1].classes()).toContain('at-select__option--focus')
    // disabled option is skipped, focus wraps around
    await key('ArrowDown')
    expect(options()[0].classes()).toContain('at-select__option--focus')

    await key('Enter')
    expect(wrapper.vm.value).toBe('1')
    expect(isOpen()).toBe(false)

    await open()
    await key('Escape')
    expect(isOpen()).toBe(false)

    // click outside closes too
    await open()
    document.body.click()
    await nextTick()
    expect(isOpen()).toBe(false)
  })

  it('scrolls the focused option into view in both directions', async () => {
    await mountSelect(
      '',
      '',
      '<at-option v-for="n in 10" :key="n" :value="String(n)">{{ n }}</at-option>',
    )
    await open()

    // happy-dom has no layout: 10 options of 30px in a 90px high dropdown
    const popover = dropdown().element
    let scrollTop = 0
    const rect = (top, height) => ({ top, bottom: top + height, left: 0, right: 0, height })
    popover.getBoundingClientRect = () => rect(0, 90)
    Object.defineProperty(popover, 'clientHeight', { configurable: true, get: () => 90 })
    Object.defineProperty(popover, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: value => {
        scrollTop = value
      },
    })
    options().forEach((option, i) => {
      Object.defineProperty(option.element, 'offsetTop', { configurable: true, get: () => i * 30 })
      Object.defineProperty(option.element, 'offsetHeight', { configurable: true, get: () => 30 })
      Object.defineProperty(option.element, 'offsetParent', {
        configurable: true,
        get: () => popover,
      })
      option.element.getBoundingClientRect = () => rect(i * 30 - scrollTop, 30)
    })

    const key = async k => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
      await nextTick()
    }

    // ArrowUp from nothing focuses the last option: scrolled down to it
    await key('ArrowUp')
    expect(options()[9].classes()).toContain('at-select__option--focus')
    expect(scrollTop).toBe(210)

    // moving up inside the viewport keeps the scroll position
    await key('ArrowUp')
    await key('ArrowUp')
    expect(scrollTop).toBe(210)

    // past the top edge: scrolled up to the focused option
    await key('ArrowUp')
    expect(options()[6].classes()).toContain('at-select__option--focus')
    expect(scrollTop).toBe(180)

    // wrapping from last to first scrolls back to the top
    await key('ArrowDown')
    await key('ArrowDown')
    await key('ArrowDown')
    await key('ArrowDown')
    expect(options()[0].classes()).toContain('at-select__option--focus')
    expect(scrollTop).toBe(0)
  })

  it('registers options added later in DOM order', async () => {
    await mountSelect(
      '',
      'c',
      '<at-option v-for="item in items" :key="item" :value="item">{{ item.toUpperCase() }}</at-option>',
      { items: ['a', 'b'] },
    )
    expect(wrapper.find('.at-select__selected').text()).toBe('')

    wrapper.vm.items.splice(1, 0, 'c')
    await nextTick()
    await nextTick()

    expect(options().map(o => o.text())).toEqual(['A', 'C', 'B'])
    expect(wrapper.find('.at-select__selected').text()).toBe('C')

    await open()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await nextTick()
    expect(wrapper.vm.value).toBe('b')
  })
})
