# Changelog миграции cattr-ui 1.x → 2.0 (Vue 3)

Документ для команды фронтенда. Каждая запись: **Было → Стало → Что править в проекте**.
Агенты дописывают записи в том же коммите, где меняют поведение. Разделы группируются по области.
Пометка `[TODO]` означает, что изменение запланировано, но ещё не выполнено.

## Требования к окружению

- Peer dependency: `vue ^3.5`. Vue 2.x больше не поддерживается.
- Пакет поставляется как ESM (`"type": "module"`, поле `exports`, точка входа `dist/index.js`). UMD-сборки `dist/at.js`/`dist/at.min.js` удалены, глобальной переменной `at` больше нет. Сборщик потребителя должен понимать ESM (Vite, webpack 5).
  Импорт отдельных компонентов: `import { AtButton } from '@amazingcat/cattr-ui'` (имена `At*` с 20-01; tree-shaking через `sideEffects`) или `@amazingcat/cattr-ui/src/components/button`.
- Локали: `import de from '@amazingcat/cattr-ui/locale/de'` (ESM, default export) вместо `@amazingcat/cattr-ui/dist/locale/de.js` (UMD). Прямой путь `dist/...` через `exports` закрыт.
- Внутренние импорты вида `at-ui/src/...` удалены. Alias `at-ui` в конфиге потребителя больше не нужен.
- Название `at-ui` в документации, баннерах и workspace-пакете стилей заменено на `cattr-ui`. CSS-классы `at-*`, теги `<at-*>` и ключи локали `at.*` не менялись — правок в проекте не требует.

## Подключение

- Было: `Vue.use(CattrUI, { locale, i18n })`. Стало: `app.use(CattrUI, { locale, i18n })` (`createApp(App).use(CattrUI, opts)`).
  Авторегистрация через `window.Vue` удалена. Плагин можно ставить только после `createApp`, глобального `Vue` больше нет.
- Глобальные сервисы доступны как `app.config.globalProperties.$Message/$Modal/$Notify/$Loading` (в Options API `this.$Message` работает как раньше)
  и как именованные экспорты `import { Message, Dialog, Notification, LoadingBar } from '@amazingcat/cattr-ui'` для `<script setup>`.
- Именованные экспорты компонентов переименованы под имя компонента: было `import { Button, Select } from '@amazingcat/cattr-ui'`,
  стало `import { AtButton, AtSelect } from '@amazingcat/cattr-ui'` (`AtAlert` … `AtTooltip`, 43 шт., имя экспорта = `component.name`).
  Сервисы экспортируются без префикса: `Message`, `Dialog`, `Notification`, `LoadingBar`. Также экспортируются `install`, `version`, `locale`, `i18n`.
- Default export сокращён до `{ install, version }`: `CattrUI.Button`, `CattrUI.locale(...)`, `CattrUI.i18n(...)` и т.п. больше нет.
  Что править: компоненты брать именованными экспортами, локаль/хук передавать в `app.use(CattrUI, { locale, i18n })`
  или вызывать `import { locale, i18n } from '@amazingcat/cattr-ui'`.
- Отдельная регистрация компонента: `app.use(AtButton)` (`AtButton.install = app => app.component(AtButton.name, AtButton)`), вместо `Vue.use(Button)`.
- i18n-хук: `fn(key, values)`; если вернул `null`/`undefined`, берётся строка из встроенной локали (`en-US` или переданной в `locale`).
  Для vue-i18n 11: `app.use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })`.
  Учтите, что `i18n.global.t` для отсутствующего ключа возвращает сам ключ, а не `undefined`, — тогда fallback на встроенную локаль не сработает;
  либо добавить ключи `at.*` в сообщения vue-i18n, либо проверять `i18n.global.te(key)` и возвращать `undefined`.
  Автоопределение `Vue.locale`/`$t` через прототип и слияние встроенной локали с сообщениями vue-i18n (deepmerge) удалены; зависимость `deepmerge` убрана.

## v-model

- `[TODO 30-*]` Все компоненты с `v-model` переходят на prop `modelValue` + событие `update:modelValue`.
  `v-model="x"` в шаблонах продолжает работать. Ручные биндинги `:value` + `@input` заменить на `:model-value` + `@update:model-value`.
  Затронуты: Input, InputNumber, Textarea, Checkbox, CheckboxGroup, Radio, RadioGroup, Select, Switch, Slider, Rate, Modal, Tabs, Collapse.

## Удалено

- `AtForm`, `AtFormItem` удалены вместе с документацией (в 1.x не экспортировались). Если проект импортировал `@cattr/ui-kit/src/components/form` напрямую — заменить на собственную форму или `vee-validate`.

## По компонентам

### Alert

- Prop `message` остаётся обязательным (`required: true`), но у него убран `default: ''`. Было: при отсутствии значения приходила пустая строка; стало: `undefined`. Вывод компонента не меняется (текст выводится по `v-if`).
  Что править: ничего, если `message` всегда передаётся; при отсутствии значения Vue выдаёт warning о required-prop, как и раньше.
- Событие `on-close` без изменений; добавлен явный `emits: ['on-close']`.

### Tooltip, Popover (общий mixin popover)

- `v-model` открытия: было prop `value`, компонент эмитил только `toggle` (`v-model` работал в одну сторону); стало prop `modelValue` + событие `update:modelValue` при каждом открытии/закрытии (клик, hover, focus, клик снаружи), `toggle` остаётся.
  Что править: `v-model="open"` работает как есть; `:value="open"` → `:model-value="open"`, вместо `@toggle` для синхронизации можно использовать `v-model`.
- Popover: props `title`/`content` по-прежнему вставляются как HTML (`v-html`, решение оставить API без изменений); экранирование недоверенных строк — на стороне потребителя, либо слоты `#title`/`#content`. Слот `title` рендерится только при непустом prop `title` (как в 1.x).
  Что править: `<template slot="content">` → `<template #content>` (синтаксис слотов Vue 3); остальное без изменений.

### Progress

- Публичный API не изменился: имена props/событий и поведение те же. Prop `percent` больше не помечен `required` (при `default: 0` это давало предупреждение Vue в dev-режиме); поведение при отсутствии `percent` прежнее — `0`.
- Событие `on-status-success` теперь объявлено в `emits`; слушатель `@on-status-success` работает как раньше. Что править: ничего.

(заполняется задачами 30-*)

### Pagination

- События `page-change` (номер страницы) и `pagesize-change` (размер страницы) сохранены, объявлены в `emits`.
- Новое: при смене страницы изнутри (клик, prev/next, jump, quickjump, стрелки) эмитится `update:current`, при смене размера через sizer — `update:pageSize`. Было: prop `current`/`page-size` только читался, синхронизация вручную через `@page-change`. Стало: работают `v-model:current="page"` и `v-model:page-size="size"`; `:current` + `@page-change` работают как раньше.
- Было: quickjump/simple-ввод по Enter не ограничивал номер сверху — в поле оставалось введённое число (например `999`), если страница не менялась. Стало: номер приводится к `[1, totalPage]`, в поле показывается приведённое значение; событие эмитится только если страница реально изменилась (как в 1.x).
- Клавиатура: `keyCode` → `event.key`. Фильтр ввода в поля номера пропускает цифры, `Backspace`, `ArrowLeft`/`ArrowRight` (теперь также цифры NumPad; `Shift`+цифра — нет). В simple-режиме `ArrowDown` — предыдущая страница, `ArrowUp` — следующая (как в 1.x).
- Prop `total` больше не помечен `required` (при `default: 0` это давало предупреждение Vue); поведение без `total` прежнее — одна страница.
- Корень — один `<ul class="at-pagination">` (убраны корневые комментарии, делавшие корень фрагментом): `class`/`style`/атрибуты потребителя попадают на него.
  Что править: ничего; при желании заменить `:current` + `@page-change` на `v-model:current`.

### Input

- v-model: prop `modelValue` + событие `update:modelValue` вместо `value` + `input`. `v-model` работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`. Событие `change` (значение строкой на каждый ввод), `focus`, `blur` (нативный `Event`) — без изменений.
- Было: атрибуты и слушатели потребителя вешались на корневой `div.at-input`, нативные события ловились через `.native` (`@keyup.enter.native`). Стало: `inheritAttrs: false` — `class` и `style` остаются на обёртке `div.at-input`, всё остальное (слушатели `@keyup.enter`, `@keydown`, `@paste`, атрибуты `id`, `autocomplete`, `aria-*`, `data-*`…) уходит на внутренний `<input class="at-input__original">`.
  Что править: `@keyup.enter.native="…"` → `@keyup.enter="…"` (модификатор `.native` в Vue 3 удалён); `id`/`data-*`/`aria-*` теперь на `<input>`, а не на обёртке — проверить селекторы в CSS/тестах.
  `@input` на `<at-input>` больше не событие компонента: он вешается на нативный `<input>` и получает `Event`, а не строку — использовать `@update:model-value` или `@change`.
- Удалены внутренние вызовы `dispatch('AtFormItem', 'on-form-item-blur/change')` (Form удалён), наружу эти события не эмитились и не эмитятся.

### InputNumber

- v-model: prop `modelValue` + событие `update:modelValue` вместо `value` + `input`. `v-model` работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`. События `change` (число), `focus`, `blur` (нативный `Event`) — имена прежние.
- Было: `change` эмитился дважды на каждый клик +/-; стало: `update:modelValue` и `change` — ровно по одному разу на каждое изменение значения, в том числе при достижении `min`/`max` (фикс 1.x сохранён). При внешнем изменении `modelValue` события не эмитятся.
- Было: изменение `value` родителем после монтирования не отображалось, а набранное с клавиатуры число игнорировалось. Стало: компонент следит за `modelValue`; введённое число применяется по `change` (blur) и Enter, обрезается до `min`/`max`, нечисловой/пустой ввод откатывается к текущему значению.
- Было: атрибуты и слушатели потребителя вешались на корневой `div.at-input-number`, нативные события ловились через `.native` (`@keyup.native`). Стало: `inheritAttrs: false` — `class` и `style` остаются на обёртке, всё остальное (`@keyup`, `@keydown`, `@paste`, `id`, `placeholder`, `aria-*`, `data-*`…) уходит на внутренний `<input class="at-input-number__original">`.
  Что править: `@keyup.native="…"` → `@keyup="…"`; `id`/`data-*`/`aria-*` теперь на `<input>` — проверить селекторы в CSS/тестах.
  `@input` на `<at-input-number>` больше не событие компонента: он вешается на нативный `<input>` и получает `Event` на каждый набранный символ, а не число — использовать `@update:model-value` или `@change`.
- Событий `on-form-item-change` (через `dispatch` в `AtFormItem`) больше нет — Form удалён.

### Button, ButtonGroup

- Клик: было `<at-button @click.native="fn">` (или `@click` на собственный `$emit('click')`) → стало `<at-button @click="fn">`. `AtButton` больше не эмитит свой `click`: слушатель потребителя падает на корневой `<button>` через `$attrs` и вызывается ровно один раз с нативным `MouseEvent`. Что править: убрать `.native` у всех `@click`/`@mouseenter`/… на `at-button`.
- `disabled` — нативный атрибут, клик не доходит до слушателя (как в 1.x). `loading` клик **не** блокирует (как в 1.x) — если нужно, добавлять `:disabled="loading"`.
- `size`/`gap` группы: было `$parent.size`/`$parent.gap` (работало только для прямого потомка `AtButtonGroup` и случайно подхватывало `size` любого другого родителя) → стало provide/inject из `AtButtonGroup`: кнопка получает `at-btn--<size>` и `margin-right: <gap>px` на любой глубине внутри группы, реактивно; вне группы — ничего. Что править: ничего, если кнопки лежат в `AtButtonGroup`.
- Атрибут `style` потребителя сливается со стилем группы обычным fallthrough Vue 3 (без изменений для потребителя).

### Radio, RadioGroup, RadioButton

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input` (у `AtRadioGroup` и одиночного `AtRadio`). `v-model` в шаблонах работает как раньше.
- Событие группы `radio-group-change` сохранено. Было: срабатывало на любое изменение `value`, в т.ч. программное → стало: только при выборе пользователем, аргумент — `label` выбранного радио. Что править: если нужна реакция на программные изменения — `watch` на свою переменную v-model.
- `AtRadio` внутри группы больше не эмитит собственный `input`/`update:modelValue` — слушать события на `AtRadioGroup`. Одиночный `AtRadio`/`AtRadioButton` эмитит только `update:modelValue`.
- `AtRadioButton` теперь работает и без группы по собственному `modelValue` (`v-model` на кнопке). `size`/`fill`/`text-color` по-прежнему задаются только на `AtRadioGroup`; `size` группы теперь реактивен (в 1.x читался один раз при создании).
- Выбор `disabled` радио/кнопки не эмитит событий; повторный выбор уже выбранного значения тоже.

### Checkbox, CheckboxGroup

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input` (у `AtCheckboxGroup` — массив `label` отмеченных, у одиночного `AtCheckbox` — `Boolean`). `v-model` в шаблонах работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`.
- Событие `on-change` сохранено у обоих (у группы — новый массив, у одиночного — `true`/`false`). Props `label`, `name`, `checked`, `disabled` без изменений; `size`/`indeterminate` у компонентов нет ни в 1.x, ни в 2.0.
- Было: `AtCheckbox` внутри группы эмитил собственный `input` (boolean) и мутировал массив `value` группы на месте (нативный `v-model` по тому же массиву). Стало: чекбокс в группе ничего не эмитит, группа эмитит `update:modelValue` + `on-change` с **новым** массивом (исходный не мутируется; добавленный `label` идёт в конец). Что править: слушать события на `AtCheckboxGroup`; если код полагался на мутацию исходного массива (без `v-model`) — перейти на `v-model`/`@on-change`.
- Связь группа ↔ чекбокс: было `findComponentsDownward`/`findComponentUpward` (прямой обход дерева, состояние синхронизировалось только в `mounted`/`watch value`) → стало provide/inject: чекбокс на любой глубине внутри группы, отмеченность реактивно вычисляется из `modelValue` группы. Prop `checked` внутри группы больше не влияет на отображение (в 1.x визуально отмечал чекбокс без изменения массива) — отмечать через `modelValue` группы.
- Изменение `disabled` чекбокса событий не эмитит.

### Switch

- v-model: prop `value` → `modelValue`. Было: `<at-switch v-model="on">` с prop `value`. Стало: `v-model="on"` работает как раньше, `:value="on"` → `:model-value="on"`.
- Добавлено событие `update:modelValue` при каждом клике (не для `disabled`). Событие `change` сохранено, аргумент — новое значение.
- Состояние переключателя синхронизируется с `modelValue` при изменении prop; внутреннее состояние остаётся и при клике без `v-model` (как в 1.x).

### Collapse, CollapseItem

- v-model: prop `value` → `modelValue`. Было: `:value="active"` + `@on-change`, компонент сам `input` не эмитил (v-model фактически был односторонним). Стало: `v-model="active"` работает в обе стороны — при клике по заголовку эмитится `update:modelValue`; `:value` → `:model-value`.
- Событие `on-change` сохранено, аргумент как в 1.x — массив активных имён-строк (в `accordion` — из одного элемента или пустой). Что править: ничего; если слушали `on-change` только ради синхронизации — заменить на `v-model`.
- `modelValue` принимает строку, число или массив; значения приводятся к строкам, эмитится всегда массив строк (как в 1.x). Исходный массив больше не мутируется (в 1.x элементы переписывались `toString()` на месте).
- `AtCollapseItem` без `name` получает имя = индекс в DOM-порядке среди элементов своего `AtCollapse` (`'0'`, `'1'`, …), как в 1.x; индекс теперь пересчитывается при добавлении/удалении элементов. `AtCollapseItem` вне `AtCollapse` не раскрывается и не реагирует на клик (в 1.x падал на `$parent.toggle`).

### Dropdown, DropdownMenu, DropdownItem

- Было: `AtDropdown` падал при монтировании (`this.$on is not a function`), связь item → dropdown шла через `dispatch('AtDropdown', 'menu-item-click')`. Стало: provide/inject — `AtDropdownItem` на любой глубине внутри `AtDropdown` вызывает команду родителя; вне `AtDropdown` клик по item ничего не делает.
- Событие `on-dropdown-command` сохранено (аргумент — `name` пункта), после него меню закрывается, как в 1.x. Клик по `disabled` пункту событие не эмитит и меню не закрывает. Props `trigger` (по умолчанию `hover`), `placement` (по умолчанию `bottom`), у item `name`/`disabled`/`divided` — без изменений.
- Слот меню: было `<at-dropdown-menu slot="menu">` → стало `<template #menu><at-dropdown-menu>…</at-dropdown-menu></template>` (синтаксис слотов Vue 3, атрибут `slot` удалён). Что править: все `slot="menu"` у `at-dropdown`.
- Открытие (общий mixin popover, см. Tooltip/Popover): было prop `value` (односторонний) → стало `modelValue` + `update:modelValue` при каждом открытии/закрытии (триггер, выбор пункта, клик снаружи), событие `toggle` (только по click-триггеру) сохранено. Что править: `:value="open"` → `v-model="open"` или `:model-value="open"`.

### Tabs, TabPane

- v-model: prop `value` → `modelValue` (строка — `name` активной панели). Было: `value` читался один раз при создании, `input` не эмитился (v-model был односторонним). Стало: `v-model="active"` работает в обе стороны — клик по вкладке эмитит `update:modelValue`, внешнее изменение `modelValue` переключает вкладку; `:value` → `:model-value`. Пустой `modelValue` — активна первая панель (как в 1.x), но событий при монтировании больше нет.
- `on-change` (`{ index, name }`) и `on-tab-remove` (`{ index, name }`) — имена и аргументы прежние. Было: `on-change` срабатывал и при монтировании (выбор первой панели по умолчанию); стало: только при выборе пользователем (клик или закрытие активной вкладки), не при внешнем изменении `modelValue`. Что править: если слушали `on-change` ради синхронизации — заменить на `v-model`.
- Закрытие вкладки: как и в 1.x, панель из DOM удаляет **потребитель** в обработчике `on-tab-remove` (`tabList.splice(index, 1)`). Было: Tabs временно убирал пункт из nav сам, но после следующего обновления он возвращался, если панель не удалили. Стало: nav строится из смонтированных `AtTabPane`, пункт исчезает только вместе с панелью. Если закрыта активная вкладка, Tabs выбирает следующую незаблокированную (иначе предыдущую) и эмитит `update:modelValue` + `on-change` с индексом в списке без закрытой панели.
- Связь Tabs ↔ TabPane: было `$children`/`$parent.updateNav()` (только прямые потомки) → стало provide/inject + регистрация в DOM-порядке: панели можно оборачивать в другие элементы/компоненты, добавленные позже или переставленные (keyed `v-for`) панели встают в nav по порядку в DOM. `label`/`icon`/`disabled`/`closable` панели реактивны.
- `AtTabPane` без `name` получает имя = индекс в DOM-порядке строкой (`'0'`, `'1'`, …); в 1.x было число. `AtTabPane` вне `AtTabs` просто показывает содержимое.

### Table

- **Сигнатура колонки `render` изменена.** Было: `render: (h, params) => VNode` — `h` передавался первым аргументом, VNode в формате Vue 2 (`props`/`on`/`style` во вложенных объектах). Стало: `render: (params) => VNode`, `params = { item, column, index }`; `h` импортируется из `vue`, VNode в формате Vue 3 (плоские props, слушатели `onXxx`).
  ```js
  // было (1.x)
  render: (h, params) => h('AtButton', { props: { size: 'small' }, on: { click: () => this.$Message(params.item.name) } }, 'View')
  // стало (2.0)
  import { h, resolveComponent } from 'vue'
  render: ({ item }) => h(resolveComponent('AtButton'), { size: 'small', onClick: () => this.$Message(item.name) }, () => 'View')
  // или с импортом компонента: import { AtButton } from '@amazingcat/cattr-ui'; h(AtButton, {...}, () => 'View')
  ```
  Что править: во всех колонках с `render` убрать первый аргумент `h`, импортировать `h` из `vue` и переписать VNode-данные под Vue 3 (`props: {...}` → поля верхнего уровня, `on: { click }` → `onClick`, `attrs`/`domProps` → верхний уровень, дети компонентов — функцией/объектом слотов). `resolveComponent` работает только внутри render/setup, поэтому в колонках, объявленных в `data()`, надёжнее импортировать компонент.
- **Исправление: `params.index` — индекс строки.** Было: из-за затенения переменной в шаблоне в `render` приходил индекс **колонки** (документация обещала индекс строки). Стало: индекс отображаемой строки (позиция в текущей странице/сортировке, с 0). Исходный индекс строки в `data` по-прежнему доступен как `params.item.index`. Что править: если код опирался на `index` как на номер колонки — определять колонку через `params.column` (например, `params.column.key`).
- `.native` на внутренних чекбоксах выделения убран (Checkbox на Vue 3 с одним корнем). Чекбокс «выбрать всё» в режиме фиксированной высоты (`height`) больше не переключается дважды за клик: оба заголовка используют `@click.prevent` + `:model-value`. События `on-select-all`/`on-selection-change` — те же имена и аргументы.
- Исправление: чекбокс строки привязан к исходному индексу строки (`item.index`), а не к позиции в отсортированной/постраничной выборке; раньше после сортировки или на 2+ странице отмечалась не та строка.
- Prop `data` отслеживается глубоко (`deep: true`): в Vue 3 `push`/`splice` массива без `deep` watcher не вызывают, а в 1.x таблица на них реагировала. При любом изменении `data` выделение пересобирается из `row.isChecked` (раньше состояние выделения не пересоздавалось и при росте `data` с `optional` таблица падала).
- Слушатель `resize` на `window` теперь снимается при размонтировании (в 1.x хук был написан с опечаткой `beforeDestory` и не срабатывал).
- `AtCheckbox` и `AtPagination` зарегистрированы локально — Table работает при `app.use(AtTable)` без глобальной регистрации остальных компонентов.
- События объявлены в `emits`: `rowClick` (нативный `MouseEvent` клика по строке), `on-select-all`, `on-selection-change`, `on-sort-change`, `on-page-change`, `on-page-size-change`. Имена без изменений. Что править: ничего.

## Сервисы

- `[TODO 20-03, 30-w3-*]` До завершения миграции сервисов `$Message`, `$Modal`, `$Notify`, `$Loading` существуют, но при вызове бросают `… is not migrated to Vue 3 yet`. Промежуточные сборки ветки `feat/vue-3` для потребителя непригодны до закрытия этапа 30.

- `Message` (`$Message`): API вызова без изменений — `Message('text')`, `Message({ message, type, icon, duration, onClose })`, `Message.info/success/warning/error/loading(...)`, `Message.close(id)`, `Message.closeAll()`, вызов возвращает функцию закрытия.
  Импорт для `<script setup>`: `import { Message } from '@amazingcat/cattr-ui'`; также можно поставить отдельно: `app.use(Message)` (кладёт `$Message` в `globalProperties`).
  Было: работало сразу после импорта. Стало: сервис рендерится в контексте приложения, установившего плагин, — вызывать **после** `app.use(CattrUI)`, иначе `<at-*>`-компоненты и локаль внутри сервиса не отрендерятся (для `Message` сейчас некритично — иконки CSS-классами, текстов локали нет, — но для `$Modal`/`$Notify` обязательно; полагаться не стоит).
  Мелочи: объект `options` больше не мутируется (раньше в него дописывались `type`/`onClose`); `Message.close(id)` теперь и прячет сообщение, а не только убирает его из стека; `Message.closeAll()` закрывает все сообщения (раньше пропускал каждое второе); в `onClose(vm)` приходит публичный экземпляр компонента сообщения, как и раньше.

- `LoadingBar` (`$Loading`): API вызова без изменений — `start()`, `update(percent)` (число), `finish()`, `error()`, `config({ width })`; единственная полоса создаётся лениво при первом вызове и удаляется через 800 мс после `finish()`/`error()`.
  Импорт для `<script setup>`: `import { LoadingBar } from '@amazingcat/cattr-ui'`; отдельная установка: `app.use(LoadingBar)` (кладёт `$Loading` в `globalProperties`).
  Было: Vue 2 `extend`/`mount`, параметры через `data`. Стало: `mountService` + props `percent`, `status`, `show`, `width` у `AtLoadingBar`.
  Новое: `LoadingBar.destroy()` — немедленно убирает полосу и останавливает таймеры (например, при смене маршрута или в тестах). `config({ width })` применяется и к уже показанной полосе (в 1.x — только к следующей).
  Исправлено: `start()` сразу после `finish()`/`error()` больше не удаляется отложенным скрытием предыдущего запуска. Что править: ничего.
  Известное: CSS `.at-loading-bar { height: 4px !important }` перебивает высоту из `config({ width })`, как и в 1.x.

- `Notification` (`$Notify`): вызов `Notification({ title, message, type, icon, duration, showClose, onClose })`, `Notification('text')` (строка = `message`), `Notification.info/success/warning/error(...)` — как раньше.
  Импорт для `<script setup>`: `import { Notification } from '@amazingcat/cattr-ui'`; отдельная установка `app.use(Notification)` (кладёт `$Notify` в `globalProperties`). Вызывать после `app.use(CattrUI)` (см. `Message`).
  Было: вызов возвращал экземпляр компонента (`vm`, с `vm.id`, `vm.handleClose()`). Стало: возвращает функцию закрытия, как `Message`. Что править: `const n = this.$Notify(...); n.handleClose()` → `const close = this.$Notify(...); close()`.
  Добавлено: `Notification.closeAll()` (в 1.x не было). `Notification.close(id)` теперь и прячет уведомление, а не только убирает его из стека и сдвигает остальные.
  Было: `icon` показывался, только если `type` не из `success/error/warning/info` (иконка типа побеждала, без `type` иконки не было вовсе). Стало: `icon` имеет приоритет над иконкой типа и показывается и без `type` (как у `Message`). Тип по умолчанию по-прежнему пустой (без иконки), а не `info`, как написано в документации 1.x.
  `title`/`message` выводятся текстом (`{{ }}`, в 1.x `v-text`), HTML не интерпретируется — без изменений. Объект `options` не мутируется; в `onClose(vm)` приходит публичный экземпляр компонента.

(заполняется задачами 30-w3-modal, 30-w3-notification, 30-w3-loading-bar)

## Документация и разработка

- Сборка: `pnpm build` (Vite library mode, ESM, `vue` external). Скрипты `build:component`, `build:locale`, `build:doc`, `prepublish` удалены; `build:package` оставлен алиасом `pnpm build` для CI. Стили: `pnpm build:style`. Требуется Node ≥ 24.
- Линтер: ESLint 10 flat config (`eslint.config.js`) + eslint-plugin-vue 10 + Prettier 3 (`.prettierrc`). Команды `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`. `.eslintrc.js` и `eslint-config-o2team` удалены.
