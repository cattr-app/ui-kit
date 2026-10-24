---
id: 30-w2-checkbox
title: Checkbox, CheckboxGroup → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
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
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/checkbox && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/checkbox
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.
Записано: «Checkbox, CheckboxGroup» — v-model, события чекбокса в группе (не эмитит, группа отдаёт новый массив), `checked` в группе не влияет.

## Найдено по ходу

## Заметки агента
- Ключ `CheckboxGroupContext` в `src/components/checkbox/src/context.js`; группа провайдит `reactive({ modelValue: toRef, update })`, чекбокс `inject(null)`, два нативных `<input>` (group/standalone) объединены в один с `:checked`.
- Реальное API отличается от брифа: событие — `on-change` (не `change`), props `size` и `indeterminate` в компоненте отсутствуют — не добавлялись (scope); тест на `size` из группы заменён на реактивную синхронизацию с `modelValue` группы. Prop `checked` сохранён (начальное состояние одиночного чекбокса).
- Одиночный чекбокс держит локальное `currentValue` (как в 1.x): работает и без `v-model`, синхронизируется по `watch modelValue`.
- Внутри группы при отказе родителя применить `update:modelValue` нативный `input.checked` расходится с моделью (то же у Radio) — не чинилось.
- Для w4-table: `<at-checkbox v-model="isSelectAll" @click.native(.prevent)="handleSelectAll">` → убрать `.native` (корень один — `label`, `@click.prevent` упадёт на него через `$attrs`, input не переключится, как и раньше); `v-model` + `@on-change="changeRowSelection"` в строках совместимы без правок.
