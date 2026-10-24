import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtAlert from '../../src/components/alert'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AtAlert', () => {
  it('renders the root class, type modifier and message', () => {
    const wrapper = mount(AtAlert, { props: { message: 'Saved', type: 'success' } })

    expect(wrapper.find('.at-alert').exists()).toBe(true)
    expect(wrapper.find('.at-alert').classes()).toContain('at-alert--success')
    expect(wrapper.find('.at-alert__message').text()).toBe('Saved')
    expect(wrapper.find('.at-alert__description').exists()).toBe(false)
  })

  it('renders description and the type icon when showIcon is set', () => {
    const wrapper = mount(AtAlert, {
      props: { message: 'Oops', description: 'Details', type: 'error', showIcon: true },
    })

    expect(wrapper.find('.at-alert').classes()).toContain('at-alert--with-description')
    expect(wrapper.find('.at-alert__description').text()).toBe('Details')
    expect(wrapper.find('.at-alert__icon').classes()).toContain('icon-x-circle')
  })

  it('emits on-close and hides itself when the close icon is clicked', async () => {
    const wrapper = mount(AtAlert, { props: { message: 'Bye', closable: true } })

    await wrapper.find('.at-alert__close').trigger('click')
    expect(wrapper.emitted('on-close')).toEqual([[]])

    await vi.runAllTimersAsync()
    await nextTick()
    expect(wrapper.find('.at-alert').element.style.display).toBe('none')
  })

  it('shows the custom closeText instead of the close icon', () => {
    const wrapper = mount(AtAlert, { props: { message: 'Hi', closeText: 'Dismiss' } })
    const close = wrapper.find('.at-alert__close')

    expect(close.classes()).toContain('at-alert__close--custom')
    expect(close.text()).toBe('Dismiss')
  })
})
