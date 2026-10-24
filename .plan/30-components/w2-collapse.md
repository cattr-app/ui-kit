---
id: 30-w2-collapse
title: Collapse, CollapseItem → Vue 3
status: done
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
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/collapse && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/collapse
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано: «Collapse, CollapseItem» — `update:modelValue` теперь эмитится (в 1.x не было), исходный массив не мутируется, item без `name` = индекс в DOM-порядке, item вне Collapse — no-op.

## Найдено по ходу

## Заметки агента
- Новый `src/components/collapse/src/context.js` (`CollapseContext`); Collapse отдаёт `reactive({ activeKeys, accordion, children, register, unregister, toggle })`, состояние в `setup()` (ref `currentValue` + watch `modelValue`), чтобы работало и без v-model, как в 1.x.
- CollapseItem: `useChild(ctx, null)` — индекс по DOM-порядку, `exposed` не нужен (родителю не требуется читать детей; `children` в контексте только ради регистрации). `isActive` — computed от `ctx.activeKeys`.
- 1.x не эмитил `input` вообще — `update:modelValue` добавлен как новое поведение, `on-change` сохранён с тем же аргументом (массив строк).
- В тесте `isVisible()` VTU без `attachTo` всегда true в happy-dom — проверяю `style.display` у `.at-collapse__body`.
- Item без `name` до `mounted` имеет индекс `-1` → раскрытие по индексу происходит после монтирования с enter-анимацией (так же было в 1.x через `setActive` в `mounted`).
- `src/utils/collapse-transition.js` и `useChildren.js` не менялись.
