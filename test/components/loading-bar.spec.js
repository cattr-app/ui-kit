import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import CattrUI, { LoadingBar } from '../../src/index.js'

const bars = () => document.body.querySelectorAll('.at-loading-bar')
const innerWidth = () => parseFloat(bars()[0].querySelector('.at-loading-bar__inner').style.width)

beforeAll(() => {
  createApp({}).use(CattrUI)
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  LoadingBar.destroy()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('LoadingBar', () => {
  it('start() appends a single .at-loading-bar to body and grows percent', async () => {
    LoadingBar.start()
    await nextTick()

    expect(bars()).toHaveLength(1)
    expect(bars()[0].classList).toContain('at-loading-bar--success')
    expect(bars()[0].style.display).not.toBe('none')
    expect(innerWidth()).toBe(0)

    await vi.advanceTimersByTimeAsync(1000)
    expect(innerWidth()).toBeGreaterThan(0)
    expect(bars()).toHaveLength(1)
  })

  it('finish() fills the bar to 100% and removes it afterwards', async () => {
    LoadingBar.start()
    LoadingBar.finish()
    await nextTick()

    expect(innerWidth()).toBe(100)

    await vi.advanceTimersByTimeAsync(800)
    expect(bars()).toHaveLength(0)
  })

  it('error() switches the status to error', async () => {
    LoadingBar.start()
    LoadingBar.error()
    await nextTick()

    expect(bars()[0].classList).toContain('at-loading-bar--error')
    expect(innerWidth()).toBe(100)
  })

  it('update(percent) sets the width, config() changes the height', async () => {
    LoadingBar.update(50)
    LoadingBar.config({ width: 4 })
    await nextTick()

    expect(innerWidth()).toBe(50)
    expect(bars()[0].style.height).toBe('4px')
    LoadingBar.config({ width: 2 })
  })

  it('destroy() removes the bar, the next start() creates it again', async () => {
    LoadingBar.start()
    await nextTick()
    LoadingBar.destroy()
    await nextTick()
    expect(bars()).toHaveLength(0)

    LoadingBar.start()
    await nextTick()
    expect(bars()).toHaveLength(1)
    expect(innerWidth()).toBe(0)
  })
})
