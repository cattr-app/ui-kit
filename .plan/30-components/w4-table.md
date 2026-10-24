---
id: 30-w4-table
title: Table → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
touches: [src/components/table/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `.native` ×2
- `table.vue:24` no-deprecated-v-on-native-modifier
- `table.vue:66` no-deprecated-v-on-native-modifier
- `table.vue:97` no-v-for-template-key-on-child
- событий без `emits`: 7
- файлы: render.js table.vue 

## Специфика
- Колонка `render`: сейчас `render: (h, params) => VNode` через functional `Cell` (`render.js`). Vue 3: `Cell` = функциональный компонент `(props) => props.render(props.params)`; публичная сигнатура становится `render: ({ item, column, index }) => VNode`, где потребитель импортирует `h` из vue сам. **Записать в changelog с примером было/стало.**
- `<template v-for>` с `:key` на `<tr>` → key на `<template>`; внутри `v-for` по колонкам переменная `index` затеняет внешний `index` — переименовать.
- `.native` ×2 на at-checkbox (выделение строк) → обычные listeners/`@change`.
- Событие `rowClick` (добавлено Cattr) сохранить в `emits`.
- Smoke-тест: рендер 2 колонок × 3 строк, колонка с `render` рендерит переданный vnode, клик по строке эмитит `rowClick`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/table` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/table && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/table
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
