---
id: 30-w1-progress
title: Progress → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/progress/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- событий без `emits`: 1
- файлы: progress.vue 

## Специфика
- Только emits/lint.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/progress` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/progress && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/progress
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- (из 10-02) Prop `percent` одновременно `required` и с `default` — ошибка `vue/no-required-prop-with-default`, решить и отразить в changelog.

## Заметки агента
- `percent`: выбран вариант «убрать `required`», `default: 0` сохранён. Удалять `default` нельзя: без него отсутствующий `percent` дал бы `undefined%` в стиле полосы. Поведение не менялось, запись в CHANGELOG → «Progress».
- `emits: ['on-status-success']` объявлено явно (после `props`, по `vue/order-in-components`). Имя события не менялось.
- Вне задачи, не чинил: `currentStatus` инициализируется из `status` один раз (`data`), поэтому смена prop `status` после монтирования не отображается. Это поведение было и в Vue 2.
- Вне задачи: `pnpm test` печатает `[Vue warn]: Property "style" was accessed during render` для `AtButton` в спеках других компонентов (не в progress).
- Установка `pnpm install --frozen-lockfile` без изменений lockfile.
