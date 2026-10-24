<template>
  <div ref="trigger" v-clickoutside="handleClose" class="at-dropdown">
    <div class="at-dropdown__trigger"><slot></slot></div>

    <transition name="slide-up" @after-leave="doDestory">
      <div v-show="show" ref="popover" class="at-dropdown__popover">
        <slot name="menu"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import Clickoutside from '../../../directives/clickoutside'
import PopoverMixin from '../../../mixins/popover'

export default {
  name: 'AtDropdown',
  directives: { Clickoutside },
  mixins: [PopoverMixin],
  props: {
    trigger: {
      type: String,
      default: 'hover',
      validator: val => ['click', 'hover', 'focus'].indexOf(val) > -1,
    },
    placement: {
      type: String,
      default: 'bottom',
      validator: val =>
        [
          'top',
          'top-left',
          'top-right',
          'left',
          'left-top',
          'left-bottom',
          'right',
          'right-top',
          'right-bottom',
          'bottom',
          'bottom-left',
          'bottom-right',
        ].indexOf(val) > -1,
    },
  },
  mounted() {
    this.$on('menu-item-click', this.handleMenuItemClick)
  },
  methods: {
    handleClose() {
      this.show = false
    },
    handleMenuItemClick(name) {
      this.show = false
      this.$emit('on-dropdown-command', name)
    },
  },
}
</script>
