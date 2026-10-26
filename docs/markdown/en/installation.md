# Installation

----

## NPM

`Cattr UI` is distributed as an ES module package for bundlers that understand ESM (Vite, webpack 5). It requires `vue` 3.5 or newer as a peer dependency.

```bash
npm install vue @amazingcat/cattr-ui
# or
pnpm add vue @amazingcat/cattr-ui
```

UMD builds for the `<script>` tag (`dist/at.min.js`, the global `at`) are no longer provided. The styles are shipped inside the package, both compiled (`@amazingcat/cattr-ui/style.css`) and as SCSS sources (`@amazingcat/cattr-ui/src/stylesheet`), so a separate style package is not needed.

## Example

A minimal application, e.g. created with `npm create vite@latest` (template `vue`):

```js
// main.js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/style.css'
import App from './App.vue'

createApp(App).use(CattrUI).mount('#app')
```

```html
<!-- App.vue -->
<template>
  <at-button @click="showMessage">Show message</at-button>
</template>

<script>
export default {
  methods: {
    showMessage() {
      this.$Message('Thanks for using Cattr UI')
    }
  }
}
</script>
```

`style.css` is the compiled stylesheet with the default theme (a minified `style.min.css` is available too); the icon fonts are picked up by the bundler from the package. No Sass is needed for it.

To customize the theme, load the SCSS sources instead (see [Customize Theme](#/en/docs/quickstart)). They require Sass: `npm install -D sass-embedded` (recommended, `sass` works as well). With pnpm 10 or newer, add this to the `pnpm-workspace.yaml` of the project, otherwise `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` because of `@parcel/watcher`:

```yaml
ignoredOptionalDependencies:
  - sass-embedded-all-unknown
  - sass-embedded-unknown-all
```

With `sass` use `allowBuilds: { '@parcel/watcher': false }` instead.
