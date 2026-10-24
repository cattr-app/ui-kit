---
id: 30-w1-input-number
title: InputNumber → Vue 3
status: done
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
- (из 30-w1-input/slider) Slider вешает `@keyup.native` на `<at-input-number>` — после миграции решить: `inheritAttrs: false` + `v-bind="$attrs"` на нативный `<input>` (как в Input), чтобы `@keyup` потребителя шёл на input. Записать в changelog.
- Вызовы `this.dispatch('AtFormItem', 'on-form-item-*', …)` остались после удаления Form (00-02) и сейчас no-op. Удалить вместе с emitter: события `on-form-item-blur/change` наружу не эмитить.
- v-model; сохранить фикс из коммита `9-input-number-does-not-emit-changes-on-edge-value` (эмит на граничных значениях) — есть ли тест? написать.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/input-number` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/input-number && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/input-number
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано: InputNumber — attrs/слушатели на нативный `<input>` (`.native` не нужен, `@input` = нативный `Event`), один `change` на изменение, синхронизация с `modelValue`, применение ввода по blur/Enter с обрезкой до `min`/`max`, нет `on-form-item-change`.

## Найдено по ходу

## Заметки агента
- Фикс `9-input-number-does-not-emit-changes-on-edge-value` (de8da3c: убрано подавление эмита в watcher при `upDisabled/downDisabled`) сохранён: эмит теперь явный в `setValue()`, тест «emits when reaching min/max» падал бы на старом поведении.
- Отклонения от плана (в рамках компонента): в 1.x не было ни `watch: value`, ни обработки набранного числа — добавлены (иначе пункт «значение из modelValue»/«ввод с blur/enter» не выполним); убран двойной `change` на клик; `upDisabled/downDisabled` считали `currentValue + step` строкой при `step="0.5"` — теперь `Number(step)`.
- `inheritAttrs: false` + `v-bind="inputAttrs()"` на `<input>` по образцу Input; `class`/`style` на обёртке.
- Slider после мержа: `<at-input-number … @keyup.native="onInputChange">` → `@keyup="onInputChange"` (слушатель теперь на нативном `<input>`); `v-model="inputValue"` теперь реально синхронизирует внутреннее значение (раньше дочерний не видел изменений `value`), проверить, что нет лишних `update:modelValue`/циклов в связке `inputValue` ↔ `value`.
- Enter применяет значение на `keydown`, поэтому `@keyup` потребителя (slider) видит уже обновлённый `modelValue`.
