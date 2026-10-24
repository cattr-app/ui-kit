import MessageVue from './message.vue'
import { mountService } from '../../../utils/mount-service.js'

const messageType = ['info', 'success', 'warning', 'error', 'loading']
const GAP = 8
const instances = []
let seed = 1
let zindexSeed = 1010

const normalize = options => (typeof options === 'string' ? { message: options } : { ...options })

/**
 * Show a message. `options`: a string or `{ message, type, icon, duration, onClose }`.
 * Returns a function that closes this message.
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
    onClose: () => Message.close(id, customCloseFunc),
    onDestroy: () => service.unmount(),
  })

  instances.push({
    id,
    top,
    vm: service.vm,
    el: service.el,
    update: service.update,
    unmount: service.unmount,
  })

  // 返回关闭方法，用于手动消除
  return function () {
    service.vm.close()
  }
}

/** Remove a message from the stack and shift the ones below it up. */
Message.close = (id, customCloseFunc) => {
  const index = instances.findIndex(item => item.id === id)
  if (index === -1) return

  const [removed] = instances.splice(index, 1)
  if (typeof customCloseFunc === 'function') {
    customCloseFunc(removed.vm)
  }
  // The closing message is still visible (leave transition) — close() starts it.
  removed.vm.close()

  const removedHeight = removed.el.offsetHeight
  for (let i = index; i < instances.length; i++) {
    instances[i].top -= removedHeight + GAP
    instances[i].update({ top: instances[i].top })
  }
}

Message.closeAll = () => {
  // close() splices `instances`, iterate over a copy.
  instances.slice().forEach(item => item.vm.close())
}

messageType.forEach(type => {
  Message[type] = options => Message({ ...normalize(options), type })
})

Message.install = app => {
  app.config.globalProperties.$Message = Message
}

export default Message
