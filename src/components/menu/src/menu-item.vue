<template>
  <li
    class="at-menu__item"
    :class="[active ? 'at-menu__item--active' : '', disabled ? 'at-menu__item--disabled' : '']"
    @click="handleClick"
  >
    <!-- resolved only in this branch: no "Failed to resolve component" warning without vue-router -->
    <component
      :is="'router-link'"
      v-if="Object.keys(to).length"
      ref="link"
      class="at-menu__item-link"
      :to="to"
    >
      <slot></slot>
    </component>
    <div v-else class="at-menu__item-link">
      <slot></slot>
    </div>
  </li>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { useChild } from '../../../composables/useChildren'
import { MenuContext, SubmenuContext } from './context'

export default {
  name: 'AtMenuItem',
  props: {
    name: {
      type: [String, Number],
    },
    to: {
      type: [Object, String],
      default() {
        return {}
      },
    },
    replace: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],
  setup(props) {
    const menu = MenuContext.inject(null)
    const submenu = SubmenuContext.inject(null)
    // `router-link-active` on the link, re-checked whenever the menu's active name changes (as in 1.x)
    const routerActive = ref(false)
    const active = computed(() => !!menu && (menu.activeName === props.name || routerActive.value))

    // the enclosing submenu is highlighted while this item is active
    useChild(submenu, reactive({ active }))

    return { menu, submenu, routerActive, active }
  },
  watch: {
    'menu.activeName'() {
      this.$nextTick(this.updateRouterActive)
    },
  },
  mounted() {
    this.$nextTick(this.updateRouterActive)
  },
  methods: {
    updateRouterActive() {
      const el = this.$refs.link && this.$refs.link.$el
      this.routerActive = !!(el && el.classList && el.classList.contains('router-link-active'))
    },
    handleClick(evt) {
      evt.preventDefault()
      if (this.disabled) return

      if (this.submenu) this.submenu.select()
      if (this.menu) {
        this.menu.select({ name: this.name, to: this.to, replace: this.replace })
      }
    },
  },
}
</script>
