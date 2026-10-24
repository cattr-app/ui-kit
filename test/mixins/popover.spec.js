import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import PopoverMixin from '../../src/mixins/popover.js'

const Host = {
  name: 'PopoverHost',
  mixins: [PopoverMixin],
  template: `
    <div>
      <span ref="trigger" class="trigger">trigger</span>
      <div v-show="show" ref="popover" class="popover">popover</div>
    </div>
  `,
}

function mountHost(props) {
  return mount(Host, { props, attachTo: document.body })
}

describe('popover mixin', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('declares modelValue and its emits', () => {
    expect(PopoverMixin.props.modelValue).toBeDefined()
    expect(PopoverMixin.props.value).toBeUndefined()
    expect(PopoverMixin.emits).toEqual(['update:modelValue', 'toggle'])
  })

  it('click trigger toggles show and emits update:modelValue/toggle', async () => {
    const wrapper = mountHost({ trigger: 'click' })
    const trigger = wrapper.find('.trigger')

    await trigger.trigger('click')
    expect(wrapper.vm.show).toBe(true)
    expect(wrapper.emitted('toggle')).toEqual([[true]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])

    await trigger.trigger('click')
    expect(wrapper.vm.show).toBe(false)
    expect(wrapper.emitted('toggle')).toEqual([[true], [false]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
    wrapper.unmount()
  })

  it('hover shows on mouseenter and hides 200ms after mouseleave', async () => {
    vi.useFakeTimers()
    const wrapper = mountHost({ trigger: 'hover' })
    const trigger = wrapper.find('.trigger')

    await trigger.trigger('mouseenter')
    expect(wrapper.vm.show).toBe(true)

    await trigger.trigger('mouseleave')
    vi.advanceTimersByTime(199)
    expect(wrapper.vm.show).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(wrapper.vm.show).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
    wrapper.unmount()
  })

  it('mouseenter during the hide delay keeps the popover open', async () => {
    vi.useFakeTimers()
    const wrapper = mountHost({ trigger: 'hover' })
    const trigger = wrapper.find('.trigger')

    await trigger.trigger('mouseenter')
    await trigger.trigger('mouseleave')
    vi.advanceTimersByTime(100)
    await trigger.trigger('mouseenter')
    vi.advanceTimersByTime(500)

    expect(wrapper.vm.show).toBe(true)
    wrapper.unmount()
  })

  it('focus trigger shows on focus and hides on blur', async () => {
    const wrapper = mountHost({ trigger: 'focus' })
    const trigger = wrapper.find('.trigger')

    await trigger.trigger('focus')
    expect(wrapper.vm.show).toBe(true)
    await trigger.trigger('blur')
    expect(wrapper.vm.show).toBe(false)
    wrapper.unmount()
  })

  it('initialises show from modelValue and follows it', async () => {
    const wrapper = mountHost({ trigger: 'click', modelValue: true })
    expect(wrapper.vm.show).toBe(true)

    await wrapper.setProps({ modelValue: false })
    expect(wrapper.vm.show).toBe(false)
    // a change coming from the parent is not echoed back
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.vm.show).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('works with v-model in both directions', async () => {
    const wrapper = mount(
      {
        components: { Host },
        data: () => ({ open: false }),
        template: '<host v-model="open" trigger="click" />',
      },
      { attachTo: document.body },
    )
    const host = wrapper.findComponent(Host)

    await wrapper.find('.trigger').trigger('click')
    expect(wrapper.vm.open).toBe(true)

    wrapper.vm.open = false
    await nextTick()
    expect(host.vm.show).toBe(false)
    expect(host.emitted('update:modelValue')).toEqual([[true]])

    await wrapper.find('.trigger').trigger('click')
    expect(wrapper.vm.open).toBe(true)
    wrapper.unmount()
  })

  it('removes trigger listeners on unmount', async () => {
    const wrapper = mountHost({ trigger: 'click' })
    const triggerEl = wrapper.find('.trigger').element
    const vm = wrapper.vm
    const toggle = vi.spyOn(vm, 'toggle')

    wrapper.unmount()
    triggerEl.click()
    await nextTick()

    expect(toggle).not.toHaveBeenCalled()
    expect(vm.show).toBe(false)
  })

  it('keeps listeners after the hide transition (doDestory)', async () => {
    const wrapper = mountHost({ trigger: 'click' })
    const trigger = wrapper.find('.trigger')

    await trigger.trigger('click')
    await trigger.trigger('click')
    wrapper.vm.doDestory()
    await trigger.trigger('click')

    expect(wrapper.vm.show).toBe(true)
    wrapper.unmount()
  })
})
