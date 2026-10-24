---
id: 30-w1-tooltip
title: Tooltip → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/tooltip/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- файлы: tooltip.vue 

## Специфика
- (из 20-04) `v-model` через mixin уже работает в обе стороны (`modelValue`/`update:modelValue`); проверить шаблон на остатки `value`, убрать `@after-leave="doDestory"`, если есть.
- Использует mixin popover (20-04): `modelValue` вместо `value`. Один корень обязателен — позиционирование popover считается от `$refs.trigger` внутри корня.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/tooltip` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/tooltip && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/tooltip
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
- Шаблон уже был на Vue 3 (один корень `.at-tooltip`, `ref="trigger"` внутри, `v-if` внутри `<transition>`, без `value`); единственная правка — убран `@after-leave="doDestory"`.
- Своих событий и таймеров нет: `emits` (`update:modelValue`, `toggle`) и очистка в `beforeUnmount` приходят из mixin popover, в компоненте не дублируются.
- Публичный API не менялся сверх записи «Tooltip, Popover» в CHANGELOG-MIGRATION.md; changelog не дополнялся.
- Метод `doDestory` в `src/mixins/popover.js` теперь не нужен Tooltip; удалить его можно после миграции Popover (не трогал, mixin вне scope).
