import LoadingBarVue from './loading-bar.vue'

// The Vue 2 constructor was dropped in 20-01 so that importing the library does not fail.
// The service itself is migrated to createVNode/render in 20-03 / 30-w3-*.
// eslint-disable-next-line no-unused-vars
const createInstance = (component, options) => {
  throw new Error('LoadingBar is not migrated to Vue 3 yet (plan 20-03)')
}
let instance

class LoadingBar {
  constructor(options) {
    options = options || {}

    instance = createInstance(LoadingBarVue, {
      data: options,
    })

    instance.vm = instance.$mount()
    document.body.appendChild(instance.vm.$el)
  }

  update(newOptions) {
    if (newOptions.percent) {
      instance.percent = newOptions.percent
    }
    if (newOptions.status) {
      instance.status = newOptions.status
    }
    if (newOptions.show) {
      instance.show = newOptions.show
    }
  }

  destroy() {
    document.body.removeChild(instance.vm.$el)
  }
}

export default LoadingBar
