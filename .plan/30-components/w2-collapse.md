---
id: 30-w2-collapse
title: Collapse, CollapseItem → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/collapse/**, src/components/collapse-item/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$children` ×1
- `$parent` ×1
- `$slots` ×1
- событий без `emits`: 1
- файлы: collapse-item.vue collapse.vue 

## Специфика
- `collapse.vue` обходит `$children` для установки `isActive` и индекса → `useChildren` (20-02) с порядком по DOM; `collapse-item` вызывает `$parent.toggle` → inject. Использует CollapseTransition (20-04). v-model (`value` → `modelValue`, accordion-режим).

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/collapse` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/collapse && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/collapse
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
