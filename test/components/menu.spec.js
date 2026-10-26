import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount } from '../helpers/mount.js'
import AtMenu from '../../src/components/menu'

async function mountMenu(attrs = '', data = {}) {
  const wrapper = mount({
    data: () => ({ active: '1', ...data }),
    template: `
      <at-menu :active-name="active" ${attrs}>
        <at-menu-item name="1">One</at-menu-item>
        <at-menu-item name="2" disabled>Two</at-menu-item>
        <at-submenu>
          <template #title>Three</template>
          <at-menu-item-group title="Group">
            <at-menu-item name="3-1">Three-One</at-menu-item>
          </at-menu-item-group>
          <at-submenu>
            <template #title>Three-Three</template>
            <at-menu-item name="3-3-1">Three-Three-One</at-menu-item>
          </at-submenu>
        </at-submenu>
        <at-submenu>
          <template #title>Four</template>
          <at-menu-item name="4-1">Four-One</at-menu-item>
        </at-submenu>
      </at-menu>`,
  })
  await nextTick()
  return wrapper
}

const item = (wrapper, text) => wrapper.findAll('.at-menu__item').find(li => li.text() === text)
const submenus = wrapper => wrapper.findAll('.at-menu__submenu')
const activeItems = wrapper => wrapper.findAll('.at-menu__item--active').map(li => li.text())

describe('AtMenu + AtMenuItem + AtSubmenu', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('mounts in inline mode and highlights the active item', async () => {
    const wrapper = await mountMenu()

    const menu = wrapper.find('.at-menu')
    expect(menu.classes()).toEqual(expect.arrayContaining(['at-menu--light', 'at-menu--inline']))
    expect(menu.attributes('style')).toContain('width: 240px')
    expect(wrapper.find('.at-menu__item-group-title').text()).toBe('Group')
    expect(activeItems(wrapper)).toEqual(['One'])
    expect(wrapper.findAll('.at-menu__submenu--active')).toHaveLength(0)
  })

  it('emits on-select with the name on item click and makes it active', async () => {
    const wrapper = await mountMenu()

    await item(wrapper, 'Four-One').trigger('click')

    expect(wrapper.getComponent(AtMenu).emitted('on-select')).toEqual([['4-1']])
    expect(activeItems(wrapper)).toEqual(['Four-One'])
    expect(submenus(wrapper)[2].classes()).toContain('at-menu__submenu--active')
  })

  it('does not emit for a disabled item', async () => {
    const wrapper = await mountMenu()

    await item(wrapper, 'Two').trigger('click')

    expect(wrapper.getComponent(AtMenu).emitted('on-select')).toBeUndefined()
    expect(activeItems(wrapper)).toEqual(['One'])
  })

  it('highlights every ancestor submenu of the active item, follows active-name', async () => {
    const wrapper = await mountMenu()

    wrapper.vm.active = '3-3-1'
    await nextTick()

    const [outer, inner, other] = submenus(wrapper)
    expect(outer.classes()).toContain('at-menu__submenu--active')
    expect(inner.classes()).toContain('at-menu__submenu--active')
    expect(other.classes()).not.toContain('at-menu__submenu--active')
    expect(activeItems(wrapper)).toEqual(['Three-Three-One'])
  })

  it('toggles a submenu on title click in inline mode', async () => {
    const wrapper = await mountMenu()
    const outer = submenus(wrapper)[0]

    await outer.find('.at-menu__submenu-title').trigger('click')
    expect(outer.classes()).toContain('at-menu__submenu--opened')

    await outer.find('.at-menu__submenu-title').trigger('click')
    expect(outer.classes()).not.toContain('at-menu__submenu--opened')
  })

  it('keeps a single top-level submenu open with inline-collapsed', async () => {
    const wrapper = await mountMenu('inline-collapsed')
    const [first, , second] = submenus(wrapper)

    await first.find('.at-menu__submenu-title').trigger('click')
    await second.find('.at-menu__submenu-title').trigger('click')

    expect(first.classes()).not.toContain('at-menu__submenu--opened')
    expect(second.classes()).toContain('at-menu__submenu--opened')
  })

  it('opens the submenu popup on hover in horizontal mode and closes it on select', async () => {
    vi.useFakeTimers()
    const wrapper = await mountMenu('mode="horizontal"')
    const outer = submenus(wrapper)[0]

    expect(wrapper.find('.at-menu').classes()).toContain('at-menu--horizontal')
    expect(wrapper.find('.at-menu').attributes('style')).toBeUndefined()

    await outer.trigger('click') // click does nothing outside inline mode
    await outer.find('.at-menu__submenu-title').trigger('click')
    expect(outer.classes()).not.toContain('at-menu__submenu--opened')

    await outer.trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(200)
    expect(outer.classes()).toContain('at-menu__submenu--opened')
    expect(outer.find('.at-dropdown__popover').exists()).toBe(true)

    await item(wrapper, 'Three-One').trigger('click')
    expect(wrapper.getComponent(AtMenu).emitted('on-select')).toEqual([['3-1']])
    expect(outer.classes()).not.toContain('at-menu__submenu--opened')

    await outer.trigger('mouseenter')
    expect(vi.getTimerCount()).toBe(1)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('AtMenuItem navigation', () => {
  const Page = { render: () => null }

  async function mountRouted(attrs, items) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: ['/', '/a', '/b'].map(path => ({ path, component: Page })),
    })
    router.push('/')
    await router.isReady()
    const push = vi.spyOn(router, 'push')
    const replace = vi.spyOn(router, 'replace')
    const wrapper = mount(
      { template: `<at-menu ${attrs}>${items}</at-menu>` },
      { global: { plugins: [router] } },
    )
    await flushPromises()
    return { wrapper, router, push, replace }
  }

  it.each([
    ['router', 'router mode'],
    ['', 'plain mode'],
  ])('navigates once per click (%s)', async attrs => {
    const { wrapper, router, push, replace } = await mountRouted(
      attrs,
      '<at-menu-item name="a" to="/a">A</at-menu-item>',
    )

    await wrapper.find('a.at-menu__item-link').trigger('click')
    await flushPromises()

    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/a')
    expect(wrapper.find('a.at-menu__item-link').attributes('href')).toBe('/a')
    expect(wrapper.find('.at-menu__item').classes()).toContain('at-menu__item--active')
  })

  it.each([['router'], ['']])('honours replace with one replace and no push (%s)', async attrs => {
    const { wrapper, router, push, replace } = await mountRouted(
      attrs,
      '<at-menu-item name="b" :to="{ path: \'/b\' }" replace>B</at-menu-item>',
    )

    await wrapper.find('a.at-menu__item-link').trigger('click')
    await flushPromises()

    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/b')
  })

  it.each([['router'], ['']])('does not navigate from a disabled item (%s)', async attrs => {
    const { wrapper, router, push, replace } = await mountRouted(
      attrs,
      '<at-menu-item name="a" to="/a" disabled>A</at-menu-item>',
    )

    await wrapper.find('a.at-menu__item-link').trigger('click')
    await flushPromises()

    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('does not throw in router mode without vue-router installed', async () => {
    const wrapper = mount({
      template: '<at-menu router><at-menu-item name="a">A</at-menu-item></at-menu>',
    })

    await wrapper.find('.at-menu__item').trigger('click')

    expect(wrapper.getComponent(AtMenu).emitted('on-select')).toEqual([['a']])
  })
})
