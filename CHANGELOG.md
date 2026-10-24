# Changelog

## 2.0.0 — миграция на Vue 3 (2026-10-24)

Ломающий релиз: библиотека переведена на Vue 3.5 и сборку Vite. Документ написан для команды фронтенда.
Каждая запись: **Было → Стало → Что править в проекте**. Разделы сгруппированы по области, компоненты — по алфавиту.

### Чеклист миграции проекта

Последовательность действий во фронтенде (пути `src/` — исходники проекта-потребителя):

1. **Обновить окружение:** `vue@^3.5`, сборщик с поддержкой ESM (Vite с `@vitejs/plugin-vue` или webpack 5), `sass` (для SCSS-исходников стилей), Node ≥ 24 для сборки. Убрать alias `at-ui` из конфига сборщика (см. «Требования к окружению»).
2. **Обновить пакет:** `pnpm add @amazingcat/cattr-ui@^2.0.0`. Заменить импорты: `@amazingcat/cattr-ui/dist/locale/<lang>.js` → `@amazingcat/cattr-ui/locale/<lang>`, `at-ui/src/...` → `@amazingcat/cattr-ui/src/...`, `import { Button } from '@amazingcat/cattr-ui'` → `import { AtButton } from '@amazingcat/cattr-ui'`, `CattrUI.locale(...)`/`CattrUI.i18n(...)` → опции `app.use` или именованные `locale`/`i18n` (см. «Подключение»).
3. **Подключить плагин:** `Vue.use(CattrUI, opts)` → `createApp(App).use(CattrUI, opts)`. Сервисы `$Modal`/`$Message`/`$Notify`/`$Loading` вызывать только после `app.use(CattrUI)`.
4. **v-model:** у всех `<at-*>` ручные `:value` + `@input` заменить на `:model-value` + `@update:model-value`; `v-model="x"` оставить как есть. У `<at-input>`/`<at-input-number>` `@input` больше не событие компонента (см. «v-model», Input, InputNumber).
5. **Убрать `.native`:** `@click.native`, `@keyup.enter.native` и т.п. на `<at-*>` → без `.native` (модификатор удалён во Vue 3). Проверить селекторы CSS/тестов на `id`/`data-*`/`aria-*` у Input/InputNumber — они теперь на внутреннем `<input>`.
6. **Слоты:** `slot="name"` и `slot-scope` → `<template #name>`: `#menu` у Dropdown, `#title` у Submenu, `#header`/`#footer` у Modal, `#title`/`#content` у Popover, `#title`/`#extra`/`#loading` у Card.
7. **Таблица:** во всех колонках с `render` сигнатура `(h, params)` → `({ item, column, index })`, `h` импортировать из `vue`, VNode переписать в формат Vue 3. `params.index` теперь индекс строки, а не колонки (см. Table).
8. **Сервисы:** `$Notify(...)` возвращает функцию закрытия, а не экземпляр (`n.handleClose()` → `close()`, `n.id` → `close.id`); у `$Message(...)` у функции закрытия появился `id`. `$Modal`: OK больше не вызывает `on-cancel`, Escape/крестик/маска дают `'cancel'`, `callback` и промис работают вместе, диалоги идут очередью. `$Loading`: высота полосы теперь задаётся `config({ width })`, дефолт 2px (прежний вид — `LoadingBar.config({ width: 4 })`). Подробности — «Сервисы».
9. **i18n-хук:** `app.use(CattrUI, { i18n: (key, values) => i18n.global.te(key) ? i18n.global.t(key, values) : undefined })` для vue-i18n 11 (`legacy: false`) либо добавить ключи `at.*` в сообщения vue-i18n.
10. **Стили:** `$var: …; @import '~@amazingcat/cattr-ui/src/stylesheet/src/index.scss'` → `@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' with (…)`; переменные/миксины в своих `.scss` подключать через `@use … as *`. Переименовать свои классы переходов `-enter`/`-leave` → `-enter-from`/`-leave-from` (см. «Стили»).
11. **Поведенческие изменения событий:** `on-change` у Select/Rate/Tabs/Textarea/RadioGroup (`radio-group-change`) больше не срабатывает на программную смену значения, `on-select` у Menu — один раз на клик, у Modal — по одному событию на действие. Если на это опирались — перейти на `watch` своей переменной `v-model`.
12. **Прогнать поиск по проекту** и разобрать каждое совпадение:

```sh
# подключение, старые импорты и alias
grep -rnE "Vue\.use|new Vue\(|window\.Vue" src
grep -rnE "at-ui|cattr-ui/dist|CattrUI\.(locale|i18n|[A-Z])" src
grep -rnE "import \{[^}]*\b(Button|Select|Input|Table|Modal)\b[^}]*\} from '@amazingcat/cattr-ui'" src
# v-model и события компонентов
grep -rnE "<at-[a-z-]+[^>]*(:value=|v-bind:value=|@input=|v-on:input=)" src
# .native и старый синтаксис слотов
grep -rnE "\.native\b" src
grep -rnE "\sslot=\"|slot-scope" src
# render колонок таблицы
grep -rnE "render\s*(:|\()\s*\(?\s*h\s*," src
# сервисы: возвращаемое значение $Notify, коллбеки $Modal, LoadingBar
grep -rnE "\\\$(Notify|Modal|Message|Loading)\b|\b(Notification|Dialog|Message|LoadingBar)\." src
# стили: @import библиотеки и классы переходов Vue 2
grep -rnE "@import .*cattr-ui|@import .*stylesheet/src" src
grep -rnE "\.[a-z-]+-(enter|leave)\b[^-]" src
```

### Требования к окружению

- Peer dependency: `vue ^3.5`. Vue 2.x больше не поддерживается.
- Пакет поставляется как ESM (`"type": "module"`, поле `exports`, точка входа `dist/index.js`). Было: UMD-сборки `dist/at.js`/`dist/at.min.js` и глобальная переменная `at`. Стало: UMD-сборки удалены, глобальной переменной `at` нет. Что править: сборщик потребителя должен понимать ESM (Vite, webpack 5).
  Импорт отдельных компонентов: `import { AtButton } from '@amazingcat/cattr-ui'` (имена `At*`, tree-shaking через `sideEffects`) или `@amazingcat/cattr-ui/src/components/button`.
- Локали: было `@amazingcat/cattr-ui/dist/locale/de.js` (UMD) → стало `import de from '@amazingcat/cattr-ui/locale/de'` (ESM, default export). Прямой путь `dist/...` через `exports` закрыт. Доступны `de`, `en-US`, `fa-IR`, `ko-KR`, `pt-BR`, `zh-CN`.
- Внутренние импорты вида `at-ui/src/...` удалены. Что править: alias `at-ui` в конфиге потребителя больше не нужен, импорты исходников — через `@amazingcat/cattr-ui/src/...`.
- Название `at-ui` в документации, баннерах и workspace-пакете стилей заменено на `cattr-ui`. CSS-классы `at-*`, теги `<at-*>` и ключи локали `at.*` не менялись — правок в проекте не требует.

### Подключение

- Было: `Vue.use(CattrUI, { locale, i18n })`. Стало: `app.use(CattrUI, { locale, i18n })` (`createApp(App).use(CattrUI, opts)`).
  Авторегистрация через `window.Vue` удалена. Плагин можно ставить только после `createApp`, глобального `Vue` больше нет.
- Глобальные сервисы доступны как `app.config.globalProperties.$Message/$Modal/$Notify/$Loading` (в Options API `this.$Message` работает как раньше)
  и как именованные экспорты `import { Message, Dialog, Notification, LoadingBar } from '@amazingcat/cattr-ui'` для `<script setup>`.
- Именованные экспорты компонентов переименованы под имя компонента: было `import { Button, Select } from '@amazingcat/cattr-ui'`,
  стало `import { AtButton, AtSelect } from '@amazingcat/cattr-ui'` (`AtAlert` … `AtTimelineItem`, 43 шт., имя экспорта = `component.name`).
  Сервисы экспортируются без префикса: `Message`, `Dialog`, `Notification`, `LoadingBar`. Также экспортируются `install`, `version`, `locale`, `i18n`.
- Default export сокращён до `{ install, version }`: было `CattrUI.Button`, `CattrUI.locale(...)`, `CattrUI.i18n(...)` и т.п., стало — их нет.
  Что править: компоненты брать именованными экспортами, локаль/хук передавать в `app.use(CattrUI, { locale, i18n })`
  или вызывать `import { locale, i18n } from '@amazingcat/cattr-ui'`.
- Отдельная регистрация компонента: было `Vue.use(Button)`, стало `app.use(AtButton)` (`AtButton.install = app => app.component(AtButton.name, AtButton)`) или `app.component(AtButton.name, AtButton)`.
- i18n-хук: `fn(key, values)`; если вернул `null`/`undefined`, берётся строка из встроенной локали (`en-US` или переданной в `locale`).
  Для vue-i18n 11: `app.use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })`.
  Учтите, что `i18n.global.t` для отсутствующего ключа возвращает сам ключ, а не `undefined`, — тогда fallback на встроенную локаль не сработает;
  либо добавить ключи `at.*` в сообщения vue-i18n, либо проверять `i18n.global.te(key)` и возвращать `undefined`.
  Было: автоопределение `Vue.locale`/`$t` через прототип и слияние встроенной локали с сообщениями vue-i18n (deepmerge). Стало: удалено, зависимость `deepmerge` убрана; перевод работает только через явный хук `i18n`.

### v-model

- Все компоненты с `v-model` переходят на prop `modelValue` + событие `update:modelValue` (было: prop `value` + событие `input`).
  `v-model="x"` в шаблонах продолжает работать. Что править: ручные биндинги `:value` + `@input` заменить на `:model-value` + `@update:model-value`.
  Затронуты: Checkbox, CheckboxGroup, Collapse, Dropdown, Input, InputNumber, Modal, Popover, Radio, RadioButton, RadioGroup, Rate, Select, Slider, Switch, Tabs, Textarea, Tooltip.
  У Pagination добавлены именованные `v-model:current` и `v-model:page-size` (см. Pagination).

### Удалено

- `AtForm`, `AtFormItem` удалены вместе с документацией (в 1.x не экспортировались, зависимость `async-validator` не была объявлена). Что править: если проект импортировал `@amazingcat/cattr-ui/src/components/form` напрямую — заменить на собственную форму или `vee-validate`.
- UMD-сборки `dist/at.js`/`dist/at.min.js`, глобальная переменная `at`, авторегистрация через `window.Vue`, пути `dist/locale/*.js` — см. «Требования к окружению» и «Подключение».
- Модификатор `.native` для `<at-*>` (удалён во Vue 3) и атрибут `slot="…"` (синтаксис слотов Vue 2) — см. компоненты.
- Свойства default export (`CattrUI.Button`, `CattrUI.locale`, `CattrUI.i18n`) — см. «Подключение».
- Зависимость `deepmerge` и автоопределение vue-i18n через прототип — см. «Подключение».

### Компоненты

#### Alert

- Prop `message` остаётся обязательным (`required: true`), но у него убран `default: ''`. Было: при отсутствии значения приходила пустая строка; стало: `undefined`. Вывод компонента не меняется (текст выводится по `v-if`).
  Что править: ничего, если `message` всегда передаётся; при отсутствии значения Vue выдаёт warning о required-prop, как и раньше.
- Событие `on-close` без изменений; добавлен явный `emits: ['on-close']`.

#### Badge, Breadcrumb, BreadcrumbItem, Card, Tag

- Props, события и имена слотов без изменений; события объявлены в `emits` (`on-close` у Tag).
- Card: слоты `title`/`extra`/`loading` — было `<div slot="title">`, стало `<template #title>` (синтаксис слотов Vue 3).
- Breadcrumb: было `this.$parent.separator`, прочитанный один раз в `mounted` (только для прямого потомка) → стало provide/inject: `separator` реактивен и доходит до `AtBreadcrumbItem` на любой глубине; item вне `AtBreadcrumb` использует `/`. Клик по item с `to` без vue-router ничего не делает (в 1.x падал на `$router`). `separator` по-прежнему выводится как HTML (`v-html`).
- Tag: убрана обёртка `<transition name="fade">` без переключателя (анимации она не давала). Что править: ничего.

#### Button, ButtonGroup

- Клик: было `<at-button @click.native="fn">` (или `@click` на собственный `$emit('click')`) → стало `<at-button @click="fn">`. `AtButton` больше не эмитит свой `click`: слушатель потребителя падает на корневой `<button>` через `$attrs` и вызывается ровно один раз с нативным `MouseEvent`. Что править: убрать `.native` у всех `@click`/`@mouseenter`/… на `at-button`.
- `disabled` — нативный атрибут, клик не доходит до слушателя (как в 1.x). `loading` клик **не** блокирует (как в 1.x) — если нужно, добавлять `:disabled="loading"`.
- `size`/`gap` группы: было `$parent.size`/`$parent.gap` (работало только для прямого потомка `AtButtonGroup` и случайно подхватывало `size` любого другого родителя) → стало provide/inject из `AtButtonGroup`: кнопка получает `at-btn--<size>` и `margin-right: <gap>px` на любой глубине внутри группы, реактивно; вне группы — ничего. Что править: ничего, если кнопки лежат в `AtButtonGroup`.
- Атрибут `style` потребителя сливается со стилем группы обычным fallthrough Vue 3 (без изменений для потребителя).

#### Checkbox, CheckboxGroup

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input` (у `AtCheckboxGroup` — массив `label` отмеченных, у одиночного `AtCheckbox` — `Boolean`). `v-model` в шаблонах работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`.
- Событие `on-change` сохранено у обоих (у группы — новый массив, у одиночного — `true`/`false`). Props `label`, `name`, `checked`, `disabled` без изменений; `size`/`indeterminate` у компонентов нет ни в 1.x, ни в 2.0.
- Было: `AtCheckbox` внутри группы эмитил собственный `input` (boolean) и мутировал массив `value` группы на месте (нативный `v-model` по тому же массиву). Стало: чекбокс в группе ничего не эмитит, группа эмитит `update:modelValue` + `on-change` с **новым** массивом (исходный не мутируется; добавленный `label` идёт в конец). Что править: слушать события на `AtCheckboxGroup`; если код полагался на мутацию исходного массива (без `v-model`) — перейти на `v-model`/`@on-change`.
- Связь группа ↔ чекбокс: было `findComponentsDownward`/`findComponentUpward` (прямой обход дерева, состояние синхронизировалось только в `mounted`/`watch value`) → стало provide/inject: чекбокс на любой глубине внутри группы, отмеченность реактивно вычисляется из `modelValue` группы. Prop `checked` внутри группы больше не влияет на отображение (в 1.x визуально отмечал чекбокс без изменения массива) — отмечать через `modelValue` группы.
- Изменение `disabled` чекбокса событий не эмитит.

#### Collapse, CollapseItem

- v-model: prop `value` → `modelValue`. Было: `:value="active"` + `@on-change`, компонент сам `input` не эмитил (v-model фактически был односторонним). Стало: `v-model="active"` работает в обе стороны — при клике по заголовку эмитится `update:modelValue`; `:value` → `:model-value`.
- Событие `on-change` сохранено, аргумент как в 1.x — массив активных имён-строк (в `accordion` — из одного элемента или пустой). Что править: ничего; если слушали `on-change` только ради синхронизации — заменить на `v-model`.
- `modelValue` принимает строку, число или массив; значения приводятся к строкам, эмитится всегда массив строк (как в 1.x). Исходный массив больше не мутируется (в 1.x элементы переписывались `toString()` на месте).
- `AtCollapseItem` без `name` получает имя = индекс в DOM-порядке среди элементов своего `AtCollapse` (`'0'`, `'1'`, …), как в 1.x; индекс теперь пересчитывается при добавлении/удалении элементов и известен уже на первом рендере. `AtCollapseItem` вне `AtCollapse` не раскрывается и не реагирует на клик (в 1.x падал на `$parent.toggle`).

#### Dropdown, DropdownMenu, DropdownItem

- Было: `AtDropdown` падал при монтировании (`this.$on is not a function`), связь item → dropdown шла через `dispatch('AtDropdown', 'menu-item-click')`. Стало: provide/inject — `AtDropdownItem` на любой глубине внутри `AtDropdown` вызывает команду родителя; вне `AtDropdown` клик по item ничего не делает.
- Событие `on-dropdown-command` сохранено (аргумент — `name` пункта), после него меню закрывается, как в 1.x. Клик по `disabled` пункту событие не эмитит и меню не закрывает. Props `trigger` (по умолчанию `hover`), `placement` (по умолчанию `bottom`), у item `name`/`disabled`/`divided` — без изменений.
- Слот меню: было `<at-dropdown-menu slot="menu">` → стало `<template #menu><at-dropdown-menu>…</at-dropdown-menu></template>` (синтаксис слотов Vue 3, атрибут `slot` удалён). Что править: все `slot="menu"` у `at-dropdown`.
- Открытие (общий mixin popover, см. Tooltip, Popover): было prop `value` (односторонний) → стало `modelValue` + `update:modelValue` при каждом открытии/закрытии (триггер, выбор пункта, клик снаружи), событие `toggle` (только по click-триггеру) сохранено. Что править: `:value="open"` → `v-model="open"` или `:model-value="open"`.

#### Input

- v-model: prop `modelValue` + событие `update:modelValue` вместо `value` + `input`. `v-model` работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`. Событие `change` (значение строкой на каждый ввод), `focus`, `blur` (нативный `Event`) — без изменений.
- Было: атрибуты и слушатели потребителя вешались на корневой `div.at-input`, нативные события ловились через `.native` (`@keyup.enter.native`). Стало: `inheritAttrs: false` — `class` и `style` остаются на обёртке `div.at-input`, всё остальное (слушатели `@keyup.enter`, `@keydown`, `@paste`, атрибуты `id`, `autocomplete`, `aria-*`, `data-*`…) уходит на внутренний `<input class="at-input__original">`.
  Что править: `@keyup.enter.native="…"` → `@keyup.enter="…"` (модификатор `.native` в Vue 3 удалён); `id`/`data-*`/`aria-*` теперь на `<input>`, а не на обёртке — проверить селекторы в CSS/тестах.
  `@input` на `<at-input>` больше не событие компонента: он вешается на нативный `<input>` и получает `Event`, а не строку — использовать `@update:model-value` или `@change`.
- Удалены внутренние вызовы `dispatch('AtFormItem', 'on-form-item-blur/change')` (Form удалён), наружу эти события не эмитились и не эмитятся.

#### InputNumber

- v-model: prop `modelValue` + событие `update:modelValue` вместо `value` + `input`. `v-model` работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`. События `change` (число), `focus`, `blur` (нативный `Event`) — имена прежние.
- Было: `change` эмитился дважды на каждый клик +/-; стало: `update:modelValue` и `change` — ровно по одному разу на каждое изменение значения, в том числе при достижении `min`/`max` (фикс 1.x сохранён). При внешнем изменении `modelValue` события не эмитятся.
- Было: изменение `value` родителем после монтирования не отображалось, а набранное с клавиатуры число игнорировалось. Стало: компонент следит за `modelValue`; введённое число применяется по `change` (blur) и Enter, обрезается до `min`/`max`, нечисловой/пустой ввод откатывается к текущему значению.
- Было: атрибуты и слушатели потребителя вешались на корневой `div.at-input-number`, нативные события ловились через `.native` (`@keyup.native`). Стало: `inheritAttrs: false` — `class` и `style` остаются на обёртке, всё остальное (`@keyup`, `@keydown`, `@paste`, `id`, `placeholder`, `aria-*`, `data-*`…) уходит на внутренний `<input class="at-input-number__original">`.
  Что править: `@keyup.native="…"` → `@keyup="…"`; `id`/`data-*`/`aria-*` теперь на `<input>` — проверить селекторы в CSS/тестах.
  `@input` на `<at-input-number>` больше не событие компонента: он вешается на нативный `<input>` и получает `Event` на каждый набранный символ, а не число — использовать `@update:model-value` или `@change`.
- Событий `on-form-item-change` (через `dispatch` в `AtFormItem`) больше нет — Form удалён.

#### Menu, MenuItem, MenuItemGroup, Submenu

- Props и события без изменений: `AtMenu` — `mode`, `theme`, `active-name`, `inline-collapsed`, `width`, `router`, событие `on-select(name)`; `AtSubmenu` — `disabled`, `opened` (только начальное состояние, как в 1.x); `AtMenuItem` — `name`, `to`, `replace`, `disabled`; `AtMenuItemGroup` — `title`. Новых событий (`update:*`, `on-open-change`) не добавлено.
- Слот заголовка подменю: было `<template slot="title">` → стало `<template #title>` (синтаксис слотов Vue 3).
- Было: при клике по пункту внутри вложенных подменю `on-select` эмитился по разу на каждый уровень вложенности (2 раза для `submenu > submenu > item`). Стало: ровно один раз на клик. Что править: убрать дедупликацию, если она была.
- `AtSubmenu` больше не подключает mixin popover: недокументированные и ни на что не влиявшие props `trigger`, `title`, `content`, `header`, `placement`, `value` удалены. Атрибут `title` на `<at-submenu>` теперь попадает на корневой `<li>` как HTML-атрибут (нативная подсказка). Убран мусорный атрибут `placement="placementValue"` на `div.at-dropdown__popover`.
- `AtMenuItem` резолвит `router-link` (vue-router 4+) только при непустом `to`: меню без `to` работает без vue-router и без предупреждения `Failed to resolve component: router-link`. Подсветка по `router-link-active` по-прежнему перепроверяется при смене `active-name`. `AtSubmenu`/`AtMenuItem` вне `AtMenu` больше не падают (в 1.x — `parentMenu` = `null`).

#### Modal

- v-model: prop `modelValue` + событие `update:modelValue` вместо `value` + `input`. `v-model="show"` работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`. Корень — один `div`, обёртка не менялась.
- Было: кнопка OK эмитила `input(false)` дважды, `on-confirm` **и затем `on-cancel`**. Стало: OK → `update:modelValue(false)` + `on-confirm`; отмена (кнопка Cancel, крестик, клик по маске при `maskClosable`, Escape) → `update:modelValue(false)` + `on-cancel`. По одному событию на действие.
  Что править: если обработчик `on-cancel` молча рассчитывал отработать и после OK — перенести эту логику в `on-confirm`.
- Escape: было `keyCode === 27`, и слушатель `keydown` на `document` никогда не снимался (опечатка `beforeDestory`) → стало `event.key === 'Escape'`, слушатель снимается в `beforeUnmount`. Prop `closeOnPressEsc` (в 1.x был в документации, но ни на что не влиял) теперь работает: `:close-on-press-esc="false"` отключает Escape; `:show-close="false"` по-прежнему тоже отключает Escape.
- Новые props (в 1.x были внутренним `data`, их заполнял `$Modal`): `showCancelButton`, `showConfirmButton` (Boolean, по умолчанию `true`), `inputValue` (начальное значение поля при `showInput`), `inputPlaceholder`. При `showInput` поле получает фокус при открытии.
- Новое событие `after-leave` — после завершения анимации закрытия (на нём `$Modal` размонтирует диалог). Внутренние `callback`/`action` из `data` удалены.
- Слоты: было `<div slot="header">` → стало `<template #header>`, `slot="footer"` → `#footer` (синтаксис Vue 3); имена слотов `header`/`footer`/default без изменений. Слушатели на кнопках внутри своего `#footer`: `@click`, без `.native`.

#### Pagination

- События `page-change` (номер страницы) и `pagesize-change` (размер страницы) сохранены, объявлены в `emits`.
- Новое: при смене страницы изнутри (клик, prev/next, jump, quickjump, стрелки) эмитится `update:current`, при смене размера через sizer — `update:pageSize`. Было: prop `current`/`page-size` только читался, синхронизация вручную через `@page-change`. Стало: работают `v-model:current="page"` и `v-model:page-size="size"`; `:current` + `@page-change` работают как раньше.
- Было: quickjump/simple-ввод по Enter не ограничивал номер сверху — в поле оставалось введённое число (например `999`), если страница не менялась. Стало: номер приводится к `[1, totalPage]`, в поле показывается приведённое значение; событие эмитится только если страница реально изменилась (как в 1.x).
- Клавиатура: `keyCode` → `event.key`. Фильтр ввода в поля номера пропускает цифры, `Backspace`, `ArrowLeft`/`ArrowRight` (теперь также цифры NumPad; `Shift`+цифра — нет). В simple-режиме `ArrowDown` — предыдущая страница, `ArrowUp` — следующая (как в 1.x).
- Prop `total` больше не помечен `required` (при `default: 0` это давало предупреждение Vue); поведение без `total` прежнее — одна страница.
- Корень — один `<ul class="at-pagination">` (убраны корневые комментарии, делавшие корень фрагментом): `class`/`style`/атрибуты потребителя попадают на него.
  Что править: ничего; при желании заменить `:current` + `@page-change` на `v-model:current`.

#### Progress

- Публичный API не изменился: имена props/событий и поведение те же. Prop `percent` больше не помечен `required` (при `default: 0` это давало предупреждение Vue в dev-режиме); поведение при отсутствии `percent` прежнее — `0`.
- Событие `on-status-success` теперь объявлено в `emits`; слушатель `@on-status-success` работает как раньше. Что править: ничего.

#### Radio, RadioGroup, RadioButton

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input` (у `AtRadioGroup` и одиночного `AtRadio`). `v-model` в шаблонах работает как раньше.
- Событие группы `radio-group-change` сохранено. Было: срабатывало на любое изменение `value`, в т.ч. программное → стало: только при выборе пользователем, аргумент — `label` выбранного радио. Что править: если нужна реакция на программные изменения — `watch` на свою переменную v-model.
- `AtRadio` внутри группы больше не эмитит собственный `input`/`update:modelValue` — слушать события на `AtRadioGroup`. Одиночный `AtRadio`/`AtRadioButton` эмитит только `update:modelValue`.
- `AtRadioButton` теперь работает и без группы по собственному `modelValue` (`v-model` на кнопке). `size`/`fill`/`text-color` по-прежнему задаются только на `AtRadioGroup`; `size` группы теперь реактивен (в 1.x читался один раз при создании).
- Выбор `disabled` радио/кнопки не эмитит событий; повторный выбор уже выбранного значения тоже.

#### Rate

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input`. События `on-change`, `on-hover-change` — имена и аргументы прежние.
- Было: при `v-model` клик эмитил `on-change` дважды (сам клик и затем watcher значения), а любое внешнее изменение `value` тоже давало `on-change`. Стало: `on-change` — ровно один раз на клик пользователя, внешнее изменение `modelValue` только перерисовывает звёзды.
  Что править: убрать дедупликацию `on-change`, если была; реакцию на программную смену значения делать через `watch`.

#### Select, Option, OptionGroup

- v-model: prop `value` → `modelValue` (String / Number / Array), событие `input` → `update:modelValue`. `v-model` работает как раньше; `:value`/`@input` → `:model-value`/`@update:model-value`. Событие `on-change` и его аргумент прежние (значение / массив значений; с `value-with-label` — `{ value, label }` / массив таких объектов).
- Было: `on-change` эмитился и при внешнем изменении `value` родителем (через внутренний watcher). Стало: `update:modelValue` и `on-change` — только на действия пользователя (клик/Enter по опции, удаление тега, крестик очистки). Что править: если `@on-change` использовался как реакция на программную смену значения — следить за своей переменной `watch`-ем.
- Было: в `multiple` массив из `v-model` мутировался на месте (`push`/`splice`). Стало: эмитится новый массив, исходный не меняется. Что править: ничего, если значение берётся из `v-model`/события.
- Select больше не наследует mixin popover: props `title`, `content`, `header` и событие `toggle` (в 1.x протекали из mixin и для Select смысла не имели) удалены. `placement` и `trigger` объявлены у Select; `placement` поддерживает `bottom` (по умолчанию) и `top` (варианты `top-*`/`bottom-*` → то же), `trigger` — только `click`, как и раньше фактически.
- Подпись опции без prop `label` берётся из текста слота (`textContent`), а не `innerHTML`: в выбранном значении/тегах больше не видна HTML-разметка слота. Фильтрация (`filterable`) идёт по этой подписи без учёта регистра. Для кастомного шаблона опции по-прежнему рекомендуется задавать `label`.
- Клавиатура: навигация стрелками пропускает disabled и скрытые фильтром опции, по кругу; Enter без подсвеченной опции выбирает первую доступную; Esc закрывает. Опции, добавленные/удалённые позже (`v-for` по реактивному массиву), регистрируются автоматически в DOM-порядке; выбранная подпись обновляется, когда нужная опция появляется.
- `AtOption` вне `AtSelect` рендерится, но ничего не выбирает (в 1.x падал на `inject: ['select']`). `AtOptionGroup` без изменений. Слотов у Select/Option не прибавилось и не убавилось: `default`.

#### Slider

- v-model: prop `modelValue` + `update:modelValue` вместо `value` + `input`; событие `change` — как раньше.
- Удалён скрытый (`v-show="false"`) `<at-input-number class="at-slider__input">` внутри `.at-slider`: он не был виден и не влиял на значение. Что править: ничего, если в CSS/тестах нет селекторов `.at-slider__input` / `.at-slider .at-input-number`.

#### Steps, Step, Timeline, TimelineItem

- Props, события и слоты без изменений. Связь родитель ↔ дети: было `$children`/`$parent` (только прямые потомки) → стало provide/inject с регистрацией в DOM-порядке: `AtStep`/`AtTimelineItem` можно оборачивать в другие элементы/компоненты, добавленные позже элементы встают на своё место.
- Номер шага известен уже на первом рендере и при SSR. Что править: ничего.

#### Switch

- v-model: prop `value` → `modelValue`. Было: `<at-switch v-model="on">` с prop `value`. Стало: `v-model="on"` работает как раньше, `:value="on"` → `:model-value="on"`.
- Добавлено событие `update:modelValue` при каждом клике (не для `disabled`). Событие `change` сохранено, аргумент — новое значение.
- Состояние переключателя синхронизируется с `modelValue` при изменении prop; внутреннее состояние остаётся и при клике без `v-model` (как в 1.x).

#### Table

- **Сигнатура колонки `render` изменена.** Было: `render: (h, params) => VNode` — `h` передавался первым аргументом, VNode в формате Vue 2 (`props`/`on`/`style` во вложенных объектах). Стало: `render: (params) => VNode`, `params = { item, column, index }`; `h` импортируется из `vue`, VNode в формате Vue 3 (плоские props, слушатели `onXxx`).

  ```js
  // было (1.x)
  render: (h, params) =>
    h(
      'AtButton',
      { props: { size: 'small' }, on: { click: () => this.$Message(params.item.name) } },
      'View',
    )
  // стало (2.0)
  import { h, resolveComponent } from 'vue'
  render: ({ item }) =>
    h(
      resolveComponent('AtButton'),
      { size: 'small', onClick: () => this.$Message(item.name) },
      () => 'View',
    )
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

#### Tabs, TabPane

- v-model: prop `value` → `modelValue` (строка — `name` активной панели). Было: `value` читался один раз при создании, `input` не эмитился (v-model был односторонним). Стало: `v-model="active"` работает в обе стороны — клик по вкладке эмитит `update:modelValue`, внешнее изменение `modelValue` переключает вкладку; `:value` → `:model-value`. Пустой `modelValue` — активна первая панель (как в 1.x), но событий при монтировании больше нет.
- `on-change` (`{ index, name }`) и `on-tab-remove` (`{ index, name }`) — имена и аргументы прежние. Было: `on-change` срабатывал и при монтировании (выбор первой панели по умолчанию); стало: только при выборе пользователем (клик или закрытие активной вкладки), не при внешнем изменении `modelValue`. Что править: если слушали `on-change` ради синхронизации — заменить на `v-model`.
- Закрытие вкладки: как и в 1.x, панель из DOM удаляет **потребитель** в обработчике `on-tab-remove` (`tabList.splice(index, 1)`). Было: Tabs временно убирал пункт из nav сам, но после следующего обновления он возвращался, если панель не удалили. Стало: nav строится из смонтированных `AtTabPane`, пункт исчезает только вместе с панелью. Если закрыта активная вкладка, Tabs выбирает следующую незаблокированную (иначе предыдущую) и эмитит `update:modelValue` + `on-change` с индексом в списке без закрытой панели.
- Связь Tabs ↔ TabPane: было `$children`/`$parent.updateNav()` (только прямые потомки) → стало provide/inject + регистрация в DOM-порядке: панели можно оборачивать в другие элементы/компоненты, добавленные позже или переставленные (keyed `v-for`) панели встают в nav по порядку в DOM. `label`/`icon`/`disabled`/`closable` панели реактивны.
- `AtTabPane` без `name` получает имя = индекс в DOM-порядке строкой (`'0'`, `'1'`, …), известное уже на первом рендере; в 1.x было число. `AtTabPane` вне `AtTabs` просто показывает содержимое.

#### Textarea

- v-model: prop `modelValue` + событие `update:modelValue` вместо `value` + `input`; `change` (строка), `focus`, `blur` — имена прежние.
- Было: `input`/`change` эмитились и при изменении значения родителем (программная смена текста давала `change`). Стало: `update:modelValue` и `change` — только на ввод пользователя, по одному разу; внешнее изменение `modelValue` лишь обновляет поле (как у Input/Select/Switch).
  Что править: если `@change` использовался как реакция на программную смену значения — следить за своей переменной `watch`-ем.

#### Tooltip, Popover (общий mixin popover)

- `v-model` открытия: было prop `value`, компонент эмитил только `toggle` (`v-model` работал в одну сторону); стало prop `modelValue` + событие `update:modelValue` при каждом открытии/закрытии (клик, hover, focus, клик снаружи), `toggle` остаётся.
  Что править: `v-model="open"` работает как есть; `:value="open"` → `:model-value="open"`, вместо `@toggle` для синхронизации можно использовать `v-model`.
- Popover: props `title`/`content` по-прежнему вставляются как HTML (`v-html`, решение оставить API без изменений); экранирование недоверенных строк — на стороне потребителя, либо слоты `#title`/`#content`. Слот `title` рендерится только при непустом prop `title` (как в 1.x).
  Что править: было `<template slot="content">` → стало `<template #content>` (синтаксис слотов Vue 3); остальное без изменений.

### Сервисы

- `Message` (`$Message`): API вызова без изменений — `Message('text')`, `Message({ message, type, icon, duration, onClose })`, `Message.info/success/warning/error/loading(...)`, `Message.close(id)`, `Message.closeAll()`, вызов возвращает функцию закрытия.
  Новое: у возвращаемой функции есть свойство `id` — `const close = Message('…'); Message.close(close.id)` (в 1.x `id` наружу не отдавался, `close(id)` был внутренним).
  Импорт для `<script setup>`: `import { Message } from '@amazingcat/cattr-ui'`; также можно поставить отдельно: `app.use(Message)` (кладёт `$Message` в `globalProperties`).
  Было: работало сразу после импорта. Стало: сервис рендерится в контексте приложения — вызывать **после** `app.use(CattrUI)` или отдельной установки `app.use(Message)` (у каждого из четырёх сервисов `install` запоминает app, если `app.use(CattrUI)` ещё не вызывался; `app.use(CattrUI)` всегда перезаписывает его последним app). До любой установки `appContext` нет: глобальные компоненты, `globalProperties` и `provide` приложения внутри сервиса недоступны.
  Мелочи: объект `options` больше не мутируется (раньше в него дописывались `type`/`onClose`); `Message.close(id)` теперь и прячет сообщение, а не только убирает его из стека, и вызывает `onClose` (второй, внутренний аргумент `close(id, onClose)` убран); `Message.closeAll()` закрывает все сообщения (раньше пропускал каждое второе); в `onClose(vm)` приходит публичный экземпляр компонента сообщения, как и раньше.

- `Dialog` (`$Modal`): методы и сигнатуры прежние — `$Modal.alert/confirm/prompt/info/success/warning/error(content, title, options)` или `(options)`, `$Modal.close()`, возвращают `Promise`.
  `confirm`/`prompt`: resolve на OK (`'confirm'`; у `prompt` — `{ value, action: 'confirm' }`), reject `'cancel'` на отмену; `alert`/`info`/`success`/`warning`/`error`: resolve при любом закрытии (`'confirm'`/`'cancel'`). Импорт: `import { Dialog } from '@amazingcat/cattr-ui'`, отдельная установка `app.use(Dialog)` (кладёт `$Modal`).
  Было: работало после импорта. Стало: сервис рендерится в контексте приложения — вызывать **после** `app.use(CattrUI)` или `app.use(Dialog)`. `AtModal` регистрирует `AtButton`/`AtInput` локально, поэтому `app.use(Dialog)` (или `app.use(AtModal)`) без `app.use(CattrUI)` даёт рабочий диалог с кнопками и полем ввода.
  Титулы статусных диалогов по умолчанию (объектная форма без `title`): были китайские `信息/成功/警告/错误` → стали английские `Info/Success/Warning/Error` (ключей `at.modal.info…` в локалях нет; для перевода передавать `title`). В строковой форме `$Modal.info('text')` заголовка по-прежнему нет.
  Поведенческие исправления: 1) очередь — было: каждый вызов сразу открывал новый диалог поверх предыдущего, а промис/коллбек первого мог получить ответ второго; стало: диалоги показываются по одному, следующий — после анимации закрытия текущего. 2) Escape, крестик и клик по маске считаются `'cancel'` (было: промис и коллбек не вызывались вовсе и очередь «зависала»). 3) `callback` из `options` (или вторым аргументом `Dialog(options, cb)`) вызывается как `cb(action)`, для `prompt` — `cb(value, action)`, и **вместе** с промисом (было: при `options.callback` промис не разрешался, коллбек получал `(action, instance)`); при наличии `callback` отклонение промиса не даёт `unhandledrejection`. 4) `$Modal.close()` закрывает текущий и очищает очередь; промисы закрытых так диалогов, как и в 1.x, не разрешаются.
  Опции передаются в `AtModal` как props (`title`, `content`, `type`, `okText`, `cancelText`, `maskClosable`, `showClose`, `showCancelButton`, `showConfirmButton`, `showInput`, `inputValue`, `inputPlaceholder`, `width`, `styles`…); неизвестные ключи игнорируются. Объект `options` не мутируется.
  Что править: коллбеки вида `(action, instance)` → `(action)` / `(value, action)`; логику, ожидавшую одновременного показа нескольких диалогов, — под очередь.

- `LoadingBar` (`$Loading`): API вызова без изменений — `start()`, `update(percent)` (число), `finish()`, `error()`, `config({ width })`; единственная полоса создаётся лениво при первом вызове и удаляется через 800 мс после `finish()`/`error()`.
  Импорт для `<script setup>`: `import { LoadingBar } from '@amazingcat/cattr-ui'`; отдельная установка: `app.use(LoadingBar)` (кладёт `$Loading` в `globalProperties`, запоминает app для сервисов, если `app.use(CattrUI)` не вызывался).
  Было: Vue 2 `extend`/`mount`, параметры через `data`. Стало: `mountService` + props `percent`, `status`, `show`, `width` у `AtLoadingBar`.
  Новое: `LoadingBar.destroy()` — немедленно убирает полосу и останавливает таймеры (например, при смене маршрута или в тестах). `config({ width })` применяется и к уже показанной полосе (в 1.x — только к следующей).
  Исправлено: `start()` сразу после `finish()`/`error()` больше не удаляется отложенным скрытием предыдущего запуска. Что править: ничего.
  Исправлено: `config({ width })` меняет высоту полосы. Побочный эффект: в 1.x `height: 4px !important` в CSS перебивал inline-высоту, поэтому полоса всегда была 4px; теперь без `config()` действует задокументированный дефолт 2px. Что править: чтобы вернуть прежний вид — `LoadingBar.config({ width: 4 })` при старте приложения.

- `Notification` (`$Notify`): вызов `Notification({ title, message, type, icon, duration, showClose, onClose })`, `Notification('text')` (строка = `message`), `Notification.info/success/warning/error(...)` — как раньше.
  Импорт для `<script setup>`: `import { Notification } from '@amazingcat/cattr-ui'`; отдельная установка `app.use(Notification)` (кладёт `$Notify` в `globalProperties`). Вызывать после `app.use(CattrUI)` или `app.use(Notification)` (см. `Message`).
  Было: вызов возвращал экземпляр компонента (`vm`, с `vm.id`, `vm.handleClose()`). Стало: возвращает функцию закрытия, как `Message`. Что править: `const n = this.$Notify(...); n.handleClose()` → `const close = this.$Notify(...); close()`; `n.id` → `close.id` (для `Notification.close(id)`).
  Добавлено: `Notification.closeAll()` (в 1.x не было). `Notification.close(id)` теперь и прячет уведомление (и вызывает его `onClose`), а не только убирает его из стека и сдвигает остальные; `id` — свойство возвращённой функции закрытия.
  Было: `icon` показывался, только если `type` не из `success/error/warning/info` (иконка типа побеждала, без `type` иконки не было вовсе). Стало: `icon` имеет приоритет над иконкой типа и показывается и без `type` (как у `Message`). Тип по умолчанию по-прежнему пустой (без иконки), а не `info`, как написано в документации 1.x.
  `title`/`message` выводятся текстом (`{{ }}`, в 1.x `v-text`), HTML не интерпретируется — без изменений. Объект `options` не мутируется; в `onClose(vm)` приходит публичный экземпляр компонента.

### Стили

- Классы переходов Vue 3: было `.x-enter` / `.x-leave` (Vue 2) → стало `.x-enter-from` / `.x-leave-from` для начального/конечного состояния (`-enter-active`, `-leave-active`, `-enter-to`, `-leave-to` без изменений).
  Анимации библиотеки (`fade`, `slide-up`, `move-up`, `notification-fade` в `animation.scss`) построены на `@keyframes` в `-enter-active`/`-leave-active` и Vue 2-имён не использовали — в `src/stylesheet` правок не потребовалось: modal/alert/loading-bar (`fade`), select/dropdown/submenu/tooltip/popover (`slide-up`), message (`move-up`), notification (`notification-fade`) анимируются как раньше (проверено по CSS и именам переходов).
  Что править: если в проекте есть свои стили на `.at-*-enter`, `.at-*-leave` или на `.fade-enter`/`.slide-up-enter` (или своих `<transition name>`), переименовать в `-enter-from`/`-leave-from`; иначе стартовое состояние перехода не применится и элемент появится без анимации.
- Готовый CSS (`src/stylesheet/css/at.css`, `at.min.css`) собирается в репозитории командой `pnpm build:style` и в npm-пакет не входит (каталог `css/` в `src/stylesheet/.gitignore`) — потребитель подключает SCSS-исходники `src/stylesheet/src/index.scss`. Автопрефиксы: было `last 2 versions, ie > 8` → стало `browserslist` пакета стилей `last 2 versions, not dead`. Селекторы и значения не изменились; убраны устаревшие префиксы `-webkit-box-*`, `-ms-flex*`, `-webkit-transform`/`-webkit-transition`/`-webkit-animation` и т.п. Карты исходников теперь внешние и актуальные (`at.css.map`, `at.min.css.map`), а не base64 внутри CSS.
  Что править: ничего, если не нужна поддержка IE / старых WebKit; иначе прогнать CSS через свой autoprefixer со своим `browserslist`.
- Исходники стилей (`src/stylesheet/src/**`) переведены с `@import` на модули Sass (`@use`/`@forward`, `math.div`, `color.mix`, `string.*`, `meta.*`); сборка и docs идут без `DEPRECATION WARNING`. `index.scss` делает `@forward` переменных (`variables/default.scss`, `variables/timing-function.scss` — все с `!default`) и миксинов, затем `@use` `core/` и `components/`. CSS на выходе прежний (селекторы и значения совпадают).
  Было: переменные темы переопределялись глобально перед `@import`:

  ```scss
  $brand-blue-500: #ff5722;
  @import '~@amazingcat/cattr-ui/src/stylesheet/src/index.scss';
  ```

  Стало: конфигурация модуля при загрузке (проверено `sass` 1.106.1):

  ```scss
  @use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' as cattr with (
    $brand-blue-500: #ff5722,
    $font-size-base: 13px
  );
  .my-link {
    color: cattr.$link-color;
    @include cattr.ellipsis(200px);
  }
  ```

  Что править: заменить «переменные + `@import`» на свой SCSS-вход с `@use … with (…)` и импортировать его вместо `index.scss`; загружать стили с конфигурацией один раз и раньше любых других файлов из `src/stylesheet` (модуль конфигурируется только при первой загрузке). В своих `.scss`/`<style lang="scss">` переменные и миксины библиотеки больше не глобальные: `@use '@amazingcat/cattr-ui/src/stylesheet/src/variables' as *;` и `@use '@amazingcat/cattr-ui/src/stylesheet/src/mixins' as *;` (или `cattr.$…` через namespace). Каждый `<style lang="scss">` в SFC компилируется отдельно и конфигурацию из входа не видит — если тема нужна и в своих компонентах, вынести её в `_theme.scss` (`@forward '…/src/stylesheet/src/variables' with (…)` + `@forward '…/mixins'`), во входе `@use 'theme'; @use '…/index.scss';`, в компонентах `@use '@/styles/theme' as *;` (проверено). Неизвестное имя в `with (…)` — ошибка компиляции. Старый путь (`$var: …; @import …`) пока работает, но с `DEPRECATION WARNING [import]` и исчезнет в Sass 3.
  Мелочь: `core/grid.scss` больше не перезаписывает глобальные `$screen-*`/`$container-*` своими значениями — после `@import index.scss` `$screen-sm-max` теперь `767px` из `default.scss` (было `991px`), сетка при этом не изменилась.

### Документация и разработка

- Сборка: было webpack 3 (`build:component`, `build:locale`, `build:doc`, `prepublish`) → стало `pnpm build` (Vite library mode, ESM, `vue` external). Скрипты `build:component`, `build:locale`, `build:doc`, `prepublish` удалены; `build:package` оставлен алиасом `pnpm build` для CI. Стили: `pnpm build:style`. Требуется Node ≥ 24.
- Тесты: `pnpm test` (Vitest + `@vue/test-utils` 2 + happy-dom), `pnpm test:watch`.
- Линтер: ESLint 10 flat config (`eslint.config.js`) + eslint-plugin-vue 10 + Prettier 3 (`.prettierrc`). Команды `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`. `.eslintrc.js` и `eslint-config-o2team` удалены.
- CI (GitHub Actions): на pull request и push в `main`/`feat/vue-3` — `install --frozen-lockfile`, `lint --max-warnings 0`, `format:check`, `test`, `build`, `build:docs`; на push в `main` — деплой документации на GitHub Pages; на создание release — публикация в npm.
- Документация: `pnpm dev` — dev-сервер сайта на Vite с HMR (`--host`, порт 7200), `pnpm build:docs` — `pnpm build:style` + статический сайт в `dist-docs/` (hash-роутер, `base: './'`, для GitHub Pages). Конфиг — `vite.docs.config.js`; сайт импортирует библиотеку прямо из `src/`, предварительный `pnpm build` не нужен. Стек сайта: vue-router 5, vue-i18n 11 (`legacy: false`), unplugin-vue-markdown + markdown-it-container (`:::demo`), highlight.js 11; `clipboard`, `vue-markdown-loader`, yaml-loader не используются. Демо, которое не компилируется Vue 3, заменяется на сайте плашкой `.demo-error` и выводится в консоль сборки (`[docs] demo does not compile …`).

## 1.x

История версий 1.x ведётся в документации: `docs/markdown/en/changelog.md`, `docs/markdown/zh/changelog.md`.
