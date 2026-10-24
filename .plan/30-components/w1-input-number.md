---
id: 30-w1-input-number
title: InputNumber → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/input-number/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×1
- `dispatch(` ×1
- событий без `emits`: 5
- файлы: input-number.vue 

## Специфика
- Вызовы `this.dispatch('AtFormItem', 'on-form-item-*', …)` остались после удаления Form (00-02) и сейчас no-op. Удалить вместе с emitter: события `on-form-item-blur/change` наружу не эмитить.
- v-model; сохранить фикс из коммита `9-input-number-does-not-emit-changes-on-edge-value` (эмит на граничных значениях) — есть ли тест? написать.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/input-number` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/input-number && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/input-number
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
