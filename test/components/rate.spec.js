import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtRate from '../../src/components/rate'

describe('AtRate', () => {
  it('renders the root class and count stars', () => {
    const wrapper = mount(AtRate, { props: { count: 5, modelValue: 2 } })

    expect(wrapper.classes()).toContain('at-rate')
    expect(wrapper.findAll('.at-rate__item')).toHaveLength(5)
    expect(wrapper.findAll('.at-rate__item--on')).toHaveLength(2)
  })

  it('emits update:modelValue with the clicked star index', async () => {
    const wrapper = mount(AtRate, { props: { count: 5, modelValue: 0 } })

    await wrapper.findAll('.at-rate__icon')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])
    expect(wrapper.emitted('on-change')).toEqual([[3]])
  })

  it('updates stars when modelValue changes', async () => {
    const wrapper = mount(AtRate, { props: { count: 5, modelValue: 0 } })

    await wrapper.setProps({ modelValue: 4 })

    expect(wrapper.findAll('.at-rate__item--on')).toHaveLength(4)
    expect(wrapper.emitted('on-change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('emits on-change once per click with v-model', async () => {
    const wrapper = mount({
      components: { AtRate },
      data: () => ({ value: 1 }),
      template: '<at-rate v-model="value" :count="5" />',
    })
    const rate = wrapper.getComponent(AtRate)

    await wrapper.findAll('.at-rate__icon')[3].trigger('click')
    await nextTick()

    expect(wrapper.vm.value).toBe(4)
    expect(rate.emitted('update:modelValue')).toEqual([[4]])
    expect(rate.emitted('on-change')).toEqual([[4]])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(AtRate, { props: { count: 5, modelValue: 0, disabled: true } })

    await wrapper.findAll('.at-rate__icon')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('on-change')).toBeUndefined()
  })
})
