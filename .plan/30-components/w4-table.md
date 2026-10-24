---
id: 30-w4-table
title: Table → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
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
- (из 10-02) В `<td v-for>` внутренний `index` переименован в `columnIndex`, и `Cell` получает `:index="columnIndex"` — это сохраняет прежнее поведение, при котором из-за затенения в `render(h, { index })` приходил индекс КОЛОНКИ, хотя docs/table.md описывает `index` как индекс строки. Решить здесь: передавать индекс строки (как в документации) и записать в changelog как исправление.
- (из 10-01) `:key` уже перенесён на `<template v-for>` (коммит 12f2405), иначе компилятор Vue 3 не собирал SFC. Пункт в «Специфике» выполнен.
- (из 10-02) Удалены неиспользуемые локальные регистрации `Checkbox`/`Pagination` (под этими именами шаблон их не резолвил); `<at-checkbox>`/`<at-pagination>` работают только при глобальной регистрации — зарегистрировать локально как `AtCheckbox`/`AtPagination`. Внутренний `v-for` колонок переименован `index` → `columnIndex` (`vue/no-template-shadow`).

## Заметки агента
