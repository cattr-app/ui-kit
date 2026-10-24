/**
 * popover mixins
 * https://github.com/yuche/vue-strap/blob/master/src/utils/popoverMixins.js
 *
 * The host component provides `ref="trigger"` (element the listeners are bound to) and
 * `ref="popover"` (positioned element). `v-model` controls `show`.
 */
const HIDE_DELAY = 200

export default {
  props: {
    trigger: String,
    title: String,
    content: {
      type: String,
      default: '',
    },
    header: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: String,
      default: 'top',
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'toggle'],
  data() {
    return {
      show: this.modelValue,
      position: {
        top: 0,
        left: 0,
      },
    }
  },
  watch: {
    modelValue(value) {
      if (value === this.show) return
      // mark the change as coming from the parent so it is not echoed back
      this.popoverSyncing = true
      this.show = value
    },
    show(value) {
      if (this.popoverSyncing) {
        this.popoverSyncing = false
        return
      }
      this.$emit('update:modelValue', value)
    },
  },
  created() {
    // plain instance fields, not reactive
    this.popoverTimer = null
    this.popoverSyncing = false
    this.popoverListeners = []
  },
  methods: {
    // Trigger listeners survive a hide (the popover can be shown again); they are
    // removed in beforeUnmount.
    toggle() {
      this.show = !this.show
      this.$emit('toggle', this.show)
      if (!this.show) return

      this.setPopoverPosition()
    },
    showPopover() {
      this.show = true
      this.setPopoverPosition()
    },
    hidePopover() {
      this.show = false
    },
    handleMouseEnter() {
      this.showPopover()
      clearTimeout(this.popoverTimer)
    },
    handleMouseLeave() {
      clearTimeout(this.popoverTimer)
      this.popoverTimer = setTimeout(() => {
        this.hidePopover()
      }, HIDE_DELAY)
    },
    setPopoverPosition() {
      this.$nextTick(() => {
        const popover = this.$refs.popover
        const trigger = this.$refs.trigger
        if (!popover || !trigger) return

        switch (this.placement) {
          case 'top':
            this.position.left =
              trigger.offsetLeft - popover.offsetWidth / 2 + trigger.offsetWidth / 2
            this.position.top = trigger.offsetTop - popover.offsetHeight
            break
          case 'top-left':
            this.position.left = trigger.offsetLeft
            this.position.top = trigger.offsetTop - popover.offsetHeight
            break
          case 'top-right':
            this.position.left = trigger.offsetLeft + trigger.offsetWidth - popover.offsetWidth
            this.position.top = trigger.offsetTop - popover.offsetHeight
            break
          case 'left':
            this.position.left = trigger.offsetLeft - popover.offsetWidth
            this.position.top =
              trigger.offsetTop + trigger.offsetHeight / 2 - popover.offsetHeight / 2
            break
          case 'left-top':
            this.position.left = trigger.offsetLeft - popover.offsetWidth
            this.position.top = trigger.offsetTop
            break
          case 'left-bottom':
            this.position.left = trigger.offsetLeft - popover.offsetWidth
            this.position.top = trigger.offsetTop + trigger.offsetHeight - popover.offsetHeight
            break
          case 'right':
            this.position.left = trigger.offsetLeft + trigger.offsetWidth
            this.position.top =
              trigger.offsetTop + trigger.offsetHeight / 2 - popover.offsetHeight / 2
            break
          case 'right-top':
            this.position.left = trigger.offsetLeft + trigger.offsetWidth
            this.position.top = trigger.offsetTop
            break
          case 'right-bottom':
            this.position.left = trigger.offsetLeft + trigger.offsetWidth
            this.position.top = trigger.offsetTop + trigger.offsetHeight - popover.offsetHeight
            break
          case 'bottom':
            this.position.left =
              trigger.offsetLeft - popover.offsetWidth / 2 + trigger.offsetWidth / 2
            this.position.top = trigger.offsetTop + trigger.offsetHeight
            break
          case 'bottom-left':
            this.position.left = trigger.offsetLeft
            this.position.top = trigger.offsetTop + trigger.offsetHeight
            break
          case 'bottom-right':
            this.position.left = trigger.offsetLeft + trigger.offsetWidth - popover.offsetWidth
            this.position.top = trigger.offsetTop + trigger.offsetHeight
            break
          default:
            // if user set wrong placement, then use default 'top'
            this.position.left =
              trigger.offsetLeft - popover.offsetWidth / 2 + trigger.offsetWidth / 2
            this.position.top = trigger.offsetTop - popover.offsetHeight
            break
        }

        popover.style.top = `${this.position.top}px`
        popover.style.left = `${this.position.left}px`
      })
    },
    addTriggerListener(el, event, handler) {
      el.addEventListener(event, handler)
      this.popoverListeners.push([el, event, handler])
    },
    removeTriggerListeners() {
      this.popoverListeners.forEach(([el, event, handler]) => {
        el.removeEventListener(event, handler)
      })
      this.popoverListeners = []
    },
  },
  mounted() {
    const trigger = this.$refs.trigger

    if (!trigger) {
      return console.error('Could not find trigger ref in your component that uses popovermixin')
    }

    if (this.trigger === 'click') {
      this.addTriggerListener(trigger, 'click', this.toggle)
    } else if (this.trigger === 'hover') {
      this.addTriggerListener(trigger, 'mouseenter', this.handleMouseEnter)
      this.addTriggerListener(trigger, 'mouseleave', this.handleMouseLeave)
    } else if (this.trigger === 'focus') {
      this.addTriggerListener(trigger, 'focus', this.showPopover)
      this.addTriggerListener(trigger, 'blur', this.hidePopover)
    }
  },
  beforeUnmount() {
    clearTimeout(this.popoverTimer)
    this.removeTriggerListeners()
  },
}
