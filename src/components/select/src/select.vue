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
      <span v-show="showPlaceholder && !searchable" class="at-select__placeholder">{{
        localePlaceholder
      }}</span>
      <span v-show="!showPlaceholder && !multiple && !searchable" class="at-select__selected">{{
        selectedSingle
      }}</span>
      <input
        v-if="searchable"
        ref="input"
        v-model="query"
        type="text"
        class="at-select__input"
        :disabled="disabled"
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
        @scroll="checkLoadMore"
      >
        <ul v-show="showEmpty" class="at-select__not-found">
          <li>
            <slot name="empty" :query="filterQuery" :loading="isLoading">{{ emptyText }}</slot>
          </li>
        </ul>
        <ul v-show="!showEmpty" class="at-select__list">
          <slot></slot>
          <li v-if="remote && isLoading" class="at-select__loading">{{ localeLoadingText }}</li>
        </ul>
        <div v-if="$slots.footer" class="at-select__footer">
          <slot name="footer" :query="filterQuery" :loading="isLoading"></slot>
        </div>
      </div>
    </transition>
    <!-- E Dropdown -->
  </div>
</template>

<script>
import { computed, getCurrentInstance, reactive, ref, toRef } from 'vue'
import clickoutside from '../../../directives/clickoutside'
import Locale from '../../../mixins/locale'
import { useChildren } from '../../../composables/useChildren'
import { SelectContext } from './context'

const BLUR_DELAY = 300
// remote mode: `on-load-more` fires when the end of the list is closer than this (px)
const LOAD_MORE_DISTANCE = 20

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
    // remote mode: options come from the consumer's `remoteMethod`, not filtered locally
    remote: {
      type: Boolean,
      default: false,
    },
    // `(query, { signal }) => Promise | void`; `signal` is aborted when a newer search starts
    remoteMethod: {
      type: Function,
    },
    // delay (ms) between the last keystroke and the `remoteMethod` call
    debounce: {
      type: Number,
      default: 300,
    },
    // shows the loading state (e.g. while the consumer loads the next page)
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
    },
    // `value => label`: label of a selected value whose option is not rendered (not loaded yet)
    fallbackLabel: {
      type: Function,
    },
  },
  emits: ['update:modelValue', 'on-change', 'on-load-more'],
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
        // options filter themselves only in local mode: remote options are already the result
        filterable: computed(() => props.filterable && !props.remote),
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
      // remote mode: the latest `remoteMethod` call has not settled yet
      remoteLoading: false,
      // remote mode: labels of the selected values, kept when their options are replaced
      labelCache: new Map(),
    }
  },
  computed: {
    // the input is shown both for local filtering and for remote search
    searchable() {
      return this.filterable || this.remote
    },
    isLoading() {
      return this.loading || this.remoteLoading
    },
    values() {
      return Array.isArray(this.model) ? this.model : []
    },
    showPlaceholder() {
      return isEmpty(this.model)
    },
    showCloseIcon() {
      return !this.multiple && this.clearable && !this.disabled && !this.showPlaceholder
    },
    selectedSingle() {
      if (this.multiple || isEmpty(this.model)) return ''
      return this.labelOf(this.model)
    },
    selectedMultiple() {
      if (!this.multiple) return []
      return this.values
        .map(value => ({ value, label: this.resolveLabel(value) }))
        .filter(item => item.label !== undefined)
    },
    // remote mode: `[value, label]` of every selected value whose option is rendered now
    renderedSelection() {
      if (!this.remote) return []
      const values = this.multiple ? this.values : isEmpty(this.model) ? [] : [this.model]
      return values.map(value => {
        const option = this.findOption(value)
        return [value, option ? option.label : undefined]
      })
    },
    navigable() {
      return this.children.map(c => c.exposed).filter(o => !o.hidden && !o.disabled)
    },
    notFound() {
      if (!this.children.length) return !!this.filterQuery
      return this.children.every(c => c.exposed.hidden)
    },
    showEmpty() {
      // remote options are not filtered locally: empty means nothing is loaded
      return this.remote ? !this.children.length : this.notFound
    },
    emptyText() {
      return this.remote && this.isLoading ? this.localeLoadingText : this.localeNotFoundText
    },
    localeLoadingText() {
      return typeof this.loadingText === 'undefined'
        ? this.t('at.select.loadingText')
        : this.loadingText
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
        if (this.searchable && !this.multiple && !this.visible) this.query = String(label)
      },
    },
    renderedSelection: {
      immediate: true,
      handler(selection) {
        if (!this.remote) return
        // keep only the selected values; a rendered option refreshes its label
        const next = new Map()
        selection.forEach(([value, label]) => {
          if (label !== undefined) next.set(value, label)
          else if (this.labelCache.has(value)) next.set(value, this.labelCache.get(value))
        })
        this.labelCache = next
      },
    },
    'children.length'() {
      // a new page (or a new result) arrived: the end of the list may be reached again
      this.loadMoreArmed = true
      this.$nextTick(this.checkLoadMore)
      // the dropdown height changed: `placement="top"` is measured from it
      this.updatePosition()
    },
    isLoading(value) {
      if (!value) this.$nextTick(this.checkLoadMore)
      // the loading text / row changes the dropdown height
      this.updatePosition()
    },
    visible(value) {
      this.focusUid = null
      if (!value) {
        // a search typed right before closing is dropped: opening searches again
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
      if (value) {
        this.updatePosition()
        if (this.searchable) {
          this.$nextTick(() => {
            const input = this.$refs.input
            if (!input) return
            if (this.multiple) input.focus()
            else input.select()
          })
        }
      } else if (this.searchable && this.$refs.input) {
        this.$refs.input.blur()
      }
    },
    filterQuery() {
      this.updatePosition()
    },
  },
  created() {
    // plain instance fields, not reactive
    this.blurTimer = null
    // remote mode: debounce timer, controller of the latest search, its query
    this.searchTimer = null
    this.searchController = null
    this.searchQuery = ''
    // `on-load-more` is emitted once until the list changes or a new search starts
    this.loadMoreArmed = true
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
    clearTimeout(this.searchTimer)
    if (this.searchController) this.searchController.abort()
  },
  methods: {
    findOption(value) {
      const child = this.children.find(c => c.exposed.value === value)
      return child ? child.exposed : null
    },
    // label of a value: its option, then (remote) the remembered label, then `fallbackLabel`;
    // `undefined` when unknown
    resolveLabel(value) {
      const option = this.findOption(value)
      if (option) return option.label
      if (this.remote && this.labelCache.has(value)) return this.labelCache.get(value)
      if (this.fallbackLabel) {
        const label = this.fallbackLabel(value)
        if (label != null) return label
      }
      return undefined
    },
    labelOf(value) {
      const label = this.resolveLabel(value)
      return label === undefined ? '' : label
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

        // remote: the query and the loaded results stay, so several options can be picked
        if (this.filterable && !this.remote) {
          this.query = ''
          this.filterQuery = ''
        }
        if (this.searchable && this.$refs.input) this.$refs.input.focus()
        this.updatePosition()
      } else {
        if (this.model !== value) this.setModel(value)
        if (this.searchable) this.query = String(this.labelOf(value))
        this.hideMenu()
      }
    },
    toggleMenu() {
      if (this.disabled) return
      // opening from the trigger shows all options; typing filters again
      if (!this.visible) {
        this.filterQuery = ''
        if (this.remote) this.remoteSearch('')
      }
      this.visible = !this.visible
    },
    remoteSearch(query) {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
      if (!this.remoteMethod) return

      if (this.searchController) this.searchController.abort()
      const controller = new AbortController()
      this.searchController = controller
      this.searchQuery = query
      this.loadMoreArmed = true
      this.remoteLoading = true
      // new results start from the top: a list left scrolled to its end would load page 2 at once
      // (after the render: a hidden dropdown is shown by the same click and has no scroll box yet)
      this.$nextTick(() => {
        if (this.$refs.popover) this.$refs.popover.scrollTop = 0
      })

      // only the latest search ends the loading state; a rejection is left to the consumer
      Promise.resolve(this.remoteMethod(query, { signal: controller.signal })).finally(() => {
        if (this.searchController === controller) this.remoteLoading = false
      })
    },
    cancelSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
      if (this.searchController) this.searchController.abort()
      this.searchController = null
      this.searchQuery = ''
      this.remoteLoading = false
    },
    scheduleSearch(query) {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.remoteSearch(query), this.debounce)
    },
    checkLoadMore() {
      const popover = this.$refs.popover
      if (!this.remote || !this.visible || this.isLoading || !this.loadMoreArmed) return
      if (!popover || !this.children.length) return
      if (popover.scrollHeight - popover.scrollTop - popover.clientHeight > LOAD_MORE_DISTANCE) {
        return
      }

      this.loadMoreArmed = false
      this.$emit('on-load-more', {
        query: this.searchQuery,
        signal: this.searchController ? this.searchController.signal : undefined,
      })
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

      // focus moved to another field (e.g. Tab): leave its keys alone and close the dropdown
      const active = document.activeElement
      if (
        active &&
        active !== document.body &&
        active !== document.documentElement &&
        !this.$el.contains(active)
      ) {
        this.hideMenu()
        return
      }

      // a control in the dropdown (e.g. a button in #footer or #empty) handles its own keys;
      // only Escape still closes the dropdown
      const popover = this.$refs.popover
      if (
        evt.key !== 'Escape' &&
        popover &&
        evt.target instanceof Node &&
        popover.contains(evt.target)
      ) {
        return
      }

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
          // remote: while a search is pending the list holds the results of the previous query,
          // none of them is picked (neither highlighted nor the first one)
          if (this.remote && (this.isLoading || this.searchTimer !== null)) break
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
      this.checkLoadMore()
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
      if (this.searchable) {
        // reset the active filter too: option visibility and `notFound` follow `filterQuery`
        this.query = ''
        this.filterQuery = ''
      }
      // remote: the typed text is gone, so is its search (pending or in flight)
      if (this.remote) {
        if (this.visible) this.remoteSearch('')
        else this.cancelSearch()
      }
    },
    removeTag(value) {
      if (this.disabled) return
      this.setModel(this.values.filter(v => v !== value))

      if (this.searchable && this.visible && this.$refs.input) {
        this.$refs.input.focus()
      }
      this.updatePosition()
    },
    handleInput(evt) {
      this.filterQuery = evt.target.value
      if (this.remote) {
        // the highlight belongs to the results of the previous query
        this.focusUid = null
        this.scheduleSearch(this.filterQuery)
      }
      if (!this.visible && !this.disabled) this.visible = true
    },
    handleBlur() {
      // delayed: a click on an option blurs the input before the option handles it
      clearTimeout(this.blurTimer)
      this.blurTimer = setTimeout(() => {
        // remote: focus moved to a control in the open dropdown (e.g. a footer button)
        if (this.remote && this.visible && this.$el.contains(document.activeElement)) return
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
