---
id: 30-w4-table
title: Table → Vue 3
status: done
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
- (из 30-w2-checkbox) `<at-checkbox v-model="isSelectAll" @click.native.prevent="handleSelectAll">` → убрать `.native` (корень чекбокса один, `@click.prevent` упадёт на него через `$attrs`); `v-model` + `@on-change="changeRowSelection"` совместимы без правок. Локально зарегистрировать `AtCheckbox`/`AtPagination` в `components`, чтобы Table работал при импорте по отдельности.
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
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/table && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/table
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.
Записано в «По компонентам → Table»: сигнатура `render` `(h, params)` → `({ item, column, index })` с примером было/стало; `index` = индекс строки (исправление); `.native` убран, двойное переключение «выбрать всё» в режиме `height`; чекбокс строки по `item.index`; `data` deep-watch; снятие `resize`; локальная регистрация `AtCheckbox`/`AtPagination`; `emits`.

## Найдено по ходу
- (из 10-02) В `<td v-for>` внутренний `index` переименован в `columnIndex`, и `Cell` получает `:index="columnIndex"` — это сохраняет прежнее поведение, при котором из-за затенения в `render(h, { index })` приходил индекс КОЛОНКИ, хотя docs/table.md описывает `index` как индекс строки. Решить здесь: передавать индекс строки (как в документации) и записать в changelog как исправление.
- (из 10-01) `:key` уже перенесён на `<template v-for>` (коммит 12f2405), иначе компилятор Vue 3 не собирал SFC. Пункт в «Специфике» выполнен.
- (из 10-02) Удалены неиспользуемые локальные регистрации `Checkbox`/`Pagination` (под этими именами шаблон их не резолвил); `<at-checkbox>`/`<at-pagination>` работают только при глобальной регистрации — зарегистрировать локально как `AtCheckbox`/`AtPagination`. Внутренний `v-for` колонок переименован `index` → `columnIndex` (`vue/no-template-shadow`).

## Заметки агента
- `Cell` — функциональный компонент Vue 3 (`(props) => props.render({ item, column, index })`, `Cell.props`); `index` = индекс отображаемой строки (`rowIndex` из `v-for`), исходный индекс — `item.index`. Тест `render` в `test/components/table.spec.js` ловит регрессию к индексу колонки.
- Чекбоксы «выбрать всё»: `v-model` на computed `isSelectAll` (без сеттера → Vue warn в 3.x) заменён на `:model-value` + `@click.prevent` в обоих заголовках; в режиме `height` раньше не было `.prevent`, клик обрабатывался дважды.
- Попутные исправления в Table (в changelog): чекбокс строки `objData[item.index]` вместо позиции в `sortData` (ломалось после сортировки/на 2+ странице); `beforeDestory` (опечатка, хук не работал) → `beforeUnmount`; убран `this.width` (не объявлен, Vue 3 warn при рендере); watcher `data` — `deep: true` + пересборка `objData` (иначе `push` не виден в Vue 3, а при росте `data` с `optional` падало). Пересборка сбрасывает выделение к `row.isChecked` при любом изменении `data` — осознанный компромисс.
- `:key` строк — `item.index` (стабилен при сортировке); ключи колонок остались индексами (у render-колонок может не быть `key`).
- Smoke-тест (7 `it`) монтирует Table без `pagination` и проверяет отсутствие `console.warn`. **Пагинацию (футер `v-if="pagination && total"`, события `page-change`/`pagesize-change` → `on-page-change`/`on-page-size-change`) проверить после мержа 30-w3-pagination** — в этой ветке Pagination ещё Vue 2-стиля; при смене имён его событий поправить слушатели в `table.vue`.
- `calculateBodyHeight`/`handleResize`/`bodyStyle` используют `$refs` и `getStyle` как раньше; в happy-dom размеры нулевые, режим `height` тестом не покрыт — проверить визуально в docs (этап 40). Примеры `render` в `docs/markdown/en/table.md` всё ещё `(h, params)` и Vue 2-формат VNode — переписать в 40-*.
