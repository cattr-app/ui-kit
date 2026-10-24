# 安装

----

## 环境要求

- `Vue` 3.5 及以上版本（`peerDependencies`: `vue ^3.5`），不再支持 Vue 2.x
- 组件库以 ESM 格式发布，需要支持 ESM 的构建工具，如 `Vite` 或 `webpack 5`

## 使用 npm 安装

推荐使用 `npm` 或 `pnpm` 的方式进行开发，享受 `node` 生态圈和 `Vite` 工具链带来的便利。通过 `npm` 安装的模块包，可以使用 `import` 的方式引用

```bash
npm install vue @amazingcat/cattr-ui
```

组件样式随组件库一起发布，无需安装单独的样式包。

> 2.0 起不再提供 UMD 版本（`dist/at.min.js`）和 CDN `<script>` 引入方式，也没有全局变量 `at`。

#### 示例：

在项目的入口文件中创建应用并安装 `Cattr UI`：

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
      showMessage () {
        this.$Message('Thanks for using Cattr UI')
      }
    }
  }
</script>
```
