---
id: 30-w1-tooltip
title: Tooltip → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
touches: [src/components/tooltip/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- файлы: tooltip.vue 

## Специфика
- Использует mixin popover (20-04): `modelValue` вместо `value`. Один корень обязателен — позиционирование popover считается от `$refs.trigger` внутри корня.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/tooltip` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/tooltip && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/tooltip
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
