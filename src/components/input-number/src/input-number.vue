<template>
  <div
    class="at-input-number"
    :class="[
      size ? `at-input-number--${size}` : '',
      {
        'at-input-number--disabled': disabled,
      },
      $attrs.class,
    ]"
    :style="$attrs.style"
  >
    <!-- S input -->
    <div class="at-input-number__input">
      <input
        v-bind="inputAttrs()"
        type="number"
        class="at-input-number__original"
        :value="currentValue"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :max="max"
        :min="min"
        :autofocus="autofocus"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown.enter="handleChange"
        @keydown.up.stop.prevent="increaseNum"
        @keydown.down.stop.prevent="decreaseNum"
      />
    </div>
    <!-- E input -->

    <!-- S handle button -->
    <div class="at-input-number__handler">
      <span
        class="at-input-number__up"
        :class="{
          'at-input-number__up--disabled': upDisabled,
        }"
        @click="increaseNum"
      >
        <i class="icon icon-chevron-up"></i>
      </span>
      <span
        class="at-input-number__down"
        :class="{
          'at-input-number__down--disabled': downDisabled,
        }"
        @click="decreaseNum"
      >
        <i class="icon icon-chevron-down"></i>
      </span>
    </div>
    <!-- E handle button -->
  </div>
</template>

<script>
export default {
  name: 'AtInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: 'normal',
    },
    step: {
      type: [Number, String],
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: String,
    readonly: Boolean,
    autofocus: Boolean,
    max: Number,
    min: Number,
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  data() {
    return {
      currentValue: this.modelValue,
    }
  },
  computed: {
    upDisabled() {
      return this.currentValue + Number(this.step) > this.max
    },
    downDisabled() {
      return this.currentValue - Number(this.step) < this.min
    },
  },
  watch: {
    modelValue(value) {
      this.currentValue = value
    },
  },
  methods: {
    // Everything except class/style goes to the native <input>: listeners
    // (@keyup, @keydown, @paste…) and attributes (id, placeholder, aria-*).
    inputAttrs() {
      // eslint-disable-next-line no-unused-vars
      const { class: _class, style: _style, ...rest } = this.$attrs
      return rest
    },
    handleFocus(evt) {
      this.$emit('focus', evt)
    },
    handleBlur(evt) {
      this.$emit('blur', evt)
    },
    // Typed value is applied on native change (blur) and on Enter.
    handleChange(evt) {
      const raw = evt.target.value
      let value = raw === '' ? NaN : Number(raw)

      if (!isNaN(value) && !this.disabled && !this.readonly) {
        if (value > this.max) value = this.max
        if (value < this.min) value = this.min
        this.setValue(value)
      }

      // Re-sync the field when the value was rejected, clamped or unchanged.
      evt.target.value = this.currentValue
    },
    increaseNum() {
      const value = this.currentValue || 0
      if (value >= this.max || this.disabled) return
      this.calculateStep('up')
    },
    decreaseNum() {
      const value = this.currentValue || 0
      if (value <= this.min || this.disabled) return
      this.calculateStep('down')
    },
    calculateStep(type) {
      if (this.disabled) return

      let value = Number(this.currentValue)
      const stepNum = Number(this.step)

      if (type === 'up') {
        value = this.calculateNumber(value, stepNum, '+')
      } else if (type === 'down') {
        value = this.calculateNumber(value, stepNum, '-')
      }

      if (value > this.max || value < this.min) return

      this.setValue(value)
    },
    // Emits on every change, including reaching min/max
    // (fix from 9-input-number-does-not-emit-changes-on-edge-value).
    setValue(value) {
      if (value === this.currentValue) return
      this.currentValue = value
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    calculateNumber(num, stepNum, symbol) {
      let decimal1, decimal2

      try {
        decimal1 = num.toString().split('.')[1].length
      } catch {
        decimal1 = 0
      }

      try {
        decimal2 = stepNum.toString().split('.')[1].length
      } catch {
        decimal2 = 0
      }

      const quantity = Math.pow(10, Math.max(decimal1, decimal2))

      if (symbol === '+') {
        return (num * quantity + stepNum * quantity) / quantity
      } else if (symbol === '-') {
        return (num * quantity - stepNum * quantity) / quantity
      }
    },
  },
}
</script>
