import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtPopover from '../../src/components/popover'

let wrapper

function mountPopover(options = {}) {
  wrapper = mount(AtPopover, {
    attachTo: document.body,
    slots: { default: '<button class="btn">Open</button>' },
    ...options,
  })
  return wrapper
}

describe('AtPopover', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('opens and closes on trigger click and emits update:modelValue', async () => {
    mountPopover({ props: { content: 'Body' } })

    expect(wrapper.classes()).toContain('at-popover')
    expect(wrapper.find('.at-popover__popper').exists()).toBe(false)

    await wrapper.find('.at-popover__trigger').trigger('click')
    expect(wrapper.find('.at-popover__popper').exists()).toBe(true)

    await wrapper.find('.at-popover__trigger').trigger('click')
    expect(wrapper.find('.at-popover__popper').exists()).toBe(false)

    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
    expect(wrapper.emitted('toggle')).toEqual([[true], [false]])
  })

  it('closes on a click outside', async () => {
    mountPopover({ props: { modelValue: true, content: 'Body' } })
    expect(wrapper.find('.at-popover__popper').exists()).toBe(true)

    await wrapper.find('.at-popover__content').trigger('click')
    expect(wrapper.find('.at-popover__popper').exists()).toBe(true)

    document.body.click()
    await nextTick()

    expect(wrapper.find('.at-popover__popper').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('renders title and content props as HTML', () => {
    mountPopover({ props: { modelValue: true, title: '<b>Title</b>', content: '<i>Body</i>' } })

    expect(wrapper.find('.at-popover__title b').text()).toBe('Title')
    expect(wrapper.find('.at-popover__content i').text()).toBe('Body')
  })

  it('lets the content slot override the content prop', () => {
    mountPopover({
      props: { modelValue: true, content: 'From prop' },
      slots: { default: 'Open', content: '<span class="custom">From slot</span>' },
    })

    expect(wrapper.find('.at-popover__content .custom').text()).toBe('From slot')
    expect(wrapper.find('.at-popover__content').text()).not.toContain('From prop')
  })
})
