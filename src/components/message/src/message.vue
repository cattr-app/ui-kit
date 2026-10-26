<template>
  <div
    class="at-message__wrapper"
    :style="{
      top: top ? `${top}px` : 'auto',
      zIndex,
    }"
  >
    <transition name="move-up" @after-leave="$emit('destroy')">
      <div
        v-show="visible"
        class="at-message"
        :class="{
          [`at-message--${type}`]: type,
        }"
      >
        <i class="icon at-message__icon" :class="iconClass"></i>
        <span class="at-message__content">{{ message }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
const iconClasses = {
  success: 'icon-check-circle',
  error: 'icon-x-circle',
  warning: 'icon-alert-circle',
  info: 'icon-info',
  loading: 'icon-loader',
}

export default {
  props: {
    message: { type: [String, Number], default: '' },
    type: { type: String, default: 'info' },
    icon: { type: String, default: '' },
    duration: { type: Number, default: 3000 },
    top: { type: Number, default: null },
    zIndex: { type: Number, default: null },
  },
  emits: ['close', 'destroy'],
  data() {
    return {
      visible: false,
      closed: false,
      timer: null,
    }
  },
  computed: {
    iconClass() {
      return this.icon || iconClasses[this.type]
    },
  },
  mounted() {
    // Shown after mount so the `move-up` enter transition plays.
    this.visible = true
    this.startTimer()
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    close() {
      if (this.closed) return
      this.closed = true
      this.visible = false
      this.clearTimer()
      this.$emit('close')
    },
    startTimer() {
      if (this.duration) {
        this.timer = setTimeout(() => this.close(), this.duration)
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
  },
}
</script>
