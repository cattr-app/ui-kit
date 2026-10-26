import { describe, expect, it, vi } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtButton from '../../src/components/button'

describe('AtButton', () => {
  it('renders classes from type and size', () => {
    const wrapper = mount(AtButton, {
      props: { type: 'primary', size: 'large' },
      slots: { default: 'Ok' },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['at-btn', 'at-btn--primary', 'at-btn--large']),
    )
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('calls the parent @click listener exactly once', async () => {
    const onClick = vi.fn()
    const wrapper = mount({
      components: { AtButton },
      template: '<at-button style="color: red" @click="onClick">Ok</at-button>',
      methods: { onClick },
    })

    await wrapper.find('button').trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
    expect(wrapper.find('button').element.style.color).toBe('red')
  })

  it('does not call @click when disabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(AtButton, { props: { disabled: true, onClick } })

    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')

    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders at-btn--circle when circle has no slot', () => {
    const wrapper = mount(AtButton, { props: { circle: true, icon: 'icon-plus' } })

    expect(wrapper.classes()).toContain('at-btn--circle')
    expect(wrapper.find('.at-btn__text').exists()).toBe(false)
  })

  it('takes size and gap from AtButtonGroup', () => {
    const wrapper = mount({
      template: `
        <at-button-group size="small" :gap="4">
          <at-button>A</at-button>
          <at-button>B</at-button>
        </at-button-group>`,
    })
    const buttons = wrapper.findAll('.at-btn')

    expect(wrapper.find('.at-btn-group').classes()).toContain('at-btn-group--small')
    expect(buttons).toHaveLength(2)
    buttons.forEach(b => {
      expect(b.classes()).toContain('at-btn--small')
      expect(b.element.style.marginRight).toBe('4px')
    })
  })
})
