---
id: 30-w3-notification
title: Notification ($Notify) → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-03, 20-04]
parallel: true
touches: [src/components/notification/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$destroy` ×1
- `$mount` ×1
- `Vue.extend` ×1
- файлы: notic.js notification.vue 

## Специфика
- `notic.js`: `Vue.extend`, `$mount`, стек инстансов с `offsetHeight`; `notification.vue`: `$destroy(true)`. Повторить паттерн Message (20-03) 1:1, включая возвращаемую функцию закрытия и `Notification.close/closeAll`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/notification` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/notification && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/notification
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
