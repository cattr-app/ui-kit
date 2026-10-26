<template>
  <div
    class="at-timeline"
    :class="{
      'at-timeline--pending': pending,
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
import { onUpdated, reactive, toRef } from 'vue'
import { useChildren } from '../../../composables/useChildren'
import { TimelineContext } from './context'

export default {
  name: 'AtTimeline',
  props: {
    pending: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],
  setup(props) {
    const { children, register, unregister, sort } = useChildren()
    // keyed `v-for` reorders move children without remounting them: re-sort by DOM order
    onUpdated(sort)
    TimelineContext.provide(
      reactive({
        pending: toRef(props, 'pending'),
        children,
        register,
        unregister,
      }),
    )
  },
}
</script>
