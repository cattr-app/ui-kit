---
id: 30-w2-timeline
title: Timeline, TimelineItem → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/timeline/**, src/components/timeline-item/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$children` ×2
- `$parent` ×2
- `$slots` ×1
- файлы: timeline-item.vue timeline.vue 

## Специфика
- `timeline.vue` правит `$children`; `timeline-item` читает `$parent.$children`/`$parent.pending` для определения последнего элемента → `useChildren`; `this.$slots.dot` в script → `!!this.$slots.dot`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/timeline` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/timeline && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/timeline
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
