import { describe, expect, it } from 'vitest'
import { Comment, h, nextTick, ref } from 'vue'
import { mount } from '../helpers/mount.js'
import AtSkeleton from '../../src/components/skeleton'

const bones = wrapper => wrapper.findAll('.at-skeleton')

describe('AtSkeleton', () => {
  describe('loading not passed: follows the default slot', () => {
    it('shows one placeholder without a slot', () => {
      const wrapper = mount(AtSkeleton)

      expect(wrapper.element.tagName).toBe('SPAN')
      expect(bones(wrapper)).toHaveLength(1)
      // a zero-width non-joiner gives the inline-block a line height
      expect(bones(wrapper)[0].text()).toBe('‌')
    })

    it('treats whitespace, comments and empty fragments as an empty slot', () => {
      for (const slot of ['   ', () => [], () => h(Comment, 'placeholder')]) {
        const wrapper = mount(AtSkeleton, { slots: { default: slot } })
        expect(bones(wrapper), String(slot)).toHaveLength(1)
      }

      for (const inner of [
        '<b v-if="false">x</b>',
        '<template v-for="item in []" :key="item">{{ item }}</template>',
        '\n  <!-- comment -->\n',
      ]) {
        const wrapper = mount({
          components: { AtSkeleton },
          template: `<at-skeleton>${inner}</at-skeleton>`,
        })
        expect(bones(wrapper), inner).toHaveLength(1)
      }
    })

    it('renders the slot instead once it has text or elements', () => {
      const text = mount(AtSkeleton, { slots: { default: 'John Doe' } })
      expect(bones(text)).toHaveLength(0)
      expect(text.text()).toBe('John Doe')

      const element = mount(AtSkeleton, { slots: { default: '<b class="name">John</b>' } })
      expect(bones(element)).toHaveLength(0)
      expect(element.find('.name').exists()).toBe(true)

      const list = mount(AtSkeleton, {
        slots: { default: '<i v-for="n in 2" :key="n">{{ n }}</i>' },
      })
      expect(bones(list)).toHaveLength(0)
      expect(list.findAll('i')).toHaveLength(2)
    })

    it('switches to the content when the slot fills in', async () => {
      const name = ref('')
      const wrapper = mount({
        components: { AtSkeleton },
        setup: () => ({ name }),
        template: '<at-skeleton>{{ name }}</at-skeleton>',
      })
      expect(bones(wrapper)).toHaveLength(1)

      name.value = 'Jane'
      await nextTick()
      expect(bones(wrapper)).toHaveLength(0)
      expect(wrapper.text()).toBe('Jane')
    })
  })

  it('loading=true shows the placeholder even over slot content', () => {
    const wrapper = mount(AtSkeleton, {
      props: { loading: true },
      slots: { default: 'John Doe' },
    })

    expect(bones(wrapper)).toHaveLength(1)
    expect(wrapper.text()).not.toContain('John Doe')
  })

  it('loading=false shows the slot, even an empty one', () => {
    const filled = mount(AtSkeleton, {
      props: { loading: false },
      slots: { default: 'John Doe' },
    })
    expect(bones(filled)).toHaveLength(0)
    expect(filled.text()).toBe('John Doe')

    const empty = mount(AtSkeleton, { props: { loading: false } })
    expect(bones(empty)).toHaveLength(0)
    expect(empty.element.tagName).toBe('SPAN')
  })

  it('renders `count` placeholders', () => {
    const wrapper = mount(AtSkeleton, { props: { count: 3 } })

    expect(bones(wrapper)).toHaveLength(3)
  })

  it('takes width and height as numbers (px) or CSS strings', () => {
    const numbers = bones(mount(AtSkeleton, { props: { width: 120, height: 16 } }))[0]
    expect(numbers.element.style.width).toBe('120px')
    expect(numbers.element.style.height).toBe('16px')

    const strings = bones(mount(AtSkeleton, { props: { width: '50%', height: '2em' } }))[0]
    expect(strings.element.style.width).toBe('50%')
    expect(strings.element.style.height).toBe('2em')

    const none = bones(mount(AtSkeleton))[0]
    expect(none.element.style.width).toBe('')
    expect(none.element.style.height).toBe('')
  })

  it('circle rounds the placeholder', () => {
    expect(
      bones(mount(AtSkeleton, { props: { circle: true } }))[0].element.style.borderRadius,
    ).toBe('50%')
    expect(bones(mount(AtSkeleton))[0].element.style.borderRadius).toBe('')
  })

  it('duration sets the shimmer cycle; 0 makes the placeholder static', () => {
    const base = bones(mount(AtSkeleton))[0]
    expect(base.element.style.animationDuration).toBe('1.5s')
    expect(base.classes()).not.toContain('at-skeleton--static')

    const slow = bones(mount(AtSkeleton, { props: { duration: 3 } }))[0]
    expect(slow.element.style.animationDuration).toBe('3s')

    const still = bones(mount(AtSkeleton, { props: { duration: 0 } }))[0]
    expect(still.element.style.animationDuration).toBe('')
    expect(still.classes()).toContain('at-skeleton--static')
  })

  describe('tag', () => {
    it('sets the wrapper element for both the placeholder and the content', () => {
      const loading = mount(AtSkeleton, { props: { tag: 'div', count: 2 } })
      expect(loading.element.tagName).toBe('DIV')
      expect(loading.findAll('div > .at-skeleton')).toHaveLength(2)

      const loaded = mount(AtSkeleton, { props: { tag: 'p' }, slots: { default: 'Text' } })
      expect(loaded.element.tagName).toBe('P')
      expect(loaded.text()).toBe('Text')
    })

    it('an empty tag renders the content without a wrapper, the placeholder in a span', () => {
      const loaded = mount({
        components: { AtSkeleton },
        template: '<section><at-skeleton tag=""><b>One</b><b>Two</b></at-skeleton></section>',
      })
      expect(loaded.find('section').element.children).toHaveLength(2)
      expect(loaded.findAll('section > b')).toHaveLength(2)

      const loading = mount({
        components: { AtSkeleton },
        template: '<section><at-skeleton tag="" /></section>',
      })
      expect(loading.findAll('section > span > .at-skeleton')).toHaveLength(1)
    })
  })

  it('is registered globally by the plugin', () => {
    const wrapper = mount({ template: '<at-skeleton :count="2" />' })

    expect(bones(wrapper)).toHaveLength(2)
  })
})
