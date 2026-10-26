<template>
  <div class="at-slider">
    <!-- S slider track -->
    <div
      ref="slider"
      class="at-slider__track"
      :class="{
        'at-slider--disabled': disabled,
      }"
      @click="onSliderClick"
    >
      <div class="at-slider__bar" :style="{ width: currentPosition }"></div>

      <!-- S tooltip and dot -->
      <div
        class="at-slider__dot-wrapper"
        :class="{
          'at-slider__dot-wrapper--hover': isHover,
          'at-slider__dot-wrapper--drag': isDrag,
        }"
        :style="{ left: currentPosition }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @mousedown="handleMouseDown"
      >
        <at-tooltip ref="tooltip" placement="top" trigger="click" content="Top value">
          <div
            class="at-slider__dot"
            :class="{
              'at-slider__dot--hover': isHover,
              'at-slider__dot--drag': isDrag,
            }"
          ></div>
          <template #content>
            <span>{{ currentValue }}</span>
          </template>
        </at-tooltip>
      </div>
      <!-- E tooltip and dot -->
    </div>
    <!-- E slider track -->
  </div>
</template>

<script>
import AtTooltip from '../../tooltip'

const HIDE_DELAY = 200

// number of digits after the decimal point (0.25 → 2, 3 → 0)
function decimals(num) {
  const str = String(num)
  const dot = str.indexOf('.')
  return dot === -1 ? 0 : str.length - dot - 1
}

export default {
  name: 'AtSlider',
  components: {
    AtTooltip,
  },
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      // local copy of modelValue: the dot follows it right away, without waiting
      // for the parent to pass the emitted value back
      currentValue: this.modelValue,
      isHover: false,
      isDrag: false,
      startX: 0,
      startPos: 0,
      newPos: null,
      oldValue: this.modelValue,
    }
  },
  computed: {
    currentPosition() {
      return `${((this.currentValue - this.min) * 100) / (this.max - this.min)}%`
    },
  },
  watch: {
    modelValue(val) {
      if (typeof val !== 'number' || isNaN(val) || val < this.min) {
        this.$emit('update:modelValue', this.min)
        return
      }

      if (val > this.max) {
        this.$emit('update:modelValue', this.max)
        return
      }

      this.currentValue = val

      // programmatic change (not an echo of our own emit): report it as 1.x did
      if (!this.isDrag && val !== this.oldValue) {
        this.oldValue = val
        this.$emit('change', val)
      }
    },
  },
  created() {
    // plain instance field, not reactive
    this.hoverTimer = null

    if (
      typeof this.modelValue !== 'number' ||
      isNaN(this.modelValue) ||
      this.modelValue < this.min
    ) {
      this.$emit('update:modelValue', this.min)
    } else if (this.modelValue > this.max) {
      this.$emit('update:modelValue', this.max)
    }
  },
  beforeUnmount() {
    clearTimeout(this.hoverTimer)
    this.removeDragListeners()
  },
  methods: {
    toPercent(val) {
      return ((val - this.min) * 100) / (this.max - this.min)
    },
    getSliderRect() {
      return this.$refs.slider.getBoundingClientRect()
    },
    handleMouseEnter() {
      clearTimeout(this.hoverTimer)
      this.isHover = true
      this.$refs.tooltip?.showPopover()
    },
    handleMouseLeave() {
      if (this.isDrag) return
      this.isHover = false
      clearTimeout(this.hoverTimer)
      this.hoverTimer = setTimeout(() => {
        this.$refs.tooltip?.hidePopover()
      }, HIDE_DELAY)
    },
    handleMouseDown(evt) {
      if (this.disabled) return
      this.onDragStart(evt)

      window.addEventListener('mousemove', this.onDragging)
      window.addEventListener('mouseup', this.onDragEnd)
    },
    removeDragListeners() {
      window.removeEventListener('mousemove', this.onDragging)
      window.removeEventListener('mouseup', this.onDragEnd)
    },
    onDragStart(evt) {
      this.isDrag = true
      this.startX = evt.clientX
      this.startPos = this.toPercent(this.currentValue)
      this.newPos = this.startPos
    },
    onDragging(evt) {
      if (!this.isDrag) return
      const width = this.getSliderRect().width
      if (!width) return

      this.$refs.tooltip?.showPopover()
      this.newPos = this.startPos + ((evt.clientX - this.startX) * 100) / width
      this.setPosition(this.newPos)
    },
    onDragEnd() {
      this.removeDragListeners()
      if (!this.isDrag) return

      this.$refs.tooltip?.hidePopover()
      this.isDrag = false
      this.setPosition(this.newPos)
    },
    setPosition(pos) {
      if (pos < 0) {
        pos = 0
      } else if (pos > 100) {
        pos = 100
      }

      const { min, max } = this
      const step = this.step > 0 ? this.step : 1
      const raw = min + (pos * (max - min)) / 100

      // snap to the min + k * step grid, stay within [min, max] and drop float
      // noise (0.30000000000000004) at the precision of step/min/max
      let value = min + Math.round((raw - min) / step) * step
      value = Math.min(max, Math.max(min, value))
      value = parseFloat(value.toFixed(Math.max(decimals(step), decimals(min), decimals(max))))

      if (value !== this.currentValue) {
        this.currentValue = value
        this.$emit('update:modelValue', value)
      }

      if (!this.isDrag && value !== this.oldValue) {
        this.oldValue = value
        this.$emit('change', value)
      }
    },
    onSliderClick(evt) {
      if (this.disabled || this.isDrag) return
      const { left, width } = this.getSliderRect()
      if (!width) return
      this.setPosition(((evt.clientX - left) / width) * 100)
    },
  },
}
</script>
