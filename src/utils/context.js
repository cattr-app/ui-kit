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
