import { describe, expect, it } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtProgress from '../../src/components/progress'

describe('AtProgress', () => {
  it('fills the bar by percent and shows the percent text', () => {
    const wrapper = mount(AtProgress, { props: { percent: 40 } })

    expect(wrapper.classes()).toContain('at-progress--bar')
    expect(wrapper.find('.at-progress-bar__inner').element.style.width).toBe('40%')
    expect(wrapper.find('.at-progress__text').text()).toBe('40%')
  })

  it('applies the status class and replaces the text with an icon', () => {
    const wrapper = mount(AtProgress, { props: { percent: 40, status: 'error' } })

    expect(wrapper.classes()).toContain('at-progress--error')
    expect(wrapper.find('.at-progress__text').text()).toBe('')
    expect(wrapper.find('.at-progress__text i').classes()).toContain('icon-x-circle')
  })

  it('switches to success and emits on-status-success when reaching 100', async () => {
    const wrapper = mount(AtProgress, { props: { percent: 50 } })
    expect(wrapper.emitted('on-status-success')).toBeUndefined()

    await wrapper.setProps({ percent: 100 })

    expect(wrapper.classes()).toContain('at-progress--success')
    expect(wrapper.find('.at-progress__text i').classes()).toContain('icon-check-circle')
    expect(wrapper.emitted('on-status-success')).toEqual([[100]])
  })
})
