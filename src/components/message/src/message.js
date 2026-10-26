import MessageVue from './message.vue'
import { mountService } from '../../../utils/mount-service.js'
import { getCurrentApp, setCurrentApp } from '../../../utils/context.js'

const messageType = ['info', 'success', 'warning', 'error', 'loading']
const GAP = 8
const instances = []
let seed = 1
let zindexSeed = 1010

const normalize = options => (typeof options === 'string' ? { message: options } : { ...options })

/**
 * Show a message. `options`: a string or `{ message, type, icon, duration, onClose }`.
 * Returns a function that closes this message; its `id` property is the message id.
 */
const Message = options => {
  if (typeof window === 'undefined') return
  const { message, type, icon, duration, onClose: customCloseFunc } = normalize(options)
  const id = `message_${seed++}`

  let top = GAP
  for (const item of instances) {
    top += item.el.offsetHeight + GAP
  }

  const service = mountService(MessageVue, {
    message,
    type,
    icon,
    duration,
    top,
    zIndex: zindexSeed++,
    onClose: () => Message.close(id),
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

  // `close.id` can be passed to `Message.close(id)`
  const close = () => service.vm.close()
  close.id = id
  return close
}

/**
 * Close the message with this `id` (the `id` property of the function returned by the call),
 * call its `onClose` and shift the ones below it up. Unknown or already closed `id` — no-op.
 */
Message.close = id => {
  const index = instances.findIndex(item => item.id === id)
  if (index === -1) return

  const [removed] = instances.splice(index, 1)

  // Shift the rest up before `onClose`: a message it opens is placed from the updated stack
  // and must not be shifted again.
  const removedHeight = removed.el.offsetHeight
  for (let i = index; i < instances.length; i++) {
    instances[i].top -= removedHeight + GAP
    instances[i].update({ top: instances[i].top })
  }

  if (typeof removed.onClose === 'function') {
    removed.onClose(removed.vm)
  }
  // The closing message is still visible (leave transition) — close() starts it.
  removed.vm.close()
}

Message.closeAll = () => {
  // close() splices `instances`, iterate over a copy.
  instances.slice().forEach(item => item.vm.close())
}

messageType.forEach(type => {
  Message[type] = options => Message({ ...normalize(options), type })
})

// Standalone `app.use(Message)` (without CattrUI): render the service in this app's context.
Message.install = app => {
  if (!getCurrentApp()) setCurrentApp(app)
  app.config.globalProperties.$Message = Message
}

export default Message
