import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtInput from '../../src/components/input'

describe('AtInput', () => {
  it('renders the value from modelValue and follows its updates', async () => {
    const wrapper = mount(AtInput, { props: { modelValue: 'hello' } })

    expect(wrapper.classes()).toContain('at-input')
    expect(wrapper.find('input').element.value).toBe('hello')

    await wrapper.setProps({ modelValue: 'world' })
    expect(wrapper.find('input').element.value).toBe('world')
  })

  it('emits update:modelValue and change on input', async () => {
    const wrapper = mount({
      data: () => ({ value: '' }),
      template: '<at-input v-model="value" />',
    })
    const input = wrapper.getComponent(AtInput)

    await wrapper.find('input').setValue('abc')

    expect(input.emitted('update:modelValue')).toEqual([['abc']])
    expect(input.emitted('change')).toEqual([['abc']])
    expect(wrapper.vm.value).toBe('abc')
  })

  it('forwards consumer listeners and attributes to the native input', async () => {
    const wrapper = mount({
      data: () => ({ entered: 0 }),
      template: '<at-input autocomplete="off" @keyup.enter="entered++" />',
    })
    const input = wrapper.find('input')

    expect(input.attributes('autocomplete')).toBe('off')
    expect(wrapper.find('.at-input').attributes('autocomplete')).toBeUndefined()

    await input.trigger('keyup', { key: 'Enter' })
    await input.trigger('keyup', { key: 'a' })

    expect(wrapper.vm.entered).toBe(1)
  })

  it('keeps consumer class and style on the .at-input wrapper', () => {
    const wrapper = mount({
      template: '<at-input class="custom" style="width: 100px" size="small" />',
    })
    const root = wrapper.find('.at-input')

    expect(root.classes()).toEqual(
      expect.arrayContaining(['at-input', 'at-input--small', 'custom']),
    )
    expect(root.element.style.width).toBe('100px')
    expect(wrapper.find('input').classes()).toEqual(['at-input__original'])
    expect(wrapper.find('input').attributes('style')).toBeUndefined()
  })

  it('sets disabled on the native input', () => {
    const wrapper = mount(AtInput, { props: { disabled: true } })

    expect(wrapper.find('input').element.disabled).toBe(true)
    expect(wrapper.classes()).toContain('at-input--disabled')
  })

  it('renders the append slot as an input group', () => {
    const wrapper = mount(AtInput, { slots: { append: '<span class="unit">kg</span>' } })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['at-input-group', 'at-input--append']),
    )
    expect(wrapper.classes()).not.toContain('at-input--prepend')
    expect(wrapper.find('.at-input-group__append .unit').exists()).toBe(true)
  })
})
