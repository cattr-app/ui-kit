# Changelog миграции cattr-ui 1.x → 2.0 (Vue 3)

Документ для команды фронтенда. Каждая запись: **Было → Стало → Что править в проекте**.
Агенты дописывают записи в том же коммите, где меняют поведение. Разделы группируются по области.
Пометка `[TODO]` означает, что изменение запланировано, но ещё не выполнено.

## Требования к окружению

- `[TODO 10-01]` Peer dependency: `vue ^3.5`. Vue 2.x больше не поддерживается.
- `[TODO 10-01]` Пакет поставляется как ESM (`"type": "module"`, поле `exports`). UMD-сборки `dist/at.js`/`dist/at.min.js` удалены.
  Импорт отдельных компонентов: `import { AtButton } from '@amazingcat/cattr-ui'` (tree-shaking через `sideEffects`) или `@amazingcat/cattr-ui/src/components/button`.
- `[TODO 10-01]` Локали: `@amazingcat/cattr-ui/locale/<lang>` (ESM) вместо `dist/locale/<lang>.js` (UMD).
- `[TODO 00-03]` Внутренние импорты вида `at-ui/src/...` удалены. Alias `at-ui` в конфиге потребителя больше не нужен.

## Подключение

- `[TODO 20-01]` Было: `Vue.use(CattrUI, { locale, i18n })`. Стало: `app.use(CattrUI, { locale, i18n })`.
  Авторегистрация через `window.Vue` удалена.
- `[TODO 20-01]` Глобальные сервисы доступны как `app.config.globalProperties.$Message/$Modal/$Notify/$Loading` (в Options API `this.$Message` работает как раньше)
  и как именованные экспорты `import { Message, Dialog, Notification, LoadingBar } from '@amazingcat/cattr-ui'` для `<script setup>`.
- `[TODO 20-01]` i18n-хук: `CattrUI.i18n(fn)` вызывается с `(key, values)`; для vue-i18n 11 передавать `(key, values) => i18n.global.t(key, values)`.
  Автоопределение `Vue.locale`/`$t` через прототип удалено.

## v-model

- `[TODO 30-*]` Все компоненты с `v-model` переходят на prop `modelValue` + событие `update:modelValue`.
  `v-model="x"` в шаблонах продолжает работать. Ручные биндинги `:value` + `@input` заменить на `:model-value` + `@update:model-value`.
  Затронуты: Input, InputNumber, Textarea, Checkbox, CheckboxGroup, Radio, RadioGroup, Select, Switch, Slider, Rate, Modal, Tabs, Collapse.

## Удалено

- `[TODO 00-02]` `AtForm`, `AtFormItem` удалены вместе с документацией (в 1.x не экспортировались).

## По компонентам

(заполняется задачами 30-*)

## Сервисы

(заполняется задачами 20-03, 30-w3-modal, 30-w3-notification, 30-w3-loading-bar)

## Документация и разработка

- `[TODO 10-01]` Сборка: `pnpm build` (Vite). Скрипты `build:component`, `build:locale`, `build:doc` заменены.
- `[TODO 10-02]` Линтер: ESLint 10 flat config + eslint-plugin-vue 10 + Prettier 3. Команды `pnpm lint`, `pnpm format`, `pnpm format:check`.
