import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import CattrUI, { Dialog } from '../../src/index.js'

// happy-dom applies no CSS: `<transition name="fade">` finishes on the next animation
// frame, `flush()` advances fake timers past it (and past the 300 ms wrapper timer).
async function flush() {
  await nextTick()
  await vi.runAllTimersAsync()
  await nextTick()
}

const modals = () => document.body.querySelectorAll('.at-modal')
const buttons = () => document.body.querySelectorAll('.at-modal__footer .at-btn')
const confirmButton = () => document.body.querySelector('.at-modal__footer .at-btn--primary')

beforeAll(() => {
  createApp({}).use(CattrUI)
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(async () => {
  Dialog.close()
  await flush()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('Dialog ($Modal)', () => {
  it('confirm() mounts .at-modal and resolves "confirm" on the OK button', async () => {
    const promise = Dialog.confirm('Sure?', 'Title')
    await flush()

    expect(modals()).toHaveLength(1)
    expect(modals()[0].textContent).toContain('Sure?')
    expect(modals()[0].style.display).not.toBe('none')

    confirmButton().click()
    await expect(promise).resolves.toBe('confirm')

    await flush()
    expect(modals()).toHaveLength(0)
  })

  it('confirm() rejects with "cancel" on the cancel button and calls the callback', async () => {
    const callback = vi.fn()
    const promise = Dialog.confirm({ content: 'Sure?', callback })
    await flush()

    buttons()[0].click()
    await expect(promise).rejects.toBe('cancel')
    expect(callback).toHaveBeenCalledWith('cancel')
  })

  it('prompt() resolves { value, action } with the typed value', async () => {
    const promise = Dialog.prompt({ content: 'Email:' })
    await flush()

    const input = document.body.querySelector('.at-modal__input input')
    input.value = 'a@b.c'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))

    await expect(promise).resolves.toEqual({ value: 'a@b.c', action: 'confirm' })
  })

  it('close() in the same tick as alert() keeps the dialog hidden and does not block the next one', async () => {
    Dialog.alert('never shown')
    Dialog.close()
    await flush()

    expect(modals()).toHaveLength(0)

    const next = Dialog.alert('shown')
    await flush()

    expect(modals()).toHaveLength(1)
    expect(modals()[0].textContent).toContain('shown')
    expect(modals()[0].style.display).not.toBe('none')

    confirmButton().click()
    await expect(next).resolves.toBe('confirm')
  })

  it('shows the queued dialog after the previous one has closed', async () => {
    const first = Dialog.alert('first')
    const second = Dialog.info({ content: 'second' })
    await flush()

    expect(modals()).toHaveLength(1)
    expect(modals()[0].textContent).toContain('first')

    confirmButton().click()
    await expect(first).resolves.toBe('confirm')
    await flush()

    expect(modals()).toHaveLength(1)
    expect(modals()[0].textContent).toContain('second')
    expect(modals()[0].querySelector('.at-modal__title').textContent).toBe('Info')

    confirmButton().click()
    await expect(second).resolves.toBe('confirm')
  })
})
