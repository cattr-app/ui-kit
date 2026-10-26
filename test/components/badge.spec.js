import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtBadge from '../../src/components/badge'

describe('AtBadge', () => {
  it('renders the root class, the status modifier and the value', () => {
    const wrapper = mount(AtBadge, { props: { value: 5 } })

    expect(wrapper.classes()).toContain('at-badge')
    expect(wrapper.classes()).toContain('at-badge--error')
    expect(wrapper.classes()).toContain('at-badge--alone')
    expect(wrapper.find('.at-badge__content').text()).toBe('5')
  })

  it('caps numeric values above maxNum', () => {
    const wrapper = mount(AtBadge, { props: { value: 120, maxNum: 99 } })

    expect(wrapper.find('.at-badge__content').text()).toBe('99+')
  })

  it('wraps a slot with the corner badge and hides it when show is false', () => {
    const wrapper = mount(AtBadge, {
      props: { value: 3, show: false },
      slots: { default: '<span class="target">Mail</span>' },
    })
    const sup = wrapper.find('.at-badge__content')

    expect(wrapper.find('.target').exists()).toBe(true)
    expect(wrapper.classes()).not.toContain('at-badge--alone')
    expect(sup.classes()).toContain('at-badge--corner')
    expect(sup.element.style.display).toBe('none')
  })

  it('renders a dot without text', () => {
    const wrapper = mount(AtBadge, { props: { value: 7, dot: true } })
    const sup = wrapper.find('.at-badge__content')

    expect(sup.classes()).toContain('at-badge--dot')
    expect(sup.text()).toBe('')
  })
})
