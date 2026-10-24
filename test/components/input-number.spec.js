import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtInputNumber from '../../src/components/input-number'

describe('AtInputNumber', () => {
  it('renders the value from modelValue and follows its updates', async () => {
    const wrapper = mount(AtInputNumber, { props: { modelValue: 3 } })

    expect(wrapper.classes()).toContain('at-input-number')
    expect(wrapper.find('input').element.value).toBe('3')

    await wrapper.setProps({ modelValue: 7 })
    expect(wrapper.find('input').element.value).toBe('7')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('emits update:modelValue and change by step from the +/- buttons', async () => {
    const wrapper = mount({
      data: () => ({ num: 1 }),
      template: '<at-input-number v-model="num" :step="0.3" />',
    })
    const input = wrapper.findComponent(AtInputNumber)

    await wrapper.find('.at-input-number__up').trigger('click')
    expect(wrapper.vm.num).toBe(1.3)

    await wrapper.find('.at-input-number__down').trigger('click')
    await wrapper.find('.at-input-number__down').trigger('click')

    expect(input.emitted('update:modelValue')).toEqual([[1.3], [1], [0.7]])
    expect(input.emitted('change')).toEqual([[1.3], [1], [0.7]])
    expect(wrapper.vm.num).toBe(0.7)
  })

  it('emits when reaching min/max and stops beyond them', async () => {
    const wrapper = mount(AtInputNumber, { props: { modelValue: 1, min: 0, max: 2 } })
    const up = wrapper.find('.at-input-number__up')
    const down = wrapper.find('.at-input-number__down')

    await up.trigger('click')
    expect(up.classes()).toContain('at-input-number__up--disabled')
    await up.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])

    await down.trigger('click')
    await down.trigger('click')
    expect(down.classes()).toContain('at-input-number__down--disabled')
    await down.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2], [1], [0]])
  })

  it('applies a typed number on change and Enter, clamped to min/max', async () => {
    const wrapper = mount(AtInputNumber, { props: { modelValue: 1, min: 0, max: 10 } })
    const input = wrapper.find('input')

    input.element.value = '5'
    await input.trigger('change')
    input.element.value = '42'
    await input.trigger('keydown', { key: 'Enter' })
    input.element.value = ''
    await input.trigger('change')

    expect(wrapper.emitted('update:modelValue')).toEqual([[5], [10]])
    expect(input.element.value).toBe('10')
  })

  it('ignores buttons and input when disabled', async () => {
    const wrapper = mount(AtInputNumber, { props: { modelValue: 1, disabled: true } })
    const input = wrapper.find('input')

    expect(wrapper.classes()).toContain('at-input-number--disabled')
    expect(input.element.disabled).toBe(true)

    await wrapper.find('.at-input-number__up').trigger('click')
    input.element.value = '5'
    await input.trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('forwards consumer listeners/attrs to the native input, class/style to the wrapper', async () => {
    const wrapper = mount({
      data: () => ({ keys: 0 }),
      template: '<at-input-number class="custom" style="width: 80px" id="qty" @keyup="keys++" />',
    })
    const root = wrapper.find('.at-input-number')
    const input = wrapper.find('input')

    expect(root.classes()).toContain('custom')
    expect(root.element.style.width).toBe('80px')
    expect(root.attributes('id')).toBeUndefined()
    expect(input.attributes('id')).toBe('qty')
    expect(input.attributes('style')).toBeUndefined()

    await input.trigger('keyup', { key: '1' })
    expect(wrapper.vm.keys).toBe(1)
  })
})
