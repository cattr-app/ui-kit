import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtTooltip from '../../src/components/tooltip'

describe('AtTooltip', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the trigger slot and the content prop when open', () => {
    const wrapper = mount(AtTooltip, {
      props: { content: 'Hint', modelValue: true },
      slots: { default: 'Hover me' },
      attachTo: document.body,
    })

    expect(wrapper.classes()).toContain('at-tooltip')
    expect(wrapper.find('.at-tooltip__trigger').text()).toBe('Hover me')
    expect(wrapper.find('.at-tooltip__content').text()).toBe('Hint')
    wrapper.unmount()
  })

  it('hover trigger shows on mouseenter and hides 200ms after mouseleave', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AtTooltip, {
      props: { content: 'Hint' },
      slots: { default: 'Hover me' },
      attachTo: document.body,
    })
    const trigger = wrapper.find('.at-tooltip__trigger')

    expect(wrapper.find('.at-tooltip__popper').exists()).toBe(false)
    await trigger.trigger('mouseenter')
    expect(wrapper.find('.at-tooltip__popper').exists()).toBe(true)

    await trigger.trigger('mouseleave')
    vi.advanceTimersByTime(199)
    await nextTick()
    expect(wrapper.vm.show).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(wrapper.vm.show).toBe(false)
    await vi.runAllTimersAsync()
    await nextTick()
    expect(wrapper.find('.at-tooltip__popper').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
    wrapper.unmount()
  })

  it('works with v-model in both directions', async () => {
    const wrapper = mount(
      {
        components: { AtTooltip },
        data: () => ({ open: false }),
        template: '<at-tooltip v-model="open" content="Hint">Hover me</at-tooltip>',
      },
      { attachTo: document.body },
    )
    const tooltip = wrapper.getComponent(AtTooltip)

    await wrapper.find('.at-tooltip__trigger').trigger('mouseenter')
    expect(wrapper.vm.open).toBe(true)

    wrapper.vm.open = false
    await nextTick()
    expect(tooltip.vm.show).toBe(false)
    expect(tooltip.emitted('update:modelValue')).toEqual([[true]])

    wrapper.vm.open = true
    await nextTick()
    expect(wrapper.find('.at-tooltip__popper').exists()).toBe(true)
    wrapper.unmount()
  })

  it('adds the placement class to the popper', () => {
    const wrapper = mount(AtTooltip, {
      props: { content: 'Hint', placement: 'bottom-left', modelValue: true },
      slots: { default: 'Hover me' },
      attachTo: document.body,
    })

    expect(wrapper.find('.at-tooltip__popper').classes()).toContain('at-tooltip--bottom-left')
    wrapper.unmount()
  })
})
