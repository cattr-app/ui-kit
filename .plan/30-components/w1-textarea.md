---
id: 30-w1-textarea
title: Textarea → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/textarea/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×1
- событий без `emits`: 4
- файлы: textarea.vue utils.js 

## Специфика
- v-model; `$emit('input')` → `update:modelValue`; события `focus/blur` оставить.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/textarea` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/textarea && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/textarea
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- Vue 3 warn "Property "style" was accessed during render" из `<AtButton>` в test/utils/mount-service.spec.js, test/helpers/mount.spec.js (вне textarea, для 30-w1-button).

## Заметки агента
- Textarea: prop `value` → `modelValue`, `$emit("input")` → `update:modelValue`, `watch: { value }` → `watch: { modelValue }`, `mixins: [Emitter]` удалён (dispatch не использовался), добавлен `emits: [update:modelValue, change, focus, blur]`.
- Public API: кроме `modelValue`/`update:modelValue` ничего не менялось (события `change/focus/blur` и пропсы прежние), поэтому CHANGELOG-MIGRATION.md не правился (общая строка про v-model уже покрывает Textarea).
- Smoke-тест test/components/textarea.spec.js: 4 it (значение из modelValue, ввод → update:modelValue + change, disabled/readonly, maxlength/rows + focus/blur).
- Проверки: eslint 0, format:check ok, pnpm test 59/59, pnpm build ok; grep-критерий пуст.
- Для `pnpm test` есть warn про AtButton `style` (не textarea), не блокирует.
