---
id: 30-w1-popover
title: Popover → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/popover/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- файлы: popover.vue 

## Специфика
- (из 20-04) В `popover.vue` остался мёртвый `watch.value` — удалить. Метод `doDestory` из mixin пустой, вызов `@after-leave="doDestory"` в шаблоне убрать; слушатели mixin снимает сам в `beforeUnmount`.
- mixin popover + `v-clickoutside` (20-04). `modelValue`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/popover` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/popover && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/popover
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Добавлено в «Tooltip, Popover»: `title`/`content` остаются HTML (`v-html`), слоты `#title`/`#content`, слот `title` требует prop `title`.

## Найдено по ходу
- (из 10-02) `popover.vue` — 2 ошибки `vue/no-v-html` (title/content). Решить: оставить с `eslint-disable-next-line` и обоснованием или сменить API; выбор отметить в changelog.

## Заметки агента
- Удалены мёртвый `watch.value`, `@after-leave="doDestory"` и неиспользуемый `ref="parent"`; корень один (`div.at-popover`), `ref="trigger"`/`ref="popover"` внутри.
- `v-clickoutside` регистрируется локально `directives: { clickoutside }` (default-импорт из `directives/clickoutside`); `emits: []` — события `update:modelValue`/`toggle` из mixin.
- `vue/no-v-html` (title, content): `v-html` оставлен как намеренный API, точечные `eslint-disable-next-line` с комментарием; зафиксировано в changelog.
- Слот `#title` не рендерится без prop `title` (`v-if="title"`, поведение 1.x) — не менял; кандидат на `title || $slots.title` на этапе 40/по запросу.
- Smoke-тест `test/components/popover.spec.js` (4 it): click open/close + `update:modelValue`/`toggle`, клик снаружи, HTML title/content, слот `content`.
