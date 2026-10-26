import { inject, provide } from 'vue'

/**
 * Application context shared by the plugin and the imperative services
 * ($Message, $Modal, $Notify, $Loading).
 *
 * `install(app)` stores the app here so services mounted outside the component
 * tree can reuse its `_context` (registered components, globalProperties, provides).
 * With several apps calling `app.use(CattrUI)` the last one wins.
 */

/** Injection key: `inject(CATTR_UI_KEY)` → `{ app }` inside any component of the app. */
export const CATTR_UI_KEY = Symbol('cattr-ui')

let currentApp = null

export function setCurrentApp(app) {
  currentApp = app || null
}

/** The last app that installed CattrUI, or `null` before `app.use(CattrUI)`. */
export function getCurrentApp() {
  return currentApp
}

/**
 * Typed provide/inject pair for parent ↔ child links (RadioGroup → Radio, Tabs → TabPane, …).
 * Replaces the Vue 2 `dispatch`/`broadcast` event bus and the component-tree walking helpers.
 *
 *   // radio/src/context.js
 *   export const RadioGroupContext = createContext('AtRadioGroup')
 *
 *   // parent setup():  RadioGroupContext.provide(reactive({ modelValue: toRef(props, 'modelValue'), update }))
 *   // child setup():   const group = RadioGroupContext.inject(null) // null when used standalone
 *
 * Options API without setup(): `provide() { return { [Ctx.key]: value } }`,
 * `inject: { group: { from: Ctx.key, default: null } }`.
 *
 * @template T
 * @param {string} name Component name, used as the Symbol description (shown in devtools/warnings).
 * @returns {{
 *   key: import('vue').InjectionKey<T>,
 *   provide: (value: T) => T,
 *   inject: (fallback?: T) => T,
 * }}
 *   `provide(value)` and `inject(fallback)` must be called inside `setup()`.
 *   `inject()` without an argument means "parent required": Vue warns in dev when it is missing.
 *   `inject(null)` (or any fallback) makes the parent optional and returns the fallback silently.
 */
export function createContext(name) {
  const key = Symbol(name)

  return {
    key,
    provide(value) {
      provide(key, value)
      return value
    },
    inject(...args) {
      return args.length ? inject(key, args[0]) : inject(key)
    },
  }
}
