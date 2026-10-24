---
id: 30-w1-rate
title: Rate → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/rate/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×1
- событий без `emits`: 4
- файлы: rate.vue 

## Специфика
- v-model.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/rate` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/rate && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/rate
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- Подозрительно (не чинил, вне scope): при v-model клик эмитит `on-change` дважды — из `confirmValue` и из `watch: modelValue` после того, как родитель обновил значение. Так было и в Vue 2 (`watch: value`), поведение сохранено.

## Заметки агента
- `value` → `modelValue`, `$emit('input')` → `$emit('update:modelValue')`, `watch` переименован; добавлен явный `emits: ['update:modelValue', 'on-change', 'on-hover-change']`. `on-change` и `on-hover-change` без изменений.
- Тест `test/components/rate.spec.js` создан с нуля (4 `it`: рендер звёзд, клик эмитит `update:modelValue` с индексом, реакция на `modelValue`, `disabled` не эмитит).
- CHANGELOG-MIGRATION.md не менял: кроме `modelValue` публичное API не изменилось (v-model-часть уже описана в разделе v-model).
- Проверки: grep-критерий пуст, eslint (src и test) exit 0, prettier check зелёный, `pnpm test` 12 файлов / 59 тестов, `pnpm build` exit 0. Установка через `scripts/node.sh pnpm install --frozen-lockfile` без изменений lockfile.
