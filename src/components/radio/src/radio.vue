<template>
  <label class="at-radio">
    <span class="at-radio__input">
      <span
        class="at-radio__inner"
        :class="{
          'at-radio--focus': focus,
          'at-radio--checked': checked,
          'at-radio--disabled': disabled,
        }"
      ></span>
      <input
        type="radio"
        class="at-radio__original"
        :name="name"
        :value="label"
        :checked="checked"
        :disabled="disabled"
        @change="select"
        @focus="focus = true"
        @blur="focus = false"
      />
    </span>
    <span class="at-radio__label">
      <slot></slot>
    </span>
  </label>
</template>

<script>
import { useRadio } from './context'

export default {
  name: 'AtRadio',
  props: {
    modelValue: [String, Number],
    name: String,
    label: {
      type: [String, Number],
      required: true,
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const { checked, select } = useRadio(props, emit)
    return { checked, select }
  },
  data() {
    return {
      focus: false,
    }
  },
}
</script>
