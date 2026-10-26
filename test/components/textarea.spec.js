import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtTextarea from '../../src/components/textarea'

describe('AtTextarea', () => {
  it('renders the modelValue inside the textarea', () => {
    const wrapper = mount(AtTextarea, { props: { modelValue: 'hello' } })

    expect(wrapper.classes()).toContain('at-textarea')
    expect(wrapper.find('textarea').element.value).toBe('hello')
  })

  it('emits update:modelValue and change when the user types', async () => {
    const wrapper = mount(AtTextarea, { props: { modelValue: '' } })

    await wrapper.find('textarea').setValue('world')

    expect(wrapper.emitted('update:modelValue')).toEqual([['world']])
    expect(wrapper.emitted('change')).toEqual([['world']])
  })

  it('does not emit when the parent changes modelValue', async () => {
    const wrapper = mount(AtTextarea, { props: { modelValue: 'a' } })

    await wrapper.setProps({ modelValue: 'b' })

    expect(wrapper.find('textarea').element.value).toBe('b')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('emits once per input with v-model', async () => {
    const wrapper = mount({
      components: { AtTextarea },
      data: () => ({ text: '' }),
      template: '<at-textarea v-model="text" />',
    })
    const textarea = wrapper.getComponent(AtTextarea)

    await wrapper.find('textarea').setValue('hi')

    expect(wrapper.vm.text).toBe('hi')
    expect(textarea.emitted('update:modelValue')).toEqual([['hi']])
    expect(textarea.emitted('change')).toEqual([['hi']])
  })

  it('applies disabled and readonly to the native textarea', () => {
    const disabled = mount(AtTextarea, { props: { modelValue: '', disabled: true } })
    const readonly = mount(AtTextarea, { props: { modelValue: '', readonly: true } })

    expect(disabled.find('textarea').attributes('disabled')).toBeDefined()
    expect(disabled.classes()).toContain('at-textarea--disabled')
    expect(readonly.find('textarea').attributes('readonly')).toBeDefined()
    expect(readonly.find('textarea').attributes('disabled')).toBeUndefined()
  })

  it('passes maxlength and rows to the native textarea and emits focus/blur', async () => {
    const wrapper = mount(AtTextarea, { props: { modelValue: '', maxlength: 10, rows: 4 } })
    const textarea = wrapper.find('textarea')

    expect(textarea.attributes('maxlength')).toBe('10')
    expect(textarea.attributes('rows')).toBe('4')

    await textarea.trigger('focus')
    await textarea.trigger('blur')

    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })
})
