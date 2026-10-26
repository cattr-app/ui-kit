import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, inject } from 'vue'
import CattrUI, * as exported from '../../src/index.js'
import { i18n, t } from '../../src/locale/index.js'
import { CATTR_UI_KEY, getCurrentApp } from '../../src/utils/context.js'

const services = ['Message', 'Dialog', 'Notification']
const EmptyRoot = {}
let injected
const Probe = {
  setup() {
    injected = inject(CATTR_UI_KEY)
    return () => h('div')
  },
}

afterEach(() => {
  i18n(null)
})

describe('app.use(CattrUI)', () => {
  it('registers components and global services', () => {
    const app = createApp(EmptyRoot).use(CattrUI, { i18n: () => 'X' })

    expect(app.component('AtButton')).toBe(exported.AtButton)
    expect(app.component('AtSelect')).toBe(exported.AtSelect)
    expect(typeof app.config.globalProperties.$Message).toBe('function')
    expect(app.config.globalProperties.$Message).toBe(exported.Message)
    expect(app.config.globalProperties.$Modal).toBe(exported.Dialog)
    expect(app.config.globalProperties.$Notify).toBe(exported.Notification)
    expect(app.config.globalProperties.$Loading).toBe(exported.LoadingBar)
    expect(t('at.select.placeholder')).toBe('X')
  })

  it('stores the app in the shared context and provides CATTR_UI_KEY', () => {
    const app = createApp(Probe).use(CattrUI)
    app.mount(document.createElement('div'))

    expect(getCurrentApp()).toBe(app)
    expect(injected).toEqual({ app })
    app.unmount()
  })

  it('falls back to en-US without an i18n hook', () => {
    createApp(EmptyRoot).use(CattrUI)
    expect(t('at.select.placeholder')).toBe('Select')
  })

  it('exports every component under its component.name', () => {
    const components = Object.entries(exported).filter(([name]) => name.startsWith('At'))

    expect(components.length).toBeGreaterThan(40)
    for (const [name, component] of components) {
      expect(component.name, name).toBe(name)
    }
  })

  it('exports services, locale helpers and the default plugin object', () => {
    for (const name of services) {
      expect(typeof exported[name], name).toBe('function')
    }
    expect(typeof exported.LoadingBar.start).toBe('function')
    expect(typeof exported.locale).toBe('function')
    expect(typeof exported.i18n).toBe('function')
    expect(typeof CattrUI.install).toBe('function')
    expect(typeof CattrUI.version).toBe('string')
  })
})
