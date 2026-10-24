# Quickstart

----

## Before Start

> Before using Cattr UI, we recommend you to learn `Vue` and modern JavaScript (ES modules), and make sure that you had installed [Node.js](https://nodejs.org/en/) correctly.

`Cattr UI` is based on `Vue.js` 3.5+, so we encourage you to know the basics below:

- [Vue Components](https://vuejs.org/guide/essentials/component-basics.html)
- [Single File Components](https://vuejs.org/guide/scaling-up/sfc.html)

## Starter Kit

> [Vite](https://vite.dev/) provides an official template for Vue (`npm create vite@latest`, template `vue`). It takes only a few minutes to get up and running with hot-reload and production-ready builds.

## Standard Development Flow

`Cattr UI` is an ES module package, it is used with a bundler that understands ESM (Vite, webpack 5).

### Global Components Usage

Install the plugin in the entry file of the project. All components are registered globally as `<at-*>`.

```js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/src/stylesheet/src/index.scss'   // Import styles (SCSS, requires `sass`)
import App from './App.vue'

const app = createApp(App)

app.use(CattrUI)    // or app.use(CattrUI, { locale, i18n }), see Internationalization
app.mount('#app')
```

The plugin also adds the global services `$Message`, `$Modal`, `$Notify` and `$Loading` to `app.config.globalProperties`, so in the Options API you can use them directly, such as:

```js
this.$Loading.start()
this.$Message.success(config)
this.$Modal.alert(config)
this.$Notify(config)
```

In `<script setup>` or outside components, import the services as named exports (call them after `app.use(CattrUI)`, the services are rendered in the context of that application):

```js
import { Message, Dialog, Notification, LoadingBar } from '@amazingcat/cattr-ui'

LoadingBar.start()
Message.success('Saved')
Dialog.confirm('Are you sure?').then(() => {})
Notification({ title: 'Title', message: 'Content' })
```

### Import On Demand

Each component is a named export with the name of the component (`AtButton`, `AtInput`, …); unused components are removed by tree-shaking. Register them locally:

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

In template, use components with custom tag as `<at-input></at-input>`, use `v-model` to achieve data binding.

```html
<template>
  <div>
    <at-input v-model="value" placeholder="Please input..."></at-input>
  </div>
</template>
```

Or register a single component globally with `app.use(AtButton)` (same as `app.component(AtButton.name, AtButton)`). A component can also be imported by path: `import AtButton from '@amazingcat/cattr-ui/src/components/button'`.

The following are the complete list of components and the way to be imported:

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

const app = createApp(App)

app.use(AtButton)
// …
app.use(Message)        // adds $Message to app.config.globalProperties
app.use(Dialog)         // adds $Modal
app.use(Notification)   // adds $Notify
app.use(LoadingBar)     // adds $Loading
```

> A service renders in the context of the first app that ran `app.use(CattrUI)` or `app.use(<Service>)` (`app.use(CattrUI)` always wins, the last one installed). `$Modal` (`Dialog`) registers its `AtButton`/`AtInput` itself, so a standalone `app.use(Dialog)` is enough.

## Customize Theme

The styles of `Cattr UI` are included in the package (`@amazingcat/cattr-ui/src/stylesheet`). The variables for each component are stored in the file `src/stylesheet/src/variables/default.scss`. User can customize the style of components according to actual needs.
