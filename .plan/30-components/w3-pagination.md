---
id: 30-w3-pagination
title: Pagination → Vue 3
status: todo
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
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/pagination && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/pagination
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- (из 10-02) `handleKeyup` (Enter): кламп `numVal > totalPage` был мёртвым присваиванием (сразу перезаписывался), в 10-02 переписано эквивалентно в `const page = numVal <= 0 ? 1 : numVal` — номер страницы сверху не ограничивается, починить. Prop `total` одновременно `required` и с `default` (`vue/no-required-prop-with-default`), решить. Ключ `v-for` по `pageRange` поставлен `:key="index"` (эквивалент неключёвому), можно перейти на `num`.

## Заметки агента
