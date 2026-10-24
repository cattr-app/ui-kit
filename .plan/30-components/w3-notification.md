---
id: 30-w3-notification
title: Notification ($Notify) → Vue 3
status: done
depends_on: [20-01, 20-02, 20-03, 20-04]
parallel: true
model: opus
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
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/notification && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/notification
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.
Записано в «Сервисы» → `Notification` (`$Notify`): возврат функции закрытия вместо `vm`, новый `closeAll()`, `close(id)` теперь прячет, приоритет `icon` над иконкой типа.

## Найдено по ходу

## Заметки агента
- Сервис переписан 1:1 по Message: props вместо `data: options`, `mountService`, стек `instances[]` с `update({ top })` (GAP 16 как в 1.x), `close(id)` прячет, `closeAll` по копии, `install`.
- Отклонение от 1.x: вызов возвращает функцию закрытия (было `vm`); `closeAll()` в 1.x не было — добавлен. Записано в changelog.
- `v-html` в notification нет (было `v-text`) — выводится `{{ }}`, eslint-disable не нужен.
- `icon` теперь приоритетнее иконки типа и работает без `type` (в 1.x был фактически мёртвым). Тип по умолчанию оставлен `''`; документация 1.x пишет `info` и `duration` «in seconds» — поправить на этапе 40.
- Пометка `[TODO 20-03, 30-w3-*]` в «Сервисах» оставлена: `$Modal`/`$Loading` ещё не описаны.
