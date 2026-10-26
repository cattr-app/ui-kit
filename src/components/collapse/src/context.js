import { createContext } from '../../../utils/context'

/**
 * Provided by `AtCollapse` as `reactive({ activeKeys, accordion, children, register, unregister, toggle })`.
 * `activeKeys` — normalized active names (strings; one at most in accordion mode).
 * `AtCollapseItem` injects it with `null` fallback and registers via `useChild` to get its index.
 */
export const CollapseContext = createContext('AtCollapse')
