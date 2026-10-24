import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtSlider from '../../src/components/slider'

// happy-dom has no layout: give the track a fixed 200px box starting at x = 100
function mockTrack(wrapper) {
  const track = wrapper.find('.at-slider__track')
  track.element.getBoundingClientRect = () => ({ left: 100, width: 200, top: 0, height: 4 })
  return track
}

describe('AtSlider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('positions the bar and the dot from modelValue', async () => {
    const wrapper = mount(AtSlider, { props: { modelValue: 50, max: 200 } })

    expect(wrapper.classes()).toContain('at-slider')
    expect(wrapper.find('.at-slider__bar').element.style.width).toBe('25%')
    expect(wrapper.find('.at-slider__dot-wrapper').element.style.left).toBe('25%')

    await wrapper.setProps({ modelValue: 100 })
    expect(wrapper.find('.at-slider__bar').element.style.width).toBe('50%')
    expect(wrapper.find('.at-tooltip').exists()).toBe(true)
  })

  it('emits update:modelValue and change on a track click (v-model)', async () => {
    const wrapper = mount({
      data: () => ({ value: 0 }),
      template: '<at-slider v-model="value" />',
    })
    const slider = wrapper.findComponent(AtSlider)

    await mockTrack(wrapper).trigger('click', { clientX: 230 })

    expect(slider.emitted('update:modelValue')).toEqual([[65]])
    expect(slider.emitted('change')).toEqual([[65]])
    expect(wrapper.vm.value).toBe(65)
    expect(wrapper.find('.at-slider__bar').element.style.width).toBe('65%')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(AtSlider, { props: { modelValue: 10, disabled: true } })
    const track = mockTrack(wrapper)

    await track.trigger('click', { clientX: 250 })
    await wrapper.find('.at-slider__dot-wrapper').trigger('mousedown', { clientX: 120 })
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 200 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(track.classes()).toContain('at-slider--disabled')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('snaps to step and clamps to min/max', async () => {
    const wrapper = mount(AtSlider, { props: { modelValue: 500, min: 100, max: 300, step: 50 } })
    // out of range value is clamped on creation
    expect(wrapper.emitted('update:modelValue')).toEqual([[300]])

    const track = mockTrack(wrapper)
    await track.trigger('click', { clientX: 155 }) // 27.5% → 155 → nearest step 150
    await track.trigger('click', { clientX: 900 }) // past the end → max
    await track.trigger('click', { clientX: 0 }) // before the start → min

    expect(wrapper.emitted('update:modelValue').slice(1)).toEqual([[150], [300], [100]])

    await wrapper.setProps({ modelValue: 50 })
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([100])
  })

  it('drags the dot via window listeners and removes them on unmount', async () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(AtSlider, { props: { modelValue: 20 } })
    mockTrack(wrapper)

    await wrapper.find('.at-slider__dot-wrapper').trigger('mousedown', { clientX: 140 })
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 180 })) // +40px = +20%
    expect(wrapper.emitted('update:modelValue')).toEqual([[40]])
    expect(wrapper.emitted('change')).toBeUndefined()

    window.dispatchEvent(new MouseEvent('mouseup'))
    expect(wrapper.emitted('change')).toEqual([[40]])

    await wrapper.find('.at-slider__dot-wrapper').trigger('mousedown', { clientX: 180 })
    remove.mockClear()
    wrapper.unmount()

    const removed = remove.mock.calls.map(([type]) => type)
    expect(removed).toEqual(expect.arrayContaining(['mousemove', 'mouseup']))
  })
})
