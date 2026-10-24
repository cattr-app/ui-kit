<template>
  <div class="at-radio-group">
    <slot></slot>
  </div>
</template>

<script>
import { reactive, toRef } from 'vue'
import { RadioGroupContext } from './context'

export default {
  name: 'AtRadioGroup',
  props: {
    modelValue: [String, Number],
    size: String,
    fill: String,
    textColor: String,
  },
  emits: ['update:modelValue', 'radio-group-change'],
  setup(props, { emit }) {
    RadioGroupContext.provide(
      reactive({
        modelValue: toRef(props, 'modelValue'),
        size: toRef(props, 'size'),
        fill: toRef(props, 'fill'),
        textColor: toRef(props, 'textColor'),
        update(value) {
          if (value === props.modelValue) return
          emit('update:modelValue', value)
          emit('radio-group-change', value)
        },
      }),
    )
  },
}
</script>
