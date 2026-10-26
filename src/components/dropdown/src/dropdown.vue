<template>
  <div ref="trigger" v-clickoutside="handleClose" class="at-dropdown">
    <div class="at-dropdown__trigger"><slot></slot></div>

    <transition name="slide-up">
      <div v-show="show" ref="popover" class="at-dropdown__popover">
        <slot name="menu"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { reactive } from 'vue'
import Clickoutside from '../../../directives/clickoutside'
import PopoverMixin from '../../../mixins/popover'
import { DropdownContext } from './context'

export default {
  name: 'AtDropdown',
  directives: { Clickoutside },
  mixins: [PopoverMixin],
  provide() {
    return {
      [DropdownContext.key]: reactive({
        onItemClick: name => this.handleMenuItemClick(name),
      }),
    }
  },
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
  // `update:modelValue` and `toggle` come from the popover mixin.
  emits: ['on-dropdown-command'],
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
