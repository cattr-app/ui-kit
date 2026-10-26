import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'

function mountTimeline(data = {}) {
  return mount({
    data: () => ({ pending: false, extra: false, ...data }),
    template: `
      <at-timeline :pending="pending">
        <at-timeline-item>A</at-timeline-item>
        <at-timeline-item color="green">B</at-timeline-item>
        <at-timeline-item color="red">C</at-timeline-item>
        <at-timeline-item v-if="extra">D</at-timeline-item>
      </at-timeline>`,
  })
}

const flags = wrapper =>
  wrapper.findAll('.at-timeline__item').map(item => ({
    last: item.classes('at-timeline__item--last'),
    pending: item.classes('at-timeline__item--pending'),
  }))

describe('AtTimeline + AtTimelineItem', () => {
  it('marks only the last item as last', async () => {
    const wrapper = mountTimeline()
    await nextTick()

    expect(wrapper.find('.at-timeline').exists()).toBe(true)
    expect(flags(wrapper)).toEqual([
      { last: false, pending: false },
      { last: false, pending: false },
      { last: true, pending: false },
    ])
  })

  it('with pending marks the last item as pending and the one before it as last', async () => {
    const wrapper = mountTimeline()
    await nextTick()

    await wrapper.setData({ pending: true })
    expect(wrapper.find('.at-timeline').classes()).toContain('at-timeline--pending')
    expect(flags(wrapper)).toEqual([
      { last: false, pending: false },
      { last: true, pending: false },
      { last: false, pending: true },
    ])

    await wrapper.setData({ pending: false })
    expect(flags(wrapper).map(f => f.pending)).toEqual([false, false, false])
    expect(flags(wrapper)[2].last).toBe(true)
  })

  it('maps color to status class and adds custom class for the dot slot', async () => {
    const wrapper = mount({
      template: `
        <at-timeline>
          <at-timeline-item color="green">A</at-timeline-item>
          <at-timeline-item color="unknown">B</at-timeline-item>
          <at-timeline-item><template #dot><i class="dot"></i></template>C</at-timeline-item>
        </at-timeline>`,
    })
    await nextTick()
    const items = wrapper.findAll('.at-timeline__item')

    expect(items[0].classes()).toContain('at-timeline__item--success')
    expect(items[1].classes()).toContain('at-timeline__item--default')
    expect(items[0].classes()).not.toContain('at-timeline__item--custom')
    expect(items[2].classes()).toContain('at-timeline__item--custom')
    expect(items[2].find('.at-timeline__dot .dot').exists()).toBe(true)
  })

  it('moves the last mark when an item is added or removed', async () => {
    const wrapper = mountTimeline()
    await nextTick()

    await wrapper.setData({ extra: true })
    await nextTick()
    expect(flags(wrapper).map(f => f.last)).toEqual([false, false, false, true])

    await wrapper.setData({ extra: false })
    await nextTick()
    expect(flags(wrapper).map(f => f.last)).toEqual([false, false, true])
  })
})
