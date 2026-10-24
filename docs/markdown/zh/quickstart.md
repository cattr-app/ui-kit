
# 快速上手

----

## 使用前准备

> 在使用之前，推荐学习 `Vue 3` 和现代 JavaScript（ES Modules），并正确配置 `Node.js` 24 或以上版本

`Cattr UI` 基于 `Vue.js` 3.5+ 版本开发，所以有必要了解以下基础知识：
- [Vue 组件](https://cn.vuejs.org/guide/essentials/component-basics.html)
- [单文件组件](https://cn.vuejs.org/guide/scaling-up/sfc.html)

## 基于模板工程开发

> `Vue.js` 提供官方脚手架 `create-vue`（`npm create vue@latest`），基于 `Vite` 快速搭建单页应用。该工具提供开箱即用的构建工具配置，带来现代化的前端开发流程。只需几分钟即可创建并启动一个带热重载、保存时静态检查以及可用于生产环境的构建配置的项目。


## 标准开发

实际项目中，往往会使用 `Vite` 或 `webpack 5` 的工作流，大多可以做到按需加载页面用到的组件。组件库以 ESM 格式发布，不提供 `<script>` 标签全局引入的方式。

### 全局组件使用

可以在项目的入口文件中创建应用并安装所有组件

```js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/style.css'    // 引入组件样式（编译好的 CSS，无需 Sass）
import App from './App.vue'

const app = createApp(App)

app.use(CattrUI)
app.mount('#app')
```

如果全局安装了 `Cattr UI`，那么可以直接使用 `Cattr UI` 的全局实例方法（`app.config.globalProperties`），如：

```js
this.$Message.success(config)
this.$Notify(config)
this.$Loading.start()
this.$Modal.alert(config)
```

在 `<script setup>` 中没有 `this`，可以直接导入对应的服务：

```js
import { Message, Notification, LoadingBar, Dialog } from '@amazingcat/cattr-ui'

Message.success(config)
Notification(config)
LoadingBar.start()
Dialog.alert(config)
```

> 服务在安装了插件的应用上下文中渲染，因此需要在 `app.use(CattrUI)` 之后调用。

### 单个组件按需使用

组件以具名导出的方式提供（导出名与组件名一致，如 `AtInput`），配合构建工具的 tree-shaking 即可减小项目体积，无需 `babel-plugin-import` 等额外插件。

可以局部注册所需的组件：

```js
import { AtInput } from '@amazingcat/cattr-ui'

export default {
  components: {
    AtInput
  },
  data () {
    return {
      value: 'Cattr'
    }
  }
}
```

在模板中，用 `<at-input></at-input>` 自定义标签的方式使用组件，并且可用 `v-model` 语法实现数据的动态绑定

```html
<template>
  <div>
    <at-input v-model="value" placeholder="请输入..."></at-input>
  </div>
</template>
```

以下是完整的组件列表和全局注册方式：

```js
import { createApp } from 'vue'
import {
  AtButton,
  AtButtonGroup,
  AtTag,
  AtRadio,
  AtRadioGroup,
  AtRadioButton,
  AtCheckbox,
  AtCheckboxGroup,
  AtInput,
  AtInputNumber,
  AtTextarea,
  AtBadge,
  AtSwitch,
  AtSlider,
  AtTooltip,
  AtPopover,
  AtAlert,
  AtProgress,
  AtModal,
  AtSelect,
  AtOption,
  AtOptionGroup,
  AtDropdown,
  AtDropdownMenu,
  AtDropdownItem,
  AtBreadcrumb,
  AtBreadcrumbItem,
  AtPagination,
  AtMenu,
  AtMenuItem,
  AtMenuItemGroup,
  AtSubmenu,
  AtTable,
  AtCard,
  AtCollapse,
  AtCollapseItem,
  AtSteps,
  AtStep,
  AtRate,
  AtTabs,
  AtTabPane,
  AtTimeline,
  AtTimelineItem,
  Message,
  Dialog,
  Notification,
  LoadingBar
} from '@amazingcat/cattr-ui'
import App from './App.vue'

const app = createApp(App)

app.use(AtButton)                     // 等价于 app.component(AtButton.name, AtButton)
app.component(AtInput.name, AtInput)

app.use(Message)                      // app.config.globalProperties.$Message
app.use(Notification)                 // app.config.globalProperties.$Notify
app.use(LoadingBar)                   // app.config.globalProperties.$Loading
app.use(Dialog)                       // app.config.globalProperties.$Modal

app.mount('#app')
```

> 服务在第一个执行 `app.use(CattrUI)` 或 `app.use(<服务>)` 的应用上下文中渲染（`app.use(CattrUI)` 总是以最后一次安装为准）。`$Modal`（`Dialog`）内部的 `AtButton`、`AtInput` 已在组件内注册，单独 `app.use(Dialog)` 即可使用。

## 自定义主题

`Cattr UI` 的样式随组件库一起发布：编译好的默认主题 `@amazingcat/cattr-ui/style.css`，以及位于 `@amazingcat/cattr-ui/src/stylesheet/src` 的 SCSS 源码。各个组件的样式变量都存放在 `@amazingcat/cattr-ui/src/stylesheet/src/variables/default.scss` 文件中。用户可根据实际需要，自定义组件的样式：用 SCSS 源码代替 `style.css` 引入。此时项目需要安装 Sass：`sass-embedded`（推荐）或 `sass`，pnpm 的相关配置见 [安装](#/zh/docs/installation)。

样式基于 Sass 模块系统（`@use` / `@forward`）编写。`default.scss` 中的所有变量都带有 `!default`，并由入口文件转发，因此主题在加载样式时配置：新建自己的 SCSS 入口文件，并用它代替 `index.scss` 引入。

```scss
// src/styles/cattr-ui.scss
@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' as cattr with (
  $brand-blue-500: #ff5722,   // 链接、主要按钮、激活状态等
  $font-size-base: 13px
);

// 在该文件中可通过命名空间使用同样的变量和 mixin
.my-link {
  color: cattr.$link-color;
  @include cattr.ellipsis(200px);
}
```

```js
import './styles/cattr-ui.scss'
```

单文件组件中的每个 `<style lang="scss">` 块都是单独编译的，入口文件里的配置在那里不可见。如果自己的样式也需要使用主题变量，请把配置放在一个 partial 文件中，并在各处加载它：

```scss
// src/styles/_theme.scss
@forward '@amazingcat/cattr-ui/src/stylesheet/src/variables' with (
  $brand-blue-500: #ff5722
);
@forward '@amazingcat/cattr-ui/src/stylesheet/src/mixins';

// src/styles/cattr-ui.scss —— 入口文件，主题放在最前面
@use 'theme';
@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss';

// 任意组件：<style lang="scss">
@use '@/styles/theme' as *;
.my-link { color: $link-color; }
```

`with (…)` 只接受 `default.scss` 中定义的变量（以及 `$ease-*` 缓动函数），变量名写错会导致编译错误。一个模块只能被配置一次，且只能在第一次 `@use` 时配置，因此请只加载一次带配置的 `index.scss`，并放在其他样式文件之前。在 `@import` 之前覆盖变量的旧方式仍可编译，但会输出弃用警告：Dart Sass 已弃用 `@import`，并将在 Sass 3 中移除。
