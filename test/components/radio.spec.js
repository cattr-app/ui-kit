import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtRadio from '../../src/components/radio'
import AtRadioGroup from '../../src/components/radio-group'
import AtRadioButton from '../../src/components/radio-button'

function mountGroup(template, value = 'a') {
  return mount({
    data: () => ({ value, changes: [] }),
    template,
  })
}

describe('AtRadioGroup + AtRadio', () => {
  const template = `
    <at-radio-group v-model="value" @radio-group-change="changes.push($event)">
      <at-radio label="a">A</at-radio>
      <at-radio label="b">B</at-radio>
      <at-radio label="c">C</at-radio>
    </at-radio-group>`

  it('checks the radio matching the group value', () => {
    const wrapper = mountGroup(template)
    const radios = wrapper.findAllComponents(AtRadio)

    expect(radios).toHaveLength(3)
    expect(radios.map(r => r.find('input').element.checked)).toEqual([true, false, false])
    expect(radios[0].find('.at-radio__inner').classes()).toContain('at-radio--checked')
  })

  it('emits update:modelValue and radio-group-change with the clicked radio label', async () => {
    const wrapper = mountGroup(template)
    const group = wrapper.findComponent(AtRadioGroup)
    const second = wrapper.findAllComponents(AtRadio)[1]

    await second.find('input').setValue()

    expect(group.emitted('update:modelValue')).toEqual([['b']])
    expect(group.emitted('radio-group-change')).toEqual([['b']])
    expect(second.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.vm.value).toBe('b')
    expect(wrapper.vm.changes).toEqual(['b'])
    expect(second.find('.at-radio__inner').classes()).toContain('at-radio--checked')
  })

  it('does not emit when a disabled radio receives change', async () => {
    const wrapper = mountGroup(`
      <at-radio-group v-model="value">
        <at-radio label="a">A</at-radio>
        <at-radio label="b" disabled>B</at-radio>
      </at-radio-group>`)
    const group = wrapper.findComponent(AtRadioGroup)

    wrapper.findAll('input')[1].element.dispatchEvent(new Event('change'))
    await nextTick()

    expect(group.emitted('update:modelValue')).toBeUndefined()
    expect(group.emitted('radio-group-change')).toBeUndefined()
    expect(wrapper.vm.value).toBe('a')
  })
})

describe('AtRadioButton', () => {
  it('inherits size from the group and paints the checked one with fill/textColor', () => {
    const wrapper = mountGroup(
      `
      <at-radio-group v-model="value" size="small" fill="#ff0000" text-color="#ffffff">
        <at-radio-button label="a">A</at-radio-button>
        <at-radio-button label="b">B</at-radio-button>
      </at-radio-group>`,
      'a',
    )
    const [first, second] = wrapper.findAllComponents(AtRadioButton)

    expect(first.classes()).toContain('at-radio-button--small')
    expect(second.classes()).toContain('at-radio-button--small')
    expect(first.classes()).toContain('at-radio--checked')

    const style = first.find('.at-radio-button__inner').element.style
    expect(style.backgroundColor).toBe('#ff0000')
    expect(style.borderColor).toBe('#ff0000')
    expect(style.color).toBe('#ffffff')
    expect(second.find('.at-radio-button__inner').attributes('style')).toBeUndefined()
  })

  it('updates the group value on change', async () => {
    const wrapper = mountGroup(`
      <at-radio-group v-model="value">
        <at-radio-button label="a">A</at-radio-button>
        <at-radio-button label="b">B</at-radio-button>
      </at-radio-group>`)

    await wrapper.findAll('input')[1].setValue()

    expect(wrapper.findComponent(AtRadioGroup).emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.vm.value).toBe('b')
  })
})

describe('AtRadio without a group', () => {
  it('works with its own modelValue', async () => {
    const wrapper = mount(AtRadio, { props: { label: 'x', modelValue: 'y' } })

    expect(wrapper.find('input').element.checked).toBe(false)

    await wrapper.find('input').setValue()
    expect(wrapper.emitted('update:modelValue')).toEqual([['x']])

    await wrapper.setProps({ modelValue: 'x' })
    expect(wrapper.find('input').element.checked).toBe(true)
    expect(wrapper.find('.at-radio__inner').classes()).toContain('at-radio--checked')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(AtRadio, { props: { label: 'x', modelValue: 'y', disabled: true } })

    wrapper.find('input').element.dispatchEvent(new Event('change'))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
