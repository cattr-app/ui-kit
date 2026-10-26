import { nextTick } from 'vue'
import Modal from './modal.vue'
import { mountService } from '../../../utils/mount-service.js'
import { getCurrentApp, setCurrentApp } from '../../../utils/context.js'

const modalProps = Object.keys(Modal.props)

const defaults = {
  title: '',
  content: '',
  type: '',
}

// Dialogs are shown one at a time: the next one opens after the current one has closed.
let modalQueue = []
let current = null

const noop = () => {}

/** Options → AtModal props; unknown keys (`callback`…) are dropped. */
const toProps = options => {
  const props = {}
  for (const key of modalProps) {
    if (options[key] !== undefined) props[key] = options[key]
  }
  return props
}

const settle = (item, action) => {
  if (item.action) return
  item.action = action

  const { options, callback, resolve, reject, service } = item
  const withInput = !!options.showInput
  const value = withInput ? service.vm.currentInputValue : undefined

  if (typeof callback === 'function') {
    if (withInput) {
      callback(value, action)
    } else {
      callback(action)
    }
  }

  if (options.type === 'confirm' || options.type === 'prompt') {
    if (action === 'confirm') {
      resolve(withInput ? { value, action } : action)
    } else {
      reject(action)
    }
  } else {
    resolve(action)
  }
}

const showNextModal = () => {
  if (current || !modalQueue.length) return

  const item = modalQueue.shift()
  current = item

  const service = mountService(Modal, {
    ...toProps(item.options),
    modelValue: false,
    'onOn-confirm': () => settle(item, 'confirm'),
    'onOn-cancel': () => settle(item, 'cancel'),
    'onUpdate:modelValue': value => service.update({ modelValue: value }),
    onAfterLeave: () => {
      service.unmount()
      if (current === item) current = null
      showNextModal()
    },
  })
  if (!service) {
    current = null
    return
  }
  item.service = service

  // Opened after mount so the `fade` enter transition plays. `Dialog.close()` called in the
  // same tick marks the item closed and unmounts it itself: there is nothing to open then.
  nextTick(() => {
    if (item.closed) return
    item.opened = true
    service.update({ modelValue: true })
  })
}

const Dialog = (options, callback) => {
  if (typeof window === 'undefined') return
  if (options.callback && !callback) {
    callback = options.callback
  }

  const promise = new Promise((resolve, reject) => {
    modalQueue.push({
      options: Object.assign({}, defaults, options),
      callback,
      resolve,
      reject,
    })

    showNextModal()
  })
  // Callback-style callers usually ignore the promise: no unhandled rejection on cancel.
  if (typeof callback === 'function') promise.catch(noop)

  return promise
}

/** Hide the current dialog and drop the queued ones (their promises stay pending, as in 1.x). */
Dialog.close = () => {
  modalQueue = []
  const item = current
  if (!item || item.closed) return
  item.closed = true
  item.action = item.action || 'close'
  if (item.opened) {
    // leave transition → `onAfterLeave` unmounts and releases `current`
    item.service.update({ modelValue: false })
  } else {
    // never shown: no leave transition will fire, release it right away
    item.service.unmount()
    current = null
  }
}

const normalizeArgs = (content, title, options) => {
  if (typeof content === 'object' && content !== null) {
    options = content
    content = options.content
    title = options.title || ''
  }
  return { content, title, options }
}

/**
 * Such like window.alert
 */
Dialog.alert = (...args) => {
  const { content, title, options } = normalizeArgs(...args)

  return Dialog(
    Object.assign(
      {
        title,
        content,
        type: 'alert',
        maskClosable: false,
        showCancelButton: false,
      },
      options,
    ),
  )
}

/**
 * Such like window.confirm
 */
Dialog.confirm = (...args) => {
  const { content, title, options } = normalizeArgs(...args)

  return Dialog(
    Object.assign(
      {
        title,
        content,
        type: 'confirm',
      },
      options,
    ),
  )
}

/**
 * Such like window.prompt
 */
Dialog.prompt = (...args) => {
  const { content, title, options } = normalizeArgs(...args)

  return Dialog(
    Object.assign(
      {
        title,
        content,
        type: 'prompt',
        showInput: true,
      },
      options,
    ),
  )
}

/**
 * Status Dialog
 */
function createStatusDialog(type) {
  const statusTitles = {
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
  }
  return (content, title, options) => {
    if (typeof content === 'object' && content !== null) {
      options = content
      content = options.content
      title = options.title || statusTitles[type]
    }

    return Dialog(
      Object.assign(
        {
          title,
          content,
          type,
          maskClosable: false,
          showCancelButton: false,
          showClose: false,
        },
        options,
      ),
    )
  }
}

Dialog.info = createStatusDialog('info')
Dialog.success = createStatusDialog('success')
Dialog.warning = createStatusDialog('warning')
Dialog.error = createStatusDialog('error')

// Standalone `app.use(Dialog)` (without CattrUI): render the service in this app's context.
Dialog.install = app => {
  if (!getCurrentApp()) setCurrentApp(app)
  app.config.globalProperties.$Modal = Dialog
}

export default Dialog
