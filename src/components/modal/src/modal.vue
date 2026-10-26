<template>
  <div>
    <transition name="fade">
      <div v-show="visible" class="at-modal__mask" @click="handleMaskClick"></div>
    </transition>
    <!-- / mask -->
    <div
      class="at-modal__wrapper"
      :class="{
        'at-modal--hidden': !wrapShow,
        'at-modal--confirm': isIconType,
        [`at-modal--confirm-${type}`]: isIconType,
      }"
      @click.self="handleWrapperClick"
    >
      <transition name="fade" @after-leave="$emit('after-leave')">
        <div v-show="visible" class="at-modal" :style="modalStyle">
          <div v-if="showHead && ($slots.header || title)" class="at-modal__header">
            <div class="at-modal__title">
              <slot name="header">
                <p>{{ title }}</p>
              </slot>
            </div>
          </div>
          <div class="at-modal__body">
            <slot>
              <p>{{ content }}</p>
              <div v-if="showInput" class="at-modal__input">
                <at-input
                  ref="input"
                  v-model="currentInputValue"
                  :placeholder="inputPlaceholder"
                  @keyup.enter="handleAction('confirm')"
                ></at-input>
              </div>
            </slot>
          </div>
          <div v-if="showFooter" class="at-modal__footer">
            <slot name="footer">
              <at-button v-show="showCancelButton" @click="handleAction('cancel')">{{
                localeCancelText
              }}</at-button>
              <at-button
                v-show="showConfirmButton"
                type="primary"
                @click="handleAction('confirm')"
                >{{ localeOKText }}</at-button
              >
            </slot>
          </div>
          <i v-if="isIconType" class="icon at-modal__icon" :class="iconClass"></i>
          <span v-if="showClose" class="at-modal__close" @click="handleAction('cancel')"
            ><i class="icon icon-x"></i
          ></span>
        </div>
      </transition>
    </div>
    <!-- / wrap -->
  </div>
</template>

<script>
import { t } from '../../../locale'
import AtButton from '../../button'
import AtInput from '../../input'

export default {
  name: 'AtModal',
  // local: the dialog works with a standalone `app.use(Dialog)` / `app.use(AtModal)`
  components: { AtButton, AtInput },
  props: {
    title: String,
    content: String,
    modelValue: {
      type: Boolean,
      default: false,
    },
    cancelText: {
      type: String,
    },
    okText: {
      type: String,
    },
    maskClosable: {
      type: Boolean,
      default: true,
    },
    showHead: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
    showConfirmButton: {
      type: Boolean,
      default: true,
    },
    showInput: {
      type: Boolean,
      default: false,
    },
    inputValue: {
      type: [String, Number],
      default: null,
    },
    inputPlaceholder: {
      type: String,
      default: '',
    },
    width: {
      type: [Number, String],
      default: 520,
    },
    closeOnPressEsc: {
      type: Boolean,
      default: true,
    },
    styles: {
      type: Object,
      default() {
        return {}
      },
    },
    type: String,
  },
  // `after-leave`: the close transition has finished (the $Modal service unmounts here).
  emits: ['update:modelValue', 'on-confirm', 'on-cancel', 'after-leave'],
  data() {
    return {
      wrapShow: false,
      visible: this.modelValue,
      currentInputValue: this.inputValue,
      timer: null,
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

      return classArr[this.type] || ''
    },
    isIconType() {
      return ['success', 'error', 'warning', 'info'].indexOf(this.type) > -1
    },
    modalStyle() {
      const style = {}
      const styleWidth = {
        width: `${this.width}px`,
      }

      Object.assign(style, styleWidth, this.styles)

      return style
    },
    localeOKText() {
      return typeof this.okText === 'undefined' ? t('at.modal.okText') : this.okText
    },
    localeCancelText() {
      return typeof this.cancelText === 'undefined' ? t('at.modal.cancelText') : this.cancelText
    },
  },
  watch: {
    modelValue(val) {
      this.visible = val
    },
    inputValue(val) {
      this.currentInputValue = val
    },
    visible(val) {
      this.clearTimer()
      if (val) {
        this.wrapShow = true
        this.focusInput()
      } else {
        this.timer = setTimeout(() => {
          this.wrapShow = false
        }, 300)
      }
    },
  },
  mounted() {
    if (this.visible) {
      this.wrapShow = true
      // opened from the start: the input gets focus as when opened later
      this.focusInput()
    }

    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
    this.clearTimer()
  },
  methods: {
    focusInput() {
      if (this.showInput) {
        this.$nextTick(() => this.$refs.input?.$el.querySelector('input')?.focus())
      }
    },
    close() {
      this.visible = false
      this.$emit('update:modelValue', false)
    },
    handleMaskClick() {
      if (this.maskClosable) {
        this.handleAction('cancel')
      }
    },
    handleWrapperClick() {
      if (this.maskClosable) {
        this.handleAction('cancel')
      }
    },
    handleAction(action) {
      if (!this.visible) return
      this.close()
      this.$emit(action === 'confirm' ? 'on-confirm' : 'on-cancel')
    },
    handleKeydown(evt) {
      if (this.visible && this.showClose && this.closeOnPressEsc && evt.key === 'Escape') {
        this.handleAction('cancel')
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
  },
}
</script>
