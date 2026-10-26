import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtCard from '../../src/components/card'

describe('AtCard', () => {
  it('renders the root class with the bordered modifier by default', () => {
    const wrapper = mount(AtCard)

    expect(wrapper.classes()).toContain('at-card')
    expect(wrapper.classes()).toContain('at-card--bordered')
    expect(wrapper.find('.at-card__head').exists()).toBe(false)
  })

  it('applies no-hover and drops bordered when props are set', () => {
    const wrapper = mount(AtCard, { props: { bordered: false, noHover: true } })

    expect(wrapper.classes()).toContain('at-card--no-hover')
    expect(wrapper.classes()).not.toContain('at-card--bordered')
  })

  it('renders title, extra and default slots', () => {
    const wrapper = mount(AtCard, { slots: { title: 'T', extra: 'E', default: 'B' } })

    expect(wrapper.find('.at-card__head').exists()).toBe(true)
    expect(wrapper.find('.at-card__title').text()).toBe('T')
    expect(wrapper.find('.at-card__extra').text()).toBe('E')
    expect(wrapper.find('.at-card__body').text()).toBe('B')
  })

  it('shows the loading placeholder instead of the default slot while loading', () => {
    const wrapper = mount(AtCard, { props: { loading: true }, slots: { default: 'B' } })

    expect(wrapper.find('.at-card__body--loading').exists()).toBe(true)
    expect(wrapper.find('.at-card__body').text()).not.toContain('B')
  })
})
