import { createVNode, render } from 'vue'
import { getCurrentApp } from './context.js'

/**
 * Mount a component imperatively (outside the app's component tree) and move its root
 * element into `document.body`. Replaces the Vue 2 extend/mount/destroy constructor flow.
 *
 *   const service = mountService(MessageVue, { message: 'hi', onDestroy: () => service.unmount() })
 *   service.update({ top: 24 })   // patch props, the component instance is kept
 *   service.unmount()             // unmount the component and remove `el` from the DOM
 *
 * `appContext` defaults to the context of the last app that ran `app.use(CattrUI)`
 * (`getCurrentApp()._context`), so globally registered `<at-*>` components,
 * `globalProperties` and app-level `provide` resolve inside the service. Without it
 * (service called before `app.use`) they do not.
 *
 * Props: listeners are passed as `onXxx` props (`onClose`, `onDestroy`). A `reactive`
 * object passed as props is copied by `createVNode`, so mutating it later does nothing.
 * To change props call `update(patch)`: it merges `patch` into the current props and
 * re-renders `createVNode(Component, props)` into the same container; Vue patches the
 * existing instance (same type/key), so state, `instance` and `el` stay the same.
 *
 * @param {object} Component  component options / SFC
 * @param {object} [props]    initial props and `onXxx` listeners
 * @param {{ appContext?: import('vue').AppContext | null }} [options]
 * @returns {{
 *   instance: import('vue').ComponentInternalInstance,
 *   vm: import('vue').ComponentPublicInstance,
 *   el: Element,
 *   update(patch: object): void,
 *   unmount(): void,
 * } | null}  `null` without a DOM (SSR).
 */
export function mountService(Component, props = {}, { appContext } = {}) {
  if (typeof window === 'undefined') return null

  const context = appContext ?? getCurrentApp()?._context ?? null
  const container = document.createElement('div')
  let currentProps = { ...props }
  let mounted = true

  const renderVNode = () => {
    const vnode = createVNode(Component, currentProps)
    vnode.appContext = context
    render(vnode, container)
    return vnode
  }

  const vnode = renderVNode()
  const el = vnode.el
  // Teleport the root element; Vue keeps patching it by reference.
  document.body.appendChild(el)

  return {
    instance: vnode.component,
    vm: vnode.component.proxy,
    el,
    update(patch) {
      if (!mounted) return
      currentProps = { ...currentProps, ...patch }
      renderVNode()
    },
    unmount() {
      if (!mounted) return
      mounted = false
      render(null, container)
      el.remove()
    },
  }
}
