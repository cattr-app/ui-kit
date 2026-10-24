---
id: 30-w2-steps
title: Steps, Step → Vue 3
status: done
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
- `StepsContext` (`steps/src/context.js`): `reactive({ current, status, size, direction, children, register, unregister })` + `useChildren`; Step — `useChild(ctx)`, exposed = proxy. `useChildren.js` не менялся.
- `index`, `internalStatus`, `nextError` в Step стали computed (из `index`/`current`/`status`) вместо мутаций из `Steps.updateStepsStatus`; `watch`/`data.steps` в Steps удалены. Логика 1.x сохранена, включая `next-error` только при `status="error"` на текущем шаге без собственного `status`.
- `index` = -1 до `onMounted`: первый рендер без ширины и с номером «0», после регистрации — корректно (тест ждёт `nextTick`). Ширина не ставится, пока `children.length === 0`.
- `AtStep` без `AtSteps` больше не падает (было обращение к `$parent.steps`): статус только из своего `status`, без ширины.
- Публичное API (props/events/slots) не изменилось — запись в changelog не нужна. Smoke-тест: `test/components/steps.spec.js` (5 `it`).
