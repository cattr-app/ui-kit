<template>
  <div
    class="at-progress"
    :class="[
      type ? `at-progress--${type}` : 'at-progress--bar',
      currentStatus ? `at-progress--${currentStatus}` : '',
    ]"
  >
    <!-- S 环形进度条 -->
    <div v-if="type === 'circle'" class="at-progress-circle"></div>
    <!-- E 环形进度条 -->

    <!-- S 条状进度条 -->
    <div v-else class="at-progress-bar">
      <div class="at-progress-bar__wraper" :style="barStyle">
        <div class="at-progress-bar__inner" :style="{ width: percent + '%' }"></div>
      </div>
    </div>
    <div class="at-progress__text">
      <span v-if="!currentStatus">{{ percent }}%</span>
      <i v-else class="icon" :class="statusIconClass"></i>
    </div>
    <!-- E 条状进度条 -->
  </div>
</template>

<script>
export default {
  name: 'AtProgress',
  props: {
    type: {
      type: String,
      default: 'bar',
      validator: val => ['bar', 'circle'].indexOf(val) > -1,
    },
    status: {
      type: String,
      default: '',
      validator: val => ['', 'success', 'error'].indexOf(val) > -1,
    },
    percent: {
      type: Number,
      default: 0,
      required: true,
      validator: val => val >= 0 && val <= 100,
    },
    strokeWidth: {
      type: Number,
      default: 8,
    },
  },
  data() {
    return {
      currentStatus: this.status,
    }
  },
  computed: {
    barStyle() {
      return {
        height: `${this.strokeWidth}px`,
      }
    },
    statusIconClass() {
      return this.currentStatus === 'success' ? 'icon-check-circle' : 'icon-x-circle'
    },
  },
  watch: {
    percent(val) {
      this.handleChange(val | 0)
    },
  },
  mounted() {
    this.handleChange(this.percent)
  },
  methods: {
    handleChange(val) {
      if (val === 100) {
        this.currentStatus = 'success'
        this.$emit('on-status-success', this.percent)
      } else {
        this.currentStatus = this.status
      }
    },
  },
}
</script>
