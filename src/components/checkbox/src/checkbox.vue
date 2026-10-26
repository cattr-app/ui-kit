<template>
  <label
    class="at-checkbox"
    :class="{
      'at-checkbox--focus': focus,
      'at-checkbox--checked': isChecked,
      'at-checkbox--disabled': disabled,
    }"
  >
    <span class="at-checkbox__input">
      <span class="at-checkbox__inner"></span>
      <input
        type="checkbox"
        class="at-checkbox__original"
        :name="name"
        :value="label"
        :disabled="disabled"
        :checked="isChecked"
        @change="change"
        @focus="focus = true"
        @blur="focus = false"
      />
    </span>
    <span class="at-checkbox__label">
      <slot></slot>
    </span>
  </label>
</template>

<script>
import { CheckboxGroupContext } from './context'

export default {
  name: 'AtCheckbox',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Array],
      default: false,
    },
    label: [String, Number, Boolean],
    name: String,
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'on-change'],
  setup() {
    return { group: CheckboxGroupContext.inject(null) }
  },
  data() {
    return {
      focus: false,
      currentValue: this.checked || this.modelValue,
    }
  },
  computed: {
    isChecked() {
      if (this.group) return this.group.modelValue.includes(this.label)
      return Boolean(this.currentValue)
    },
  },
  watch: {
    modelValue(value) {
      this.currentValue = value
    },
  },
  methods: {
    change(evt) {
      if (this.disabled) return

      const checked = evt.target.checked

      if (this.group) {
        const current = this.group.modelValue
        const next = checked
          ? [...current.filter(item => item !== this.label), this.label]
          : current.filter(item => item !== this.label)
        this.group.update(next)
        return
      }

      this.currentValue = checked
      this.$emit('update:modelValue', checked)
      this.$emit('on-change', checked)
    },
  },
}
</script>
