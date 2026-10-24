import { computed } from 'vue'
import { createContext } from '../../../utils/context'

/**
 * Provided by `AtRadioGroup` as `reactive({ modelValue, size, fill, textColor, update })`
 * (props unwrapped from `toRef`). `AtRadio`/`AtRadioButton` inject it with `null` fallback.
 */
export const RadioGroupContext = createContext('AtRadioGroup')

/**
 * Shared state of `AtRadio` and `AtRadioButton`: value comes from the group when present,
 * otherwise from the component's own `modelValue`.
 */
export function useRadio(props, emit) {
  const group = RadioGroupContext.inject(null)
  const checked = computed(() => (group ? group.modelValue : props.modelValue) === props.label)

  function select() {
    if (props.disabled || checked.value) return
    if (group) {
      group.update(props.label)
    } else {
      emit('update:modelValue', props.label)
    }
  }

  return { group, checked, select }
}
