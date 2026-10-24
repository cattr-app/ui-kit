---
id: 30-w2-checkbox
title: Checkbox, CheckboxGroup → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
touches: [src/components/checkbox/**, src/components/checkbox-group/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×2
- `findComponent` ×4
- `model:` ×1
- событий без `emits`: 4
- файлы: checkbox-group.vue checkbox.vue 

## Специфика
- Повторить паттерн Radio из 20-02: группа `provide`, чекбокс `inject`; v-model у обоих; `$emit('input')` ×2.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/checkbox` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/checkbox && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/checkbox
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
