<template>
  <div
    class="at-textarea"
    :class="{
      'at-textarea--disabled': disabled,
    }"
  >
    <textarea
      ref="textarea"
      v-model="store"
      class="at-textarea__original"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :style="textareaStyle"
      :readonly="readonly"
      :rows="rows"
      :autofocus="autofocus"
      :maxlength="maxlength"
      :minlength="minlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    ></textarea>
  </div>
</template>

<script>
import { calcTextareaHeight } from './utils'

export default {
  name: 'AtTextarea',
  props: {
    modelValue: String,
    name: String,
    placeholder: String,
    readonly: Boolean,
    disabled: Boolean,
    rows: {
      type: Number,
      default: 2,
    },
    minlength: Number,
    maxlength: Number,
    autofocus: Boolean,
    autosize: {
      type: Boolean,
      default: false,
    },
    minRows: [Number, String],
    maxRows: [Number, String],
    resize: {
      type: String,
      default: 'vertical', // none, both, horizontal, vertical
    },
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  data() {
    return {
      store: this.modelValue,
      calculateStyle: {},
    }
  },
  computed: {
    textareaStyle() {
      return Object.assign({}, this.calculateStyle, {
        resize: this.resize,
      })
    },
  },
  watch: {
    modelValue(value) {
      this.store = value
    },
    store() {
      this.$nextTick(() => {
        this.resizeTextarea()
      })
    },
  },
  mounted() {
    this.resizeTextarea()
  },
  methods: {
    handleFocus(evt) {
      this.$emit('focus', evt)
    },
    handleBlur(evt) {
      this.$emit('blur', evt)
    },
    // user input only: an external modelValue change syncs `store` without events (as Input)
    handleInput(evt) {
      this.store = evt.target.value
      this.$emit('update:modelValue', this.store)
      this.$emit('change', this.store)
    },
    resizeTextarea() {
      if (!this.autosize && !this.minRows && !this.maxRows) return

      this.calculateStyle = calcTextareaHeight(this.$refs.textarea, this.minRows, this.maxRows)
    },
  },
}
</script>
