# Этап 30: миграция компонентов

Один файл = одна задача = один worktree = один субагент. Все задачи параллельны между собой.
Зависимости: все `20-*` в статусе `done`. Radio (20-02) и Message (20-03) уже мигрированы как эталоны — **читать их код перед началом**.

## Общий чеклист (выполняется для каждого компонента, в файле задачи не дублируется)

1. **v-model**: prop `value` → `modelValue`, `this.$emit('input', v)` → `this.$emit('update:modelValue', v)`. Внутренний `watch: { value }` → `watch: { modelValue }`. Опция `model: {...}` удаляется.
2. **emits**: явный массив `emits: [...]` со всеми событиями компонента (правило `vue/require-explicit-emits`). Имена событий оставить как есть (`on-change`, `on-click` и т.д.), чтобы не плодить изменения, кроме `input`.
3. **Lifecycle**: `beforeDestroy` → `beforeUnmount`, `destroyed` → `unmounted`.
4. **`.native`** удалить: события на `at-button`/`at-input` теперь пробрасываются через `$attrs` (убедиться, что у дочернего компонента единственный корень или задан `inheritAttrs: false` + `v-bind="$attrs"` на нужном элементе).
5. **`$children` / `$parent` / `$on` / `dispatch` / `broadcast` / `findComponent*`** → provide/inject по паттерну ниже. После правки в файле не должно остаться импортов `mixins/emitter` и `findComponent`.
6. **Слоты**: `slot="x"` → `v-slot:x`/`#x`; в script `this.$slots.x` — это функция: проверка наличия `!!this.$slots.x`, в render — `this.$slots.x?.()`. В шаблонах `$slots.default` как булево работает.
7. **`<transition>`**: внутри единственный элемент с `v-if/v-show` (правило `require-toggle-inside-transition`). `<template v-for>` — `:key` на `<template>`.
8. **Корень шаблона**: если корень один — ничего; если фрагмент — проверить, куда падают `class`/`style`/listeners от родителя, при необходимости `inheritAttrs: false`.
9. **Приватные поля `this._x`**: в Vue 3 `_`-префикс в data не проксируется; переименовать в `timer`/`triggerEl` в data или держать вне реактивности (замыкание/`markRaw`).
10. **Options API сохраняем.** Переписывать на `<script setup>` не нужно — это не цель миграции. Composition API использовать только там, где это упрощает provide/inject.
11. **Lint**: `scripts/node.sh pnpm exec eslint <папка компонента>` — 0 ошибок, включая `vue/no-deprecated-*`. `scripts/node.sh pnpm format:check` по затронутым файлам.
12. **Smoke-тест** `test/components/<name>.spec.js`: монтируется с плагином (helper из `test/helpers/mount.js`), рендерит ожидаемый корневой класс, основное взаимодействие эмитит ожидаемое событие (для v-model — `update:modelValue`). 2–4 `it`, без снапшотов.
13. **Документация**: markdown в `docs/markdown/**` **не трогать** (этап 40). Но если меняется публичный API, кроме v-model (имя prop/event/slot, сигнатура), записать в `CHANGELOG-MIGRATION.md` → «По компонентам» и в раздел «Changelog» своего файла.
14. **Коммит**: `feat(<component>): migrate to vue 3` + `Plan: 30-wN-<name>`; статус задачи → `done` в том же коммите.

## Паттерн provide/inject

(Заполняет 20-02 после реализации: имена файлов `src/utils/context.js`, `src/composables/useChildren.js`, пример — `src/components/radio/src/*.vue`.)

## Паттерн императивных сервисов

(Заполняет 20-03: сигнатура `mountService` из `src/utils/mount-service.js`, пример — `src/components/message/src/message.js`.)

## Волны

Волны — только подсказка по сложности, а не порядок. Запускать можно всё сразу; если субагентов мало, начинать с w3 (select, menu, modal) — там выше риск найти проблему в инфраструктуре 20-*.

| Волна | Задачи |
|---|---|
| w1 простые | button, tag, badge, alert, card, progress, switch, tooltip, popover, textarea, input, input-number, rate, slider |
| w2 пары | checkbox, collapse, steps, timeline, breadcrumb, dropdown |
| w3 сложные | select, menu, tabs, pagination, modal (+Dialog), notification, loading-bar |
| w4 | table |
