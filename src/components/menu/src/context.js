import { createContext } from '../../../utils/context'

/**
 * Provided by `AtMenu` as
 * `reactive({ mode, theme, inlineCollapsed, activeName, children, register, unregister, select })`.
 * `activeName` — current active item name (`-1` when nothing is active, as in 1.x).
 * `children` — top-level `AtSubmenu`s (registered via `useChild`, `exposed = { close }`),
 * closed together in `inlineCollapsed` mode. `select(item)` takes `{ name, to, replace }`
 * and emits `on-select` from the menu.
 */
export const MenuContext = createContext('AtMenu')

/**
 * Provided by every `AtSubmenu` as `reactive({ children, register, unregister, select })`.
 * Nested `AtMenuItem`s and `AtSubmenu`s register via `useChild` with `exposed = reactive({ active })`;
 * the submenu is highlighted when any registered child is active (recursively).
 * `select()` is called by a nested item on click: closes the popup (non-inline modes)
 * and bubbles up to the parent submenu.
 */
export const SubmenuContext = createContext('AtSubmenu')
