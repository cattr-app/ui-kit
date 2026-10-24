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

- Было: `Vue.use(CattrUI, { locale, i18n })`. Стало: `app.use(CattrUI, { locale, i18n })` (`createApp(App).use(CattrUI, opts)`).
  Авторегистрация через `window.Vue` удалена. Плагин можно ставить только после `createApp`, глобального `Vue` больше нет.
- Глобальные сервисы доступны как `app.config.globalProperties.$Message/$Modal/$Notify/$Loading` (в Options API `this.$Message` работает как раньше)
  и как именованные экспорты `import { Message, Dialog, Notification, LoadingBar } from '@amazingcat/cattr-ui'` для `<script setup>`.
- Именованные экспорты компонентов переименованы под имя компонента: было `import { Button, Select } from '@amazingcat/cattr-ui'`,
  стало `import { AtButton, AtSelect } from '@amazingcat/cattr-ui'` (`AtAlert` … `AtTooltip`, 43 шт., имя экспорта = `component.name`).
  Сервисы экспортируются без префикса: `Message`, `Dialog`, `Notification`, `LoadingBar`. Также экспортируются `install`, `version`, `locale`, `i18n`.
- Default export сокращён до `{ install, version }`: `CattrUI.Button`, `CattrUI.locale(...)`, `CattrUI.i18n(...)` и т.п. больше нет.
  Что править: компоненты брать именованными экспортами, локаль/хук передавать в `app.use(CattrUI, { locale, i18n })`
  или вызывать `import { locale, i18n } from '@amazingcat/cattr-ui'`.
- Отдельная регистрация компонента: `app.use(AtButton)` (`AtButton.install = app => app.component(AtButton.name, AtButton)`), вместо `Vue.use(Button)`.
- i18n-хук: `fn(key, values)`; если вернул `null`/`undefined`, берётся строка из встроенной локали (`en-US` или переданной в `locale`).
  Для vue-i18n 11: `app.use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })`.
  Учтите, что `i18n.global.t` для отсутствующего ключа возвращает сам ключ, а не `undefined`, — тогда fallback на встроенную локаль не сработает;
  либо добавить ключи `at.*` в сообщения vue-i18n, либо проверять `i18n.global.te(key)` и возвращать `undefined`.
  Автоопределение `Vue.locale`/`$t` через прототип и слияние встроенной локали с сообщениями vue-i18n (deepmerge) удалены; зависимость `deepmerge` убрана.

## v-model

- `[TODO 30-*]` Все компоненты с `v-model` переходят на prop `modelValue` + событие `update:modelValue`.
  `v-model="x"` в шаблонах продолжает работать. Ручные биндинги `:value` + `@input` заменить на `:model-value` + `@update:model-value`.
  Затронуты: Input, InputNumber, Textarea, Checkbox, CheckboxGroup, Radio, RadioGroup, Select, Switch, Slider, Rate, Modal, Tabs, Collapse.

## Удалено

- `AtForm`, `AtFormItem` удалены вместе с документацией (в 1.x не экспортировались). Если проект импортировал `@cattr/ui-kit/src/components/form` напрямую — заменить на собственную форму или `vee-validate`.

## По компонентам

### Alert

- Prop `message` остаётся обязательным (`required: true`), но у него убран `default: ''`. Было: при отсутствии значения приходила пустая строка; стало: `undefined`. Вывод компонента не меняется (текст выводится по `v-if`).
  Что править: ничего, если `message` всегда передаётся; при отсутствии значения Vue выдаёт warning о required-prop, как и раньше.
- Событие `on-close` без изменений; добавлен явный `emits: ['on-close']`.

### Tooltip, Popover (общий mixin popover)

- `v-model` открытия: было prop `value`, компонент эмитил только `toggle` (`v-model` работал в одну сторону); стало prop `modelValue` + событие `update:modelValue` при каждом открытии/закрытии (клик, hover, focus, клик снаружи), `toggle` остаётся.
  Что править: `v-model="open"` работает как есть; `:value="open"` → `:model-value="open"`, вместо `@toggle` для синхронизации можно использовать `v-model`.

### Progress

- Публичный API не изменился: имена props/событий и поведение те же. Prop `percent` больше не помечен `required` (при `default: 0` это давало предупреждение Vue в dev-режиме); поведение при отсутствии `percent` прежнее — `0`.
- Событие `on-status-success` теперь объявлено в `emits`; слушатель `@on-status-success` работает как раньше. Что править: ничего.

(заполняется задачами 30-*)

### Radio, RadioGroup, RadioButton

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input` (у `AtRadioGroup` и одиночного `AtRadio`). `v-model` в шаблонах работает как раньше.
- Событие группы `radio-group-change` сохранено. Было: срабатывало на любое изменение `value`, в т.ч. программное → стало: только при выборе пользователем, аргумент — `label` выбранного радио. Что править: если нужна реакция на программные изменения — `watch` на свою переменную v-model.
- `AtRadio` внутри группы больше не эмитит собственный `input`/`update:modelValue` — слушать события на `AtRadioGroup`. Одиночный `AtRadio`/`AtRadioButton` эмитит только `update:modelValue`.
- `AtRadioButton` теперь работает и без группы по собственному `modelValue` (`v-model` на кнопке). `size`/`fill`/`text-color` по-прежнему задаются только на `AtRadioGroup`; `size` группы теперь реактивен (в 1.x читался один раз при создании).
- Выбор `disabled` радио/кнопки не эмитит событий; повторный выбор уже выбранного значения тоже.

### Switch

- v-model: prop `value` → `modelValue`. Было: `<at-switch v-model="on">` с prop `value`. Стало: `v-model="on"` работает как раньше, `:value="on"` → `:model-value="on"`.
- Добавлено событие `update:modelValue` при каждом клике (не для `disabled`). Событие `change` сохранено, аргумент — новое значение.
- Состояние переключателя синхронизируется с `modelValue` при изменении prop; внутреннее состояние остаётся и при клике без `v-model` (как в 1.x).

## Сервисы

- `[TODO 20-03, 30-w3-*]` До завершения миграции сервисов `$Message`, `$Modal`, `$Notify`, `$Loading` существуют, но при вызове бросают `… is not migrated to Vue 3 yet`. Промежуточные сборки ветки `feat/vue-3` для потребителя непригодны до закрытия этапа 30.

- `Message` (`$Message`): API вызова без изменений — `Message('text')`, `Message({ message, type, icon, duration, onClose })`, `Message.info/success/warning/error/loading(...)`, `Message.close(id)`, `Message.closeAll()`, вызов возвращает функцию закрытия.
  Импорт для `<script setup>`: `import { Message } from '@amazingcat/cattr-ui'`; также можно поставить отдельно: `app.use(Message)` (кладёт `$Message` в `globalProperties`).
  Было: работало сразу после импорта. Стало: сервис рендерится в контексте приложения, установившего плагин, — вызывать **после** `app.use(CattrUI)`, иначе `<at-*>`-компоненты и локаль внутри сервиса не отрендерятся (для `Message` сейчас некритично — иконки CSS-классами, текстов локали нет, — но для `$Modal`/`$Notify` обязательно; полагаться не стоит).
  Мелочи: объект `options` больше не мутируется (раньше в него дописывались `type`/`onClose`); `Message.close(id)` теперь и прячет сообщение, а не только убирает его из стека; `Message.closeAll()` закрывает все сообщения (раньше пропускал каждое второе); в `onClose(vm)` приходит публичный экземпляр компонента сообщения, как и раньше.

(заполняется задачами 30-w3-modal, 30-w3-notification, 30-w3-loading-bar)

## Документация и разработка

- Сборка: `pnpm build` (Vite library mode, ESM, `vue` external). Скрипты `build:component`, `build:locale`, `build:doc`, `prepublish` удалены; `build:package` оставлен алиасом `pnpm build` для CI. Стили: `pnpm build:style`. Требуется Node ≥ 24.
- Линтер: ESLint 10 flat config (`eslint.config.js`) + eslint-plugin-vue 10 + Prettier 3 (`.prettierrc`). Команды `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`. `.eslintrc.js` и `eslint-config-o2team` удалены.
