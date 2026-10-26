import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtTag from '../../src/components/tag'

describe('AtTag', () => {
  it('renders slot text and the color class', () => {
    const wrapper = mount(AtTag, { props: { color: 'success' }, slots: { default: 'Done' } })

    expect(wrapper.find('.at-tag').exists()).toBe(true)
    expect(wrapper.find('.at-tag').classes()).toContain('at-tag--success')
    expect(wrapper.find('.at-tag__text').text()).toBe('Done')
  })

  it('applies a custom color as inline style', () => {
    const wrapper = mount(AtTag, { props: { color: '#ff0000' }, slots: { default: 'X' } })

    expect(wrapper.find('.at-tag').element.style.backgroundColor).toBe('#ff0000')
    expect(wrapper.find('.at-tag').element.style.borderColor).toBe('#ff0000')
  })

  it('emits on-close with the name when the close icon is clicked', async () => {
    const wrapper = mount(AtTag, {
      props: { closable: true, name: 'tag-1' },
      slots: { default: 'T' },
    })

    await wrapper.find('.at-tag__close').trigger('click')

    expect(wrapper.emitted('on-close')).toHaveLength(1)
    expect(wrapper.emitted('on-close')[0][1]).toBe('tag-1')
  })

  it('emits on-close without a name when none is set', async () => {
    const wrapper = mount(AtTag, { props: { closable: true }, slots: { default: 'T' } })

    await wrapper.find('.at-tag__close').trigger('click')

    expect(wrapper.emitted('on-close')[0]).toHaveLength(1)
  })
})
