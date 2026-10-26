import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtTabs from '../../src/components/tabs'

const PANES = `
  <at-tab-pane label="A" name="a">a</at-tab-pane>
  <at-tab-pane label="B" name="b">b</at-tab-pane>
  <at-tab-pane label="C" name="c" disabled>c</at-tab-pane>`

async function mountTabs({ attrs = '', value = 'b', panes = PANES, data = {}, methods = {} } = {}) {
  const wrapper = mount({
    data: () => ({ value, ...data }),
    methods,
    template: `<at-tabs v-model="value" ${attrs}>${panes}</at-tabs>`,
  })
  await nextTick()
  return wrapper
}

const navItems = wrapper => wrapper.findAll('.at-tabs-nav__item')
const navLabels = wrapper => navItems(wrapper).map(item => item.text())
const activeNav = wrapper =>
  navItems(wrapper).map(item => item.classes().includes('at-tabs-nav__item--active'))

describe('AtTabs + AtTabPane', () => {
  it('renders a nav item per pane and activates the one from modelValue', async () => {
    const wrapper = await mountTabs({ attrs: ':animated="false"' })

    expect(wrapper.find('.at-tabs').classes()).not.toContain('at-tabs--card')
    expect(navLabels(wrapper)).toEqual(['A', 'B', 'C'])
    expect(activeNav(wrapper)).toEqual([false, true, false])
    expect(navItems(wrapper)[2].classes()).toContain('at-tabs-nav__item--disabled')
    const panes = wrapper.findAll('.at-tabs__pane')
    expect(panes.map(pane => pane.element.style.display)).toEqual(['none', '', 'none'])
  })

  it('emits update:modelValue and on-change with { index, name } on nav click', async () => {
    const wrapper = await mountTabs()
    const tabs = wrapper.getComponent(AtTabs)

    await navItems(wrapper)[0].trigger('click')

    expect(tabs.emitted('update:modelValue')).toEqual([['a']])
    expect(tabs.emitted('on-change')).toEqual([[{ index: 0, name: 'a' }]])
    expect(wrapper.vm.value).toBe('a')
    expect(activeNav(wrapper)).toEqual([true, false, false])
    expect(wrapper.find('.at-tabs__body').element.style.transform).toBe('translate3d(0%, 0, 0)')
  })

  it('does not activate a disabled pane', async () => {
    const wrapper = await mountTabs()

    await navItems(wrapper)[2].trigger('click')

    expect(wrapper.getComponent(AtTabs).emitted('update:modelValue')).toBeUndefined()
    expect(activeNav(wrapper)).toEqual([false, true, false])
  })

  it('emits on-tab-remove from the close button and moves the selection', async () => {
    const wrapper = await mountTabs({
      attrs: 'closable @on-tab-remove="remove"',
      data: { list: ['a', 'b', 'c'] },
      methods: {
        remove({ index }) {
          this.list.splice(index, 1)
        },
      },
      panes: `<at-tab-pane v-for="n in list" :key="n" :name="n" :label="n">{{ n }}</at-tab-pane>`,
    })
    const tabs = wrapper.getComponent(AtTabs)

    await navItems(wrapper)[1].find('.at-tabs-nav__close').trigger('click')
    await nextTick()

    expect(tabs.emitted('on-tab-remove')).toEqual([[{ index: 1, name: 'b' }]])
    expect(tabs.emitted('on-change')).toEqual([[{ index: 1, name: 'c' }]])
    expect(wrapper.vm.value).toBe('c')
    expect(navLabels(wrapper)).toEqual(['a', 'c'])
    expect(activeNav(wrapper)).toEqual([false, true])
  })

  it('selects the next unnamed pane by its index after the closed one is removed', async () => {
    const wrapper = await mountTabs({
      attrs: 'closable :animated="false" @on-tab-remove="remove"',
      value: '',
      data: { list: ['A', 'B', 'C'] },
      methods: {
        remove({ index }) {
          this.list.splice(index, 1)
        },
      },
      panes: `<at-tab-pane v-for="n in list" :key="n" :label="n">{{ n }}</at-tab-pane>`,
    })
    const tabs = wrapper.getComponent(AtTabs)
    const visiblePanes = () =>
      wrapper
        .findAll('.at-tabs__pane')
        .filter(pane => pane.element.style.display !== 'none')
        .map(pane => pane.text())

    await navItems(wrapper)[1].trigger('click')
    expect(wrapper.vm.value).toBe('1')
    expect(visiblePanes()).toEqual(['B'])

    await navItems(wrapper)[1].find('.at-tabs-nav__close').trigger('click')
    await nextTick()

    expect(tabs.emitted('on-tab-remove')).toEqual([[{ index: 1, name: '1' }]])
    expect(tabs.emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(tabs.emitted('on-change').at(-1)).toEqual([{ index: 1, name: '1' }])
    expect(wrapper.vm.value).toBe('1')
    expect(navLabels(wrapper)).toEqual(['A', 'C'])
    expect(activeNav(wrapper)).toEqual([false, true])
    expect(visiblePanes()).toEqual(['C'])
  })

  it('keeps an unnamed active pane selected when an earlier pane is closed', async () => {
    const wrapper = await mountTabs({
      attrs: 'closable :animated="false" @on-tab-remove="remove"',
      value: '',
      data: { list: ['A', 'B', 'C'] },
      methods: {
        remove({ index }) {
          this.list.splice(index, 1)
        },
      },
      panes: `<at-tab-pane v-for="n in list" :key="n" :label="n">{{ n }}</at-tab-pane>`,
    })
    const tabs = wrapper.getComponent(AtTabs)
    const visiblePanes = () =>
      wrapper
        .findAll('.at-tabs__pane')
        .filter(pane => pane.element.style.display !== 'none')
        .map(pane => pane.text())

    await navItems(wrapper)[2].trigger('click')
    expect(wrapper.vm.value).toBe('2')
    expect(visiblePanes()).toEqual(['C'])

    await navItems(wrapper)[0].find('.at-tabs-nav__close').trigger('click')
    await nextTick()

    expect(tabs.emitted('on-tab-remove')).toEqual([[{ index: 0, name: '0' }]])
    expect(tabs.emitted('update:modelValue').at(-1)).toEqual(['1'])
    // the same pane stays active: no pane switch, no extra on-change
    expect(tabs.emitted('on-change')).toEqual([[{ index: 2, name: '2' }]])
    expect(wrapper.vm.value).toBe('1')
    expect(navLabels(wrapper)).toEqual(['B', 'C'])
    expect(activeNav(wrapper)).toEqual([false, true])
    expect(visiblePanes()).toEqual(['C'])
  })

  it('keeps nav in DOM order for panes added later', async () => {
    const wrapper = await mountTabs({
      value: 'c',
      data: { list: ['a', 'c'] },
      panes: `<at-tab-pane v-for="n in list" :key="n" :name="n" :label="n">{{ n }}</at-tab-pane>`,
    })

    wrapper.vm.list.splice(1, 0, 'b')
    await nextTick()
    await nextTick()

    expect(navLabels(wrapper)).toEqual(['a', 'b', 'c'])
    expect(activeNav(wrapper)).toEqual([false, false, true])

    wrapper.vm.list.reverse()
    await nextTick()
    await nextTick()

    expect(navLabels(wrapper)).toEqual(['c', 'b', 'a'])
    expect(activeNav(wrapper)).toEqual([true, false, false])
  })

  it('applies the card type class and defaults to the first pane', async () => {
    const wrapper = await mountTabs({ attrs: 'type="card"', value: '' })

    expect(wrapper.find('.at-tabs').classes()).toContain('at-tabs--card')
    expect(activeNav(wrapper)).toEqual([true, false, false])
  })
})
