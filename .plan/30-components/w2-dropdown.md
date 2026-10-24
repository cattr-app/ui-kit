---
id: 30-w2-dropdown
title: Dropdown, DropdownMenu, DropdownItem → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/dropdown/**, src/components/dropdown-menu/index.js, src/components/dropdown-item/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$on(` ×1
- `dispatch(` ×1
- `dropdown.vue:34` no-deprecated-events-api
- событий без `emits`: 1
- файлы: dropdown-item.vue dropdown-menu.vue dropdown.vue 

## Специфика
- (из 20-04) Сейчас AtDropdown падает при монтировании с `this.$on is not a function` — после замены на provide/inject smoke-тест на монтирование обязателен первым.
- `dropdown.vue`: `$on('menu-item-click')` + `dispatch` из item → provide `{ onItemClick }`; `v-clickoutside` (20-04); mixin popover; transition.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/dropdown` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/dropdown && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/dropdown
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано: «Dropdown, DropdownMenu, DropdownItem» — provide/inject вместо dispatch, слот `slot="menu"` → `#menu`, `value` → `modelValue` + `update:modelValue`; `on-dropdown-command` без изменений.

## Найдено по ходу

## Заметки агента
- `src/components/dropdown/src/context.js`: `DropdownContext`; `AtDropdown` отдаёт `reactive({ onItemClick })` через Options API `provide()` (нужен доступ к `this.show` из mixin popover), `AtDropdownItem` — `inject(null)` в `setup()`.
- `doDestory` убран из шаблона; mixin popover и clickoutside не менялись. Свои хуки жизненного цикла не нужны — слушатели снимает `beforeUnmount` mixin.
- Smoke-тест `test/components/dropdown.spec.js` (5 `it`): монтирование, открытие по click, команда + закрытие, disabled, клик снаружи.
- Для 40-docs: в `docs/markdown/*/dropdown.md` все `<at-dropdown-menu slot="menu">` → `<template #menu>`; prop `trigger`/`placement` в таблице есть, `v-model`/`update:modelValue`/`toggle` не задокументированы.
- Для select (не трогал): `select.vue` тоже держит `@after-leave="doDestory"` — в mixin это теперь no-op.
