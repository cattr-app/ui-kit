<template>
  <label
    class="at-radio-button"
    :class="[size ? `at-radio-button--${size}` : '', { 'at-radio--checked': checked }]"
  >
    <input
      type="radio"
      class="at-radio-button__original"
      :value="label"
      :name="name"
      :checked="checked"
      :disabled="disabled"
      @change="select"
    />
    <span class="at-radio-button__inner" :style="checked ? activeStyle : null">
      <slot></slot>
    </span>
  </label>
</template>

<script>
import { computed } from 'vue'
import { useRadio } from './context'

export default {
  name: 'AtRadioButton',
  props: {
    modelValue: [String, Number],
    name: String,
    label: {
      type: [String, Number],
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const { group, checked, select } = useRadio(props, emit)

    const size = computed(() => group?.size)
    const activeStyle = computed(() => {
      const styles = {}
      if (group?.fill) {
        styles.backgroundColor = group.fill
        styles.borderColor = group.fill
      }
      if (group?.textColor) {
        styles.color = group.textColor
      }
      return styles
    })

    return { checked, select, size, activeStyle }
  },
}
</script>
