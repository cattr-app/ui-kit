<template>
  <transition name="notification-fade" @after-leave="doDestory">
    <div
      v-show="isShow"
      class="at-notification"
      :class="{
        [`at-notification--${type}`]: type,
        'at-notification--with-message': message,
        'at-notification--hover': !showClose,
      }"
      :style="{ top: top ? top + 'px' : 'auto' }"
      @click="!showClose && handleClose()"
      @mouseleave="startTimer"
      @mouseenter="clearTimer"
    >
      <i v-if="showIcon" class="icon at-notification__icon" :class="iconClass"></i>
      <div class="at-notification__content">
        <p v-if="title" class="at-notification__title" v-text="title"></p>
        <p v-if="message" class="at-notification__message" v-text="message"></p>
      </div>
      <i v-show="showClose" class="icon icon-x at-notification__close" @click="handleClose"></i>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      type: '',
      title: '',
      message: '',
      isShow: false,
      duration: 4000,
      icon: '',
      showClose: true,
      onClose: null,
      top: null,
      timer: null,
      closed: false,
    }
  },
  computed: {
    iconClass() {
      const classArr = {
        success: 'icon-check-circle',
        error: 'icon-x-circle',
        warning: 'icon-alert-circle',
        info: 'icon-info',
      }
      return classArr[this.type] || this.icon
    },
    showIcon() {
      return this.type
    },
  },
  watch: {
    closed(val) {
      if (val) {
        this.isShow = false
      }
    },
  },
  mounted() {
    this.startTimer()
  },
  methods: {
    doDestory() {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },
    handleClose() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose()
      }
    },
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.handleClose()
          }
        }, this.duration)
      }
    },
    clearTimer() {
      clearTimeout(this.timer)
    },
  },
}
</script>
