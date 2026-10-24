---
id: 30-w2-steps
title: Steps, Step → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/steps/**, src/components/step/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$parent` ×4
- `beforeDestroy` ×1
- `step.vue:100` no-deprecated-destroyed-lifecycle
- файлы: steps.vue step.vue 

## Специфика
- `step.vue`: `$parent.steps.push(this)`, `$parent.direction`, `beforeDestroy` → регистрация через `useChildren`, индекс по DOM-порядку.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/steps` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/steps && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/steps
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
