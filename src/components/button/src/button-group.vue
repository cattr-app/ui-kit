<template>
  <div class="at-btn-group" :class="[size ? `at-btn-group--${size}` : '']">
    <slot></slot>
  </div>
</template>

<script>
import { reactive, toRef } from 'vue'
import { ButtonGroupContext } from './context'

export default {
  name: 'AtButtonGroup',
  props: {
    size: String,
    gap: {
      type: Number,
      default: -1,
    },
  },
  setup(props) {
    ButtonGroupContext.provide(
      reactive({
        size: toRef(props, 'size'),
        gap: toRef(props, 'gap'),
      }),
    )
  },
}
</script>
