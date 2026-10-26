<template>
  <div class="at-step" :class="stepStatusClass" :style="stepStyle">
    <div v-if="!isLastStep" class="at-step__line"></div>
    <div class="at-step__head">
      <div
        class="at-step__label"
        :class="{
          'at-step__icon': icon,
        }"
      >
        <div v-if="icon">
          <i :class="['icon', `${icon}`]"></i>
        </div>
        <template v-else>
          <div v-if="['process', 'wait'].indexOf(finalStatus) > -1" class="at-step__order">
            {{ index + 1 }}
          </div>
          <div v-if="finalStatus === 'finish'">
            <i class="icon icon-check"></i>
          </div>
          <div v-if="finalStatus === 'error'">
            <i class="icon icon-x"></i>
          </div>
        </template>
      </div>
    </div>
    <div class="at-step__main">
      <div class="at-step__title">{{ title }}</div>
      <div v-if="description" class="at-step__description">{{ description }}</div>
    </div>
  </div>
</template>

<script>
import { useChild } from '../../../composables/useChildren'
import { StepsContext } from './context'

export default {
  name: 'AtStep',
  props: {
    title: String,
    icon: String,
    description: String,
    status: {
      type: String,
      validator: val => ['wait', 'process', 'finish', 'error'].indexOf(val) > -1,
    },
  },
  emits: [],
  setup() {
    const steps = StepsContext.inject(null)
    const { index } = useChild(steps)
    return { steps, index }
  },
  computed: {
    stepStyle() {
      const style = {}
      if (this.steps && this.steps.direction !== 'vertical' && this.stepsTotal > 0) {
        style.width = `${(1 / this.stepsTotal) * 100}%`
      }
      return style
    },
    stepsTotal() {
      return this.steps ? this.steps.children.length : 0
    },
    internalStatus() {
      if (!this.steps || this.index < 0) return ''
      const { current, status } = this.steps
      if (this.index === current) return status === 'error' ? 'error' : 'process'
      return this.index < current ? 'finish' : 'wait'
    },
    finalStatus() {
      return this.status || this.internalStatus
    },
    nextError() {
      // 1.x: the step before the current one is marked when Steps has `status="error"`
      // and the current step does not override it with its own `status`.
      if (!this.steps || this.index < 0) return false
      const next = this.steps.children[this.index + 1]
      return (
        !!next &&
        this.index + 1 === this.steps.current &&
        this.steps.status === 'error' &&
        next.exposed.finalStatus === 'error'
      )
    },
    isLastStep() {
      return this.index === this.stepsTotal - 1
    },
    stepStatusClass() {
      const className = {}

      switch (this.finalStatus) {
        case 'process':
          className['at-step--process'] = true
          break
        case 'wait':
          className['at-step--wait'] = true
          break
        case 'finish':
          className['at-step--finish'] = true
          break
        case 'error':
          className['at-step--error'] = true
          break
      }

      if (this.nextError) {
        className['at-step--next-error'] = true
      }

      return className
    },
  },
}
</script>
