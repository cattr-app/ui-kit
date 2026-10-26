import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import CollapseTransition from '../../src/utils/collapse-transition.js'

// happy-dom does no layout and never fires `transitionend`: scrollHeight is stubbed, and
// the end hooks (afterEnter/afterLeave) are reached only through Vue's own fallback when
// no CSS transition duration is computed (resolved on the next animation frame).
const frame = () => new Promise(resolve => setTimeout(resolve, 50))

function mountCollapse(open) {
  return mount(
    {
      components: { CollapseTransition },
      props: { open: Boolean },
      template:
        '<collapse-transition><div v-show="open" class="panel">content</div></collapse-transition>',
    },
    // @vue/test-utils stubs <transition> by default; the real one is needed to run the hooks
    { props: { open }, attachTo: document.body, global: { stubs: { transition: false } } },
  )
}

describe('CollapseTransition', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(50)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is a functional component with a display name', () => {
    expect(typeof CollapseTransition).toBe('function')
    expect(CollapseTransition.displayName).toBe('CollapseTransition')
  })

  it('renders the slot content', () => {
    const wrapper = mountCollapse(true)
    expect(wrapper.find('.panel').text()).toBe('content')
    wrapper.unmount()
  })

  it('runs the enter hooks when shown', async () => {
    const wrapper = mountCollapse(false)
    const el = wrapper.find('.panel').element
    el.style.paddingTop = '4px'

    await wrapper.setProps({ open: true })
    await nextTick()

    // beforeEnter + enter
    expect(el.classList.contains('collapse-transition')).toBe(true)
    expect(el.style.height).toBe('50px')
    expect(el.style.overflow).toBe('hidden')
    expect(el.style.paddingTop).toBe('4px')
    expect(el.dataset.oldPaddingTop).toBe('4px')
    expect(el.dataset.oldOverflow).toBe('')

    // afterEnter
    await frame()
    expect(el.classList.contains('collapse-transition')).toBe(false)
    expect(el.style.height).toBe('')
    wrapper.unmount()
  })

  it('runs the leave hooks when hidden', async () => {
    const wrapper = mountCollapse(true)
    const el = wrapper.find('.panel').element

    await wrapper.setProps({ open: false })
    await nextTick()

    // beforeLeave + leave
    expect(el.classList.contains('collapse-transition')).toBe(true)
    expect(el.style.height).toMatch(/^0(px)?$/)
    expect(el.style.overflow).toBe('hidden')

    // afterLeave
    await frame()
    expect(el.classList.contains('collapse-transition')).toBe(false)
    expect(el.style.height).toBe('')
    expect(el.style.display).toBe('none')
    wrapper.unmount()
  })

  it('restores its own padding and overflow when re-opened while closing', async () => {
    const wrapper = mountCollapse(true)
    const el = wrapper.find('.panel').element
    el.style.paddingTop = '4px'

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(el.style.paddingTop).toBe('0px')

    // before the leave finishes
    await wrapper.setProps({ open: true })
    await nextTick()
    await frame()

    expect(el.style.paddingTop).toBe('4px')
    expect(el.style.paddingBottom).toBe('')
    expect(el.style.overflow).toBe('')
    expect(el.style.height).toBe('')
    expect(el.classList.contains('collapse-transition')).toBe(false)
    expect(el.style.display).toBe('')

    // a later close/open cycle still ends on the element's own styles
    await wrapper.setProps({ open: false })
    await frame()
    await wrapper.setProps({ open: true })
    await frame()
    expect(el.style.paddingTop).toBe('4px')
    expect(el.style.overflow).toBe('')
    wrapper.unmount()
  })
})
