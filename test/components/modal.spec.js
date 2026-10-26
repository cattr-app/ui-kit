import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtModal from '../../src/components/modal'
import { Dialog } from '../../src/index.js'

const mounted = []
const mountModal = (options = {}) => {
  const wrapper = mount(AtModal, { attachTo: document.body, ...options })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('AtModal', () => {
  it('is shown by modelValue', async () => {
    const wrapper = mountModal({ props: { modelValue: false, title: 'Title' } })
    const modal = wrapper.find('.at-modal')
    expect(modal.isVisible()).toBe(false)

    await wrapper.setProps({ modelValue: true })

    expect(modal.isVisible()).toBe(true)
    expect(wrapper.find('.at-modal__title').text()).toBe('Title')
  })

  it('emits update:modelValue(false) on a click outside the dialog when maskClosable', async () => {
    const wrapper = mountModal({ props: { modelValue: true } })
    await wrapper.find('.at-modal__wrapper').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('on-cancel')).toHaveLength(1)

    const locked = mountModal({ props: { modelValue: true, maskClosable: false } })
    await locked.find('.at-modal__wrapper').trigger('click')
    expect(locked.emitted('update:modelValue')).toBeUndefined()
  })

  it('closes on Escape and stops listening after unmount', async () => {
    const wrapper = mountModal({ props: { modelValue: true } })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])

    const onUpdate = vi.fn()
    const other = mountModal({ props: { modelValue: true, 'onUpdate:modelValue': onUpdate } })
    other.unmount()
    mounted.splice(mounted.indexOf(other), 1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('footer buttons emit on-confirm / on-cancel', async () => {
    const wrapper = mountModal({ props: { modelValue: true } })
    const [cancel, confirm] = wrapper.findAll('.at-modal__footer .at-btn')

    await confirm.trigger('click')
    expect(wrapper.emitted('on-confirm')).toHaveLength(1)
    expect(wrapper.emitted('on-cancel')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])

    // as v-model would: the parent applies false, then opens again
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await cancel.trigger('click')
    expect(wrapper.emitted('on-cancel')).toHaveLength(1)
  })

  it('renders header and footer slots', () => {
    const wrapper = mountModal({
      props: { modelValue: true },
      slots: {
        header: '<span class="custom-header">Head</span>',
        footer: '<button class="custom-footer">Ok</button>',
        default: 'Body',
      },
    })
    expect(wrapper.find('.at-modal__header .custom-header').exists()).toBe(true)
    expect(wrapper.find('.at-modal__footer .custom-footer').exists()).toBe(true)
    expect(wrapper.find('.at-modal__footer .at-btn').exists()).toBe(false)
    expect(wrapper.find('.at-modal__body').text()).toBe('Body')
  })

  it('focuses the input when mounted already open', async () => {
    const wrapper = mountModal({ props: { modelValue: true, showInput: true } })
    await nextTick()

    expect(document.activeElement).toBe(wrapper.find('.at-modal__input input').element)
  })

  it('Escape closes only the topmost open modal', async () => {
    vi.useFakeTimers()
    try {
      const outer = mountModal({ props: { modelValue: true } })
      const inner = Dialog.confirm('inner')
      let innerResult
      inner.catch(action => {
        innerResult = action
      })
      await nextTick()
      await vi.runAllTimersAsync()
      expect(document.body.querySelectorAll('.at-modal')).toHaveLength(2)

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await vi.runAllTimersAsync()
      expect(innerResult).toBe('cancel')
      expect(outer.emitted('on-cancel')).toBeUndefined()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(outer.emitted('on-cancel')).toHaveLength(1)
    } finally {
      Dialog.close()
      await vi.runAllTimersAsync()
      vi.useRealTimers()
    }
  })
})
