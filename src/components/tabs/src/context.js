import { createContext } from '../../../utils/context'

/**
 * Provided by `AtTabs` as `reactive({ activeKey, animated, closable, children, register, unregister })`.
 * `activeKey` — name of the active pane (`modelValue`, or the first pane's name when empty).
 * `AtTabPane` injects it with `null` fallback and registers via `useChild` with
 * `reactive({ name, label, icon, disabled, closable })`; `AtTabs` builds the nav from `children[i].exposed`.
 */
export const TabsContext = createContext('AtTabs')
