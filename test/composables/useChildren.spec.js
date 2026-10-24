/* eslint-disable vue/one-component-per-file -- test fixtures: parent + child pair */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, reactive, ref, toRef } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { createContext } from '../../src/utils/context.js'
import { useChild, useChildren } from '../../src/composables/useChildren.js'

const ListContext = createContext('TestList')

const List = defineComponent({
  setup(_, { slots, expose }) {
    const { children, register, unregister } = useChildren()
    ListContext.provide(reactive({ children, register, unregister }))
    expose({ names: () => children.map(c => c.exposed.name) })
    return () => h('ul', slots.default?.())
  },
})

const Item = defineComponent({
  props: { name: String },
  setup(props) {
    const { index } = useChild(ListContext.inject(null), reactive({ name: toRef(props, 'name') }))
    return () => h('li', `${props.name}:${index.value}`)
  },
})

describe('createContext', () => {
  it('returns the fallback when no parent provides the key', () => {
    let injected
    mount({
      setup() {
        injected = ListContext.inject(null)
        return () => null
      },
    })
    expect(injected).toBeNull()
    expect(typeof ListContext.key).toBe('symbol')
  })
})

describe('useChildren', () => {
  it('keeps children in DOM order and updates on unmount', async () => {
    const show = ref(false)
    const wrapper = mount({
      setup: () => () =>
        h(List, null, () => [
          h(Item, { name: 'a' }),
          show.value ? h(Item, { name: 'b' }) : null,
          h(Item, { name: 'c' }),
        ]),
    })
    const list = wrapper.getComponent(List)

    await nextTick()
    expect(list.vm.names()).toEqual(['a', 'c'])
    expect(wrapper.text()).toBe('a:0c:1')

    show.value = true
    await nextTick()
    await nextTick()
    expect(list.vm.names()).toEqual(['a', 'b', 'c'])
    expect(wrapper.text()).toBe('a:0b:1c:2')

    show.value = false
    await nextTick()
    await nextTick()
    expect(list.vm.names()).toEqual(['a', 'c'])
    expect(wrapper.text()).toBe('a:0c:1')
  })

  it('knows the index on the first render, before mount (no -1 frame, SSR)', async () => {
    const App = {
      setup: () => () => h(List, null, () => [h(Item, { name: 'a' }), h(Item, { name: 'b' })]),
    }

    // first synchronous render, before the post-mount re-sort is flushed
    const wrapper = mount(App)
    expect(wrapper.text()).toBe('a:0b:1')

    // no onMounted on the server
    expect(await renderToString(h(App))).toContain('<li>a:0</li><li>b:1</li>')
  })

  it('is a no-op without a parent', () => {
    const wrapper = mount(Item, { props: { name: 'solo' } })
    expect(wrapper.text()).toBe('solo:-1')
  })
})
