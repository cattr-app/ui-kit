import { computed, getCurrentInstance, onBeforeUnmount, onMounted, shallowReactive } from 'vue'

/**
 * Ordered registry of child components for parents that need their children's index
 * (Tabs/TabPane, Steps/Step, Timeline/TimelineItem, Collapse/CollapseItem, Select/Option, Menu/MenuItem).
 * Replaces the Vue 2 child-list lookups (walking the instance tree from the parent).
 *
 *   // parent setup()
 *   const { children, register, unregister } = useChildren()
 *   TabsContext.provide(reactive({ activeName, register, unregister, children }))
 *
 *   // child setup()
 *   const { parent, index } = useChild(TabsContext.inject(null), { name: toRef(props, 'name') })
 *
 * @template T
 * @returns {{
 *   children: Array<{ uid: number, el: Node, exposed: T }>,
 *   register: (child: { uid: number, el: Node, exposed: T }) => void,
 *   unregister: (uid: number) => void,
 *   sort: () => void,
 * }}
 *   `children` is a `shallowReactive` array kept in DOM order (`Node.compareDocumentPosition`),
 *   so `children.length`, `children.map(c => c.exposed)` and `indexOf` are reactive.
 *   `register` is idempotent per `uid`: the first call adds the child, later calls (once its
 *   `el` is known) only re-sort. Entries without `el` keep their registration order.
 *   If children can be reordered in place (keyed `v-for` shuffle without remount),
 *   call `sort()` from the parent's `onUpdated`.
 */
export function useChildren() {
  const children = shallowReactive([])

  function compare(a, b) {
    if (a.el === b.el || !a.el || !b.el) return 0
    return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  }

  function sort() {
    const sorted = [...children].sort(compare)
    if (sorted.some((child, i) => child !== children[i])) {
      children.splice(0, children.length, ...sorted)
    }
  }

  function register(child) {
    if (!children.some(c => c.uid === child.uid)) children.push(child)
    sort()
  }

  function unregister(uid) {
    const i = children.findIndex(c => c.uid === uid)
    if (i !== -1) children.splice(i, 1)
  }

  return { children, register, unregister, sort }
}

/**
 * Child side of `useChildren`: registers the current component in `parent` right in
 * `setup()` (so the very first render, and SSR, already see the right `index`), re-sorts
 * by DOM position on mount and removes it before unmount. Call inside `setup()`.
 *
 * Children created in one render pass run `setup()` in tree order, so their initial
 * index matches the DOM. A child inserted later between existing ones is appended first
 * and moves to its DOM position on mount (one extra parent update).
 *
 * @template P, T
 * @param {P & { children: Array<{ exposed: T }>, register: Function, unregister: Function } | null} parent
 *   Context injected from the parent (`Ctx.inject(null)`); `null` → no-op, `index` stays `-1`.
 * @param {T} [exposed] What the parent sees as `children[i].exposed` (default: the component proxy).
 * @returns {{ parent: P | null, index: import('vue').ComputedRef<number> }}
 *   `index` — position among the parent's registered children in DOM order; `-1` without a parent.
 */
export function useChild(parent, exposed) {
  const instance = getCurrentInstance()
  const uid = instance.uid
  const entry = { uid, el: null, exposed: exposed === undefined ? instance.proxy : exposed }

  if (parent) parent.register(entry)

  onMounted(() => {
    if (!parent) return
    entry.el = instance.proxy.$el
    parent.register(entry)
  })

  onBeforeUnmount(() => {
    if (parent) parent.unregister(uid)
  })

  const index = computed(() => (parent ? parent.children.indexOf(entry) : -1))

  return { parent, index }
}

export default useChildren
