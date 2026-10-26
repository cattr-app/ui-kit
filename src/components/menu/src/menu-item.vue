<template>
  <li
    class="at-menu__item"
    :class="[active ? 'at-menu__item--active' : '', disabled ? 'at-menu__item--disabled' : '']"
    @click="handleClick"
  >
    <!-- resolved only in this branch: no "Failed to resolve component" warning without vue-router.
         `custom`: the link only renders the `<a>`; the click is handled once, in `handleClick` -->
    <component
      :is="'router-link'"
      v-if="hasLink"
      v-slot="{ href, isActive, isExactActive }"
      :to="to"
      custom
    >
      <a
        ref="link"
        class="at-menu__item-link"
        :class="{ 'router-link-active': isActive, 'router-link-exact-active': isExactActive }"
        :href="href"
      >
        <slot></slot>
      </a>
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
  computed: {
    // `$router` read from globalProperties: no "accessed during render" warning without vue-router
    router() {
      return this.$.appContext.config.globalProperties.$router || null
    },
    hasTo() {
      return typeof this.to === 'string' ? this.to !== '' : Object.keys(this.to).length > 0
    },
    hasLink() {
      return this.hasTo && !!this.router
    },
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
      const el = this.$refs.link
      this.routerActive = !!(el && el.classList && el.classList.contains('router-link-active'))
    },
    handleClick(evt) {
      evt.preventDefault()
      if (this.disabled) return

      if (this.submenu) this.submenu.select()
      if (this.menu) {
        this.menu.select({ name: this.name, to: this.to, replace: this.replace })
      }

      // the only navigation per click: `to` (as `router-link` did) or any item of `<at-menu router>`
      const router = this.router
      if (router && (this.hasTo || (this.menu && this.menu.router))) {
        const route = this.to || {}
        if (this.replace) router.replace(route)
        else router.push(route)
      }
    },
  },
}
</script>
