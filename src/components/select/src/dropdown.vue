<template>
  <div class="at-select__dropdown" :class="`at-select__dropdown--${placement}`" :style="styles">
    <slot></slot>
  </div>
</template>

<script>
/**
 * Internal, presentational dropdown panel of `AtSelect` (not exported).
 * No popover mixin and no parent lookup: width/placement come from props.
 */
export default {
  name: 'AtSelectDropdown',
  props: {
    placement: {
      type: String,
      default: 'bottom',
    },
    width: {
      type: [Number, String],
      default: '',
    },
  },
  computed: {
    styles() {
      if (this.width === '' || this.width === null) return {}
      return { width: typeof this.width === 'number' ? `${this.width}px` : this.width }
    },
  },
}
</script>
