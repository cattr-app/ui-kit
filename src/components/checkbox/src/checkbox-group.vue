<template>
  <div class="at-checkbox-group">
    <slot></slot>
  </div>
</template>

<script>
import { reactive, toRef } from 'vue'
import { CheckboxGroupContext } from './context'

export default {
  name: 'AtCheckboxGroup',
  props: {
    modelValue: {
      type: Array,
      default() {
        return []
      },
    },
  },
  emits: ['update:modelValue', 'on-change'],
  setup(props, { emit }) {
    CheckboxGroupContext.provide(
      reactive({
        modelValue: toRef(props, 'modelValue'),
        update(value) {
          emit('update:modelValue', value)
          emit('on-change', value)
        },
      }),
    )
  },
}
</script>
