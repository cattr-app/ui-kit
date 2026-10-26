import { mount as vtuMount } from '@vue/test-utils'
import CattrUI from '../../src/index.js'

/**
 * Mount a component with the library plugin installed, so nested `<at-*>` resolve.
 *
 *   const wrapper = mount(AtButton, { props: { type: 'primary' } })
 *
 * Extra `global.plugins` from options are appended after CattrUI.
 */
export function mount(component, options = {}) {
  const { global: globalOptions = {}, ...rest } = options
  return vtuMount(component, {
    ...rest,
    global: {
      ...globalOptions,
      plugins: [CattrUI, ...(globalOptions.plugins || [])],
    },
  })
}
