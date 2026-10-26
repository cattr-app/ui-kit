<template>
  <div
    class="at-timeline__item"
    :class="{
      'at-timeline__item--last': isLastItem,
      'at-timeline__item--pending': isPendingItem,
      'at-timeline__item--custom': !!$slots.dot,
      [`at-timeline__item--${status}`]: status,
    }"
  >
    <div class="at-timeline__tail"></div>
    <div class="at-timeline__dot">
      <slot name="dot"></slot>
    </div>
    <div class="at-timeline__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { useChild } from '../../../composables/useChildren'
import { TimelineContext } from './context'

const COLORS = {
  blue: 'default',
  red: 'error',
  green: 'success',
  yellow: 'warning',
}
const DEFAULT_COLOR = 'blue'

export default {
  name: 'AtTimelineItem',
  props: {
    color: {
      type: String,
      default: 'blue',
    },
  },
  emits: [],
  setup() {
    const { parent, index } = useChild(TimelineContext.inject(null))
    return { timeline: parent, index }
  },
  computed: {
    status() {
      return COLORS[this.color] || COLORS[DEFAULT_COLOR]
    },
    // With `pending` the last child is the pending item, so the "last" one is the one before it.
    lastItemIndex() {
      if (!this.timeline) return -1
      const count = this.timeline.children.length
      return this.timeline.pending ? count - 2 : count - 1
    },
    isLastItem() {
      return this.index !== -1 && this.index === this.lastItemIndex
    },
    isPendingItem() {
      return !!this.timeline?.pending && this.index !== -1 && this.index === this.lastItemIndex + 1
    },
  },
}
</script>
