<template>
  <transition name="fade">
    <div
      v-show="isShow"
      class="at-alert"
      :class="[type ? `at-alert--${type}` : '', description ? 'at-alert--with-description' : '']"
    >
      <i v-if="showIcon" class="icon at-alert__icon" :class="[iconClass]"></i>
      <div class="at-alert__content">
        <p v-if="message" class="at-alert__message" v-text="message"></p>
        <p v-if="description" class="at-alert__description" v-text="description"></p>
      </div>
      <i
        v-show="closable || closeText"
        class="icon at-alert__close"
        :class="[closeText ? 'at-alert__close--custom' : 'icon-x']"
        @click="handleClose"
        v-text="closeText"
      ></i>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AtAlert',
  props: {
    type: {
      type: String,
      default: 'info',
    },
    message: {
      type: String,
      required: true,
    },
    description: String,
    closable: {
      type: Boolean,
      default: false,
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: 'info',
    },
    closeText: String,
  },
  emits: ['on-close'],
  data() {
    return {
      isShow: true,
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
  },
  methods: {
    handleClose() {
      this.isShow = false
      this.$emit('on-close')
    },
  },
}
</script>
