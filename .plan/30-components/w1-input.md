---
id: 30-w1-input
title: Input → Vue 3
status: done
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
Записано: «По компонентам» → Input (`inheritAttrs: false`, слушатели/атрибуты на нативный `<input>`, `class`/`style` на обёртке, `@input` больше не событие компонента).

## Найдено по ходу

## Заметки агента
- `inheritAttrs: false`; `$attrs.class`/`$attrs.style` — на корень `div.at-input`, остальное — `v-bind="inputAttrs()"` (метод, а не computed: `$attrs` не следует кешировать) на `<input>` перед явными биндингами, поэтому props компонента (`value`, `type`, `disabled`…) имеют приоритет, а слушатели потребителя мержатся с внутренними.
- Emitter и `dispatch('AtFormItem', …)` удалены; `emits: ['update:modelValue', 'change', 'focus', 'blur']`. Других событий (`keyup`, `clear`, `on-*`) у компонента не было; clear/иконка без обработчиков, `.native` в input не было.
- **modal (30-w3-modal):** в `modal.vue` `<at-input @keyup.enter.native="handleAction('confirm')">` → `@keyup.enter="…"` (`.native` в Vue 3 удалён, ловит `vue/no-deprecated-v-on-native-modifier`); слушатель придёт с нативного `<input>`. `v-model`/`:placeholder` работают без правок. `ref="input"` в modal не используется для `.focus()`; если 30-w3-modal захочет фокусировать — `this.$refs.input.$el.querySelector('input')`, публичного `focus()` у AtInput нет.
- **pagination, select:** `<at-input>` не используют — у них нативные `<input class="at-input__original">` (свои `$refs.input` в select — нативный input). Правок под Input не требуется.
