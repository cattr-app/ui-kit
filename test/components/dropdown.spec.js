import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtDropdown from '../../src/components/dropdown'

let wrapper

const menu = `
  <at-dropdown-menu>
    <at-dropdown-item name="edit">Edit</at-dropdown-item>
    <at-dropdown-item name="remove" disabled>Remove</at-dropdown-item>
  </at-dropdown-menu>
`

function mountDropdown(props = {}) {
  wrapper = mount(AtDropdown, {
    attachTo: document.body,
    props: { trigger: 'click', ...props },
    slots: { default: '<button class="btn">Menu</button>', menu },
  })
  return wrapper
}

const popover = () => wrapper.find('.at-dropdown__popover')
const items = () => wrapper.findAll('.at-dropdown-menu__item')

describe('AtDropdown', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('mounts without errors and renders the menu hidden', () => {
    mountDropdown()

    expect(wrapper.classes()).toContain('at-dropdown')
    expect(wrapper.find('.at-dropdown__trigger .btn').exists()).toBe(true)
    expect(items()).toHaveLength(2)
    expect(items()[1].classes()).toContain('at-dropdown-menu__item--disabled')
    expect(popover().isVisible()).toBe(false)
  })

  it('opens the menu on trigger click and emits update:modelValue', async () => {
    mountDropdown()

    await wrapper.find('.btn').trigger('click')

    expect(popover().isVisible()).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('emits on-dropdown-command with the item name and closes', async () => {
    mountDropdown({ modelValue: true })
    expect(popover().isVisible()).toBe(true)

    await items()[0].trigger('click')

    expect(wrapper.emitted('on-dropdown-command')).toEqual([['edit']])
    expect(popover().isVisible()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('ignores clicks on a disabled item', async () => {
    mountDropdown({ modelValue: true })

    await items()[1].trigger('click')

    expect(wrapper.emitted('on-dropdown-command')).toBeUndefined()
    expect(popover().isVisible()).toBe(true)
  })

  it('closes on a click outside', async () => {
    mountDropdown({ modelValue: true })

    document.body.click()
    await nextTick()

    expect(popover().isVisible()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
