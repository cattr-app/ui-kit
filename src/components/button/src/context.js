import { createContext } from '../../../utils/context'

/**
 * Provided by `AtButtonGroup` as `reactive({ size, gap })` (props unwrapped from `toRef`).
 * `AtButton` injects it with `null` fallback, so a button works without a group.
 */
export const ButtonGroupContext = createContext('AtButtonGroup')
