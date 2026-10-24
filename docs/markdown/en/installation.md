# Installation

----

## NPM

`Cattr UI` is distributed as an ES module package for bundlers that understand ESM (Vite, webpack 5). It requires `vue` 3.5 or newer as a peer dependency.

```bash
npm install vue @amazingcat/cattr-ui
# or
pnpm add vue @amazingcat/cattr-ui
```

UMD builds for the `<script>` tag (`dist/at.min.js`, the global `at`) are no longer provided, and the styles are shipped inside the package (`@amazingcat/cattr-ui/src/stylesheet`), so a separate style package is not needed.

## Example

A minimal application, e.g. created with `npm create vite@latest` (template `vue`):

```js
// main.js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/src/stylesheet/src/index.scss'
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

The styles are written in SCSS, so the project needs the `sass` package (`npm install -D sass`).
