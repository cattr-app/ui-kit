import NotificationVue from './notification.vue'
import { mountService } from '../../../utils/mount-service.js'

const noticeType = ['success', 'error', 'warning', 'info']
const GAP = 16
const instances = []
let seed = 1
let zindexSeed = 1010

const normalize = options => (typeof options === 'string' ? { message: options } : { ...options })

/**
 * Show a notification in the top right corner.
 * `options`: a string (the message) or `{ title, message, type, icon, duration, showClose, onClose }`.
 * Returns a function that closes this notification; its `id` property is the notification id.
 */
const Notification = options => {
  if (typeof window === 'undefined') return
  const {
    title,
    message,
    type,
    icon,
    duration,
    showClose,
    onClose: customCloseFunc,
  } = normalize(options)
  const id = `notification_${seed++}`

  let top = GAP
  for (const item of instances) {
    top += item.el.offsetHeight + GAP
  }

  const service = mountService(NotificationVue, {
    title,
    message,
    type,
    icon,
    duration,
    showClose,
    top,
    zIndex: zindexSeed++,
    onClose: () => Notification.close(id),
    onDestroy: () => service.unmount(),
  })

  instances.push({
    id,
    top,
    vm: service.vm,
    el: service.el,
    onClose: customCloseFunc,
    update: service.update,
    unmount: service.unmount,
  })

  // `close.id` can be passed to `Notification.close(id)`
  const close = () => service.vm.close()
  close.id = id
  return close
}

/**
 * Close the notification with this `id` (the `id` property of the function returned by the call),
 * call its `onClose` and shift the ones below it up. Unknown or already closed `id` — no-op.
 */
Notification.close = id => {
  const index = instances.findIndex(item => item.id === id)
  if (index === -1) return

  const [removed] = instances.splice(index, 1)
  if (typeof removed.onClose === 'function') {
    removed.onClose(removed.vm)
  }
  // The closing notification is still visible (leave transition) — close() starts it.
  removed.vm.close()

  const removedHeight = removed.el.offsetHeight
  for (let i = index; i < instances.length; i++) {
    instances[i].top -= removedHeight + GAP
    instances[i].update({ top: instances[i].top })
  }
}

Notification.closeAll = () => {
  // close() splices `instances`, iterate over a copy.
  instances.slice().forEach(item => item.vm.close())
}

noticeType.forEach(type => {
  Notification[type] = options => Notification({ ...normalize(options), type })
})

Notification.install = app => {
  app.config.globalProperties.$Notify = Notification
}

export default Notification
