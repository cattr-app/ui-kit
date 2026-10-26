import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtSwitch from '../../src/components/switch'

describe('AtSwitch', () => {
  it('renders the checked class from modelValue', () => {
    const wrapper = mount(AtSwitch, { props: { modelValue: true } })

    expect(wrapper.classes()).toContain('at-switch')
    expect(wrapper.classes()).toContain('at-switch--checked')
  })

  it('emits update:modelValue with the inverted value on click', async () => {
    const wrapper = mount(AtSwitch, { props: { modelValue: false } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
    expect(wrapper.classes()).toContain('at-switch--checked')
  })

  it('syncs the checked state when modelValue changes', async () => {
    const wrapper = mount(AtSwitch, { props: { modelValue: false } })

    await wrapper.setProps({ modelValue: true })

    expect(wrapper.classes()).toContain('at-switch--checked')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(AtSwitch, { props: { modelValue: false, disabled: true } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('at-switch--checked')
  })
})
