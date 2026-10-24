<template>
  <div class="at-select__dropdown" :style="styles">
    <slot></slot>
  </div>
</template>

<script>
import PopoverMixin from '../../../mixins/popover'

export default {
  name: 'Dropdown',
  mixins: [PopoverMixin],
  props: {
    placement: {
      type: String,
      default: 'bottom',
    },
  },
  data() {
    return {
      popper: null,
      width: '',
    }
  },
  computed: {
    styles() {
      const style = {}
      if (this.width) {
        style.width = `${this.width}px`
      }
      return style
    },
  },
  created() {
    this.$on('on-update-popper', this.update)
  },
  methods: {
    update() {
      if (this.$parent.$options.name === 'AtSelect') {
        this.width = this.$parent.$el.style.width | 0
      }
    },
  },
}
</script>
