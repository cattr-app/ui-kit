<template>
  <div class="at-breadcrumb">
    <slot></slot>
  </div>
</template>

<script>
import { reactive, toRef } from 'vue'
import { BreadcrumbContext } from './context'

export default {
  name: 'AtBreadcrumb',
  props: {
    separator: {
      type: String,
      default: '/',
    },
  },
  emits: [],
  setup(props) {
    BreadcrumbContext.provide(
      reactive({
        separator: toRef(props, 'separator'),
      }),
    )
  },
}
</script>
