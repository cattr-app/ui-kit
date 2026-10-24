---
id: 30-w3-tabs
title: Tabs, TabPane → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/tabs/**, src/components/tab-pane/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$children` ×1
- `$parent` ×2
- `$slots` ×1
- событий без `emits`: 2
- файлы: tab-pane.vue tabs.vue 

## Специфика
- `getTabs()` фильтрует `$children` по `$options.name`; `tab-pane` вызывает `$parent.updateNav()`, читает `$parent.closable` → `useChildren` с DOM-порядком (важно для `removeHandle` и nav). v-model (`value` строка → `modelValue`); события `on-change`, `on-tab-remove`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/tabs` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/tabs && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/tabs
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.
Записано: «Tabs, TabPane» (двусторонний v-model, `on-change` без эмита при монтировании, кто удаляет панель, имя по индексу строкой).

## Найдено по ходу

## Заметки агента
- `TabsContext` (`src/components/tabs/src/context.js`); TabPane регистрируется `useChild(ctx, reactive({ name, label, icon, disabled, closable }))`, `navList` = computed по `children`; `updateNav`/`getTabs`/`switchTabsWithNoAnimated` удалены, видимость панели при `animated=false` — computed в TabPane.
- В 1.x `value` не отслеживался и `input` не эмитился — v-model был односторонним; теперь двусторонний (как Collapse). `on-change` больше не эмитится при монтировании.
- `on-tab-remove`: панель по-прежнему удаляет потребитель; Tabs только переносит выбор на соседнюю незаблокированную вкладку (`on-change.index` — в списке без удалённой).
- `sort()` вызывается в `updated()` Tabs (перестановка keyed `v-for`); `window resize` и `setTimeout` снимаются в `beforeUnmount`. ResizeObserver в 1.x не было, не добавлялся.
- Pane без `name` → `'0'`, `'1'`… (строка, в 1.x число). Prop `name` остался `String`, хотя docs пишут «String / Number» — для этапа 40.
- Docs (этап 40): demo «Add & close» использует несуществующий prop `unclosable` и `slot="extra"`; описание default `name` («first is 1») неверно — 0-based.
