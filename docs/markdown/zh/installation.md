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

组件样式随组件库一起发布，既有编译好的 CSS（`@amazingcat/cattr-ui/style.css`），也有 SCSS 源码（`@amazingcat/cattr-ui/src/stylesheet`），无需安装单独的样式包。

> 2.0 起不再提供 UMD 版本（`dist/at.min.js`）和 CDN `<script>` 引入方式，也没有全局变量 `at`。

#### 示例：

在项目的入口文件中创建应用并安装 `Cattr UI`：

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
      showMessage () {
        this.$Message('Thanks for using Cattr UI')
      }
    }
  }
</script>
```

`style.css` 是使用默认主题编译好的样式（另有压缩版 `style.min.css`），图标字体由构建工具从组件库中自动引入，无需安装 Sass。

如需自定义主题，请改为引入 SCSS 源码（见 [自定义主题](#/zh/docs/quickstart)），此时项目需要安装 Sass：`npm install -D sass-embedded`（推荐，也可以使用 `sass`）。使用 pnpm 10 及以上版本时，需要在项目的 `pnpm-workspace.yaml` 中添加以下配置，否则 `pnpm install` 会因 `@parcel/watcher` 报错 `ERR_PNPM_IGNORED_BUILDS`：

```yaml
ignoredOptionalDependencies:
  - sass-embedded-all-unknown
  - sass-embedded-unknown-all
```

使用 `sass` 时改为 `allowBuilds: { '@parcel/watcher': false }`。
