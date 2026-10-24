---
id: 30-w1-slider
title: Slider → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/slider/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×6
- `.native` ×1
- `slider.vue:12` no-deprecated-v-on-native-modifier
- `slider.vue:44` no-deprecated-slot-attribute
- `slot="` ×1
- `this._` ×2
- событий без `emits`: 7
- файлы: slider.vue 

## Специфика
- (из 30-w1-input) `<at-input-number … @keyup.native="onInputChange">` → без `.native`; согласовать с 30-w1-input-number, как у него пробрасываются listeners (inheritAttrs/нативный input).
- v-model; `slot="content"` у tooltip → `#content`; `@…native` на at-tooltip/at-input-number; `this._timer`; обработчики `document mousemove/mouseup` снимать в `beforeUnmount`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/slider` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/slider && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/slider
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
- Публичный API: только `value`→`modelValue`/`input`→`update:modelValue`; `change` сохранён (как в 1.x эмитится и при программной смене `modelValue`). `emits: ['update:modelValue', 'change']`.
- `@keyup.native` на `at-input-number` убран (решение архитектора): значение из InputNumber применяется через `v-model="inputValue"` + watch. До мержа 30-w1-input-number связка не работает (он ждёт prop `value`), но InputNumber всё равно скрыт `v-show="false"`. **После мержа 30-w1-input-number проверить связку slider ↔ input-number вручную/тестом.**
- Добавлено локальное `currentValue`: точка двигается сразу, без ожидания эха от родителя (в 1.x `setPosition` читал устаревший prop). Ширина трека — `getBoundingClientRect()` при каждом событии вместо кэширующего computed по `getStyle` (не обновлялся при ресайзе).
- `this._timer` → поле `hoverTimer` (в `created`); `$refs.tooltip.show = false` → `hidePopover()` mixin popover. Слушатели `window` mousemove/mouseup (в коде `window`, не `document`) и таймер снимаются в `beforeUnmount`.
- Подозрительное (не чинил, вне scope): `value.toFixed(0)` в `setPosition` округляет до целого — дробный `step` (0.5) не работает, как и в 1.x.
- Тест `test/components/slider.spec.js`: 5 `it` (позиция, клик + v-model, disabled, step/min/max, drag + cleanup); ввод через input-number не проверяется.
