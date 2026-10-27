import { describe, expect, it, vi } from 'vitest'
import { mount } from '../helpers/mount.js'
import AtAvatar from '../../src/components/avatar'
import { getInitials } from '../../src/components/avatar/src/avatar.vue'

const initials = wrapper => wrapper.find('.at-avatar__initials')

// happy-dom serialises colours as given, so compare against the browser form via a probe element.
function cssColor(value) {
  const probe = document.createElement('div')
  probe.style.color = value
  return probe.style.color
}

describe('AtAvatar', () => {
  describe('initials', () => {
    it.each([
      ['John Doe', 'JD'],
      ['jane', 'J'],
      ['Mary-Jane Watson', 'MJW'],
      ['Anna Maria de la Cruz', 'AMC'],
      ['a b c d', 'ABC'],
      ['', ''],
    ])('default parser: %j → %j', (username, expected) => {
      expect(getInitials(username)).toBe(expected)

      const wrapper = mount(AtAvatar, { props: { username } })
      expect(initials(wrapper).text()).toBe(expected)
    })

    it('renders an empty avatar without a username', () => {
      const wrapper = mount(AtAvatar)

      expect(initials(wrapper).text()).toBe('')
      expect(wrapper.element.style.backgroundColor).toBe(cssColor('#F44336'))
    })

    it('uses a custom parser, which gets the default one as the second argument', () => {
      const parser = vi.fn((name, fallback) => `${fallback(name)}!`)
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe', parser } })

      expect(initials(wrapper).text()).toBe('JD!')
      expect(parser).toHaveBeenCalledWith('John Doe', getInitials)
    })

    it('a parser is only ever called with the real username', () => {
      // A parser that needs two words must not be probed with a made-up single-word name.
      const parser = vi.fn(name => name.split(' ')[1].toUpperCase())
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe', parser } })

      expect(initials(wrapper).text()).toBe('DOE')
      expect(parser.mock.calls.every(([name]) => name === 'John Doe')).toBe(true)
    })

    it('the initials prop overrides the parser', () => {
      const parser = vi.fn(() => 'XX')
      const wrapper = mount(AtAvatar, {
        props: { username: 'John Doe', initials: 'Q', parser },
      })

      expect(initials(wrapper).text()).toBe('Q')
      expect(parser).not.toHaveBeenCalled()
    })
  })

  describe('colours', () => {
    it('picks the background from the palette deterministically by the name', () => {
      const style = username => mount(AtAvatar, { props: { username } }).element.style

      // 8 letters → palette[8]
      expect(style('John Doe').backgroundColor).toBe(cssColor('#009688'))
      expect(style('John Doe').backgroundColor).toBe(style('Jane Roe').backgroundColor)
      // 18 colours in the palette: the index wraps
      expect(style('x'.repeat(19)).backgroundColor).toBe(style('x').backgroundColor)
      expect(style('x').backgroundColor).toBe(cssColor('#FF4081'))
    })

    it('the text colour is the background lightened by `lighten`', () => {
      const style = props =>
        mount(AtAvatar, { props: { username: 'John Doe', ...props } }).element.style

      // #009688 + 80 per channel
      expect(style().color).toBe(cssColor('#50e6d8'))
      expect(style({ lighten: 20 }).color).toBe(cssColor('#14aa9c'))
      // clamped to 0..255; small channels keep the leading zeroes
      expect(style({ lighten: -150 }).color).toBe(cssColor('#000000'))
      expect(style({ backgroundColor: '#000a00', lighten: 0 }).color).toBe(cssColor('#000a00'))
    })

    it('lightens a colour given without "#"', () => {
      const wrapper = mount(AtAvatar, {
        props: { username: 'A', backgroundColor: '101010', lighten: 16 },
      })

      expect(wrapper.vm.fontColor).toBe('202020')
    })

    it('backgroundColor and color override the computed colours', () => {
      const { style } = mount(AtAvatar, {
        props: { username: 'John Doe', backgroundColor: '#eaeaea', color: '#333333' },
      }).element

      expect(style.backgroundColor).toBe(cssColor('#eaeaea'))
      expect(style.color).toBe(cssColor('#333333'))
    })

    it('a custom backgroundColor is lightened for the text when color is not set', () => {
      const { style } = mount(AtAvatar, {
        props: { username: '', backgroundColor: '#eaeaea' },
      }).element

      expect(style.color).toBe(cssColor('#ffffff'))
    })
  })

  describe('layout', () => {
    it('defaults: 50px, rounded, block flex; font size from the size', () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe' } })
      const { style } = wrapper.element

      expect(wrapper.classes()).toEqual(['at-avatar', 'at-avatar--rounded'])
      expect(style.width).toBe('50px')
      expect(style.height).toBe('50px')
      expect(style.lineHeight).toBe('50px')
      expect(style.fontSize).toBe('20px')
    })

    it('size sets the dimensions and the font size', () => {
      const { style } = mount(AtAvatar, { props: { username: 'A', size: 30 } }).element

      expect(style.width).toBe('30px')
      expect(style.height).toBe('30px')
      expect(style.lineHeight).toBe('30px')
      expect(style.fontSize).toBe('12px')
    })

    it('rounded=false gives a square, inline gives an inline avatar', () => {
      const wrapper = mount(AtAvatar, { props: { username: 'A', rounded: false, inline: true } })

      expect(wrapper.classes()).toEqual(['at-avatar', 'at-avatar--inline'])
    })

    it('customStyle is applied over the computed style', () => {
      const { style } = mount(AtAvatar, {
        props: { username: 'A', customStyle: { borderRadius: '5px', width: '64px' } },
      }).element

      expect(style.borderRadius).toBe('5px')
      expect(style.width).toBe('64px')
      expect(style.height).toBe('50px')
    })
  })

  describe('accessibility', () => {
    it('is an image named after the user by default', () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe' } })

      expect(wrapper.attributes('role')).toBe('img')
      expect(wrapper.attributes('aria-label')).toBe('John Doe')
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    })

    it('alt overrides the name; an empty alt makes it decorative', () => {
      const named = mount(AtAvatar, { props: { username: 'John Doe', alt: 'Profile of John' } })
      expect(named.attributes('aria-label')).toBe('Profile of John')

      const decorative = mount(AtAvatar, { props: { username: 'John Doe', alt: '' } })
      expect(decorative.attributes('aria-hidden')).toBe('true')
      expect(decorative.attributes('role')).toBeUndefined()
      expect(decorative.attributes('aria-label')).toBeUndefined()
    })

    it('without a name it is hidden from assistive technology', () => {
      const wrapper = mount(AtAvatar)

      expect(wrapper.attributes('aria-hidden')).toBe('true')
      expect(wrapper.attributes('role')).toBeUndefined()
    })
  })

  describe('image', () => {
    const src = 'https://example.test/avatar.png'

    it('shows the image as the background and hides the initials', () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe', src, size: 40 } })
      const img = wrapper.find('img')

      expect(img.attributes('src')).toBe(src)
      expect(img.element.style.display).toBe('none')
      expect(wrapper.element.style.backgroundImage).toBe(`url("${src}")`)
      expect(wrapper.element.style.backgroundSize).toBe('40px 40px')
      expect(wrapper.element.style.backgroundRepeat).toBe('no-repeat')
      expect(wrapper.element.style.backgroundColor).not.toBe(cssColor('#009688'))
      expect(initials(wrapper).text()).toBe('')
      expect(initials(wrapper).element.style.display).toBe('none')
    })

    it.each([["/avatars/o'connor.png"], ['/avatars/say-"hi".png'], ['/avatars/back\\slash.png']])(
      'keeps a URL with quotes intact in the CSS background: %s',
      url => {
        const wrapper = mount(AtAvatar, { props: { username: 'John Doe', src: url } })
        const value = wrapper.element.style.backgroundImage
        // An invalid url() would be dropped (empty); serialisation may keep or drop the escapes.
        const unescaped = value.replace(/\\(.)/g, '$1')

        expect(unescaped).toBe(`url("${url}")`)
      },
    )

    it('falls back to the initials when the image fails to load', async () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe', src } })

      await wrapper.find('img').trigger('error')

      expect(wrapper.find('img').exists()).toBe(false)
      expect(initials(wrapper).text()).toBe('JD')
      expect(initials(wrapper).element.style.display).toBe('')
      expect(wrapper.element.style.backgroundColor).toBe(cssColor('#009688'))
    })

    it('a new src after a failed one is tried again', async () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe', src } })
      await wrapper.find('img').trigger('error')

      await wrapper.setProps({ src: 'https://example.test/other.png' })

      expect(wrapper.find('img').attributes('src')).toBe('https://example.test/other.png')
      expect(initials(wrapper).text()).toBe('')
    })
  })

  describe('avatar-initials event', () => {
    it('is emitted on mount with the username and the initials', () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe' } })

      expect(wrapper.emitted('avatar-initials')).toEqual([['John Doe', 'JD']])
    })

    it('carries the initials prop when it is set', () => {
      const wrapper = mount(AtAvatar, { props: { username: 'John Doe', initials: 'Q' } })

      expect(wrapper.emitted('avatar-initials')).toEqual([['John Doe', 'Q']])
    })

    it('is not emitted when an image is shown', () => {
      const wrapper = mount(AtAvatar, {
        props: { username: 'John Doe', src: 'https://example.test/a.png' },
      })

      expect(wrapper.emitted('avatar-initials')).toBeUndefined()
    })
  })

  it('is registered globally by the plugin', () => {
    const wrapper = mount({ template: '<at-avatar username="Jane Roe" :size="24" />' })

    expect(wrapper.find('.at-avatar').text()).toBe('JR')
  })
})
