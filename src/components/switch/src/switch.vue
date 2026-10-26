<template>
  <span
    class="at-switch"
    :class="[
      size ? `at-switch--${size}` : '',
      {
        'at-switch--disabled': disabled,
        'at-switch--checked': checkStatus,
      },
    ]"
    @click="toggleSwitch"
  >
    <span class="at-switch__text">
      <slot v-if="checkStatus" name="checkedText"></slot>
      <slot v-if="!checkStatus" name="unCheckedText"></slot>
    </span>
  </span>
</template>

<script>
export default {
  name: 'AtSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: String,
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      checkStatus: this.modelValue,
    }
  },
  watch: {
    modelValue(val) {
      this.checkStatus = val
    },
  },
  methods: {
    toggleSwitch() {
      if (this.disabled) return

      this.checkStatus = !this.checkStatus
      this.$emit('update:modelValue', this.checkStatus)
      this.$emit('change', this.checkStatus)
    },
  },
}
</script>
