---
id: 30-w3-select
title: Select, Option, OptionGroup (+ внутренний dropdown.vue) → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/select/**, src/components/option/index.js, src/components/option-group/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$emit('input'` ×1
- `$on(` ×4
- `$parent` ×2
- `beforeDestroy` ×1
- `broadcast(` ×7
- `dispatch(` ×1
- `dropdown.vue:42` no-deprecated-events-api
- `findComponent` ×12
- `inject` ×1
- `keyCode` ×5
- `model:` ×1
- `option.vue:72` no-deprecated-events-api
- `option.vue:75` no-deprecated-events-api
- `option.vue:79` no-deprecated-destroyed-lifecycle
- `provide` ×1
- `select.vue:495` no-deprecated-events-api
- событий без `emits`: 5
- файлы: dropdown.vue option-group.vue option.vue select.vue 

## Специфика
- **Решение (ревью 20-04):** Select НЕ подключает `mixins/popover` — его prop `modelValue: Boolean` (открыт/закрыт) конфликтует с `modelValue` выбора. Оставить у Select собственное состояние `visible`, prop `placement` объявить локально, позиционирование дропдауна — как сейчас через `select/src/dropdown.vue`. Из mixin ничего не наследовать; `trigger` prop, если нужен, тоже локально.
- `select/src/dropdown.vue` без `ref="trigger"` получает `console.error` из mixin popover в `mounted` — после отказа от mixin это исчезнет само.
- Самый связанный компонент: `provide('select', this)` уже есть, `option.vue` делает `inject: ['select']` — расширить этот канал и убрать `broadcast('AtOption','on-query-change')`, `$on('on-select-selected')`, `$on('on-select-close')`, `findComponentsDownward(this,'AtOption')` (обход опций для notFound/hidden): опции регистрируются в select через `useChildren`, фильтрация — реактивным `query` из inject.
- `select/src/dropdown.vue`: `$parent.$options.name === 'AtSelect'`, `$on('on-update-popper')` → inject/props.
- `keyCode` → `event.key` (`Escape`, `ArrowDown`, `ArrowUp`, `Enter`).
- v-model (одиночный и multiple), `clearable`, `filterable`, `valueWithLabel` — покрыть smoke-тестом: выбор опции эмитит `update:modelValue` и `on-change`.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/select` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/select && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/select
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано: «По компонентам» → «Select, Option, OptionGroup» (v-model, `on-change` только на действия пользователя, немутируемый массив `multiple`, удалённые props/событие из mixin popover, подпись опции из `textContent`, клавиатура, динамические опции).

## Найдено по ходу

## Заметки агента

- Контекст `SelectContext` (`select/src/context.js`): `reactive({ modelValue, multiple, filterable, valueWithLabel, query, focusUid, children, register, unregister, select, isSelected, blur })`. Каждый `AtOption` регистрирует через `useChild` `reactive({ uid, value, label, disabled, hidden })`; Select по `children` считает подписи выбранного, теги, `notFound`, список для клавиатуры. `select(value)` в контексте вызывает метод Select через `getCurrentInstance().proxy` (Options API сохранён).
- `query` в контексте — активный фильтр (только ввод пользователя), отдельно от текста инпута: после выбора в single filterable инпут показывает подпись, а при повторном открытии видны все опции (в 1.x тот же эффект давался таймером 300 мс и гонкой с `handleBlur`).
- Mixin popover не подключён; позиционирование (`top`/`bottom`) — локальный `updatePosition()` с inline `top/left`, как это фактически делал mixin в 1.x. `select/src/dropdown.vue` в 1.x нигде не использовался — оставлен как презентационный `AtSelectDropdown` (props `placement`, `width`), без mixin и `$parent`; кандидат на удаление в 50-01.
- Поведенческие изменения: `on-change` не эмитится при внешней смене `modelValue`; массив `multiple` не мутируется; слушатель `keydown` на `document` теперь снимается (в 1.x опечатка `beforeDestory`); тег удаляется по значению, а не индексу.
- Не покрыто тестами: позиционирование/скролл к подсвеченной опции (в happy-dom нет layout), `placement="top"`, Backspace в multiple filterable, задержка `handleBlur`, `AtOptionGroup` (без изменений).

