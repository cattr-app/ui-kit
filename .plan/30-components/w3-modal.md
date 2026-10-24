---
id: 30-w3-modal
title: Modal + сервис Dialog ($Modal) → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-03, 20-04]
parallel: true
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
- `modal.vue`: v-model (`value` → `modelValue`), `.native` ×3, `keyCode === 27` → `event.key === 'Escape'`, слушатель keydown на document снимать в `beforeUnmount`.
- `dialog.js`: `Vue.extend(Modal)`, `new DialogConstructer({ el })`, присваивание опций в instance (`instance[prop] = options[prop]`), очередь `modalQueue`, promise-API `alert/confirm/prompt/info/success/warning/error`, `Dialog.close`. Переписать через `mountService` (20-03): опции передавать как props, `visible` управлять через reactive-объект props, колбэки — через `onAction`. Сохранить промис-семантику (resolve на confirm, reject на cancel для confirm/prompt). Титулы по умолчанию в `createStatusDialog` на китайском — заменить на `t('at.modal.<type>')` или английские строки, записать в changelog.
- Smoke-тесты: `Dialog.confirm('x')` монтирует `.at-modal`, клик по кнопке confirm резолвит промис; `Dialog.prompt` возвращает `{ value, action }`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/modal` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/modal && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/modal
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
