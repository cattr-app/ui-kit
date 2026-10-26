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
      <div v-show="isOpen" ref="popover" class="at-dropdown__popover" :style="dropStyle">
        <ul class="at-dropdown-menu">
          <slot></slot>
        </ul>
      </div>
    </transition>
  </li>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import CollapseTransition from '../../../utils/collapse-transition'
import { getStyle } from '../../../utils/util'
import { useChild, useChildren } from '../../../composables/useChildren'
import { MenuContext, SubmenuContext } from './context'

const HOVER_DELAY = 200

export default {
  name: 'AtSubmenu',
  components: {
    CollapseTransition,
  },
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
  emits: [],
  setup(props) {
    const menu = MenuContext.inject(null)
    const parentSubmenu = SubmenuContext.inject(null)
    const { children, register, unregister } = useChildren()
    const isOpen = ref(props.opened)
    const mode = computed(() => (menu ? menu.mode : 'inline'))
    // active while any nested item (or nested submenu) is active
    const active = computed(() => children.some(child => child.exposed.active))

    // a nested item was clicked: close the popup and let the parent submenus close too
    function select() {
      if (mode.value !== 'inline') {
        isOpen.value = false
      }
      if (parentSubmenu) parentSubmenu.select()
    }

    const exposed = reactive({
      active,
      close() {
        isOpen.value = false
      },
    })
    // nested submenus register in the parent submenu (highlight), top-level ones in the menu
    // (closed together in `inlineCollapsed` mode)
    useChild(parentSubmenu, exposed)
    useChild(parentSubmenu ? null : menu, exposed)

    SubmenuContext.provide(reactive({ children, register, unregister, select }))

    return { menu, parentSubmenu, isOpen, mode, active }
  },
  data() {
    return {
      dropWidth: null,
    }
  },
  computed: {
    inlineCollapsed() {
      return !!this.menu && this.menu.inlineCollapsed
    },
    dropStyle() {
      return {
        'min-width': this.dropWidth,
      }
    },
  },
  watch: {
    mode(val) {
      if (val !== 'inline') {
        this.isOpen = false
      }
    },
    isOpen(val) {
      if (this.mode === 'inline') return
      if (val) {
        this.dropWidth = getStyle(this.$el, 'width')
        this.$nextTick(this.resetDropdownPosition)
      }
    },
  },
  created() {
    // plain instance field, not reactive
    this.hoverTimer = null
  },
  beforeUnmount() {
    clearTimeout(this.hoverTimer)
  },
  methods: {
    resetDropdownPosition() {
      const popover = this.$refs.popover
      const trigger = this.$refs.trigger
      if (!popover || !trigger) return

      if (this.mode === 'horizontal' && !this.parentSubmenu) {
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
      if (this.inlineCollapsed && this.menu) {
        this.menu.children.forEach(child => child.exposed.close())
      }
      this.isOpen = !opened
    },
    handleMouseEnter() {
      if (this.disabled || this.mode === 'inline') return

      clearTimeout(this.hoverTimer)
      this.hoverTimer = setTimeout(() => {
        this.isOpen = true
      }, HOVER_DELAY)
    },
    handleMouseLeave() {
      if (this.disabled || this.mode === 'inline') return

      clearTimeout(this.hoverTimer)
      this.hoverTimer = setTimeout(() => {
        this.isOpen = false
      }, HOVER_DELAY)
    },
  },
}
</script>
