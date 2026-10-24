import { describe, expect, it } from 'vitest'
import { mount } from './mount.js'

describe('mount helper', () => {
  it('installs CattrUI via app.use so <at-*> tags resolve', () => {
    const wrapper = mount({ template: '<at-button>Hi</at-button>' })
    const button = wrapper.find('.at-btn')

    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Hi')
  })
})
