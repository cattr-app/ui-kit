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
import { reactive, toRef } from 'vue'
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
    const { children, register, unregister } = useChildren()
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
