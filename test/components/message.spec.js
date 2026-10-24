import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import CattrUI, { Message } from '../../src/index.js'

// happy-dom applies no CSS, so `<transition name="move-up">` finds no transition
// duration and finishes the leave on the next animation frame (no transitionend
// needed). `flush()` advances fake timers past that frame.
async function flush() {
  await nextTick()
  await vi.runAllTimersAsync()
  await nextTick()
}

const messages = () => document.body.querySelectorAll('.at-message')

beforeAll(() => {
  createApp({}).use(CattrUI)
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(async () => {
  Message.closeAll()
  await flush()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('Message', () => {
  it('appends .at-message to document.body', async () => {
    Message('hi')
    await nextTick()

    expect(messages()).toHaveLength(1)
    expect(messages()[0].textContent).toContain('hi')
    expect(messages()[0].classList).toContain('at-message--info')
  })

  it('stacks the second message below the first', async () => {
    Message.success('one')
    Message.error({ message: 'two' })
    await nextTick()

    const [first, second] = document.body.querySelectorAll('.at-message__wrapper')
    expect(parseInt(second.style.top)).toBeGreaterThan(parseInt(first.style.top))
    expect(second.querySelector('.at-message--error')).not.toBeNull()
  })

  it('shifts the messages below a closed one up', async () => {
    const closeFirst = Message({ message: 'one', duration: 0 })
    Message({ message: 'two', duration: 0 })
    await nextTick()
    const second = document.body.querySelectorAll('.at-message__wrapper')[1]
    const before = parseInt(second.style.top)

    closeFirst()
    await nextTick()

    expect(parseInt(second.style.top)).toBeLessThan(before)
  })

  it('removes the element when the returned function is called', async () => {
    const onClose = vi.fn()
    const close = Message({ message: 'hi', duration: 0, onClose })
    await nextTick()
    expect(messages()).toHaveLength(1)

    close()
    await flush()

    expect(onClose).toHaveBeenCalledOnce()
    expect(messages()).toHaveLength(0)
  })

  it('removes the element after duration', async () => {
    Message({ message: 'hi', duration: 1000 })
    await nextTick()

    await vi.advanceTimersByTimeAsync(999)
    expect(messages()).toHaveLength(1)

    await flush()
    expect(messages()).toHaveLength(0)
  })

  it('closeAll() removes every message', async () => {
    Message({ message: 'a', duration: 0 })
    Message({ message: 'b', duration: 0 })
    Message({ message: 'c', duration: 0 })
    await nextTick()
    expect(messages()).toHaveLength(3)

    Message.closeAll()
    await flush()

    expect(messages()).toHaveLength(0)
  })
})
