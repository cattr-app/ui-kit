<template>
  <div v-clickoutside="handleClose" class="at-popover">
    <span ref="trigger" class="at-popover__trigger">
      <slot></slot>
    </span>

    <transition :name="transition">
      <div
        v-if="show"
        ref="popover"
        class="at-popover__popper"
        :class="[placement ? 'at-popover--' + placement : 'at-popover--top']"
      >
        <div class="at-popover__arrow"></div>
        <div v-if="title" class="at-popover__title">
          <slot name="title">
            <!-- `title` is rendered as HTML since 1.x (intentional API); consumer sanitizes or uses the slot -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="title"></div>
          </slot>
        </div>
        <div class="at-popover__content">
          <slot name="content">
            <!-- `content` is rendered as HTML since 1.x (intentional API); consumer sanitizes or uses the slot -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="content"></div>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import clickoutside from '../../../directives/clickoutside'
import PopoverMixin from '../../../mixins/popover'

export default {
  name: 'AtPopover',
  directives: { clickoutside },
  mixins: [PopoverMixin],
  props: {
    trigger: {
      type: String,
      default: 'click',
    },
    transition: {
      type: String,
      default: 'fade',
    },
  },
  // `update:modelValue` and `toggle` come from the popover mixin; no own events.
  emits: [],
  methods: {
    handleClose() {
      this.show = false
    },
  },
}
</script>
