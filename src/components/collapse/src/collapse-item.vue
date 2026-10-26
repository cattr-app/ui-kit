<template>
  <div
    class="at-collapse__item"
    :class="{
      'at-collapse__item--active': isActive,
      'at-collapse__item--disabled': disabled,
    }"
  >
    <div class="at-collapse__header" @click="toggle">
      <i class="icon at-collapse__icon icon-chevron-right"></i>
      <slot v-if="$slots.title" name="title"></slot>
      <div v-else>{{ title }}</div>
    </div>
    <collapse-transition>
      <div v-show="isActive" class="at-collapse__body">
        <div class="at-collapse__content">
          <slot></slot>
        </div>
      </div>
    </collapse-transition>
  </div>
</template>

<script>
import CollapseTransition from '../../../utils/collapse-transition'
import { useChild } from '../../../composables/useChildren'
import { CollapseContext } from './context'

export default {
  name: 'AtCollapseItem',
  components: {
    CollapseTransition,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    name: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { parent: collapse, index } = useChild(CollapseContext.inject(null), null)
    return { collapse, index }
  },
  computed: {
    itemName() {
      return this.name || String(this.index)
    },
    isActive() {
      return !!this.collapse && this.collapse.activeKeys.includes(this.itemName)
    },
  },
  methods: {
    toggle() {
      if (this.disabled || !this.collapse) return
      this.collapse.toggle(this.itemName)
    },
  },
}
</script>
