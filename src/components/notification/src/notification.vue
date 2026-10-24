<template>
  <transition name="notification-fade" @after-leave="$emit('destroy')">
    <div
      v-show="visible"
      class="at-notification"
      :class="{
        [`at-notification--${type}`]: type,
        'at-notification--with-message': hasMessage,
        'at-notification--hover': !showClose,
      }"
      :style="{
        top: top ? `${top}px` : 'auto',
        zIndex,
      }"
      @click="!showClose && close()"
      @mouseleave="startTimer"
      @mouseenter="clearTimer"
    >
      <i v-if="iconClass" class="icon at-notification__icon" :class="iconClass"></i>
      <div class="at-notification__content">
        <p v-if="title" class="at-notification__title">{{ title }}</p>
        <p v-if="hasMessage" class="at-notification__message">{{ message }}</p>
      </div>
      <i v-show="showClose" class="icon icon-x at-notification__close" @click="close"></i>
    </div>
  </transition>
</template>

<script>
const iconClasses = {
  success: 'icon-check-circle',
  error: 'icon-x-circle',
  warning: 'icon-alert-circle',
  info: 'icon-info',
}

export default {
  props: {
    title: { type: [String, Number], default: '' },
    message: { type: [String, Number], default: '' },
    type: { type: String, default: '' },
    icon: { type: String, default: '' },
    duration: { type: Number, default: 4000 },
    showClose: { type: Boolean, default: true },
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
    hasMessage() {
      return this.message !== '' && this.message != null
    },
    iconClass() {
      return this.icon || iconClasses[this.type] || ''
    },
  },
  mounted() {
    // Shown after mount so the `notification-fade` enter transition plays.
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
      this.clearTimer()
      if (this.duration > 0 && !this.closed) {
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
