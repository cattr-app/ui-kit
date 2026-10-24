# Changelog миграции cattr-ui 1.x → 2.0 (Vue 3)

Документ для команды фронтенда. Каждая запись: **Было → Стало → Что править в проекте**.
Агенты дописывают записи в том же коммите, где меняют поведение. Разделы группируются по области.
Пометка `[TODO]` означает, что изменение запланировано, но ещё не выполнено.

## Требования к окружению

- Peer dependency: `vue ^3.5`. Vue 2.x больше не поддерживается.
- Пакет поставляется как ESM (`"type": "module"`, поле `exports`, точка входа `dist/index.js`). UMD-сборки `dist/at.js`/`dist/at.min.js` удалены, глобальной переменной `at` больше нет. Сборщик потребителя должен понимать ESM (Vite, webpack 5).
  Импорт отдельных компонентов: `import { AtButton } from '@amazingcat/cattr-ui'` (имена `At*` с 20-01; tree-shaking через `sideEffects`) или `@amazingcat/cattr-ui/src/components/button`.
- Локали: `import de from '@amazingcat/cattr-ui/locale/de'` (ESM, default export) вместо `@amazingcat/cattr-ui/dist/locale/de.js` (UMD). Прямой путь `dist/...` через `exports` закрыт.
- Внутренние импорты вида `at-ui/src/...` удалены. Alias `at-ui` в конфиге потребителя больше не нужен.
- Название `at-ui` в документации, баннерах и workspace-пакете стилей заменено на `cattr-ui`. CSS-классы `at-*`, теги `<at-*>` и ключи локали `at.*` не менялись — правок в проекте не требует.

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

- `AtForm`, `AtFormItem` удалены вместе с документацией (в 1.x не экспортировались). Если проект импортировал `@cattr/ui-kit/src/components/form` напрямую — заменить на собственную форму или `vee-validate`.

## По компонентам

(заполняется задачами 30-*)

## Сервисы

(заполняется задачами 20-03, 30-w3-modal, 30-w3-notification, 30-w3-loading-bar)

## Документация и разработка

- Сборка: `pnpm build` (Vite library mode, ESM, `vue` external). Скрипты `build:component`, `build:locale`, `build:doc`, `prepublish` удалены; `build:package` оставлен алиасом `pnpm build` для CI. Стили: `pnpm build:style`. Требуется Node ≥ 24.
- Линтер: ESLint 10 flat config (`eslint.config.js`) + eslint-plugin-vue 10 + Prettier 3 (`.prettierrc`). Команды `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`. `.eslintrc.js` и `eslint-config-o2team` удалены.
