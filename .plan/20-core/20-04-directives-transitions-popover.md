---
id: 20-04
title: Директива clickoutside, CollapseTransition, mixin popover под Vue 3
status: todo
depends_on: [20-01]
parallel: true
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

## Заметки агента
