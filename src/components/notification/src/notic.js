import NotificationVue from './notification.vue'

// The Vue 2 constructor was dropped in 20-01 so that importing the library does not fail.
// The service itself is migrated to createVNode/render in 20-03 / 30-w3-*.
// eslint-disable-next-line no-unused-vars
const createInstance = (component, options) => {
  throw new Error('Notification is not migrated to Vue 3 yet (plan 20-03)')
}

const noticeType = ['success', 'error', 'warning', 'info']
const instances = []
let instance
let seed = 1
let zindexSeed = 1010

const Notification = options => {
  if (typeof window === 'undefined') return
  options = options || {}

  const onClose = options.onClose
  const id = `notification_${seed++}`

  options.onClose = function () {
    Notification.close(id, onClose)
  }

  instance = createInstance(NotificationVue, {
    data: options,
  })

  instance.id = id
  instance.vm = instance.$mount()
  document.body.appendChild(instance.vm.$el)
  instance.vm.isShow = true
  instance.dom = instance.vm.$el
  instance.dom.style.zIndex = zindexSeed++

  const offset = 0
  let topDist = offset

  for (let i = 0, len = instances.length; i < len; i++) {
    topDist += instances[i].$el.offsetHeight + 16
  }

  topDist += 16
  instance.top = topDist
  instances.push(instance)

  return instance.vm
}

Notification.close = function (id, onClose) {
  const len = instances.length
  let index
  let removedHeight
  let i

  for (i = 0; i < len; i++) {
    if (id === instances[i].id) {
      if (typeof onClose === 'function') {
        onClose(instances[i])
      }
      index = i
      removedHeight = instances[i].dom.offsetHeight
      instances.splice(i, 1)
      break
    }
  }

  if (len > 1) {
    for (i = index; i < len - 1; i++) {
      instances[i].dom.style.top = `${parseInt(instances[i].dom.style.top) - removedHeight - 16}px`
    }
  }
}

noticeType.forEach(type => {
  Notification[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options,
      }
    }

    options.type = type
    return Notification(options)
  }
})

export default Notification
