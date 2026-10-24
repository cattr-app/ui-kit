import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtCollapse from '../../src/components/collapse'
import AtCollapseItem from '../../src/components/collapse-item'

async function mountCollapse(attrs = '', value = ['b'], items) {
  const wrapper = mount({
    data: () => ({ value }),
    template: `
      <at-collapse v-model="value" ${attrs}>
        ${
          items ||
          `<at-collapse-item name="a" title="A">a</at-collapse-item>
           <at-collapse-item name="b" title="B">b</at-collapse-item>
           <at-collapse-item name="c" title="C" disabled>c</at-collapse-item>`
        }
      </at-collapse>`,
  })
  await nextTick()
  return wrapper
}

const activeOf = wrapper =>
  wrapper
    .findAllComponents(AtCollapseItem)
    .map(item => item.classes().includes('at-collapse__item--active'))

describe('AtCollapse + AtCollapseItem', () => {
  it('expands items listed in modelValue', async () => {
    const wrapper = await mountCollapse()

    expect(wrapper.find('.at-collapse').exists()).toBe(true)
    expect(activeOf(wrapper)).toEqual([false, true, false])
    const bodies = wrapper.findAll('.at-collapse__body')
    expect(bodies[0].element.style.display).toBe('none')
    expect(bodies[1].element.style.display).toBe('')
  })

  it('emits update:modelValue and on-change with an array on header click', async () => {
    const wrapper = await mountCollapse()
    const collapse = wrapper.getComponent(AtCollapse)

    await wrapper.findAll('.at-collapse__header')[0].trigger('click')

    expect(collapse.emitted('update:modelValue')).toEqual([[['b', 'a']]])
    expect(collapse.emitted('on-change')).toEqual([[['b', 'a']]])
    expect(wrapper.vm.value).toEqual(['b', 'a'])
    expect(activeOf(wrapper)).toEqual([true, true, false])

    await wrapper.findAll('.at-collapse__header')[1].trigger('click')
    expect(wrapper.vm.value).toEqual(['a'])
  })

  it('keeps a single item open in accordion mode', async () => {
    const wrapper = await mountCollapse('accordion')

    await wrapper.findAll('.at-collapse__header')[0].trigger('click')

    expect(wrapper.vm.value).toEqual(['a'])
    expect(activeOf(wrapper)).toEqual([true, false, false])
  })

  it('does not toggle a disabled item', async () => {
    const wrapper = await mountCollapse()

    await wrapper.findAll('.at-collapse__header')[2].trigger('click')

    expect(wrapper.getComponent(AtCollapse).emitted('update:modelValue')).toBeUndefined()
    expect(activeOf(wrapper)).toEqual([false, true, false])
  })

  it('uses the DOM index as the name of items without name', async () => {
    const wrapper = await mountCollapse(
      '',
      1,
      `<at-collapse-item title="0">0</at-collapse-item>
       <at-collapse-item title="1">1</at-collapse-item>
       <at-collapse-item title="2">2</at-collapse-item>`,
    )

    expect(activeOf(wrapper)).toEqual([false, true, false])

    await wrapper.findAll('.at-collapse__header')[2].trigger('click')
    expect(wrapper.vm.value).toEqual(['1', '2'])
  })
})
