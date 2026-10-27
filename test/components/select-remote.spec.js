import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../helpers/mount.js'
import AtSelect from '../../src/components/select'

// A fake server: every request stays pending until the test resolves it.
function createServer() {
  const requests = []
  const fetch = vi.fn(
    (query, page) =>
      new Promise(resolve => {
        requests.push({ query, page, resolve })
      }),
  )
  return { requests, fetch, last: () => requests[requests.length - 1] }
}

const page = (prefix, from, count) =>
  Array.from({ length: count }, (_, i) => ({
    value: `${prefix}${from + i}`,
    label: `${prefix} ${from + i}`,
  }))

let wrapper
let server

// The consumer pattern from the docs: the select owns the search lifecycle, the consumer owns
// the options and drops responses whose `signal` is aborted.
async function mountRemote({ attrs = '', value = '', slots = '', data = {} } = {}) {
  wrapper = mount(
    {
      data: () => ({ value, items: [], page: 0, hasMore: false, loadingMore: false, ...data }),
      methods: {
        async search(query, { signal }) {
          const response = await server.fetch(query, 1)
          if (signal.aborted) return
          this.items = response.items
          this.page = 1
          this.hasMore = response.hasMore
        },
        async loadMore({ query, signal }) {
          if (!this.hasMore) return
          this.loadingMore = true
          try {
            const response = await server.fetch(query, this.page + 1)
            if (signal.aborted) return
            this.items.push(...response.items)
            this.page += 1
            this.hasMore = response.hasMore
          } finally {
            this.loadingMore = false
          }
        },
      },
      template: `
        <at-select v-model="value" remote :remote-method="search" :loading="loadingMore"
          @on-load-more="loadMore" ${attrs}>
          <at-option v-for="item in items" :key="item.value" :value="item.value" :label="item.label" />
          ${slots}
        </at-select>`,
    },
    { attachTo: document.body },
  )
  await nextTick()
  return wrapper
}

const select = () => wrapper.getComponent(AtSelect)
const dropdown = () => wrapper.find('.at-select__dropdown')
const isOpen = () => dropdown().element.style.display !== 'none'
const input = () => wrapper.find('.at-select__input')
const labels = () =>
  wrapper
    .findAll('.at-select__option')
    .filter(o => o.element.style.display !== 'none')
    .map(o => o.text())
const notFound = () => wrapper.find('.at-select__not-found')
const notFoundShown = () => notFound().element.style.display !== 'none'
const loadingRow = () => wrapper.find('.at-select__loading')

async function flush() {
  for (let i = 0; i < 5; i++) await nextTick()
}

async function open() {
  await wrapper.find('.at-select__selection').trigger('click')
}

async function respond(request, items, hasMore = false) {
  request.resolve({ items, hasMore })
  await flush()
}

async function type(text) {
  const el = input().element
  el.value = text
  await input().trigger('input')
}

async function key(k) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
  await nextTick()
}

// happy-dom has no layout: the dropdown is 100px high, its content `height()` px.
function stubScroll(height) {
  const el = dropdown().element
  const state = { scrollTop: 0, height }
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => 100 })
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => state.height() })
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => state.scrollTop,
    set: v => {
      state.scrollTop = v
    },
  })
  return state
}

async function scrollTo(state, top) {
  state.scrollTop = top
  await dropdown().trigger('scroll')
  await flush()
}

describe('AtSelect remote mode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    server = createServer()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
  })

  it('searches with an empty query on open and shows the loading state until it settles', async () => {
    await mountRemote()
    expect(wrapper.find('.at-select').classes()).toContain('at-select--single')
    expect(input().exists()).toBe(true)
    expect(server.fetch).not.toHaveBeenCalled()

    await open()
    expect(isOpen()).toBe(true)
    expect(server.fetch).toHaveBeenCalledTimes(1)
    expect(server.last().query).toBe('')
    expect(notFoundShown()).toBe(true)
    expect(notFound().text()).toBe('Loading')

    await respond(server.last(), page('a', 1, 3))
    expect(labels()).toEqual(['a 1', 'a 2', 'a 3'])
    expect(notFoundShown()).toBe(false)
    expect(loadingRow().exists()).toBe(false)
  })

  it('debounces typing and calls remoteMethod with the last query only', async () => {
    await mountRemote({ attrs: ':debounce="200"' })
    await type('s')
    expect(isOpen()).toBe(true)
    await type('sh')
    vi.advanceTimersByTime(150)
    await type('she')
    vi.advanceTimersByTime(199)
    expect(server.fetch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(server.fetch).toHaveBeenCalledTimes(1)
    expect(server.last().query).toBe('she')
  })

  it('does not filter remote options locally', async () => {
    await mountRemote()
    await type('zzz')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('a', 1, 2))

    expect(labels()).toEqual(['a 1', 'a 2'])
    expect(notFoundShown()).toBe(false)
  })

  it('aborts the previous search: a late old response does not overwrite the new one', async () => {
    await mountRemote()
    await type('old')
    vi.advanceTimersByTime(300)
    await type('new')
    vi.advanceTimersByTime(300)
    expect(server.requests.map(r => r.query)).toEqual(['old', 'new'])

    const [oldRequest, newRequest] = server.requests
    await respond(newRequest, page('new', 1, 2))
    expect(labels()).toEqual(['new 1', 'new 2'])
    expect(loadingRow().exists()).toBe(false)

    await respond(oldRequest, page('old', 1, 5))
    expect(labels()).toEqual(['new 1', 'new 2'])
  })

  it('keeps the loading state while the latest search is pending, whatever settles first', async () => {
    await mountRemote()
    await type('a')
    vi.advanceTimersByTime(300)
    await type('ab')
    vi.advanceTimersByTime(300)

    // the superseded request settles first: still loading
    server.requests[0].resolve({ items: page('a', 1, 2), hasMore: false })
    await flush()
    expect(notFound().text()).toBe('Loading')

    await respond(server.requests[1], [])
    expect(notFound().text()).toBe('No matching data')
  })

  it('passes an AbortSignal that is aborted by a newer search and on unmount', async () => {
    const calls = []
    wrapper = mount(
      {
        methods: {
          search(query, context) {
            calls.push(context.signal)
            return new Promise(() => {})
          },
        },
        template: '<at-select remote :remote-method="search" />',
      },
      { attachTo: document.body },
    )
    await open()
    await type('x')
    vi.advanceTimersByTime(300)

    expect(calls).toHaveLength(2)
    expect(calls[0].aborted).toBe(true)
    expect(calls[1].aborted).toBe(false)

    wrapper.unmount()
    wrapper = null
    expect(calls[1].aborted).toBe(true)
  })

  it('drops a pending debounced search when the dropdown closes', async () => {
    await mountRemote()
    await type('abc')
    await key('Escape')
    expect(isOpen()).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(server.fetch).not.toHaveBeenCalled()
  })

  it('emits on-load-more at the end of the list once per page, with the query and signal', async () => {
    await mountRemote()
    const state = stubScroll(() => wrapper.findAll('.at-select__option').length * 30)
    await type('a')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('a', 1, 10), true)

    // 300px of content in a 100px dropdown: not at the end yet
    expect(select().emitted('on-load-more')).toBeUndefined()
    await scrollTo(state, 100)
    expect(select().emitted('on-load-more')).toBeUndefined()

    await scrollTo(state, 185)
    const events = select().emitted('on-load-more')
    expect(events).toHaveLength(1)
    expect(events[0][0].query).toBe('a')
    expect(events[0][0].signal).toBeInstanceOf(AbortSignal)
    expect(server.last()).toMatchObject({ query: 'a', page: 2 })

    // the consumer is loading the next page: built-in loading row, no repeated event
    expect(loadingRow().exists()).toBe(true)
    expect(loadingRow().text()).toBe('Loading')
    await scrollTo(state, 200)
    expect(select().emitted('on-load-more')).toHaveLength(1)

    await respond(server.last(), page('a', 11, 10), false)
    expect(labels()).toHaveLength(20)
    expect(loadingRow().exists()).toBe(false)

    // the list grew: the end is far again, the next event needs scrolling down
    expect(select().emitted('on-load-more')).toHaveLength(1)
    await scrollTo(state, 500)
    expect(select().emitted('on-load-more')).toHaveLength(2)
    // nothing more on the server: the consumer ignores it, the list does not change
    expect(server.requests).toHaveLength(2)
    await scrollTo(state, 490)
    expect(select().emitted('on-load-more')).toHaveLength(2)

    // a new search starts from the top of the list
    await type('b')
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(state.scrollTop).toBe(0)
  })

  it('emits on-load-more right away when the loaded page does not fill the dropdown', async () => {
    await mountRemote()
    stubScroll(() => wrapper.findAll('.at-select__option').length * 30)
    await open()
    await respond(server.last(), page('a', 1, 2), true)

    expect(select().emitted('on-load-more')).toHaveLength(1)
    await respond(server.last(), page('a', 3, 2), false)
    expect(labels()).toEqual(['a 1', 'a 2', 'a 3', 'a 4'])
  })

  it('a page of an aborted search is not appended to the new results', async () => {
    await mountRemote()
    stubScroll(() => 0)
    await open()
    await respond(server.last(), page('a', 1, 2), true)
    const pageRequest = server.last()
    expect(pageRequest.page).toBe(2)

    await type('b')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('b', 1, 1), false)
    await respond(pageRequest, page('a', 3, 2), false)

    expect(labels()).toEqual(['b 1'])
  })

  it('does not emit on-load-more for an empty result or a closed dropdown', async () => {
    await mountRemote()
    stubScroll(() => 0)
    await open()
    await respond(server.last(), [])
    expect(select().emitted('on-load-more')).toBeUndefined()

    await key('Escape')
    wrapper.vm.items = page('a', 1, 2)
    await flush()
    expect(select().emitted('on-load-more')).toBeUndefined()
  })

  it('shows a selected value whose option is not loaded via fallbackLabel', async () => {
    await mountRemote({
      value: 42,
      attrs: ':fallback-label="v => `Task #${v}`"',
    })
    expect(input().element.value).toBe('Task #42')

    // the option arrives: its own label wins
    wrapper.vm.items = [{ value: 42, label: 'Write docs' }]
    await flush()
    expect(input().element.value).toBe('Write docs')
  })

  it('keeps the label of a picked option after the results are replaced', async () => {
    await mountRemote()
    await type('a')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('a', 1, 3))

    await wrapper.findAll('.at-select__option')[1].trigger('click')
    expect(wrapper.vm.value).toBe('a2')
    expect(select().emitted('on-change')).toEqual([['a2']])
    expect(isOpen()).toBe(false)
    expect(input().element.value).toBe('a 2')

    await open()
    await respond(server.last(), page('b', 1, 2))
    expect(labels()).toEqual(['b 1', 'b 2'])
    await key('Escape')
    vi.advanceTimersByTime(300)
    await flush()
    expect(input().element.value).toBe('a 2')

    // a value set by the parent that was never loaded: no stale label
    wrapper.vm.value = 'b9'
    await flush()
    expect(input().element.value).toBe('')
  })

  it('carries the remembered label in on-change with valueWithLabel', async () => {
    await mountRemote({ attrs: 'value-with-label multiple' })
    await open()
    await respond(server.last(), page('a', 1, 2))
    await wrapper.findAll('.at-select__option')[0].trigger('click')

    await type('b')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('b', 1, 2))
    await wrapper.findAll('.at-select__option')[1].trigger('click')

    expect(select().emitted('on-change')[1]).toEqual([
      [
        { value: 'a1', label: 'a 1' },
        { value: 'b2', label: 'b 2' },
      ],
    ])
  })

  it('multiple: picks from several searches, keeps tags and the query', async () => {
    await mountRemote({
      value: ['x1'],
      attrs: 'multiple :fallback-label="v => v.toUpperCase()"',
    })
    const tags = () => wrapper.findAll('.at-tag__text').map(t => t.text())
    expect(wrapper.find('.at-select').classes()).toContain('at-select--multiple')
    expect(tags()).toEqual(['X1'])

    await type('a')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('a', 1, 3))
    await wrapper.findAll('.at-select__option')[0].trigger('click')
    await wrapper.findAll('.at-select__option')[2].trigger('click')

    expect(isOpen()).toBe(true)
    expect(input().element.value).toBe('a')
    expect(labels()).toEqual(['a 1', 'a 2', 'a 3'])
    expect(wrapper.vm.value).toEqual(['x1', 'a1', 'a3'])
    expect(server.fetch).toHaveBeenCalledTimes(1)

    await type('b')
    vi.advanceTimersByTime(300)
    await respond(server.last(), page('b', 1, 2))
    expect(tags()).toEqual(['X1', 'a 1', 'a 3'])

    // deselecting a loaded option and removing a tag of an unloaded one
    await wrapper.findAll('.at-select__option')[0].trigger('click')
    expect(wrapper.vm.value).toEqual(['x1', 'a1', 'a3', 'b1'])
    await wrapper.findAll('.at-tag__close')[1].trigger('click')
    expect(wrapper.vm.value).toEqual(['x1', 'a3', 'b1'])
    expect(tags()).toEqual(['X1', 'a 3', 'b 1'])
  })

  it('clears a single remote select', async () => {
    await mountRemote({ value: 7, attrs: 'clearable :fallback-label="() => \'Seven\'"' })
    expect(input().element.value).toBe('Seven')
    expect(wrapper.find('.at-select').classes()).toContain('at-select--show-clear')

    await wrapper.find('.at-select__clear').trigger('click')
    expect(wrapper.vm.value).toBe('')
    expect(select().emitted('on-change')).toEqual([['']])
    expect(input().element.value).toBe('')
    expect(wrapper.find('.at-select').classes()).not.toContain('at-select--show-clear')
  })

  describe('clearing during a search', () => {
    const attrs = 'clearable :fallback-label="() => \'Seven\'"'
    const clear = () => wrapper.find('.at-select__clear').trigger('click')

    it('drops the debounced query and searches with an empty one when open', async () => {
      await mountRemote({ value: 7, attrs })
      stubScroll(() => 0)
      await open()
      await respond(server.last(), page('a', 1, 2), true)
      // page 2 of the '' search, the last one
      expect(server.last()).toMatchObject({ query: '', page: 2 })
      await respond(server.last(), page('a', 3, 2), false)

      await type('abc')
      await clear()
      expect(wrapper.vm.value).toBe('')
      expect(input().element.value).toBe('')
      vi.advanceTimersByTime(1000)

      expect(server.requests.map(r => [r.query, r.page])).toEqual([
        ['', 1],
        ['', 2],
        ['', 1],
      ])
      await respond(server.last(), page('b', 1, 2), true)
      expect(labels()).toEqual(['b 1', 'b 2'])
      // pagination follows the empty query, not the erased text
      expect(server.last()).toMatchObject({ query: '', page: 2 })
    })

    it('aborts the request in flight and searches with an empty query when open', async () => {
      await mountRemote({ value: 7, attrs })
      await open()
      await respond(server.last(), page('a', 1, 2))
      await type('abc')
      vi.advanceTimersByTime(300)
      const stale = server.last()
      expect(stale.query).toBe('abc')

      await clear()
      expect(server.last().query).toBe('')
      await respond(server.last(), page('b', 1, 2))
      await respond(stale, page('abc', 1, 3))
      expect(labels()).toEqual(['b 1', 'b 2'])
    })

    it('aborts the request in flight and ends the loading state when closed', async () => {
      await mountRemote({ value: 7, attrs })
      await open()
      await respond(server.last(), page('a', 1, 2))
      await type('abc')
      vi.advanceTimersByTime(300)
      const stale = server.last()
      await key('Escape')
      expect(isOpen()).toBe(false)

      await clear()
      expect(server.requests).toHaveLength(2)
      await respond(stale, page('abc', 1, 3))
      expect(labels()).toEqual(['a 1', 'a 2'])
      expect(loadingRow().exists()).toBe(false)
    })
  })

  it('navigates loaded pages with the keyboard and loads more at the last option', async () => {
    await mountRemote()
    const state = stubScroll(() => wrapper.findAll('.at-select__option').length * 30)
    // keyboard scrolling of the focused option: rows of 30px from the top of the dropdown
    const placeOptions = () => {
      dropdown().element.getBoundingClientRect = () => ({ top: 0, height: 100 })
      wrapper.findAll('.at-select__option').forEach((option, i) => {
        option.element.getBoundingClientRect = () => ({
          top: i * 30 - state.scrollTop,
          height: 30,
        })
      })
    }
    await open()
    await respond(server.last(), page('a', 1, 5), true)
    placeOptions()

    for (let i = 0; i < 4; i++) await key('ArrowDown')
    expect(state.scrollTop).toBe(20)
    expect(select().emitted('on-load-more')).toBeUndefined()
    await key('ArrowDown')
    // the last option is scrolled into view: the end of the list is reached
    expect(state.scrollTop).toBe(50)
    expect(select().emitted('on-load-more')).toHaveLength(1)

    await respond(server.last(), page('a', 6, 2), false)
    placeOptions()
    await key('ArrowDown')
    expect(wrapper.findAll('.at-select__option')[5].classes()).toContain('at-select__option--focus')
    await key('Enter')
    expect(wrapper.vm.value).toBe('a6')
    expect(isOpen()).toBe(false)
  })

  it('Enter does not pick a stale result while the new search is pending', async () => {
    await mountRemote()
    await open()
    await respond(server.last(), page('a', 1, 2))

    await type('b')
    await key('Enter')
    expect(wrapper.vm.value).toBe('')

    vi.advanceTimersByTime(300)
    await key('Enter')
    expect(wrapper.vm.value).toBe('')

    await respond(server.last(), page('b', 1, 2))
    await key('Enter')
    expect(wrapper.vm.value).toBe('b1')
  })

  it('a new query drops the keyboard highlight: Enter does not pick a previous result', async () => {
    await mountRemote()
    await open()
    await respond(server.last(), page('a', 1, 3))
    await key('ArrowDown')
    await key('ArrowDown')
    expect(wrapper.findAll('.at-select__option')[1].classes()).toContain('at-select__option--focus')

    // during the debounce
    await type('b')
    expect(wrapper.find('.at-select__option--focus').exists()).toBe(false)
    await key('Enter')
    expect(wrapper.vm.value).toBe('')
    expect(isOpen()).toBe(true)

    // highlighted again while the request is in flight: the old list cannot be picked
    vi.advanceTimersByTime(300)
    await key('ArrowDown')
    await key('Enter')
    expect(wrapper.vm.value).toBe('')
    expect(isOpen()).toBe(true)

    // the search was not cancelled: its results arrive and can be picked
    expect(server.last().query).toBe('b')
    await respond(server.last(), page('b', 1, 2))
    await key('ArrowDown')
    await key('Enter')
    expect(wrapper.vm.value).toBe('b1')
  })

  it('placement top: the dropdown is re-positioned when results and loading change', async () => {
    await mountRemote({ attrs: 'placement="top"' })
    // happy-dom has no layout: the field is at y=100, the dropdown is 40px high when empty
    // (the loading text), 30px per option otherwise, plus 30px for the loading row
    const trigger = wrapper.find('.at-select__selection').element
    Object.defineProperty(trigger, 'offsetTop', { configurable: true, get: () => 100 })
    Object.defineProperty(trigger, 'offsetHeight', { configurable: true, get: () => 30 })
    Object.defineProperty(dropdown().element, 'offsetHeight', {
      configurable: true,
      get: () => {
        const count = wrapper.findAll('.at-select__option').length
        return (count ? count * 30 : 40) + (count && loadingRow().exists() ? 30 : 0)
      },
    })
    const top = () => dropdown().element.style.top

    await open()
    await flush()
    expect(top()).toBe('60px')

    await respond(server.last(), page('a', 1, 3))
    expect(top()).toBe('10px')

    // the consumer's loading flag adds the loading row under the list
    wrapper.vm.loadingMore = true
    await flush()
    expect(top()).toBe('-20px')
    wrapper.vm.loadingMore = false
    await flush()
    expect(top()).toBe('10px')
  })

  it('renders #empty and #footer slots with the query and the loading state', async () => {
    await mountRemote({
      slots: `
        <template #empty="{ query, loading }">
          <span class="empty">{{ loading ? 'wait' : 'none for ' + query }}</span>
        </template>
        <template #footer="{ query, loading }">
          <button type="button" class="create">create {{ query }} {{ loading }}</button>
        </template>`,
    })
    await type('cat')
    expect(wrapper.find('.create').text()).toBe('create cat false')
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(wrapper.find('.empty').text()).toBe('wait')
    expect(wrapper.find('.create').text()).toBe('create cat true')

    await respond(server.last(), [])
    expect(wrapper.find('.empty').text()).toBe('none for cat')
    expect(wrapper.find('.at-select__footer .create').exists()).toBe(true)
  })

  it('keys on controls in #footer and #empty are theirs, not option navigation', async () => {
    await mountRemote({
      slots: `
        <template #empty><button type="button" class="retry">retry</button></template>
        <template #footer><button type="button" class="create">create</button></template>`,
    })
    await open()
    await respond(server.last(), page('a', 1, 3))
    await key('ArrowDown')
    const highlighted = () => wrapper.find('.at-select__option--focus').text()
    expect(highlighted()).toBe('a 1')

    const press = async (el, k) => {
      el.focus()
      const evt = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
      el.dispatchEvent(evt)
      await nextTick()
      return evt
    }
    const create = wrapper.find('.create').element
    expect((await press(create, 'ArrowDown')).defaultPrevented).toBe(false)
    expect(highlighted()).toBe('a 1')
    expect((await press(create, 'Enter')).defaultPrevented).toBe(false)
    expect(wrapper.vm.value).toBe('')
    expect(isOpen()).toBe(true)

    await type('zzz')
    vi.advanceTimersByTime(300)
    await respond(server.last(), [])
    expect((await press(wrapper.find('.retry').element, 'Enter')).defaultPrevented).toBe(false)
    expect(isOpen()).toBe(true)

    // Escape still closes the dropdown
    await press(create, 'Escape')
    expect(isOpen()).toBe(false)
  })

  it('a click on a footer control keeps the query in the input', async () => {
    await mountRemote({
      slots: '<template #footer><button type="button" class="act">go</button></template>',
    })
    await type('cat')
    wrapper.find('.act').element.focus()
    await input().trigger('blur')
    vi.advanceTimersByTime(300)
    await flush()
    expect(input().element.value).toBe('cat')

    // focus left the select: the input shows the selection again
    document.body.focus()
    wrapper.find('.act').element.blur()
    await input().trigger('blur')
    vi.advanceTimersByTime(300)
    await flush()
    expect(input().element.value).toBe('')
  })

  it('uses loadingText and the loading prop', async () => {
    await mountRemote({ attrs: 'loading-text="Fetching"' })
    await open()
    expect(notFound().text()).toBe('Fetching')
    await respond(server.last(), page('a', 1, 1))

    wrapper.vm.loadingMore = true
    await nextTick()
    expect(loadingRow().text()).toBe('Fetching')
  })

  it('works without remoteMethod (options managed outside)', async () => {
    wrapper = mount(
      {
        data: () => ({ value: '' }),
        template:
          '<at-select v-model="value" remote><at-option value="1">One</at-option></at-select>',
      },
      { attachTo: document.body },
    )
    await open()
    expect(labels()).toEqual(['One'])
    expect(loadingRow().exists()).toBe(false)
  })
})

describe('AtSelect new options outside remote mode', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('fallbackLabel shows a value without an option; filtering still works locally', async () => {
    wrapper = mount(
      {
        data: () => ({ value: 'z' }),
        template: `
          <at-select v-model="value" filterable :fallback-label="v => 'Value ' + v">
            <at-option value="1">One</at-option>
            <at-option value="2">Two</at-option>
          </at-select>`,
      },
      { attachTo: document.body },
    )
    await nextTick()
    expect(input().element.value).toBe('Value z')

    await type('tw')
    expect(labels()).toEqual(['Two'])
    expect(select().emitted('on-load-more')).toBeUndefined()
  })

  it('without fallbackLabel a value without an option shows nothing (as before)', async () => {
    wrapper = mount(
      {
        data: () => ({ value: ['1', 'z'] }),
        template: `
          <at-select v-model="value" multiple>
            <at-option value="1">One</at-option>
          </at-select>`,
      },
      { attachTo: document.body },
    )
    await nextTick()
    expect(wrapper.findAll('.at-tag__text').map(t => t.text())).toEqual(['One'])
  })

  it('renders #empty and #footer slots in local mode', async () => {
    wrapper = mount(
      {
        data: () => ({ value: '' }),
        template: `
          <at-select v-model="value" filterable>
            <at-option value="1">One</at-option>
            <template #empty="{ query }">Nothing like {{ query }}</template>
            <template #footer>Footer</template>
          </at-select>`,
      },
      { attachTo: document.body },
    )
    await nextTick()
    expect(wrapper.find('.at-select__footer').text()).toBe('Footer')

    await type('x')
    expect(notFound().text()).toBe('Nothing like x')
    expect(notFoundShown()).toBe(true)
  })

  it('renders no footer without the slot', async () => {
    wrapper = mount(
      { template: '<at-select><at-option value="1">One</at-option></at-select>' },
      { attachTo: document.body },
    )
    await nextTick()
    expect(wrapper.find('.at-select__footer').exists()).toBe(false)
    expect(wrapper.find('.at-select__loading').exists()).toBe(false)
  })
})
