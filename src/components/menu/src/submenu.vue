<template>
  <li
    ref="trigger"
    class="at-menu__submenu"
    :class="[
      active ? 'at-menu__submenu--active' : '',
      isOpen ? 'at-menu__submenu--opened' : '',
      disabled ? 'at-menu__submenu--disabled' : '',
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div ref="reference" class="at-menu__submenu-title" @click.stop="handleClick">
      <slot name="title"></slot>
      <i class="icon icon-chevron-down at-menu__submenu-icon"></i>
    </div>
    <collapse-transition v-if="mode === 'inline'">
      <ul v-show="isOpen" class="at-menu">
        <slot></slot>
      </ul>
    </collapse-transition>
    <transition v-else name="slide-up">
      <div
        v-show="isOpen"
        ref="popover"
        class="at-dropdown__popover"
        placement="placementValue"
        :style="dropStyle"
      >
        <ul class="at-dropdown-menu">
          <slot></slot>
        </ul>
      </div>
    </transition>
  </li>
</template>

<script>
import CollapseTransition from '../../../utils/collapse-transition'
import { getStyle, findComponentUpward } from '../../../utils/util'
import Emitter from '../../../mixins/emitter'
import PopoverMixin from '../../../mixins/popover'

export default {
  name: 'AtSubmenu',
  components: {
    CollapseTransition,
  },
  mixins: [Emitter, PopoverMixin],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    opened: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      active: false,
      isOpen: this.opened,
      dropWidth: getStyle(this.$el, 'width'),
      parentMenu: findComponentUpward(this, 'AtMenu'),
    }
  },
  computed: {
    mode() {
      return this.parentMenu.mode
    },
    inlineCollapsed() {
      return this.parentMenu.inlineCollapsed
    },
    dropStyle() {
      return {
        'min-width': this.dropWidth,
      }
    },
    placementValue() {
      return this.mode === 'vertical' ? 'right-top' : 'bottom'
    },
  },
  watch: {
    mode(val) {
      if (val !== 'inline') {
        this.isOpen = false
        // this.handleMouseLeave()
      }
    },
    isOpen(val) {
      if (this.mode === 'inline') return
      if (val) {
        this.dropWidth = getStyle(this.$el, 'width')
        this.resetDropdownPosition()
      }
    },
  },
  mounted() {
    this.$on('on-menu-item-select', name => {
      if (this.mode !== 'inline') {
        this.isOpen = false
      }
      this.dispatch('AtMenu', 'on-menu-item-select', name)
    })
    this.$on('on-update-active', status => {
      this.active = status
    })
  },
  methods: {
    resetDropdownPosition() {
      const popover = this.$refs.popover
      const trigger = this.$refs.trigger
      const parent = this.$parent
      const name = parent.$options.name

      if (this.mode === 'vertical') {
        popover.style.left = 'initial'
        popover.style.right = `-${trigger.offsetWidth + 4}px`
        popover.style.top = '0'
      } else if (parent && name !== 'AtSubmenu') {
        popover.style.left = '0'
        popover.style.right = 'initial'
        popover.style.top = `${trigger.offsetHeight + 2}px`
      } else {
        popover.style.left = 'initial'
        popover.style.right = `-${trigger.offsetWidth + 4}px`
        popover.style.top = '0'
      }
    },
    handleClick() {
      if (this.disabled || this.mode !== 'inline') return

      const opened = this.isOpen
      if (this.inlineCollapsed) {
        this.parentMenu.$children.forEach(item => {
          if (item.$options.name === 'AtSubmenu') {
            item.isOpen = false
          }
        })
      }
      this.isOpen = !opened
    },
    handleMouseEnter() {
      if (this.disabled || this.mode === 'inline') return

      // handle mousemove event
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.isOpen = true
      }, 200)
    },
    handleMouseLeave() {
      if (this.disabled || this.mode === 'inline') return

      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.isOpen = false
      }, 200)
    },
  },
}
</script>
