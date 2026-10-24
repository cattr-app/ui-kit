import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtCheckbox from '../../src/components/checkbox'
import AtCheckboxGroup from '../../src/components/checkbox-group'

describe('AtCheckbox without a group', () => {
  it('toggles and emits update:modelValue and on-change with a boolean', async () => {
    const wrapper = mount(AtCheckbox, { props: { modelValue: false } })

    expect(wrapper.classes()).toContain('at-checkbox')
    expect(wrapper.classes()).not.toContain('at-checkbox--checked')

    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('on-change')).toEqual([[true]])
    expect(wrapper.classes()).toContain('at-checkbox--checked')

    await wrapper.setProps({ modelValue: true })
    await wrapper.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
    expect(wrapper.classes()).not.toContain('at-checkbox--checked')
  })

  it('follows modelValue changes from the parent', async () => {
    const wrapper = mount({
      components: { AtCheckbox },
      data: () => ({ on: false }),
      template: `<at-checkbox v-model="on">On</at-checkbox>`,
    })

    expect(wrapper.find('input').element.checked).toBe(false)
    wrapper.vm.on = true
    await nextTick()
    expect(wrapper.find('input').element.checked).toBe(true)

    await wrapper.find('input').setValue(false)
    expect(wrapper.vm.on).toBe(false)
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(AtCheckbox, { props: { modelValue: false, disabled: true } })

    wrapper.find('input').element.dispatchEvent(new Event('change'))
    await nextTick()

    expect(wrapper.classes()).toContain('at-checkbox--disabled')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('on-change')).toBeUndefined()
  })
})

describe('AtCheckboxGroup + AtCheckbox', () => {
  function mountGroup(value) {
    return mount({
      data: () => ({ value, changes: [] }),
      template: `
        <at-checkbox-group v-model="value" @on-change="changes.push($event)">
          <at-checkbox label="a">A</at-checkbox>
          <at-checkbox label="b">B</at-checkbox>
          <at-checkbox label="c" disabled>C</at-checkbox>
        </at-checkbox-group>`,
    })
  }

  it('checks boxes whose label is in the group value', async () => {
    const wrapper = mountGroup(['b'])
    const inputs = () => wrapper.findAll('input').map(i => i.element.checked)

    expect(inputs()).toEqual([false, true, false])
    expect(wrapper.findAllComponents(AtCheckbox)[1].classes()).toContain('at-checkbox--checked')

    wrapper.vm.value = ['a', 'c']
    await nextTick()
    expect(inputs()).toEqual([true, false, true])
  })

  it('adds and removes the label through the group', async () => {
    const wrapper = mountGroup(['b'])
    const group = wrapper.getComponent(AtCheckboxGroup)
    const [first, second] = wrapper.findAllComponents(AtCheckbox)

    await first.find('input').setValue(true)
    expect(group.emitted('update:modelValue')).toEqual([[['b', 'a']]])
    expect(wrapper.vm.value).toEqual(['b', 'a'])

    await second.find('input').setValue(false)
    expect(group.emitted('update:modelValue')[1]).toEqual([['a']])
    expect(wrapper.vm.value).toEqual(['a'])
    expect(wrapper.vm.changes).toEqual([['b', 'a'], ['a']])

    expect(first.emitted('update:modelValue')).toBeUndefined()
    expect(first.emitted('on-change')).toBeUndefined()
  })

  it('does not emit when a disabled checkbox receives change', async () => {
    const wrapper = mountGroup(['a'])
    const group = wrapper.getComponent(AtCheckboxGroup)

    const input = wrapper.findAll('input')[2].element
    input.checked = true
    input.dispatchEvent(new Event('change'))
    await nextTick()

    expect(group.emitted('update:modelValue')).toBeUndefined()
    expect(group.emitted('on-change')).toBeUndefined()
    expect(wrapper.vm.value).toEqual(['a'])
  })
})
