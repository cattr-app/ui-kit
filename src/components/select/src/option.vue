<template>
  <li
    v-show="!hidden"
    class="at-select__option"
    :class="{
      'at-select__option--disabled': disabled,
      'at-select__option--selected': selected,
      'at-select__option--focus': isFocus,
    }"
    @click.stop="doSelect"
    @mouseout.stop="blur"
  >
    <slot>{{ showLabel }}</slot>
  </li>
</template>

<script>
import { computed, getCurrentInstance, onMounted, onUpdated, reactive, ref, toRef } from 'vue'
import { useChild } from '../../../composables/useChildren'
import { SelectContext } from './context'

export default {
  name: 'AtOption',
  props: {
    value: {
      type: [String, Number],
      required: true,
    },
    label: {
      type: [String, Number],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const select = SelectContext.inject(null)
    const instance = getCurrentInstance()
    // text of the rendered slot, used as label when the `label` prop is not set (1.x used innerHTML)
    const slotText = ref('')

    const label = computed(() =>
      props.label !== undefined ? props.label : slotText.value || props.value,
    )

    const hidden = computed(() => {
      if (!select || !select.filterable || !select.query) return false
      return !String(label.value).toLowerCase().includes(String(select.query).toLowerCase())
    })

    const option = reactive({
      uid: instance.uid,
      value: toRef(props, 'value'),
      label,
      disabled: toRef(props, 'disabled'),
      hidden,
    })

    useChild(select, option)

    const syncText = () => {
      const text = (instance.proxy.$el && instance.proxy.$el.textContent) || ''
      if (text.trim() !== slotText.value) slotText.value = text.trim()
    }
    onMounted(syncText)
    onUpdated(syncText)

    return { select, option, hidden }
  },
  computed: {
    showLabel() {
      return this.label ? this.label : this.value
    },
    selected() {
      return !!this.select && this.select.isSelected(this.value)
    },
    isFocus() {
      return !!this.select && this.select.focusUid === this.option.uid
    },
  },
  methods: {
    doSelect() {
      if (this.disabled || !this.select) return
      this.select.select(this.value)
    },
    blur() {
      if (this.select) this.select.blur(this.option.uid)
    },
  },
}
</script>
