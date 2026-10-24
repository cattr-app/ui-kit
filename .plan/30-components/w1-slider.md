---
id: 30-w1-slider
title: Slider → Vue 3
status: todo
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
