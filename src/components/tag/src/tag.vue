<template>
  <span class="at-tag" :class="[colorClass]" :style="colorStyle">
    <span class="at-tag__text"><slot></slot></span>
    <i v-if="closable" class="icon icon-x at-tag__close" @click="closeAction"></i>
  </span>
</template>

<script>
const colorArr = ['default', 'primary', 'success', 'error', 'warning', 'info']

export default {
  name: 'AtTag',
  props: {
    name: {
      type: [String, Number],
    },
    color: {
      type: String,
      default: 'default',
    },
    closable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['on-close'],
  computed: {
    colorClass() {
      return colorArr.indexOf(this.color) > -1 ? `at-tag--${this.color}` : ''
    },
    colorStyle() {
      if (colorArr.indexOf(this.color) > -1) return ''
      return {
        borderColor: this.color,
        backgroundColor: this.color,
      }
    },
  },
  methods: {
    closeAction(evt) {
      if (typeof this.name === 'undefined') {
        this.$emit('on-close', evt)
      } else {
        this.$emit('on-close', evt, this.name)
      }
    },
  },
}
</script>
