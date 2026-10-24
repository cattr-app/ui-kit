---
id: 30-w1-badge
title: Badge → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/badge/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$slots` ×2
- файлы: badge.vue 

## Специфика
- `$slots.default` в шаблоне как булево — оставить.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/badge` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/badge && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/badge
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- Тесты `AtButton` (test/utils/mount-service, test/helpers/mount) пишут Vue warn «Property "style" was accessed during render» — не относится к Badge, не трогал.

## Заметки агента
- Badge уже был почти на Vue 3: единственный корень, нет v-model, нет событий, нет lifecycle-хуков. Изменение в компоненте: явный `emits: []` (чеклист п.2).
- Prop `value` оставлен (число/текст бейджа, не v-model). Публичное API (props/slots/имя `AtBadge`) не менялось, запись в CHANGELOG-MIGRATION.md не добавлялась.
- Smoke-тест `test/components/badge.spec.js`: 4 `it` (корень/класс/значение, maxNum → `99+`, слот + show=false, dot).
- Проверено: grep-критерий пуст, eslint 0 ошибок, `pnpm test` 59/59, `pnpm format:check` ок, `pnpm build` ок.
