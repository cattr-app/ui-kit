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
    const input = wrapper.getComponent(AtInputNumber)

    await wrapper.find('.at-input-number__up').trigger('click')
    expect(wrapper.vm.num).toBe(1.3)

    await wrapper.find('.at-input-number__down').trigger('click')
    await wrapper.find('.at-input-number__down').trigger('click')

    expect(input.emitted('update:modelValue')).toEqual([[1.3], [1], [0.7]])
    expect(input.emitted('change')).toEqual([[1.3], [1], [0.7]])
    expect(wrapper.vm.num).toBe(0.7)
  })

  it.each([
    [0.14, 0.01, ['0.15', '0.16', '0.17', '0.18'], ['0.13', '0.12', '0.11', '0.1']],
    [2.01, 0.01, ['2.02', '2.03', '2.04', '2.05'], ['2', '1.99', '1.98', '1.97']],
    [0.2, 0.1, ['0.3', '0.4', '0.5', '0.6'], ['0.1', '0', '-0.1', '-0.2']],
    [1.15, 0.05, ['1.2', '1.25', '1.3', '1.35'], ['1.1', '1.05', '1', '0.95']],
  ])('steps %s by %s without float artifacts', async (start, step, ups, downs) => {
    const upWrapper = mount(AtInputNumber, { props: { modelValue: start, step } })
    for (let i = 0; i < ups.length; i++) {
      await upWrapper.find('.at-input-number__up').trigger('click')
    }
    expect(upWrapper.emitted('update:modelValue').map(([v]) => String(v))).toEqual(ups)

    const downWrapper = mount(AtInputNumber, { props: { modelValue: start, step } })
    for (let i = 0; i < downs.length; i++) {
      await downWrapper.find('.at-input-number__down').trigger('click')
    }
    expect(downWrapper.emitted('update:modelValue').map(([v]) => String(v))).toEqual(downs)
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

  it('ignores buttons and arrow keys when readonly', async () => {
    const wrapper = mount(AtInputNumber, { props: { modelValue: 1, readonly: true } })
    const input = wrapper.find('input')
    const up = wrapper.find('.at-input-number__up')
    const down = wrapper.find('.at-input-number__down')

    expect(input.element.readOnly).toBe(true)
    expect(up.classes()).toContain('at-input-number__up--disabled')
    expect(down.classes()).toContain('at-input-number__down--disabled')

    await up.trigger('click')
    await down.trigger('click')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(input.element.value).toBe('1')
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
