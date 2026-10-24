import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { Dialog, Message, Notification, LoadingBar, AtModal } from '../../src/index.js'
import { getCurrentApp, setCurrentApp } from '../../src/utils/context.js'

// No `app.use(CattrUI)` anywhere in this file: each service is installed on its own.

async function flush() {
  await nextTick()
  await vi.runAllTimersAsync()
  await nextTick()
}

beforeEach(() => {
  vi.useFakeTimers()
  setCurrentApp(null)
})

afterEach(async () => {
  Dialog.close()
  await flush()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('standalone service install', () => {
  it('app.use(Dialog) alone: Dialog.confirm renders the buttons and resolves', async () => {
    const app = createApp({}).use(Dialog)
    expect(getCurrentApp()).toBe(app)
    expect(app.config.globalProperties.$Modal).toBe(Dialog)

    const promise = Dialog.confirm('Sure?')
    await flush()

    const buttons = document.body.querySelectorAll('.at-modal__footer button.at-btn')
    expect(buttons).toHaveLength(2)
    expect(document.body.querySelector('at-button')).toBeNull()

    document.body.querySelector('.at-modal__footer .at-btn--primary').click()
    await expect(promise).resolves.toBe('confirm')
  })

  it('app.use(Dialog) alone: prompt renders AtInput', async () => {
    createApp({}).use(Dialog)
    Dialog.prompt('Email:').catch(() => {})
    await flush()

    expect(document.body.querySelector('.at-modal input.at-input__original')).not.toBeNull()
  })

  it('does not replace the app set by an earlier install', () => {
    const first = createApp({}).use(Message)
    createApp({}).use(Notification).use(LoadingBar).use(Dialog)

    expect(getCurrentApp()).toBe(first)
  })

  it('each service install sets the app when none is set', () => {
    for (const [service, key] of [
      [Message, '$Message'],
      [Notification, '$Notify'],
      [LoadingBar, '$Loading'],
      [Dialog, '$Modal'],
    ]) {
      setCurrentApp(null)
      const app = createApp({}).use(service)
      expect(getCurrentApp()).toBe(app)
      expect(app.config.globalProperties[key]).toBe(service)
    }
  })

  it('AtModal renders its buttons without global registration', () => {
    const wrapper = mount(AtModal, { props: { modelValue: true } })

    expect(wrapper.findAll('.at-modal__footer button.at-btn')).toHaveLength(2)
    wrapper.unmount()
  })
})
