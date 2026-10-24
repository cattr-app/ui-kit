<template>
  <div
    class="at-input"
    :class="[
      size ? `at-input--${size}` : '',
      status ? `at-input--${status}` : '',
      {
        'at-input-group': $slots.prepend || $slots.append,
        'at-input--disabled': disabled,
        'at-input--prepend': $slots.prepend,
        'at-input--append': $slots.append,
        'at-input--icon': icon,
      },
      $attrs.class,
    ]"
    :style="$attrs.style"
  >
    <!-- S prepend element -->
    <div
      v-if="$slots.prepend"
      class="at-input-group__prepend"
      :class="{ 'at-input-group--button': prependButton }"
    >
      <slot name="prepend"></slot>
    </div>
    <!-- E prepend element -->

    <!-- S input -->
    <input
      v-bind="inputAttrs()"
      class="at-input__original"
      :type="type"
      :name="name"
      :value="currentValue"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :minlength="minlength"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      :autofocus="autofocus"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
    />
    <!-- E input -->

    <!-- S icon -->
    <i v-if="icon" class="at-input__icon icon" :class="iconClass"></i>
    <!-- E icon -->

    <!-- S append element -->
    <div
      v-if="$slots.append"
      class="at-input-group__append"
      :class="{ 'at-input-group--button': appendButton }"
    >
      <slot name="append"></slot>
    </div>
    <!-- E append element -->
  </div>
</template>

<script>
export default {
  name: 'AtInput',
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: 'text',
    },
    modelValue: [String, Number],
    name: String,
    placeholder: String,
    size: String,
    status: String,
    icon: String,
    prependButton: {
      type: Boolean,
      default: false,
    },
    appendButton: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    maxlength: Number,
    minlength: Number,
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
    iconClass() {
      const name = this.icon || this.status
      return name ? `icon-${name}` : ''
    },
  },
  watch: {
    modelValue(val) {
      this.setCurrentValue(val)
    },
  },
  methods: {
    // Everything except class/style goes to the native <input>: listeners
    // (@keyup.enter, @keydown, @paste…) and attributes (autocomplete, id, aria-*).
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
    handleInput(evt) {
      const value = evt.target.value
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    setCurrentValue(val) {
      if (val === this.currentValue) return
      this.currentValue = val
    },
  },
}
</script>
