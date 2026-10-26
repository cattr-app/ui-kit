import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtBreadcrumbItem from '../../src/components/breadcrumb-item'

describe('AtBreadcrumb', () => {
  it('renders items with the default separator from the parent', () => {
    const wrapper = mount({
      template: `
        <at-breadcrumb>
          <at-breadcrumb-item>A</at-breadcrumb-item>
          <at-breadcrumb-item>B</at-breadcrumb-item>
          <at-breadcrumb-item>C</at-breadcrumb-item>
        </at-breadcrumb>`,
    })
    const items = wrapper.findAll('.at-breadcrumb__item')

    expect(wrapper.find('.at-breadcrumb').exists()).toBe(true)
    expect(items).toHaveLength(3)
    expect(items.map(i => i.find('.at_breadcrumb__text').text())).toEqual(['A', 'B', 'C'])
    // As in 1.x every item renders a separator; the last one is hidden by CSS (`:last-child`).
    items.forEach(i => expect(i.find('.at-breadcrumb__separator').text()).toBe('/'))
  })

  it('takes a custom HTML separator from the parent and reacts to changes', async () => {
    const wrapper = mount({
      data: () => ({ sep: '&gt;' }),
      template: `
        <at-breadcrumb :separator="sep">
          <at-breadcrumb-item>A</at-breadcrumb-item>
          <at-breadcrumb-item>B</at-breadcrumb-item>
        </at-breadcrumb>`,
    })

    expect(wrapper.find('.at-breadcrumb__separator').html()).toContain('&gt;')
    expect(wrapper.find('.at-breadcrumb__separator').text()).toBe('>')

    wrapper.vm.sep = '<i class="icon icon-chevron-right"></i>'
    await nextTick()

    expect(wrapper.findAll('.at-breadcrumb__separator .icon-chevron-right')).toHaveLength(2)
  })

  it('navigates with $router.push / replace when `to` is set', async () => {
    const $router = { push: vi.fn(), replace: vi.fn() }
    const wrapper = mount(
      {
        template: `
          <at-breadcrumb>
            <at-breadcrumb-item :to="{ name: 'home' }">Home</at-breadcrumb-item>
            <at-breadcrumb-item to="/list" replace>List</at-breadcrumb-item>
            <at-breadcrumb-item>Current</at-breadcrumb-item>
          </at-breadcrumb>`,
      },
      { global: { mocks: { $router } } },
    )
    const links = wrapper.findAll('a.at-breadcrumb__link')

    expect(links).toHaveLength(2)
    await links[0].trigger('click')
    await links[1].trigger('click')

    expect($router.push).toHaveBeenCalledWith({ name: 'home' })
    expect($router.replace).toHaveBeenCalledWith('/list')
  })

  it('works standalone and without a router', async () => {
    const wrapper = mount(AtBreadcrumbItem, {
      props: { to: { path: '/' } },
      slots: { default: 'Home' },
    })

    expect(wrapper.find('.at-breadcrumb__separator').text()).toBe('/')
    await expect(wrapper.find('a').trigger('click')).resolves.toBeUndefined()
  })
})
