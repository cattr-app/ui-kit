<template>
  <div
    class="at-collapse"
    :class="{
      'at-collapse--simple': simple,
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
import { computed, reactive, ref, toRef, watch } from 'vue'
import { useChildren } from '../../../composables/useChildren'
import { CollapseContext } from './context'

function normalize(value) {
  if (value === undefined || value === null || value === '') return []
  return (Array.isArray(value) ? value : [value]).map(String)
}

export default {
  name: 'AtCollapse',
  props: {
    accordion: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [Array, String, Number],
    },
    simple: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'on-change'],
  setup(props, { emit }) {
    const { children, register, unregister } = useChildren()
    const currentValue = ref(normalize(props.modelValue))

    // `deep`: in-place mutations of the bound array (`active.push('b')`, `splice`) must sync too,
    // as the Vue 2 array watcher did; `normalize()` keeps a separate copy in `currentValue`.
    watch(
      () => props.modelValue,
      value => {
        currentValue.value = normalize(value)
      },
      { deep: true },
    )

    const activeKeys = computed(() =>
      props.accordion ? currentValue.value.slice(0, 1) : currentValue.value,
    )

    function toggle(name) {
      const key = String(name)
      const active = activeKeys.value.includes(key)
      let next

      if (props.accordion) {
        next = active ? [] : [key]
      } else {
        next = active ? activeKeys.value.filter(k => k !== key) : [...activeKeys.value, key]
      }

      currentValue.value = next
      emit('update:modelValue', next)
      emit('on-change', next)
    }

    CollapseContext.provide(
      reactive({
        activeKeys,
        accordion: toRef(props, 'accordion'),
        children,
        register,
        unregister,
        toggle,
      }),
    )
  },
}
</script>
