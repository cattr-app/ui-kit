import { createContext } from '../../../utils/context'

/**
 * Provided by `AtCheckboxGroup` as `reactive({ modelValue, update })`
 * (`modelValue` unwrapped from `toRef`, always an array). `AtCheckbox` injects it with `null` fallback.
 */
export const CheckboxGroupContext = createContext('AtCheckboxGroup')
