---
id: 30-w3-modal
title: Modal + сервис Dialog ($Modal) → Vue 3
status: done
depends_on: [20-01, 20-02, 20-03, 20-04]
parallel: true
model: opus
touches: [src/components/modal/**, src/components/dialog/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×2
- `$slots` ×1
- `keyCode` ×1
- `modal.vue:28` no-deprecated-v-on-native-modifier
- `modal.vue:34` no-deprecated-v-on-native-modifier
- `modal.vue:35` no-deprecated-v-on-native-modifier
- `.native` ×3
- `Vue.extend` ×1
- событий без `emits`: 4
- файлы: dialog.js modal.vue 

## Специфика
- (из 30-w1-input) `@keyup.enter.native="handleAction('confirm')"` на `<at-input>` → `@keyup.enter` (слушатель теперь падает на нативный input). У AtInput нет публичного `focus()`: фокус через `this.$refs.input.$el.querySelector('input').focus()` или добавить `focus()` в Input через `defineExpose`/methods (тогда записать в changelog Input).
- `modal.vue`: v-model (`value` → `modelValue`), `.native` ×3, `keyCode === 27` → `event.key === 'Escape'`, слушатель keydown на document снимать в `beforeUnmount`.
- `dialog.js`: `Vue.extend(Modal)`, `new DialogConstructer({ el })`, присваивание опций в instance (`instance[prop] = options[prop]`), очередь `modalQueue`, promise-API `alert/confirm/prompt/info/success/warning/error`, `Dialog.close`. Переписать через `mountService` (20-03): опции передавать как props, `visible` управлять через reactive-объект props, колбэки — через `onAction`. Сохранить промис-семантику (resolve на confirm, reject на cancel для confirm/prompt). Титулы по умолчанию в `createStatusDialog` на китайском — заменить на `t('at.modal.<type>')` или английские строки, записать в changelog.
- Smoke-тесты: `Dialog.confirm('x')` монтирует `.at-modal`, клик по кнопке confirm резолвит промис; `Dialog.prompt` возвращает `{ value, action }`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/modal` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/modal && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/modal
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано: «По компонентам» → Modal (on-confirm без лишнего on-cancel, Escape/`closeOnPressEsc`, новые props `showCancelButton`/`showConfirmButton`/`inputValue`/`inputPlaceholder`, событие `after-leave`); «Сервисы» → `Dialog` (`$Modal`): промис-семантика, вызов после `app.use`, английские титулы, исправления очереди/Escape/callback.

## Найдено по ходу

## Заметки агента

- Сервис: `mountService(Modal, props)` на каждый диалог, `visible` через `update({ modelValue })`, действие — listener-props `onOn-confirm`/`onOn-cancel`, размонтирование по новому событию `after-leave` (не `destroy`, как в эталоне Message: Modal публичный компонент, а имя `destroy` вводило бы в заблуждение — событие на каждое закрытие).
- В 1.x очередь фактически не работала (новый instance на каждый вызов, `!instance.visible` всегда true), Escape/маска не разрешали промис, `options.callback` отключал промис, OK эмитил ещё и `on-cancel`, слушатель keydown не снимался (`beforeDestory`). Всё исправлено, записано в changelog.
- `Dialog.close()` оставлен 1:1: промис текущего диалога не разрешается (иначе ломается код, ожидающий «тихого» закрытия). Возможно, стоит пересмотреть на этапе 40/60.
- Титулы `info/success/warning/error` — английские строки (ключей `at.modal.<type>` в локалях нет, локаль не трогал). Кандидат в 60-backlog: добавить ключи в локали.
- Фокус prompt-поля через `$refs.input.$el.querySelector('input')`, Input не менялся.
- Пометка `[TODO 20-03, 30-w3-*]` в «Сервисах» оставлена: notification/loading-bar в этом worktree ещё не закрыты.
- docs/markdown/en/modal.md (этап 40): `value` → `modelValue`, `slot="header"` → `#header`, `@click.native` нет, но пример prompt содержит невалидный JS (`methods: { this.$Modal.prompt(...) }`).
