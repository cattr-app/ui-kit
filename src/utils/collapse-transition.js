/**
 * Collapse (height) transition, a functional wrapper around <Transition>.
 * https://github.com/ElemeFE/element/blob/dev/src/transitions/collapse-transition.js
 *
 *   <collapse-transition><div v-show="open">...</div></collapse-transition>
 */
import { h, Transition } from 'vue'
import { addClass, removeClass } from './util'

// Save the element's own inline padding/overflow once per transition. A transition reversed
// mid-way (re-open while closing) must not save the zeroed values of the cancelled one.
function saveStyle(el) {
  if (el.dataset.collapseTransitioning) return
  el.dataset.collapseTransitioning = 'true'
  el.dataset.oldPaddingTop = el.style.paddingTop
  el.dataset.oldPaddingBottom = el.style.paddingBottom
  el.dataset.oldOverflow = el.style.overflow
}

function restoreStyle(el) {
  removeClass(el, 'collapse-transition')
  el.style.height = ''
  el.style.overflow = el.dataset.oldOverflow
  el.style.paddingTop = el.dataset.oldPaddingTop
  el.style.paddingBottom = el.dataset.oldPaddingBottom
  delete el.dataset.collapseTransitioning
}

const hooks = {
  onBeforeEnter(el) {
    addClass(el, 'collapse-transition')
    saveStyle(el)

    el.style.height = '0'
    el.style.paddingTop = 0
    el.style.paddingBottom = 0
  },

  onEnter(el) {
    if (el.scrollHeight !== 0) {
      el.style.height = el.scrollHeight + 'px'
    } else {
      el.style.height = ''
    }
    el.style.paddingTop = el.dataset.oldPaddingTop
    el.style.paddingBottom = el.dataset.oldPaddingBottom

    el.style.overflow = 'hidden'
  },

  onAfterEnter(el) {
    // for safari: remove class then reset height is necessary
    restoreStyle(el)
  },

  onEnterCancelled: restoreStyle,

  onBeforeLeave(el) {
    saveStyle(el)

    el.style.height = el.scrollHeight + 'px'
    el.style.overflow = 'hidden'
  },

  onLeave(el) {
    if (el.scrollHeight !== 0) {
      // for safari: add class after set height, or it will jump to zero height suddenly
      addClass(el, 'collapse-transition')
      el.style.height = 0
      el.style.paddingTop = 0
      el.style.paddingBottom = 0
    }
  },

  onAfterLeave: restoreStyle,

  onLeaveCancelled: restoreStyle,
}

const CollapseTransition = (props, { slots }) => h(Transition, hooks, slots.default)

CollapseTransition.displayName = 'CollapseTransition'

export default CollapseTransition
