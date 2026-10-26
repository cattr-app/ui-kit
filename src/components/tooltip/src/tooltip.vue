<template>
  <div class="at-tooltip">
    <span ref="trigger" class="at-tooltip__trigger">
      <slot></slot>
    </span>

    <transition :name="transition">
      <div
        v-if="show"
        ref="popover"
        class="at-tooltip__popper"
        :class="[placement ? 'at-tooltip--' + placement : 'at-tooltip--top']"
      >
        <div class="at-tooltip__arrow"></div>
        <div class="at-tooltip__content">
          <slot name="content"><div v-text="content"></div></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import PopoverMixin from '../../../mixins/popover'

export default {
  name: 'AtTooltip',
  mixins: [PopoverMixin],
  props: {
    trigger: {
      type: String,
      default: 'hover',
    },
    transition: {
      type: String,
      default: 'fade',
    },
  },
}
</script>
