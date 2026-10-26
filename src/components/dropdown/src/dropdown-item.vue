<template>
  <li
    class="at-dropdown-menu__item"
    :class="{
      'at-dropdown-menu__item--disabled': disabled,
      'at-dropdown-menu__item--divided': divided,
    }"
    @click.stop="handleClick"
  >
    <slot></slot>
  </li>
</template>

<script>
import { DropdownContext } from './context'

export default {
  name: 'AtDropdownItem',
  props: {
    name: {
      type: [String, Number],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    divided: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return { dropdown: DropdownContext.inject(null) }
  },
  methods: {
    handleClick() {
      if (this.disabled) return
      this.dropdown?.onItemClick(this.name)
    },
  },
}
</script>
