import LoadingBarVue from './loading-bar.vue'
import { mountService } from '../../../utils/mount-service.js'

const STATE_KEYS = ['percent', 'status', 'show', 'width']

const pick = options => {
  const patch = {}
  for (const key of STATE_KEYS) {
    if (options[key] !== undefined) patch[key] = options[key]
  }
  return patch
}

/**
 * A single loading bar element mounted into `document.body`.
 * `options`: initial `{ percent, status, show, width }` (props of `AtLoadingBar`).
 */
class LoadingBar {
  constructor(options = {}) {
    // `null` without a DOM (SSR): update/destroy become no-ops.
    this.service = mountService(LoadingBarVue, pick(options))
  }

  get el() {
    return this.service?.el ?? null
  }

  update(newOptions = {}) {
    this.service?.update(pick(newOptions))
  }

  destroy() {
    this.service?.unmount()
    this.service = null
  }
}

export default LoadingBar
