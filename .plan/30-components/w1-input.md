---
id: 30-w1-input
title: Input → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/input/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×1
- `$slots` ×5
- `dispatch(` ×2
- событий без `emits`: 4
- файлы: input.vue 

## Специфика
- Вызовы `this.dispatch('AtFormItem', 'on-form-item-*', …)` остались после удаления Form (00-02) и сейчас no-op. Удалить вместе с emitter: события `on-form-item-blur/change` наружу не эмитить.
- v-model; `$slots.prepend/append` в шаблоне. У Input корень `div.at-input`, а `@keyup.enter.native` потребителей (modal, pagination) должен превратиться в `@keyup.enter` на внутреннем `<input>`: задать `inheritAttrs: false`, на `<input>` — `v-bind="$attrs"`, на корне — только `class/style` через `useAttrs` или прокинуть class вручную. Записать в changelog: listeners теперь идут на нативный input.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/input` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/input && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/input
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
