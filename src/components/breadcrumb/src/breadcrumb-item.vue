<template>
  <span class="at-breadcrumb__item">
    <a v-if="isLink" class="at-breadcrumb__link" @click="handleClick"><slot></slot></a>
    <span v-else class="at_breadcrumb__text"><slot></slot></span>
    <!-- `separator` is rendered as HTML since 1.x (intentional API, e.g. `&gt;` or an icon); consumer sanitizes it -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span class="at-breadcrumb__separator" v-html="separator"></span>
  </span>
</template>

<script>
import { BreadcrumbContext } from './context'

// Same as AtBreadcrumb's `separator` default, used when the item lives outside a breadcrumb.
const DEFAULT_SEPARATOR = '/'

export default {
  name: 'AtBreadcrumbItem',
  props: {
    href: String,
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
  },
  // No own events: consumer listeners (`@click`) fall through to the root <span> via $attrs.
  emits: [],
  setup() {
    return { breadcrumb: BreadcrumbContext.inject(null) }
  },
  computed: {
    separator() {
      return this.breadcrumb ? this.breadcrumb.separator : DEFAULT_SEPARATOR
    },
    isLink() {
      return !!this.href || Object.keys(this.to || {}).length > 0
    },
  },
  methods: {
    handleClick() {
      if (this.href) {
        window.location.href = this.href
        return
      }

      // `$router` exists only when the app uses vue-router; without it the link is inert.
      const router = this.$router
      if (!router) return

      if (this.replace) {
        router.replace(this.to)
      } else {
        router.push(this.to)
      }
    },
  },
}
</script>
