import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import CattrUI, { Notification } from '../../src/index.js'

// happy-dom applies no CSS, so `<transition name="notification-fade">` finds no
// transition duration and finishes the leave on the next animation frame.
// `flush()` advances fake timers past that frame.
async function flush() {
  await nextTick()
  await vi.runAllTimersAsync()
  await nextTick()
}

const notices = () => document.body.querySelectorAll('.at-notification')

let app

beforeAll(() => {
  app = createApp({}).use(CattrUI)
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(async () => {
  Notification.closeAll()
  await flush()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('Notification', () => {
  it('is installed as $Notify and appends .at-notification to document.body', async () => {
    expect(app.config.globalProperties.$Notify).toBe(Notification)

    Notification.success({ title: 'Title', message: 'Body' })
    await nextTick()

    expect(notices()).toHaveLength(1)
    const [el] = notices()
    expect(el.classList).toContain('at-notification--success')
    expect(el.classList).toContain('at-notification--with-message')
    expect(el.querySelector('.at-notification__title').textContent).toBe('Title')
    expect(el.querySelector('.at-notification__message').textContent).toBe('Body')
    expect(el.querySelector('.at-notification__icon').classList).toContain('icon-check-circle')
  })

  it('stacks the second notification below the first and shifts it up on close', async () => {
    const closeFirst = Notification({ title: 'one', duration: 0 })
    Notification.error({ title: 'two', duration: 0 })
    await nextTick()

    const [first, second] = notices()
    const before = parseInt(second.style.top)
    expect(before).toBeGreaterThan(parseInt(first.style.top))
    expect(second.classList).toContain('at-notification--error')

    closeFirst()
    await nextTick()

    expect(parseInt(second.style.top)).toBeLessThan(before)
  })

  it('places a notification opened from onClose at the top of the stack', async () => {
    const close = Notification({
      title: 'a',
      duration: 0,
      onClose: () => Notification({ title: 'b', duration: 0 }),
    })
    await nextTick()
    expect(notices()[0].style.top).toBe('16px')

    close()
    await flush()

    expect(notices()).toHaveLength(1)
    expect(notices()[0].textContent).toContain('b')
    expect(notices()[0].style.top).toBe('16px')
  })

  it('removes the element and calls onClose when the returned function is called', async () => {
    const onClose = vi.fn()
    const close = Notification({ title: 'hi', duration: 0, onClose })
    await nextTick()
    expect(notices()).toHaveLength(1)

    close()
    await flush()

    expect(onClose).toHaveBeenCalledOnce()
    expect(notices()).toHaveLength(0)
  })

  it('removes the element after duration and on close button click', async () => {
    Notification({ title: 'timed', duration: 1000 })
    Notification({ title: 'manual', duration: 0 })
    await nextTick()

    await vi.advanceTimersByTimeAsync(999)
    expect(notices()).toHaveLength(2)

    await vi.advanceTimersByTimeAsync(1)
    await flush()
    expect(notices()).toHaveLength(1)

    notices()[0].querySelector('.at-notification__close').click()
    await flush()
    expect(notices()).toHaveLength(0)
  })

  it('close(id) closes the notification whose id is on the returned function', async () => {
    const onClose = vi.fn()
    const closeFirst = Notification({ title: 'a', duration: 0, onClose })
    Notification({ title: 'b', duration: 0 })
    await nextTick()

    expect(typeof closeFirst.id).toBe('string')
    Notification.close(closeFirst.id)
    Notification.close(closeFirst.id)
    Notification.close('unknown')
    await flush()

    expect(onClose).toHaveBeenCalledOnce()
    expect(notices()).toHaveLength(1)
    expect(notices()[0].textContent).toContain('b')
  })

  it('closeAll() removes every notification', async () => {
    Notification({ title: 'a', duration: 0 })
    Notification({ title: 'b', duration: 0 })
    Notification({ title: 'c', duration: 0 })
    await nextTick()
    expect(notices()).toHaveLength(3)

    Notification.closeAll()
    await flush()

    expect(notices()).toHaveLength(0)
  })
})
