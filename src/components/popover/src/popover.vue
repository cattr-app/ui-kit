<template>
  <div ref="parent" v-clickoutside="handleClose" class="at-popover">
    <span ref="trigger" class="at-popover__trigger">
      <slot></slot>
    </span>

    <transition :name="transition" @after-leave="doDestory">
      <div
        v-if="show"
        ref="popover"
        class="at-popover__popper"
        :class="[placement ? 'at-popover--' + placement : 'at-popover--top']"
      >
        <div class="at-popover__arrow"></div>
        <div v-if="title" class="at-popover__title">
          <slot name="title"><div v-html="title"></div></slot>
        </div>
        <div class="at-popover__content">
          <slot name="content"><div v-html="content"></div></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Clickoutside from '../../../directives/clickoutside'
import PopoverMixin from '../../../mixins/popover'

export default {
  name: 'AtPopover',
  directives: { Clickoutside },
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
  watch: {
    value(value) {
      this.show = value
    },
  },
  methods: {
    handleClose() {
      this.show = false
    },
  },
}
</script>
