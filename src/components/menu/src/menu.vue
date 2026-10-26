<template>
  <ul
    class="at-menu"
    :class="[theme ? `at-menu--${theme}` : '', mode ? `at-menu--${mode}` : '']"
    :style="ulStyle"
  >
    <slot></slot>
  </ul>
</template>

<script>
import { reactive, ref, toRef, watch } from 'vue'
import { useChildren } from '../../../composables/useChildren'
import { MenuContext } from './context'

function normalize(name) {
  return typeof name === 'undefined' ? -1 : name
}

export default {
  name: 'AtMenu',
  props: {
    mode: {
      type: String,
      default: 'inline',
      validator: val => ['inline', 'horizontal', 'vertical'].indexOf(val) > -1,
    },
    theme: {
      type: String,
      default: 'light',
      validator: val => ['light', 'dark'].indexOf(val) > -1,
    },
    activeName: [String, Number],
    inlineCollapsed: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '240px',
    },
    router: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['on-select'],
  setup(props, { emit }) {
    const { children, register, unregister } = useChildren()
    const currentActiveName = ref(normalize(props.activeName))

    watch(
      () => props.activeName,
      value => {
        currentActiveName.value = normalize(value)
      },
    )

    function select(item) {
      currentActiveName.value = normalize(item.name)
      emit('on-select', item.name)
      // navigation (`router` mode included) is done by the clicked AtMenuItem
    }

    MenuContext.provide(
      reactive({
        mode: toRef(props, 'mode'),
        theme: toRef(props, 'theme'),
        inlineCollapsed: toRef(props, 'inlineCollapsed'),
        router: toRef(props, 'router'),
        activeName: currentActiveName,
        children,
        register,
        unregister,
        select,
      }),
    )
  },
  computed: {
    ulStyle() {
      const style = {}

      if (this.mode === 'inline' || this.mode === 'vertical') {
        style.width = this.width
      }

      return style
    },
  },
}
</script>
