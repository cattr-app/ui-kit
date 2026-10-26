<template>
  <div
    v-clickoutside="handleClose"
    :class="[
      'at-select',
      {
        'at-select--visible': visible,
        'at-select--disabled': disabled,
        'at-select--multiple': multiple,
        'at-select--single': !multiple,
        'at-select--show-clear': showCloseIcon,
        [`at-select--${size}`]: !!size,
      },
    ]"
  >
    <!-- S Selection -->
    <div ref="trigger" class="at-select__selection" @click="toggleMenu">
      <span v-for="item in selectedMultiple" :key="item.value" class="at-tag">
        <span class="at-tag__text">{{ item.label }}</span>
        <i class="icon icon-x at-tag__close" @click.stop="removeTag(item.value)"></i>
      </span>
      <span v-show="showPlaceholder && !filterable" class="at-select__placeholder">{{
        localePlaceholder
      }}</span>
      <span v-show="!showPlaceholder && !multiple && !filterable" class="at-select__selected">{{
        selectedSingle
      }}</span>
      <input
        v-if="filterable"
        ref="input"
        v-model="query"
        type="text"
        class="at-select__input"
        :placeholder="showPlaceholder ? localePlaceholder : ''"
        @input="handleInput"
        @blur="handleBlur"
        @keydown.delete="handleInputDelete"
      />
      <i class="icon icon-chevron-down at-select__arrow"></i>
      <i
        v-show="showCloseIcon"
        class="icon icon-x at-select__clear"
        @click.stop="clearSingleSelect"
      ></i>
    </div>
    <!-- E Selection -->

    <!-- S Dropdown -->
    <transition name="slide-up">
      <div
        v-show="visible"
        ref="popover"
        class="at-select__dropdown"
        :class="[placement ? `at-select__dropdown--${placement}` : 'at-select__dropdown--bottom']"
      >
        <ul v-show="notFound" class="at-select__not-found">
          <li>{{ localeNotFoundText }}</li>
        </ul>
        <ul v-show="!notFound" class="at-select__list">
          <slot></slot>
        </ul>
      </div>
    </transition>
    <!-- E Dropdown -->
  </div>
</template>

<script>
import { getCurrentInstance, reactive, ref, toRef } from 'vue'
import clickoutside from '../../../directives/clickoutside'
import Locale from '../../../mixins/locale'
import { useChildren } from '../../../composables/useChildren'
import { SelectContext } from './context'

const BLUR_DELAY = 300

function isEmpty(value) {
  return (
    value === '' || value === undefined || value === null || (Array.isArray(value) && !value.length)
  )
}

export default {
  name: 'AtSelect',
  directives: { clickoutside },
  mixins: [Locale],
  props: {
    modelValue: {
      type: [String, Number, Array],
      default: '',
    },
    // kept for API compatibility with 1.x; only `click` is supported
    trigger: {
      type: String,
      default: 'click',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'normal',
      validator: val => ['normal', 'small', 'large'].indexOf(val) > -1,
    },
    valueWithLabel: {
      type: Boolean,
      default: false,
    },
    notFoundText: {
      type: String,
    },
    placement: {
      type: String,
      default: 'bottom',
    },
  },
  emits: ['update:modelValue', 'on-change'],
  setup(props) {
    const vm = getCurrentInstance().proxy
    const { children, register, unregister, sort } = useChildren()
    // internal copy of the selection, so the component also works without v-model
    const model = ref(props.modelValue)
    // text in the filter input
    const query = ref('')
    // active filter: follows user input only, reset on open/select
    const filterQuery = ref('')
    const focusUid = ref(null)

    SelectContext.provide(
      reactive({
        modelValue: model,
        multiple: toRef(props, 'multiple'),
        filterable: toRef(props, 'filterable'),
        valueWithLabel: toRef(props, 'valueWithLabel'),
        query: filterQuery,
        focusUid,
        children,
        register,
        unregister,
        select: value => vm.selectOption(value),
        isSelected: value =>
          props.multiple
            ? Array.isArray(model.value) && model.value.includes(value)
            : model.value === value,
        blur: uid => {
          if (focusUid.value === uid) focusUid.value = null
        },
      }),
    )

    return { children, sortChildren: sort, model, query, filterQuery, focusUid }
  },
  data() {
    return {
      visible: false,
    }
  },
  computed: {
    values() {
      return Array.isArray(this.model) ? this.model : []
    },
    showPlaceholder() {
      return isEmpty(this.model)
    },
    showCloseIcon() {
      return !this.multiple && this.clearable && !this.showPlaceholder
    },
    selectedSingle() {
      if (this.multiple || isEmpty(this.model)) return ''
      return this.labelOf(this.model)
    },
    selectedMultiple() {
      if (!this.multiple) return []
      return this.values
        .map(value => this.findOption(value))
        .filter(Boolean)
        .map(option => ({ value: option.value, label: option.label }))
    },
    navigable() {
      return this.children.map(c => c.exposed).filter(o => !o.hidden && !o.disabled)
    },
    notFound() {
      if (!this.children.length) return !!this.filterQuery
      return this.children.every(c => c.exposed.hidden)
    },
    localePlaceholder() {
      return typeof this.placeholder === 'undefined'
        ? this.t('at.select.placeholder')
        : this.placeholder
    },
    localeNotFoundText() {
      return typeof this.notFoundText === 'undefined'
        ? this.t('at.select.notFoundText')
        : this.notFoundText
    },
  },
  watch: {
    modelValue(value) {
      this.model = value
      if (isEmpty(value)) this.query = ''
    },
    selectedSingle: {
      immediate: true,
      handler(label) {
        // single filterable: the input shows the selected label (options may register later)
        if (this.filterable && !this.multiple && !this.visible) this.query = String(label)
      },
    },
    visible(value) {
      this.focusUid = null
      if (value) {
        this.updatePosition()
        if (this.filterable) {
          this.$nextTick(() => {
            const input = this.$refs.input
            if (!input) return
            if (this.multiple) input.focus()
            else input.select()
          })
        }
      } else if (this.filterable && this.$refs.input) {
        this.$refs.input.blur()
      }
    },
    filterQuery() {
      this.updatePosition()
    },
  },
  created() {
    // plain instance field, not reactive
    this.blurTimer = null
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown)
  },
  updated() {
    // keyed v-for may reorder options without remounting them
    this.sortChildren()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
    clearTimeout(this.blurTimer)
  },
  methods: {
    findOption(value) {
      const child = this.children.find(c => c.exposed.value === value)
      return child ? child.exposed : null
    },
    labelOf(value) {
      const option = this.findOption(value)
      return option ? option.label : ''
    },
    setModel(next) {
      this.model = next
      this.$emit('update:modelValue', next)

      if (!this.valueWithLabel) {
        this.$emit('on-change', next)
      } else if (this.multiple) {
        this.$emit(
          'on-change',
          next.map(value => ({ value, label: this.labelOf(value) })),
        )
      } else {
        this.$emit('on-change', { value: next, label: this.labelOf(next) })
      }
    },
    selectOption(value) {
      if (this.multiple) {
        const next = this.values.includes(value)
          ? this.values.filter(v => v !== value)
          : [...this.values, value]
        this.setModel(next)

        if (this.filterable) {
          this.query = ''
          this.filterQuery = ''
          if (this.$refs.input) this.$refs.input.focus()
        }
        this.updatePosition()
      } else {
        if (this.model !== value) this.setModel(value)
        if (this.filterable) this.query = String(this.labelOf(value))
        this.hideMenu()
      }
    },
    toggleMenu() {
      if (this.disabled) return
      // opening from the trigger shows all options; typing filters again
      if (!this.visible) this.filterQuery = ''
      this.visible = !this.visible
    },
    hideMenu() {
      this.visible = false
      this.focusUid = null
    },
    handleClose() {
      if (this.visible) this.hideMenu()
    },
    handleKeydown(evt) {
      if (!this.visible) return

      switch (evt.key) {
        case 'Escape':
          evt.preventDefault()
          this.hideMenu()
          break
        case 'ArrowDown':
          evt.preventDefault()
          this.navigateOptions(1)
          break
        case 'ArrowUp':
          evt.preventDefault()
          this.navigateOptions(-1)
          break
        case 'Enter': {
          evt.preventDefault()
          const option =
            this.navigable.find(o => o.uid === this.focusUid) || this.navigable[0] || null
          if (option) this.selectOption(option.value)
          break
        }
      }
    },
    navigateOptions(step) {
      const list = this.navigable
      if (!list.length) return

      const current = list.findIndex(o => o.uid === this.focusUid)
      let next
      if (current === -1) {
        next = step > 0 ? 0 : list.length - 1
      } else {
        next = (current + step + list.length) % list.length
      }

      this.focusUid = list[next].uid
      this.resetScrollTop()
    },
    resetScrollTop() {
      const popover = this.$refs.popover
      const child = this.children.find(c => c.exposed.uid === this.focusUid)
      if (!popover || !child || !child.el) return

      // Offset of the option inside the dropdown's scrolled content. Measured from the rendered
      // boxes, not via `offsetParent`: the dropdown is not necessarily the option's offsetParent
      // (e.g. when its `position` is overridden).
      const optionRect = child.el.getBoundingClientRect()
      const popoverRect = popover.getBoundingClientRect()
      const top = optionRect.top - popoverRect.top - popover.clientTop + popover.scrollTop
      const bottom = top + optionRect.height
      if (top < popover.scrollTop) {
        popover.scrollTop = top
      } else if (bottom > popover.scrollTop + popover.clientHeight) {
        popover.scrollTop = bottom - popover.clientHeight
      }
    },
    updatePosition() {
      this.$nextTick(() => {
        const { trigger, popover } = this.$refs
        if (!this.visible || !trigger || !popover) return

        const top = String(this.placement).startsWith('top')
          ? trigger.offsetTop - popover.offsetHeight
          : trigger.offsetTop + trigger.offsetHeight

        popover.style.top = `${top}px`
        popover.style.left = `${trigger.offsetLeft}px`
      })
    },
    clearSingleSelect() {
      if (!this.showCloseIcon) return
      this.setModel('')
      if (this.filterable) {
        // reset the active filter too: option visibility and `notFound` follow `filterQuery`
        this.query = ''
        this.filterQuery = ''
      }
    },
    removeTag(value) {
      if (this.disabled) return
      this.setModel(this.values.filter(v => v !== value))

      if (this.filterable && this.visible && this.$refs.input) {
        this.$refs.input.focus()
      }
      this.updatePosition()
    },
    handleInput(evt) {
      this.filterQuery = evt.target.value
      if (!this.visible && !this.disabled) this.visible = true
    },
    handleBlur() {
      // delayed: a click on an option blurs the input before the option handles it
      clearTimeout(this.blurTimer)
      this.blurTimer = setTimeout(() => {
        this.query = !this.multiple && !isEmpty(this.model) ? String(this.selectedSingle) : ''
      }, BLUR_DELAY)
    },
    handleInputDelete() {
      if (this.multiple && this.values.length && this.query === '') {
        this.removeTag(this.values[this.values.length - 1])
      }
    },
  },
}
</script>
