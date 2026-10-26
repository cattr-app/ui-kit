<template>
  <div class="at-checkbox-group">
    <slot></slot>
  </div>
</template>

<script>
import { computed, reactive } from 'vue'
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
        // `v-model` may be null/undefined (e.g. a cleared form field): treat it as no selection
        modelValue: computed(() => (Array.isArray(props.modelValue) ? props.modelValue : [])),
        update(value) {
          emit('update:modelValue', value)
          emit('on-change', value)
        },
      }),
    )
  },
}
</script>
