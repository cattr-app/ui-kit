import { createI18n } from 'vue-i18n'

import enLocale from '../src/locale/lang/en-US.js'
import zhLocale from '../src/locale/lang/zh-CN.js'

export const LANGUAGE_KEY = 'cattr-ui-language'
const LANGS = ['en', 'zh']

function storedLang() {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY)
  } catch {
    return null
  }
}

export function preferredLang() {
  const navigatorLang = window.navigator.language.slice(0, 2)
  const lang = storedLang() || (LANGS.includes(navigatorLang) ? navigatorLang : '')
  return LANGS.includes(lang) ? lang : 'zh'
}

const urlMatch = window.location.hash.match(/^#\/(zh|en)\b/)

export default createI18n({
  legacy: false,
  locale: (urlMatch && urlMatch[1]) || preferredLang(),
  fallbackLocale: 'en',
  messages: {
    en: enLocale,
    zh: zhLocale,
  },
})
