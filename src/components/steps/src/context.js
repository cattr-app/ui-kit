import { createContext } from '../../../utils/context'

/**
 * Provided by `AtSteps` as `reactive({ current, status, size, direction, children, register, unregister })`
 * (props unwrapped from `toRef`, `children` from `useChildren`). `AtStep` injects it with `null` fallback
 * and registers itself via `useChild`; `children[i].exposed` is the step proxy (reads `finalStatus`).
 */
export const StepsContext = createContext('AtSteps')
