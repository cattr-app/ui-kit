<template>
  <transition name="fade">
    <div
      v-show="show"
      class="at-loading-bar"
      :class="{
        [`at-loading-bar--${status}`]: status,
      }"
      :style="barStyle"
    >
      <div class="at-loading-bar__inner" :style="{ width: percent + '%' }"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AtLoadingBar',
  props: {
    percent: { type: Number, default: 0 },
    status: { type: String, default: 'success' },
    show: { type: Boolean, default: false },
    width: { type: Number, default: 2 },
  },
  computed: {
    barStyle() {
      return {
        height: `${this.width | 0 || 2}px`,
      }
    },
  },
}
</script>
