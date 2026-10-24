<template>
  <div v-show="show" class="at-tabs__pane">
    <slot></slot>
  </div>
</template>

<script>
import { computed, reactive, toRef } from 'vue'
import { useChild } from '../../../composables/useChildren'
import { TabsContext } from './context'

export default {
  name: 'AtTabPane',
  props: {
    name: {
      type: String,
    },
    label: {
      type: String,
    },
    icon: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const tabs = TabsContext.inject(null)
    let index = null
    // Panes without `name` are named by their DOM index among the panes of their AtTabs ('0', '1', …).
    const currentName = computed(() => props.name || String(index.value))
    const item = reactive({
      name: currentName,
      label: toRef(props, 'label'),
      icon: toRef(props, 'icon'),
      disabled: toRef(props, 'disabled'),
      closable: computed(() => props.closable && !!tabs?.closable),
    })
    ;({ index } = useChild(tabs, item))

    return { tabs, currentName }
  },
  computed: {
    show() {
      return !this.tabs || this.tabs.animated || this.tabs.activeKey === this.currentName
    },
  },
}
</script>
