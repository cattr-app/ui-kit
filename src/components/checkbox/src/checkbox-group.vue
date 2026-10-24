<template>
  <div class="at-checkbox-group">
    <slot></slot>
  </div>
</template>

<script>
import { findComponentsDownward } from '../../../utils/util'
import Emitter from '../../../mixins/emitter'

export default {
  name: 'AtCheckboxGroup',
  mixins: [Emitter],
  props: {
    value: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      currentValue: this.value,
      childrens: [],
    }
  },
  watch: {
    value() {
      this.updateModel()
    },
  },
  mounted() {
    this.updateModel()
  },
  methods: {
    updateModel() {
      const value = this.value
      this.childrens = findComponentsDownward(this, 'AtCheckbox')

      if (this.childrens) {
        this.childrens.forEach(child => {
          child.model = value
          child.currentValue = value.indexOf(child.label) >= 0
          child.isGroup = true
        })
      }
    },
    change(data) {
      this.currentValue = data
      this.$emit('input', data)
      this.$emit('on-change', data)
    },
  },
}
</script>
