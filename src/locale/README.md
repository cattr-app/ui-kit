# Internationalization

The default language is English (en-US). Built-in language packs live in the `lang` folder: `de`, `en-US`, `fa-IR`, `ko-KR`, `pt-BR`, `zh-CN`. Each file has a default export and is published as `@amazingcat/cattr-ui/locale/<name>`; adding a file to `lang` is enough to publish a new language.

Register a language when installing the plugin:

```js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import de from '@amazingcat/cattr-ui/locale/de'

createApp(App).use(CattrUI, { locale: de }).mount('#app')
```

To translate the library with an external translator (vue-i18n 11, `legacy: false`), pass an `i18n` function `(key, values) => string | null | undefined`. Returning `null` or `undefined` falls back to the built-in language pack:

```js
app.use(CattrUI, {
  i18n: (key, values) => (i18n.global.te(key) ? i18n.global.t(key, values) : undefined),
})
```

`i18n.global.t` returns the key itself for a missing message, so check `te(key)` first, or add the `at.*` keys to your messages.
