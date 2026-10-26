/**
 * Simplified version
 * https://github.com/ElemeFE/element/blob/dev/src/locale/index.js
 *
 * No dependency on the global Vue / vue-i18n: an external translator is plugged in
 * through `i18n(fn)`, where `fn(key, values)` returns a string, or `null`/`undefined`
 * to fall back to the built-in language pack.
 */
import defaultLang from './lang/en-US'

let lang = defaultLang
let i18nHandler = null

const lookup = key => {
  const path = key.split('.')
  let current = lang

  for (let i = 0, len = path.length; i < len; i++) {
    const value = current[path[i]]

    if (i === len - 1) {
      return value
    } else if (!value) {
      return ''
    }

    current = value
  }

  return ''
}

export const t = function (key, values) {
  if (typeof i18nHandler === 'function') {
    const value = i18nHandler(key, values)
    if (value !== null && typeof value !== 'undefined') {
      return value
    }
  }

  return lookup(key)
}

export const use = function (l) {
  lang = l || lang
}

/** `fn(key, values)`; `undefined` keeps the current handler, `null` removes it. */
export const i18n = function (fn) {
  if (typeof fn === 'function' || fn === null) {
    i18nHandler = fn
  }
}

export default { use, t, i18n }
