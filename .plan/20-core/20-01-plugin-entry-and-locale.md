---
id: 20-01
title: Точка входа плагина (app.use), globalProperties, локаль без Vue.prototype
status: todo
depends_on: [10-03]
parallel: false
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
5. Тест `test/core/install.spec.js`: `createApp({}).use(CattrUI, { i18n: (k) => 'X' })` → `app.component('AtButton')` определён, `app.config.globalProperties.$Message` функция; `t('at.select.placeholder')` без хука возвращает строку из `en-US`.
6. Changelog: снять `[TODO 20-01]` ×3 в разделе «Подключение».

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

## Заметки агента
