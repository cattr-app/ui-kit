import { createContext } from '../../../utils/context'

/**
 * Provided by `AtSelect` as
 * `reactive({ modelValue, multiple, filterable, valueWithLabel, query, focusUid,
 *             children, register, unregister, select, isSelected, blur })`.
 *
 * - `modelValue` — current selection (internal copy of the prop: value, or array for `multiple`).
 * - `filterable` — local filtering is on (`filterable` and not `remote`: remote options are not filtered).
 * - `query` — active filter text (`''` when not filtering); `AtOption` hides itself when its label does not match.
 * - `focusUid` — uid of the option highlighted with the keyboard (`null` when none).
 * - `children` / `register` / `unregister` — `useChildren()` registry; each `AtOption` registers
 *   `reactive({ uid, value, label, disabled, hidden })` via `useChild`, in DOM order.
 * - `select(value)` — option click; `isSelected(value)`; `blur(uid)` — drop keyboard focus from an option.
 *
 * `AtOption` injects it with `null` fallback (standalone option renders but selects nothing).
 */
export const SelectContext = createContext('AtSelect')
