<script>
import { Comment, Fragment, Text, h } from 'vue'

// Whether the slot renders anything visible: comments (`v-if` placeholders) and
// whitespace-only text do not count, fragments (`v-for`, `<template>`) are checked inside.
function hasContent(vnodes) {
  return vnodes.some(vnode => {
    if (vnode.type === Comment) return false
    if (vnode.type === Text) return vnode.children.trim() !== ''
    if (vnode.type === Fragment) return Array.isArray(vnode.children) && hasContent(vnode.children)
    return true
  })
}

const toSize = value => (typeof value === 'number' ? `${value}px` : value)

export default {
  name: 'AtSkeleton',
  props: {
    // No default on purpose: when not passed, the skeleton shows while the default slot is empty.
    loading: {
      type: Boolean,
      default: undefined,
    },
    count: {
      type: Number,
      default: 1,
    },
    // Seconds per shimmer cycle; 0 renders a static placeholder.
    duration: {
      type: Number,
      default: 1.5,
    },
    width: {
      type: [String, Number],
    },
    height: {
      type: [String, Number],
    },
    circle: {
      type: Boolean,
      default: false,
    },
    // Wrapper element; an empty string renders the slot without a wrapper.
    tag: {
      type: String,
      default: 'span',
    },
  },
  render() {
    const content = this.$slots.default ? this.$slots.default() : []
    const showLoading = this.loading === undefined ? !hasContent(content) : this.loading

    if (!showLoading) {
      return this.tag ? h(this.tag, content) : content
    }

    const style = {}
    if (this.width) style.width = toSize(this.width)
    if (this.height) style.height = toSize(this.height)
    if (this.circle) style.borderRadius = '50%'
    if (this.duration) style.animationDuration = `${this.duration}s`

    const elements = []
    for (let i = 0; i < this.count; i += 1) {
      elements.push(
        h(
          'span',
          {
            key: i,
            class: ['at-skeleton', { 'at-skeleton--static': !this.duration }],
            style,
          },
          '‌',
        ),
      )
    }

    return h(this.tag || 'span', elements)
  },
}
</script>
