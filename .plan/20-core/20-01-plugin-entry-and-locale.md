---
id: 20-01
title: Точка входа плагина (app.use), globalProperties, локаль без Vue.prototype
status: done
depends_on: [10-03]
parallel: false
model: opus
touches: [src/index.js, src/locale/index.js, src/mixins/locale.js, src/components/*/index.js, test/**]
---
## Цель
Библиотека устанавливается через `app.use(CattrUI, opts)`. Сервисы доступны через `globalProperties` и именованные экспорты. Локаль не зависит от глобального `Vue`.

## Факты
- `src/index.js`: `install(Vue, opts)` → `Vue.component`, `Vue.prototype.$Notify/$Loading/$Modal/$Message`; `locale.use(opts.locale)`, `locale.i18n(opts.i18n)`.
- Каждый `src/components/<name>/index.js` содержит `X.install = function (Vue) { Vue.component(X.name, X) }` — 49 файлов одного шаблона (часть — реэкспорты из соседней папки, напр. `radio-group/index.js` → `../radio/src/radio-group.vue`).
- `src/locale/index.js`: `import Vue from 'vue'`, `Object.getPrototypeOf(this || Vue).$t`, `Vue.locale`, `Vue.config.lang` — API vue-i18n v5, в Vue 3 и vue-i18n 11 ничего из этого нет.
- `src/mixins/locale.js`: метод `t(...args)` → `t.apply(this, args)`.
- Сервисы (Dialog, Message, Notification, LoadingBar) на этом этапе ещё Vue 2 (`Vue.extend`) — их переписывает 20-03; здесь только проводка.

## Шаги
1. `src/index.js`:
   - `install(app, opts = {})`: `locale.use(opts.locale)`, `locale.i18n(opts.i18n)`, `for (c of components) app.component(c.name, c)`, `app.config.globalProperties.$Message = Message` и т.д., `app.provide(CATTR_UI_KEY, { app })` — ключ экспортировать из `src/utils/context.js` (нужен 20-03 для `appContext`).
   - Экспорты: `export { install, locale, i18n }`, `export * from` список компонентов под именами `AtButton`, `AtSelect`, … (имя = `component.name`), сервисы `Message`, `Dialog`, `Notification`, `LoadingBar`; `export default { install, version }`.
2. `src/components/*/index.js`: единый шаблон `X.install = app => { app.component(X.name, X) }`. Сделать скриптом (`sed`), проверить реэкспорты.
3. `src/locale/index.js`: удалить `import Vue`, `Vue.locale`, `merged`. Оставить: `lang`, `i18nHandler` (по умолчанию `null`), `t(key, values)`: если `i18nHandler` задан — вернуть его результат, если он не `undefined/null`; иначе путь по `lang`. Поддержать подстановку `{name}` из `values` в дефолтной ветке (сейчас не поддерживается — проверить, нужна ли компонентам; `grep -rn "t('at\." src/components`).
4. `src/mixins/locale.js` оставить как mixin (mixins в Vue 3 работают) **и** добавить `src/composables/useLocale.js` → `{ t }` для будущих `<script setup>`.
5. Тест `test/helpers/mount.spec.js`: helper `mount` из `test/helpers/mount.js` (статический импорт плагина) монтирует компонент с шаблоном `<at-button>Hi</at-button>` и находит `.at-btn` — это первая проверка, что `app.use(CattrUI)` работает на Vue 3.
6. Тест `test/core/install.spec.js`: `createApp({}).use(CattrUI, { i18n: (k) => 'X' })` → `app.component('AtButton')` определён, `app.config.globalProperties.$Message` функция; `t('at.select.placeholder')` без хука возвращает строку из `en-US`.
7. Changelog: снять `[TODO 20-01]` ×3 в разделе «Подключение».

## Критерии приёмки
- `grep -rn "Vue.prototype\|window.Vue\|import Vue from 'vue'" src` пусто (кроме файлов сервисов, которые чинит 20-03 — перечислить в заметках, если остались).
- `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит, `pnpm lint` не добавил ошибок в затронутых файлах.

## Проверка
```sh
scripts/node.sh pnpm test
scripts/node.sh pnpm build
scripts/node.sh pnpm exec eslint src/index.js src/locale src/mixins src/components/*/index.js
```

## Changelog
`app.use`, именованные экспорты, формат i18n-хука.

## Найдено по ходу
- (из 10-01) `import Vue from 'vue'` остаётся в `src/locale/index.js`, `modal/src/dialog.js`, `message/src/message.js`, `notification/src/notic.js`, `loading-bar/src/loading-bar.js` — из-за него `import('./dist/index.js')` падает с `does not provide an export named 'default'`. locale чинится здесь, сервисы — в 20-03/30-w3-*.
- (из 10-01) `deepmerge` 4.x: опция `clone` устарела; после переписывания locale проверить, нужен ли deepmerge вообще (единственное использование). Если остаётся — вынести в `rollupOptions.external` вместе с `vue`, чтобы не бандлить зависимость из `dependencies`.
- (из 10-01) Экспорты в `src/index.js` сейчас без префикса (`Button`, а не `AtButton`); changelog обещает `At*` — привести здесь.

## Заметки агента
- Контракт для 20-03: `src/utils/context.js` → `CATTR_UI_KEY` (Symbol('cattr-ui'); `install` делает `app.provide(CATTR_UI_KEY, { app })`), `setCurrentApp(app)`, `getCurrentApp()` (последний app, вызвавший `app.use(CattrUI)`, иначе `null`).
- `deepmerge` больше не нужен (vue-i18n merge удалён) → убран из `dependencies` и lockfile. `t()` подстановку `{name}` не делает: компоненты `values` не используют; `values` передаются только в хук. `i18n(null)` сбрасывает хук, `i18n(undefined)` оставляет текущий.
- `version`: `define: { __CATTR_UI_VERSION__ }` в vite.config.js (работает в build и vitest; при использовании `src/` напрямую — `undefined`). `import pkg ... with { type: 'json' }` отброшен: тянул весь package.json в dist.
- Сервисы с ленивой заглушкой (`createInstance` бросает `... not migrated to Vue 3 yet (plan 20-03)`): `message/src/message.js`, `notification/src/notic.js`, `loading-bar/src/loading-bar.js`, `modal/src/dialog.js`. Логика не мигрирована, `import Vue` в src больше нет.
- Каталогов компонентов 47, не 49: 43 с `install` + 4 сервиса (`dialog`, `message`, `notification`, `loading-bar`) без него. Раньше `install` регистрировал функции Message/Dialog/Notification как компоненты (по `fn.name`) — теперь только 43 компонента.
- Default export теперь `{ install, version }` (без `locale`/`i18n`/компонентов) — записано в changelog.
- `import('./dist/index.js')` в Node больше не падает. `mount.spec` с `<at-button>` проходит; предупреждение про `this.style` в button.vue → w1-button. eslint по `src/mixins` даёт старую ошибку `require` в `mixins/popover.js` (20-04), `message.js` `no-self-assign` (20-03). `pnpm lint` 89 errors / 6 warnings до и после.
