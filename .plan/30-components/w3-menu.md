---
id: 30-w3-menu
title: Menu, MenuItem, MenuItemGroup, Submenu → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
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
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/menu && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/menu
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано: «По компонентам» → Menu, MenuItem, MenuItemGroup, Submenu (слот `#title`, одиночный `on-select` для вложенных подменю, удалён inert mixin popover у Submenu, lazy `router-link`).

## Найдено по ходу

## Заметки агента
- `MenuContext` (`menu/src/context.js`): `reactive({ mode, theme, inlineCollapsed, activeName, children, register, unregister, select })`; `children` — только top-level submenu (`exposed.close()`) для `inline-collapsed`. `SubmenuContext` у каждого submenu: items и вложенные submenu регистрируются через `useChild` с `exposed = reactive({ active })`, `active` submenu = `children.some(c => c.exposed.active)` (рекурсивно). Submenu вызывает `useChild` дважды (родительский submenu либо menu) — useChildren это допускает.
- Отклонение от брифа: у Menu нет `open-names`/`accordion`/`on-open-change` и в 1.x не было — API не расширял; аналог accordion — `inline-collapsed`, раскрытие по клику только в `inline` (vertical/horizontal — hover с таймером 200 мс, снимается в `beforeUnmount`). `opened` — только начальное значение, как в 1.x.
- Исправлено попутно: `on-select` эмитился N раз при N уровнях вложенности подменю; теперь один. Mixin popover у Submenu не использовался (свои hover-обработчики, `trigger` не задан) — удалён вместе с props.
- `router-link` резолвится через `<component :is="'router-link'">` внутри `v-if`, иначе компилятор хоистит `resolveComponent` и Vue warn в каждом тесте/приложении без vue-router. Подсветка по `router-link-active` — 1:1 с 1.x (перепроверка в `nextTick` при смене activeName), на смену `$route` не реагирует.
- vue-router нет в devDependencies — props `router`/`to`/`replace` тестами не покрыты (проверить в 40-* на docs-сайте).
- Документация `docs/markdown/en/menu.md` использует `slot="title"` — обновить в 40-*.
