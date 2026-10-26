import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'

async function mountSteps(props = 'current="1"', extra = '') {
  const wrapper = mount({
    template: `
      <at-steps ${props}>
        <at-step title="A"></at-step>
        <at-step title="B" ${extra}></at-step>
        <at-step title="C"></at-step>
      </at-steps>`,
  })
  await nextTick()
  return wrapper
}

const statuses = wrapper =>
  wrapper.findAll('.at-step').map(step => {
    const cls = step.classes().find(c => /^at-step--(wait|process|finish|error)$/.test(c))
    return cls && cls.replace('at-step--', '')
  })

describe('AtSteps + AtStep', () => {
  it('derives step statuses from current', async () => {
    const wrapper = await mountSteps(':current="1"')

    expect(wrapper.find('.at-steps').classes()).toContain('at-steps--horizontal')
    expect(statuses(wrapper)).toEqual(['finish', 'process', 'wait'])
    expect(wrapper.findAll('.at-step__order').map(o => o.text())).toEqual(['2', '3'])
    expect(wrapper.findAll('.at-step__line')).toHaveLength(2)
  })

  it('numbers steps on the first render, not "0" until mounted', () => {
    const wrapper = mount({
      template: `
        <at-steps :current="0">
          <at-step title="A"></at-step>
          <at-step title="B"></at-step>
        </at-steps>`,
    })

    // checked synchronously: no nextTick, the post-mount re-render has not run yet
    expect(wrapper.findAll('.at-step__order').map(o => o.text())).toEqual(['1', '2'])
  })

  it('sizes horizontal steps by their count', async () => {
    const wrapper = await mountSteps(':current="0"')
    const width = parseFloat(wrapper.find('.at-step').element.style.width)

    expect(width).toBeCloseTo(100 / 3, 3)
  })

  it('applies the vertical class without width', async () => {
    const wrapper = await mountSteps(':current="0" direction="vertical"')

    expect(wrapper.find('.at-steps').classes()).toContain('at-steps--vertical')
    expect(wrapper.find('.at-step').element.style.width).toBe('')
  })

  it('marks the current step as error and the previous one as next-error', async () => {
    const wrapper = await mountSteps(':current="1" status="error"')
    const steps = wrapper.findAll('.at-step')

    expect(statuses(wrapper)).toEqual(['finish', 'error', 'wait'])
    expect(steps[0].classes()).toContain('at-step--next-error')
    expect(steps[1].classes()).not.toContain('at-step--next-error')
  })

  it('lets a step status prop override the derived one', async () => {
    const wrapper = await mountSteps(':current="0"', 'status="finish"')

    expect(statuses(wrapper)).toEqual(['process', 'finish', 'wait'])
  })

  it('renumbers steps after a keyed reorder', async () => {
    const wrapper = mount({
      data: () => ({ titles: ['A', 'B', 'C'] }),
      template: `
        <at-steps :current="0">
          <at-step v-for="t in titles" :key="t" :title="t"></at-step>
        </at-steps>`,
    })
    await nextTick()

    wrapper.vm.titles.reverse()
    await nextTick()
    await nextTick()

    expect(wrapper.findAll('.at-step__title').map(t => t.text())).toEqual(['C', 'B', 'A'])
    expect(wrapper.findAll('.at-step__order').map(o => o.text())).toEqual(['1', '2', '3'])
  })
})
