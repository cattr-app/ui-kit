import { describe, expect, it } from 'vitest'
import { mount } from './mount.js'

// Sanity check only: the library plugin is still Vue 2 until 20-01/20-03, so the helper
// is not called here. Component smoke tests (30-*) use it.
describe('test/helpers/mount', () => {
  it('exports an async mount helper', () => {
    expect(typeof mount).toBe('function')
    expect(mount.constructor.name).toBe('AsyncFunction')
  })
})
