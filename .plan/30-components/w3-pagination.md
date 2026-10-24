---
id: 30-w3-pagination
title: Pagination → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/pagination/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `keyCode` ×2
- событий без `emits`: 2
- файлы: pagination.vue 

## Специфика
- `keyCode` ×2 → `event.key`; `@keyup.enter.native` на at-input → `@keyup.enter` (после 30-w1-input listeners идут на нативный input); `.sync`/`current` prop: проверить, как обновляется `current` — эмитить `update:current` для `v-model:current`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/pagination` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/pagination && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/pagination
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записано в CHANGELOG-MIGRATION.md → «По компонентам» → Pagination: новые `update:current`/`update:pageSize` (`v-model:current`, `v-model:page-size`), clamp quickjump к `[1, totalPage]`, `keyCode` → `event.key`, `total` без `required`, корень без комментариев-фрагмента. События `page-change`/`pagesize-change` без изменений.

## Найдено по ходу
- (из 10-02) `handleKeyup` (Enter): кламп `numVal > totalPage` был мёртвым присваиванием (сразу перезаписывался), в 10-02 переписано эквивалентно в `const page = numVal <= 0 ? 1 : numVal` — номер страницы сверху не ограничивается, починить. Prop `total` одновременно `required` и с `default` (`vue/no-required-prop-with-default`), решить. Ключ `v-for` по `pageRange` поставлен `:key="index"` (эквивалент неключёвому), можно перейти на `num`.

## Заметки агента
- Корневые HTML-комментарии `<!-- S/E … -->` делали корень фрагментом: `class`/attrs потребителя терялись (Vue warn). Удалены.
- Clamp: `changePage` и Enter в simple-режиме приводят номер к `[1, totalPage]`; `jumpPageNum` теперь пишется всегда (раньше в quickjump оставалось `999`, если страница не менялась). Тест на это — `clamps the quickjump page…`.
- Добавлены `update:current` (любая смена страницы изнутри) и `update:pageSize` (sizer); `page-change`/`pagesize-change` и их порядок прежние. `total`: убран `required`, `default: 0` оставлен. `v-for` ключ → `num`. Глобальных слушателей нет, `beforeUnmount` не нужен.
- Фильтр keydown эквивалентен 1.x (цифры, Backspace, ←/→), т.е. по-прежнему блокирует Tab/Delete/Ctrl+V в полях номера — a11y-недочёт 1.x, не чинил (вне scope). Стрелки в simple: ArrowDown → prev, ArrowUp → next (как в 1.x, комментарии там были перепутаны).
- **Sizer (`show-sizer`) не проверен**: `<at-select>` в этой ветке ещё Vue 2; в тестах Pagination монтируется без `show-sizer` (select рендерится только под `v-if`, стабы не нужны). После мержа 30-w3-select проверить: `v-model="currentPageSize"` на `at-select` (ожидает `modelValue`/`update:modelValue`) и `@on-change` → `update:pageSize` + `pagesize-change`, добавить `it` с sizer.
- `pnpm lint` целиком красный из-за ещё не мигрированных компонентов (select, menu, tabs, modal, …); по `src/components/pagination` и спеку — 0 ошибок.
