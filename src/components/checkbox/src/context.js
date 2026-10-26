import { createContext } from '../../../utils/context'

/**
 * Provided by `AtCheckboxGroup` as `reactive({ modelValue, update })`
 * (`modelValue` unwrapped from a computed, always an array, `[]` for a null `v-model`). `AtCheckbox` injects it with `null` fallback.
 */
export const CheckboxGroupContext = createContext('AtCheckboxGroup')
