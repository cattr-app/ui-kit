<template>
  <button
    class="at-btn"
    :class="[
      type ? `at-btn--${type}` : '',
      size ? `at-btn--${size}` : '',
      group && group.size ? `at-btn--${group.size}` : '',
      hollow ? `at-btn--${type}--hollow` : '',
      circle && !$slots.default ? 'at-btn--circle' : '',
    ]"
    :style="styleList"
    :disabled="disabled"
    :type="nativeType"
  >
    <i v-if="loading" class="at-btn__loading icon icon-loader"></i>
    <i v-if="icon" class="at-btn__icon icon" :class="icon"></i>
    <span v-if="$slots.default" class="at-btn__text"><slot></slot></span>
  </button>
</template>

<script>
import { ButtonGroupContext } from './context'

export default {
  name: 'AtButton',
  props: {
    type: {
      type: String,
      default: 'default',
    },
    nativeType: {
      type: String,
      default: 'button',
    },
    size: String,
    icon: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    hollow: {
      type: Boolean,
      default: false,
    },
    circle: {
      type: Boolean,
      default: false,
    },
  },
  // No own events: consumer listeners (`@click`) fall through to the root <button> via $attrs.
  emits: [],
  setup() {
    return { group: ButtonGroupContext.inject(null) }
  },
  computed: {
    // The consumer's `style` attr is merged with this by Vue's fallthrough.
    styleList() {
      return this.group ? { marginRight: `${this.group.gap}px` } : null
    },
  },
}
</script>
