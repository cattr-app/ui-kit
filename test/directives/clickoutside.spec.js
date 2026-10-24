import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import clickoutside, { vClickoutside } from '../../src/directives/clickoutside.js'

function mountWith(spy) {
  return mount(
    {
      directives: { clickoutside },
      props: { onOutside: Function },
      template: '<div v-clickoutside="onOutside"><span class="inner">inside</span></div>',
    },
    { props: { onOutside: spy }, attachTo: document.body },
  )
}

describe('v-clickoutside', () => {
  it('exports the same directive as default and named', () => {
    expect(vClickoutside).toBe(clickoutside)
  })

  it('calls the callback with the event on a click outside', () => {
    const spy = vi.fn()
    const wrapper = mountWith(spy)

    document.body.click()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBeInstanceOf(Event)
    expect(spy.mock.calls[0][0].type).toBe('click')
    wrapper.unmount()
  })

  it('does not call the callback on a click inside', async () => {
    const spy = vi.fn()
    const wrapper = mountWith(spy)

    await wrapper.find('.inner').trigger('click')
    wrapper.element.click()

    expect(spy).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('uses the latest callback after an update', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const wrapper = mountWith(first)

    await wrapper.setProps({ onOutside: second })
    document.body.click()

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('removes the document listener on unmount', () => {
    const spy = vi.fn()
    const wrapper = mountWith(spy)

    wrapper.unmount()
    document.body.click()

    expect(spy).not.toHaveBeenCalled()
  })
})
