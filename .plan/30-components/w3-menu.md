---
id: 30-w3-menu
title: Menu, MenuItem, MenuItemGroup, Submenu → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
touches: [src/components/menu/**, src/components/menu-item/index.js, src/components/menu-item-group/index.js, src/components/submenu/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$children` ×1
- `$on(` ×4
- `$parent` ×1
- `broadcast(` ×1
- `dispatch(` ×2
- `findComponent` ×7
- `menu-item.vue:64` no-deprecated-events-api
- `menu.vue:89` no-deprecated-events-api
- `submenu.vue:148` no-deprecated-events-api
- `submenu.vue:154` no-deprecated-events-api
- событий без `emits`: 1
- файлы: menu-group.vue menu-item.vue menu.vue submenu.vue 

## Специфика
- `menu.vue` `$on('on-menu-item-select')`, `broadcast('on-update-active')`; `submenu.vue` `$on` ×2, обход `parentMenu.$children`, `findComponentUpward`; `menu-item` `$on('on-update-active')`, `dispatch`. → контекст меню (activeName, mode, openNames, select(), openSubmenu()) через provide; submenu регистрирует items через `useChildren`; CollapseTransition (20-04) для vertical.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/menu` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/menu && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/menu
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
