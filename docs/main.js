import { createApp } from 'vue'

import 'highlight.js/styles/atom-one-light.css'
import '../src/stylesheet/src/index.scss'

import CattrUI from '../src/index.js'
import App from './App.vue'
import router from './router/index.js'
import i18n from './i18n.js'
import DemoBox from './components/demobox.vue'
import IconList from './components/iconlist.vue'
import clipboard from './directives/clipboard.js'

const app = createApp(App)

app
  .use(router)
  .use(i18n)
  .use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })

app.component('DemoBox', DemoBox)
app.component('IconList', IconList)
app.directive('clipboard', clipboard)

app.mount('#app')
