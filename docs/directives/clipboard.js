/**
 * v-clipboard="text | () => text": copy on click.
 * Emits a DOM `success` event ({ detail: { text } }, also `event.text`) or `error` on the element,
 * so `@success="..."` keeps working on plain elements.
 */
function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    if (!document.execCommand('copy')) throw new Error('execCommand("copy") failed')
  } finally {
    document.body.removeChild(textarea)
  }
}

export function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  }
  return new Promise(resolve => resolve(fallbackCopy(text)))
}

function dispatch(el, type, payload) {
  const event = new CustomEvent(type, { detail: payload })
  Object.assign(event, payload)
  el.dispatchEvent(event)
}

function onClick(event) {
  const el = event.currentTarget
  const value = el._clipboardValue
  const text = String((typeof value === 'function' ? value() : value) ?? '')

  copyText(text).then(
    () => dispatch(el, 'success', { text }),
    error => dispatch(el, 'error', { text, error }),
  )
}

export default {
  mounted(el, binding) {
    el._clipboardValue = binding.value
    el.addEventListener('click', onClick)
  },
  updated(el, binding) {
    el._clipboardValue = binding.value
  },
  unmounted(el) {
    el.removeEventListener('click', onClick)
    delete el._clipboardValue
  },
}
