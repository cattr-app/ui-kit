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
  data() {
    return {
      show: false,
      status: 'success',
      percent: 0,
      width: 2,
    }
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
