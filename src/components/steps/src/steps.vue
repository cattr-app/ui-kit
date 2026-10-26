<template>
  <div
    :class="[
      'at-steps',
      direction === 'vertical' ? 'at-steps--vertical' : 'at-steps--horizontal',
      size === 'small' ? 'at-steps--small' : '',
    ]"
  >
    <slot></slot>
  </div>
</template>

<script>
import { onUpdated, reactive, toRef } from 'vue'
import { useChildren } from '../../../composables/useChildren'
import { StepsContext } from './context'

export default {
  name: 'AtSteps',
  props: {
    current: {
      type: Number,
      default: 0,
      validator: val => val >= 0,
    },
    status: {
      type: String,
      default: 'process',
      validator: val => ['wait', 'process', 'finish', 'error'].indexOf(val) > -1,
    },
    size: {
      type: String,
      default: 'default',
      validator: val => ['default', 'small'].indexOf(val) > -1,
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator: val => ['horizontal', 'vertical'].indexOf(val) > -1,
    },
  },
  emits: [],
  setup(props) {
    const { children, register, unregister, sort } = useChildren()
    // keyed `v-for` reorders move children without remounting them: re-sort by DOM order
    onUpdated(sort)

    StepsContext.provide(
      reactive({
        current: toRef(props, 'current'),
        status: toRef(props, 'status'),
        size: toRef(props, 'size'),
        direction: toRef(props, 'direction'),
        children,
        register,
        unregister,
      }),
    )
  },
}
</script>
