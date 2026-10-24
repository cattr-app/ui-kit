---
id: 30-w1-switch
title: Switch → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/switch/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- событий без `emits`: 1
- файлы: switch.vue 

## Специфика
- v-model.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/switch` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/switch && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/switch
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

- Исходный компонент не эмитил `input` вообще (только `change`), поэтому `emitter`/`input` в коде не было; добавлен `update:modelValue` с `emits`.

## Заметки агента
- `value` → `modelValue`, добавлен `emits: ['update:modelValue', 'change']`, `change` сохранён с тем же аргументом.
- `watch: { modelValue }` синхронизирует внутренний `checkStatus`; клик без `v-model` по-прежнему переключает визуально (поведение 1.x сохранено, но расходится с prop, если родитель не обновляет modelValue).
- Smoke-тест `test/components/switch.spec.js`: 4 `it` (класс по modelValue, клик → инверсия, синхронизация с prop, disabled не эмитит).
- Changelog: запись «Switch» в «По компонентам» (prop `value` → `modelValue`, новое событие `update:modelValue`).
- Коммит футер `Co-Authored-By: Claude Fable 5.1` взят из задачи как указано; фактическая модель агента — Haiku 5.5.
