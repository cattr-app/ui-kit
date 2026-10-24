---
id: 20-04
title: Директива clickoutside, CollapseTransition, mixin popover под Vue 3
status: done
depends_on: [20-01]
parallel: true
model: opus
touches: [src/directives/clickoutside.js, src/utils/collapse-transition.js, src/mixins/popover.js, src/utils/NodeList.js, test/**]
---
## Цель
Общие утилиты, от которых зависят компоненты волн 1–3, совместимы с Vue 3.

## Факты
- `clickoutside.js`: хуки `bind/unbind`, проверка `binding.expression` (в Vue 3 поля `expression` нет → колбэк никогда не вызовется). Используют dropdown, select, popover.
- `collapse-transition.js`: `functional: true`, `render(h, { children })`, события через `data.on`. Vue 3: functional-компонент = обычная функция `(props, { slots }) => h(Transition, { onBeforeEnter, ... }, slots.default)`. Используют collapse-item и submenu.
- `mixins/popover.js`: props `value` (v-model show), `trigger`, `placement`, вычисление позиции через `offsetLeft/offsetTop` `$refs.trigger`/`$refs.popover`, навешивание событий через `NodeList.js` (`$(trigger).on(...)`), приватные `this._timer/_trigger`. Используют tooltip, popover, select, dropdown (6 импортов).
- `NodeList.js` — 410 строк jQuery-подобной обёртки, используется только popover-mixin'ом.

## Шаги
1. `clickoutside.js`: `{ mounted(el, binding) {...}, unmounted(el) {...} }`, проверка `typeof binding.value === 'function'`; хранить обработчик в `WeakMap` вместо `el._handler`. Экспорт по умолчанию + именованный `vClickoutside`.
2. `collapse-transition.js` → `src/components/collapse-transition.js` (или оставить путь): функциональный компонент Vue 3 с `displayName`, хуки те же (`beforeEnter/enter/afterEnter/beforeLeave/leave/afterLeave`), `addClass/removeClass` из `util.js`. Проверить, что `el.dataset` приводится к строкам (`'0'`), как и сейчас.
3. `popover.js`: prop `value` → `modelValue`, событие `input` → `update:modelValue` (если где-то эмитится; сейчас mixin эмитит только `toggle`), `data.show` инициализировать из `modelValue` и добавить `watch(modelValue)`; `_timer/_trigger` → обычные поля data или замыкание; заменить `$(trigger).on/off` на `addEventListener/removeEventListener` с `beforeUnmount` cleanup. После этого удалить `NodeList.js`, если `grep -rn NodeList src docs` пуст (docs/utils/nodelist.js — копия для docs, трогать в 40-01).
4. Тесты: `test/directives/clickoutside.spec.js` (клик внутри не вызывает, снаружи вызывает, после unmount слушатель снят); `test/utils/collapse-transition.spec.js` — монтируется, при `v-show` toggle навешивает класс `collapse-transition`.

## Критерии приёмки
- `grep -rn "binding.expression\|functional: true\|NodeList" src` пусто.
- `pnpm test`, eslint по затронутым файлам, `pnpm build` — без ошибок.

## Проверка
```sh
scripts/node.sh pnpm test
scripts/node.sh pnpm exec eslint src/directives src/utils src/mixins
scripts/node.sh pnpm build
```

## Changelog
Если `v-clickoutside` экспортировался наружу — нет (не экспортируется). Popover/Tooltip: `v-model` → `modelValue` (запись сделают 30-w1-popover/tooltip, здесь только упомянуть в заметках).

## Найдено по ходу
- (из 10-01) `src/mixins/popover.js` подключает `NodeList.js` через `require` под `typeof window` — rolldown это пережёвывает, но при переписывании mixin заменить на обычный import.

## Заметки агента
- Mixin: prop `modelValue`, `emits: ['update:modelValue', 'toggle']`, `watch(show)` эмитит `update:modelValue` на любое изменение `show`, кроме пришедшего из `modelValue` (флаг `popoverSyncing`, без эха). Поля `popoverTimer/popoverSyncing/popoverListeners` — нереактивные, в `created`. Changelog: Tooltip/Popover.
- `doDestory` оставлен пустым: в старом коде `$(el).off()` без аргументов был no-op (баг NodeList), реальное снятие слушателей — в `beforeUnmount`. 30-*: можно убрать `@after-leave="doDestory"` из шаблонов вместе с методом.
- 30-w1-tooltip/popover: `popover.vue` содержит мёртвый `watch.value` — удалить (mixin сам следит за `modelValue`); проверено smoke-тестом, `v-model` на AtTooltip/AtPopover работает в обе стороны, клик снаружи закрывает и обновляет `v-model`.
- 30-w2-dropdown: от mixin только `show`/`trigger`; объявить `emits` для `on-dropdown-command` (mixin уже объявляет `emits`), убрать `$on`. AtDropdown/AtSelect сейчас падают на `this.$on` (не из-за 20-04).
- 30-w3-select: **конфликт имён** — mixin объявляет `modelValue: Boolean` для открытия, а Select переводит свой `v-model` выбора на `modelValue`. Select должен переопределить prop `modelValue` и не опираться на `show` mixin'а (иначе `show` инициализируется выбранным значением, а `watch(show)` эмитит `update:modelValue` с булевым). Вариант: не подключать mixin в select.vue, а брать только `setPopoverPosition`. `select/src/dropdown.vue` без `ref="trigger"` — `console.error` в mounted (как и раньше).
- Тест transition: VTU по умолчанию стабит `<transition>` → `global.stubs.transition: false`; `scrollHeight` застаблен (50). Проверены все 6 хуков: before/enter синхронно после `nextTick`, after* — через fallback Vue (нет CSS-длительности → resolve на следующем кадре), `transitionend` не эмулировался.
- `grep functional: true src` не пуст: `src/components/table/src/render.js` (30-w4-table). Lint: до 89 err/6 warn, после 88/6.
