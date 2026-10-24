import { mount as vtuMount } from '@vue/test-utils'

/**
 * Mount a component with the library plugin installed, so nested `<at-*>` resolve.
 *
 *   const wrapper = await mount(AtButton, { props: { type: 'primary' } })
 *
 * Extra `global.plugins` from options are appended after CattrUI.
 *
 * The plugin is imported lazily: until 20-01/20-03 `src/index.js` still evaluates Vue 2
 * code (`import Vue from 'vue'`, `Vue.extend`) and throws on import, so a static import
 * here would break every spec file that imports this helper.
 */
export async function mount(component, options = {}) {
  const { default: CattrUI } = await import('../../src/index.js')
  const { global: globalOptions = {}, ...rest } = options
  return vtuMount(component, {
    ...rest,
    global: {
      ...globalOptions,
      plugins: [CattrUI, ...(globalOptions.plugins || [])],
    },
  })
}
