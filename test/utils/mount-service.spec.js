import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, resolveComponent } from 'vue'
import CattrUI from '../../src/index.js'
import { mountService } from '../../src/utils/mount-service.js'

const Probe = {
  props: { label: { type: String, default: '' } },
  data: () => ({ count: 0 }),
  render() {
    return h('div', { class: 'probe' }, [h(resolveComponent('AtButton'), null, () => this.label)])
  },
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('mountService', () => {
  it('renders into document.body with the installed app context', () => {
    createApp({}).use(CattrUI)
    const service = mountService(Probe, { label: 'ok' })

    expect(service.el.parentNode).toBe(document.body)
    expect(service.el.querySelector('.at-btn')).not.toBeNull()
    service.unmount()
    expect(document.body.querySelector('.probe')).toBeNull()
  })

  it('update() patches props on the same instance', async () => {
    const service = mountService(Probe, { label: 'a' })
    service.vm.count = 5
    service.update({ label: 'b' })
    await nextTick()

    expect(service.el.textContent).toContain('b')
    expect(service.vm.count).toBe(5)
    service.unmount()
  })
})
