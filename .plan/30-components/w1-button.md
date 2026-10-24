---
id: 30-w1-button
title: Button, ButtonGroup → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/button/**, src/components/button-group/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$parent` ×2
- `$slots` ×2
- событий без `emits`: 1
- файлы: button-group.vue button.vue 

## Специфика
- `button.vue` читает `$parent.size`/`$parent.gap` для группы → provide/inject из ButtonGroup.
- `@click.native` у потребителей станет `@click`: у Button единственный корень `<button>`, listeners пробрасываются автоматически; эмит собственного `click` убрать, чтобы не дублировать (проверить, что он есть/нет).

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/button` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/button && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/button
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.
Записано: «Button, ButtonGroup» — `@click.native` → `@click`, size/gap через provide/inject, loading не блокирует клик.

## Найдено по ходу
- (из 20-01) `button.vue` `styleList` читает `this.style` (не prop) → `[Vue warn]: Property "style" was accessed during render` в `test/helpers/mount.spec.js`; в Vue 3 `style` — fallthrough attr (`this.$attrs.style`).

## Заметки агента
- `ButtonGroupContext` (`button/src/context.js`): группа отдаёт `reactive({ size, gap })`, Button `inject(null)`; `$parent` убран.
- В Vue 3 `$emit('click')` без `emits` дублировал вызов (fallthrough `onClick` на `<button>` + emit). Собственный эмит удалён, `emits: []`: `@click` потребителя вызывается один раз (покрыто тестом).
- `styleList` больше не читает несуществующий `this.style` (Vue warn устранён); вне группы стиль `null` (раньше было `marginRight: "undefinedpx"`, браузер игнорировал).
- `loading` клик не блокировал и в 1.x — поведение сохранено, отмечено в changelog. `beforeDestroy`/таймеров нет — `beforeUnmount` не нужен.
- Smoke-тест `test/components/button.spec.js` (5 `it`), `pnpm test` без Vue warn.
