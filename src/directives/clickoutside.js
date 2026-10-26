/**
 * Directive - clickoutside
 * Calls `binding.value(event)` when a click happens outside of the bound element.
 *
 *   <div v-clickoutside="handleClose">...</div>
 */
const states = new WeakMap()

export const vClickoutside = {
  mounted(el, binding) {
    const state = {
      callback: binding.value,
      handler: evt => {
        if (el.contains(evt.target)) return
        if (typeof state.callback === 'function') {
          state.callback(evt)
        }
      },
    }

    states.set(el, state)
    document.addEventListener('click', state.handler)
  },
  updated(el, binding) {
    // the callback may change between renders; the document listener stays the same
    const state = states.get(el)
    if (state) state.callback = binding.value
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return

    document.removeEventListener('click', state.handler)
    states.delete(el)
  },
}

export default vClickoutside
