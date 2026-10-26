# Changelog

## 2.0.0 — migration to Vue 3 (2026-10-24)

Breaking release: the library has been moved to Vue 3.5 and the Vite build. This document is written for the frontend team.
Each entry: **Before → After → What to change in the project**. Sections are grouped by area, components are in alphabetical order.

### Project migration checklist

Sequence of steps in the frontend (`src/` paths are the consumer project's sources):

1. **Update the environment:** `vue@^3.5`, a bundler with ESM support (Vite with `@vitejs/plugin-vue` or webpack 5), Node ≥ 24 for the build. Sass is needed only for the SCSS sources (custom theme): `sass-embedded` is recommended (`sass` also works); with the prebuilt CSS (`@amazingcat/cattr-ui/style.css`) Sass is not installed at all. With pnpm ≥ 10, Sass requires an entry in `pnpm-workspace.yaml`, otherwise `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` (`@parcel/watcher`): for `sass-embedded` — `ignoredOptionalDependencies: [sass-embedded-all-unknown, sass-embedded-unknown-all]`, for `sass` — `allowBuilds: { '@parcel/watcher': false }` or `ignoredOptionalDependencies: ['@parcel/watcher']` (see "Styles"). Remove the `at-ui` alias from the bundler config (see "Environment requirements").
2. **Update the package:** `pnpm add @amazingcat/cattr-ui@^2.0.0`. Replace imports: `@amazingcat/cattr-ui/dist/locale/<lang>.js` → `@amazingcat/cattr-ui/locale/<lang>`, `at-ui/src/...` → `@amazingcat/cattr-ui/src/...`, `import { Button } from '@amazingcat/cattr-ui'` → `import { AtButton } from '@amazingcat/cattr-ui'`, `CattrUI.locale(...)`/`CattrUI.i18n(...)` → `app.use` options or the named `locale`/`i18n` exports (see "Setup").
3. **Install the plugin:** `Vue.use(CattrUI, opts)` → `createApp(App).use(CattrUI, opts)`. Call the `$Modal`/`$Message`/`$Notify`/`$Loading` services only after `app.use(CattrUI)`.
4. **v-model:** on all `<at-*>`, replace manual `:value` + `@input` with `:model-value` + `@update:model-value`; leave `v-model="x"` as is. On `<at-input>`/`<at-input-number>`, `@input` is no longer a component event (see "v-model", Input, InputNumber).
5. **Remove `.native`:** `@click.native`, `@keyup.enter.native`, etc. on `<at-*>` → without `.native` (the modifier was removed in Vue 3). Check CSS/test selectors on `id`/`data-*`/`aria-*` of Input/InputNumber — they are now on the inner `<input>`.
6. **Slots:** `slot="name"` and `slot-scope` → `<template #name>`: `#menu` on Dropdown, `#title` on Submenu, `#header`/`#footer` on Modal, `#title`/`#content` on Popover, `#title`/`#extra`/`#loading` on Card.
7. **Table:** in all columns with `render`, the signature `(h, params)` → `({ item, column, index })`, import `h` from `vue`, rewrite the VNodes to the Vue 3 format. `params.index` is now the row index, not the column index (see Table).
8. **Services:** `$Notify(...)` returns a close function, not an instance (`n.handleClose()` → `close()`, `n.id` → `close.id`); the close function returned by `$Message(...)` now has an `id`. `$Modal`: OK no longer calls `on-cancel`, Escape/the close button/the mask give `'cancel'`, `callback` and the promise work together, dialogs are queued. `$Loading`: the bar height is now set via `config({ width })`, default 2px (the previous look — `LoadingBar.config({ width: 4 })`). Details — "Services".
9. **i18n hook:** `app.use(CattrUI, { i18n: (key, values) => i18n.global.te(key) ? i18n.global.t(key, values) : undefined })` for vue-i18n 11 (`legacy: false`), or add the `at.*` keys to the vue-i18n messages.
10. **Styles:** without a custom theme — `import '@amazingcat/cattr-ui/style.css'` (prebuilt CSS, Sass not needed). With a theme — `$var: …; @import '~@amazingcat/cattr-ui/src/stylesheet/src/index.scss'` → `@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' with (…)` (requires `sass-embedded` or `sass`, see item 1); include variables/mixins in your own `.scss` via `@use … as *`. Rename your own transition classes `-enter`/`-leave` → `-enter-from`/`-leave-from` (see "Styles").
11. **Behavioral changes in events:** `on-change` on Select/Rate/Tabs/Textarea/RadioGroup (`radio-group-change`) no longer fires on a programmatic value change, `on-select` on Menu fires once per click, on Modal — one event per action. If you relied on this, switch to a `watch` on your `v-model` variable.
12. **Run a search over the project** and go through each match:

```sh
# setup, old imports and alias
grep -rnE "Vue\.use|new Vue\(|window\.Vue" src
grep -rnE "at-ui|cattr-ui/dist|CattrUI\.(locale|i18n|[A-Z])" src
grep -rnE "import \{[^}]*\b(Button|Select|Input|Table|Modal)\b[^}]*\} from '@amazingcat/cattr-ui'" src
# v-model and component events
grep -rnE "<at-[a-z-]+[^>]*(:value=|v-bind:value=|@input=|v-on:input=)" src
# .native and the old slot syntax
grep -rnE "\.native\b" src
grep -rnE "\sslot=\"|slot-scope" src
# table column render
grep -rnE "render\s*(:|\()\s*\(?\s*h\s*," src
# services: $Notify return value, $Modal callbacks, LoadingBar
grep -rnE "\\\$(Notify|Modal|Message|Loading)\b|\b(Notification|Dialog|Message|LoadingBar)\." src
# styles: library @import and Vue 2 transition classes
grep -rnE "@import .*cattr-ui|@import .*stylesheet/src" src
grep -rnE "\.[a-z-]+-(enter|leave)\b[^-]" src
```

### Environment requirements

- Peer dependency: `vue ^3.5`. Vue 2.x is no longer supported.
- The package ships as ESM (`"type": "module"`, the `exports` field, entry point `dist/index.js`). Before: UMD builds `dist/at.js`/`dist/at.min.js` and the global variable `at`. After: the UMD builds are removed, there is no global variable `at`. What to change: the consumer's bundler must understand ESM (Vite, webpack 5).
  Importing individual components: `import { AtButton } from '@amazingcat/cattr-ui'` (`At*` names, tree-shaking via `sideEffects`) or `@amazingcat/cattr-ui/src/components/button`.
- Locales: before `@amazingcat/cattr-ui/dist/locale/de.js` (UMD) → after `import de from '@amazingcat/cattr-ui/locale/de'` (ESM, default export). The direct `dist/...` path is closed via `exports`. Available: `de`, `en-US`, `fa-IR`, `ko-KR`, `pt-BR`, `zh-CN`.
- Internal imports of the form `at-ui/src/...` are removed. What to change: the `at-ui` alias in the consumer config is no longer needed, source imports go through `@amazingcat/cattr-ui/src/...`.
- The name `at-ui` in the documentation, banners and the styles workspace package is replaced with `cattr-ui`. The `at-*` CSS classes, `<at-*>` tags and `at.*` locale keys have not changed — no changes required in the project.

### Setup

- Before: `Vue.use(CattrUI, { locale, i18n })`. After: `app.use(CattrUI, { locale, i18n })` (`createApp(App).use(CattrUI, opts)`).
  Auto-registration via `window.Vue` is removed. The plugin can only be installed after `createApp`; there is no global `Vue` anymore.
- Global services are available as `app.config.globalProperties.$Message/$Modal/$Notify/$Loading` (in the Options API `this.$Message` works as before)
  and as named exports `import { Message, Dialog, Notification, LoadingBar } from '@amazingcat/cattr-ui'` for `<script setup>`.
- Named component exports are renamed after the component name: before `import { Button, Select } from '@amazingcat/cattr-ui'`,
  after `import { AtButton, AtSelect } from '@amazingcat/cattr-ui'` (`AtAlert` … `AtTimelineItem`, 43 in total, export name = `component.name`).
  Services are exported without a prefix: `Message`, `Dialog`, `Notification`, `LoadingBar`. `install`, `version`, `locale`, `i18n` are also exported.
- The default export is reduced to `{ install, version }`: before `CattrUI.Button`, `CattrUI.locale(...)`, `CattrUI.i18n(...)`, etc., after — they are gone.
  What to change: take components from named exports, pass the locale/hook to `app.use(CattrUI, { locale, i18n })`
  or call `import { locale, i18n } from '@amazingcat/cattr-ui'`.
- Registering a single component: before `Vue.use(Button)`, after `app.use(AtButton)` (`AtButton.install = app => app.component(AtButton.name, AtButton)`) or `app.component(AtButton.name, AtButton)`.
- i18n hook: `fn(key, values)`; if it returns `null`/`undefined`, the string is taken from the built-in locale (`en-US` or the one passed in `locale`).
  For vue-i18n 11: `app.use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })`.
  Note that `i18n.global.t` returns the key itself for a missing key, not `undefined`, — then the fallback to the built-in locale will not work;
  either add the `at.*` keys to the vue-i18n messages, or check `i18n.global.te(key)` and return `undefined`.
  Before: auto-detection of `Vue.locale`/`$t` via the prototype and merging of the built-in locale with the vue-i18n messages (deepmerge). After: removed, the `deepmerge` dependency is dropped; translation works only through the explicit `i18n` hook.

### v-model

- All components with `v-model` switch to the `modelValue` prop + the `update:modelValue` event (before: the `value` prop + the `input` event).
  `v-model="x"` in templates keeps working. What to change: replace manual `:value` + `@input` bindings with `:model-value` + `@update:model-value`.
  Affected: Checkbox, CheckboxGroup, Collapse, Dropdown, Input, InputNumber, Modal, Popover, Radio, RadioButton, RadioGroup, Rate, Select, Slider, Switch, Tabs, Textarea, Tooltip.
  Pagination gets named `v-model:current` and `v-model:page-size` (see Pagination).

### Removed

- `AtForm`, `AtFormItem` are removed together with their documentation (they were not exported in 1.x, the `async-validator` dependency was not declared). What to change: if the project imported `@amazingcat/cattr-ui/src/components/form` directly — replace it with your own form or `vee-validate`.
- UMD builds `dist/at.js`/`dist/at.min.js`, the global variable `at`, auto-registration via `window.Vue`, the `dist/locale/*.js` paths — see "Environment requirements" and "Setup".
- The `.native` modifier for `<at-*>` (removed in Vue 3) and the `slot="…"` attribute (Vue 2 slot syntax) — see the components.
- Default export properties (`CattrUI.Button`, `CattrUI.locale`, `CattrUI.i18n`) — see "Setup".
- The `deepmerge` dependency and auto-detection of vue-i18n via the prototype — see "Setup".

### Components

#### Alert

- The `message` prop remains required (`required: true`), but its `default: ''` has been removed. Before: when no value was given, an empty string came in; after: `undefined`. The component's output does not change (the text is rendered via `v-if`).
  What to change: nothing, if `message` is always passed; when no value is given, Vue emits a required-prop warning, as before.
- The `on-close` event is unchanged; an explicit `emits: ['on-close']` has been added.

#### Badge, Breadcrumb, BreadcrumbItem, Card, Tag

- Props, events and slot names are unchanged; events are declared in `emits` (`on-close` on Tag).
- Card: the `title`/`extra`/`loading` slots — before `<div slot="title">`, after `<template #title>` (Vue 3 slot syntax).
- Breadcrumb: before, `this.$parent.separator` was read once in `mounted` (only for a direct child) → after, provide/inject: `separator` is reactive and reaches `AtBreadcrumbItem` at any depth; an item outside `AtBreadcrumb` uses `/`. Clicking an item with `to` without vue-router does nothing (in 1.x it crashed on `$router`). `separator` is still rendered as HTML (`v-html`).
- Tag: the `<transition name="fade">` wrapper without a toggle has been removed (it produced no animation). What to change: nothing.

#### Button, ButtonGroup

- Click: before `<at-button @click.native="fn">` (or `@click` on its own `$emit('click')`) → after `<at-button @click="fn">`. `AtButton` no longer emits its own `click`: the consumer's listener falls through to the root `<button>` via `$attrs` and is called exactly once with the native `MouseEvent`. What to change: remove `.native` from all `@click`/`@mouseenter`/… on `at-button`.
- `disabled` is a native attribute, the click does not reach the listener (as in 1.x). `loading` does **not** block the click (as in 1.x) — if needed, add `:disabled="loading"`.
- Group `size`/`gap`: before `$parent.size`/`$parent.gap` (worked only for a direct child of `AtButtonGroup` and accidentally picked up the `size` of any other parent) → after, provide/inject from `AtButtonGroup`: the button gets `at-btn--<size>` and `margin-right: <gap>px` at any depth inside the group, reactively; outside a group — nothing. What to change: nothing, if the buttons are inside `AtButtonGroup`.
- The consumer's `style` attribute is merged with the group style via ordinary Vue 3 fallthrough (no change for the consumer).

#### Checkbox, CheckboxGroup

- v-model: the `modelValue` prop + `update:modelValue` instead of `value` + `input` (for `AtCheckboxGroup` — an array of the checked `label`s, for a single `AtCheckbox` — `Boolean`). `v-model` in templates works as before; `:value`/`@input` → `:model-value`/`@update:model-value`.
- The `on-change` event is kept on both (for the group — a new array, for a single one — `true`/`false`). Props `label`, `name`, `checked`, `disabled` are unchanged; the components have no `size`/`indeterminate` either in 1.x or in 2.0.
- Before: `AtCheckbox` inside a group emitted its own `input` (boolean) and mutated the group's `value` array in place (native `v-model` on the same array). After: a checkbox in a group emits nothing, the group emits `update:modelValue` + `on-change` with a **new** array (the original is not mutated; an added `label` goes to the end). What to change: listen to events on `AtCheckboxGroup`; if the code relied on mutation of the original array (without `v-model`) — switch to `v-model`/`@on-change`.
- Group ↔ checkbox link: before `findComponentsDownward`/`findComponentUpward` (direct tree traversal, state was synchronized only in `mounted`/`watch value`) → after, provide/inject: a checkbox at any depth inside the group, its checked state is reactively computed from the group's `modelValue`. The `checked` prop inside a group no longer affects rendering (in 1.x it visually checked the checkbox without changing the array) — check via the group's `modelValue`.
- Changing a checkbox's `disabled` emits no events.

#### Collapse, CollapseItem

- v-model: prop `value` → `modelValue`. Before: `:value="active"` + `@on-change`, the component did not emit `input` itself (v-model was effectively one-way). After: `v-model="active"` works both ways — clicking a header emits `update:modelValue`; `:value` → `:model-value`.
- The `on-change` event is kept, the argument is as in 1.x — an array of active name strings (in `accordion` — with one element or empty). What to change: nothing; if you listened to `on-change` only for synchronization — replace it with `v-model`.
- `modelValue` accepts a string, a number or an array; values are converted to strings, an array of strings is always emitted (as in 1.x). The original array is no longer mutated (in 1.x the elements were overwritten with `toString()` in place).
- An `AtCollapseItem` without `name` gets a name = its index in DOM order among the items of its `AtCollapse` (`'0'`, `'1'`, …), as in 1.x; the index is now recomputed when items are added/removed and is known already on the first render. An `AtCollapseItem` outside `AtCollapse` does not expand and does not react to clicks (in 1.x it crashed on `$parent.toggle`).

#### Dropdown, DropdownMenu, DropdownItem

- Before: `AtDropdown` crashed on mount (`this.$on is not a function`), the item → dropdown link went through `dispatch('AtDropdown', 'menu-item-click')`. After: provide/inject — an `AtDropdownItem` at any depth inside `AtDropdown` invokes the parent's command; outside `AtDropdown`, clicking an item does nothing.
- The `on-dropdown-command` event is kept (the argument is the item's `name`), after it the menu closes, as in 1.x. Clicking a `disabled` item does not emit the event and does not close the menu. Props `trigger` (default `hover`), `placement` (default `bottom`), the item's `name`/`disabled`/`divided` — unchanged.
- Menu slot: before `<at-dropdown-menu slot="menu">` → after `<template #menu><at-dropdown-menu>…</at-dropdown-menu></template>` (Vue 3 slot syntax, the `slot` attribute is removed). What to change: all `slot="menu"` on `at-dropdown`.
- Opening (shared popover mixin, see Tooltip, Popover): before, the `value` prop (one-way) → after `modelValue` + `update:modelValue` on every open/close (trigger, item selection, click outside), the `toggle` event (only for the click trigger) is kept. What to change: `:value="open"` → `v-model="open"` or `:model-value="open"`.

#### Input

- v-model: the `modelValue` prop + the `update:modelValue` event instead of `value` + `input`. `v-model` works as before; `:value`/`@input` → `:model-value`/`@update:model-value`. The `change` event (the value as a string on every input), `focus`, `blur` (native `Event`) — unchanged.
- Before: the consumer's attributes and listeners were attached to the root `div.at-input`, native events were caught via `.native` (`@keyup.enter.native`). After: `inheritAttrs: false` — `class` and `style` stay on the `div.at-input` wrapper, everything else (listeners `@keyup.enter`, `@keydown`, `@paste`, attributes `id`, `autocomplete`, `aria-*`, `data-*`…) goes to the inner `<input class="at-input__original">`.
  What to change: `@keyup.enter.native="…"` → `@keyup.enter="…"` (the `.native` modifier is removed in Vue 3); `id`/`data-*`/`aria-*` are now on the `<input>`, not on the wrapper — check selectors in CSS/tests.
  `@input` on `<at-input>` is no longer a component event: it is attached to the native `<input>` and receives an `Event`, not a string — use `@update:model-value` or `@change`.
- Internal calls to `dispatch('AtFormItem', 'on-form-item-blur/change')` are removed (Form is removed); these events were not and are not emitted outward.

#### InputNumber

- v-model: the `modelValue` prop + the `update:modelValue` event instead of `value` + `input`. `v-model` works as before; `:value`/`@input` → `:model-value`/`@update:model-value`. The events `change` (a number), `focus`, `blur` (native `Event`) — names unchanged.
- Before: `change` was emitted twice on every +/- click; after: `update:modelValue` and `change` — exactly once each per value change, including when `min`/`max` is reached (the 1.x fix is kept). No events are emitted on an external `modelValue` change.
- Before: a change of `value` by the parent after mounting was not displayed, and a number typed on the keyboard was ignored. After: the component watches `modelValue`; the entered number is applied on `change` (blur) and Enter, clamped to `min`/`max`, non-numeric/empty input rolls back to the current value.
- Before: the consumer's attributes and listeners were attached to the root `div.at-input-number`, native events were caught via `.native` (`@keyup.native`). After: `inheritAttrs: false` — `class` and `style` stay on the wrapper, everything else (`@keyup`, `@keydown`, `@paste`, `id`, `placeholder`, `aria-*`, `data-*`…) goes to the inner `<input class="at-input-number__original">`.
  What to change: `@keyup.native="…"` → `@keyup="…"`; `id`/`data-*`/`aria-*` are now on the `<input>` — check selectors in CSS/tests.
  `@input` on `<at-input-number>` is no longer a component event: it is attached to the native `<input>` and receives an `Event` on every typed character, not a number — use `@update:model-value` or `@change`.
- The `on-form-item-change` events (via `dispatch` to `AtFormItem`) no longer exist — Form is removed.

#### Menu, MenuItem, MenuItemGroup, Submenu

- Props and events are unchanged: `AtMenu` — `mode`, `theme`, `active-name`, `inline-collapsed`, `width`, `router`, the `on-select(name)` event; `AtSubmenu` — `disabled`, `opened` (initial state only, as in 1.x); `AtMenuItem` — `name`, `to`, `replace`, `disabled`; `AtMenuItemGroup` — `title`. No new events (`update:*`, `on-open-change`) have been added.
- Submenu title slot: before `<template slot="title">` → after `<template #title>` (Vue 3 slot syntax).
- Before: when clicking an item inside nested submenus, `on-select` was emitted once per nesting level (2 times for `submenu > submenu > item`). After: exactly once per click. What to change: remove deduplication, if there was any.
- `AtSubmenu` no longer includes the popover mixin: the undocumented props `trigger`, `title`, `content`, `header`, `placement`, `value`, which affected nothing, are removed. The `title` attribute on `<at-submenu>` now lands on the root `<li>` as an HTML attribute (native tooltip). The junk attribute `placement="placementValue"` on `div.at-dropdown__popover` has been removed.
- `AtMenuItem` resolves `router-link` (vue-router 4+) only when `to` is non-empty: a menu without `to` works without vue-router and without the `Failed to resolve component: router-link` warning. Highlighting by `router-link-active` is still re-checked when `active-name` changes. `AtSubmenu`/`AtMenuItem` outside `AtMenu` no longer crash (in 1.x — `parentMenu` = `null`).

#### Modal

- v-model: the `modelValue` prop + the `update:modelValue` event instead of `value` + `input`. `v-model="show"` works as before; `:value`/`@input` → `:model-value`/`@update:model-value`. The root is a single `div`, the wrapper has not changed.
- Before: the OK button emitted `input(false)` twice, `on-confirm` **and then `on-cancel`**. After: OK → `update:modelValue(false)` + `on-confirm`; cancel (the Cancel button, the close button, a click on the mask with `maskClosable`, Escape) → `update:modelValue(false)` + `on-cancel`. One event per action.
  What to change: if an `on-cancel` handler silently relied on running after OK as well — move that logic to `on-confirm`.
- Escape: before `keyCode === 27`, and the `keydown` listener on `document` was never removed (typo `beforeDestory`) → after `event.key === 'Escape'`, the listener is removed in `beforeUnmount`. The `closeOnPressEsc` prop (documented in 1.x, but it affected nothing) now works: `:close-on-press-esc="false"` disables Escape; `:show-close="false"` still disables Escape too.
- New props (in 1.x they were internal `data`, filled by `$Modal`): `showCancelButton`, `showConfirmButton` (Boolean, default `true`), `inputValue` (the initial field value with `showInput`), `inputPlaceholder`. With `showInput`, the field gets focus on open.
- New event `after-leave` — after the close animation finishes (`$Modal` unmounts the dialog on it). The internal `callback`/`action` from `data` are removed.
- Slots: before `<div slot="header">` → after `<template #header>`, `slot="footer"` → `#footer` (Vue 3 syntax); the slot names `header`/`footer`/default are unchanged. Listeners on buttons inside your own `#footer`: `@click`, without `.native`.

#### Pagination

- The `page-change` (page number) and `pagesize-change` (page size) events are kept, declared in `emits`.
- New: when the page changes internally (click, prev/next, jump, quickjump, arrows), `update:current` is emitted, when the size changes via the sizer — `update:pageSize`. Before: the `current`/`page-size` prop was only read, synchronization was manual via `@page-change`. After: `v-model:current="page"` and `v-model:page-size="size"` work; `:current` + `@page-change` work as before.
- Before: quickjump/simple input on Enter did not cap the number from above — the entered number (for example `999`) stayed in the field if the page did not change. After: the number is clamped to `[1, totalPage]`, the field shows the clamped value; the event is emitted only if the page actually changed (as in 1.x).
- Keyboard: `keyCode` → `event.key`. The input filter for the page number fields lets through digits, `Backspace`, `ArrowLeft`/`ArrowRight` (now also NumPad digits; `Shift`+digit — no). In simple mode `ArrowDown` is the previous page, `ArrowUp` is the next one (as in 1.x).
- The `total` prop is no longer marked `required` (with `default: 0` this produced a Vue warning); behavior without `total` is the same — a single page.
- The root is a single `<ul class="at-pagination">` (root comments that made the root a fragment were removed): the consumer's `class`/`style`/attributes land on it.
  What to change: nothing; optionally replace `:current` + `@page-change` with `v-model:current`.

#### Progress

- The public API has not changed: prop/event names and behavior are the same. The `percent` prop is no longer marked `required` (with `default: 0` this produced a Vue warning in dev mode); behavior without `percent` is the same — `0`.
- The `on-status-success` event is now declared in `emits`; the `@on-status-success` listener works as before. What to change: nothing.

#### Radio, RadioGroup, RadioButton

- v-model: the `modelValue` prop + `update:modelValue` instead of `value` + `input` (on `AtRadioGroup` and a single `AtRadio`). `v-model` in templates works as before.
- The group event `radio-group-change` is kept. Before: it fired on any change of `value`, including programmatic ones → after: only on user selection, the argument is the `label` of the selected radio. What to change: if you need to react to programmatic changes — a `watch` on your v-model variable.
- `AtRadio` inside a group no longer emits its own `input`/`update:modelValue` — listen to events on `AtRadioGroup`. A single `AtRadio`/`AtRadioButton` emits only `update:modelValue`.
- `AtRadioButton` now also works without a group, based on its own `modelValue` (`v-model` on the button). `size`/`fill`/`text-color` are still set only on `AtRadioGroup`; the group's `size` is now reactive (in 1.x it was read once on creation).
- Selecting a `disabled` radio/button emits no events; neither does re-selecting an already selected value.

#### Rate

- v-model: the `modelValue` prop + `update:modelValue` instead of `value` + `input`. The `on-change`, `on-hover-change` events — names and arguments unchanged.
- Before: with `v-model`, a click emitted `on-change` twice (the click itself and then the value watcher), and any external change of `value` also produced `on-change`. After: `on-change` — exactly once per user click, an external `modelValue` change only re-renders the stars.
  What to change: remove `on-change` deduplication, if there was any; react to programmatic value changes via `watch`.

#### Select, Option, OptionGroup

- v-model: prop `value` → `modelValue` (String / Number / Array), event `input` → `update:modelValue`. `v-model` works as before; `:value`/`@input` → `:model-value`/`@update:model-value`. The `on-change` event and its argument are unchanged (value / array of values; with `value-with-label` — `{ value, label }` / an array of such objects).
- Before: `on-change` was also emitted on an external change of `value` by the parent (via an internal watcher). After: `update:modelValue` and `on-change` — only on user actions (click/Enter on an option, removing a tag, the clear button). What to change: if `@on-change` was used to react to a programmatic value change — watch your own variable with `watch`.
- Before: in `multiple`, the array from `v-model` was mutated in place (`push`/`splice`). After: a new array is emitted, the original is not changed. What to change: nothing, if the value is taken from `v-model`/the event.
- Select no longer inherits the popover mixin: the props `title`, `content`, `header` and the `toggle` event (in 1.x they leaked from the mixin and made no sense for Select) are removed. `placement` and `trigger` are declared on Select; `placement` supports `bottom` (default) and `top` (the `top-*`/`bottom-*` variants → the same), `trigger` — only `click`, as was effectively the case before.
- An option's caption without the `label` prop is taken from the slot text (`textContent`), not `innerHTML`: the slot's HTML markup is no longer visible in the selected value/tags. Filtering (`filterable`) works on this caption, case-insensitively. For a custom option template, setting `label` is still recommended.
- Keyboard: arrow navigation skips disabled options and options hidden by the filter, wrapping around; Enter with no highlighted option selects the first available one; Esc closes. Options added/removed later (`v-for` over a reactive array) are registered automatically in DOM order; the selected caption updates when the matching option appears.
- `AtOption` outside `AtSelect` renders but selects nothing (in 1.x it crashed on `inject: ['select']`). `AtOptionGroup` is unchanged. Select/Option have neither gained nor lost slots: `default`.

#### Slider

- v-model: the `modelValue` prop + `update:modelValue` instead of `value` + `input`; the `change` event — as before.
- The hidden (`v-show="false"`) `<at-input-number class="at-slider__input">` inside `.at-slider` has been removed: it was not visible and did not affect the value. What to change: nothing, if there are no `.at-slider__input` / `.at-slider .at-input-number` selectors in CSS/tests.

#### Steps, Step, Timeline, TimelineItem

- Props, events and slots are unchanged. Parent ↔ children link: before `$children`/`$parent` (direct children only) → after, provide/inject with registration in DOM order: `AtStep`/`AtTimelineItem` can be wrapped in other elements/components, items added later take their proper place.
- The step number is known already on the first render and during SSR. What to change: nothing.

#### Switch

- v-model: prop `value` → `modelValue`. Before: `<at-switch v-model="on">` with the `value` prop. After: `v-model="on"` works as before, `:value="on"` → `:model-value="on"`.
- Added the `update:modelValue` event on every click (not for `disabled`). The `change` event is kept, the argument is the new value.
- The switch state is synchronized with `modelValue` when the prop changes; the internal state is still kept on click without `v-model` (as in 1.x).

#### Table

- **The column `render` signature has changed.** Before: `render: (h, params) => VNode` — `h` was passed as the first argument, VNode in the Vue 2 format (`props`/`on`/`style` in nested objects). After: `render: (params) => VNode`, `params = { item, column, index }`; `h` is imported from `vue`, VNode in the Vue 3 format (flat props, `onXxx` listeners).

  ```js
  // before (1.x)
  render: (h, params) =>
    h(
      'AtButton',
      { props: { size: 'small' }, on: { click: () => this.$Message(params.item.name) } },
      'View',
    )
  // after (2.0)
  import { h, resolveComponent } from 'vue'
  render: ({ item }) =>
    h(
      resolveComponent('AtButton'),
      { size: 'small', onClick: () => this.$Message(item.name) },
      () => 'View',
    )
  // or with a component import: import { AtButton } from '@amazingcat/cattr-ui'; h(AtButton, {...}, () => 'View')
  ```

  What to change: in all columns with `render`, remove the first `h` argument, import `h` from `vue` and rewrite the VNode data for Vue 3 (`props: {...}` → top-level fields, `on: { click }` → `onClick`, `attrs`/`domProps` → top level, component children — as a function/slots object). `resolveComponent` works only inside render/setup, so in columns declared in `data()` it is more reliable to import the component.

- **Fix: `params.index` is the row index.** Before: due to variable shadowing in the template, `render` received the **column** index (the documentation promised the row index). After: the index of the displayed row (position in the current page/sort order, starting from 0). The original row index in `data` is still available as `params.item.index`. What to change: if the code relied on `index` as the column number — determine the column via `params.column` (for example, `params.column.key`).
- `.native` on the internal selection checkboxes has been removed (Checkbox on Vue 3 has a single root). The "select all" checkbox in fixed-height mode (`height`) no longer toggles twice per click: both headers use `@click.prevent` + `:model-value`. The `on-select-all`/`on-selection-change` events — same names and arguments.
- Fix: a row checkbox is bound to the original row index (`item.index`), not to the position in the sorted/paginated selection; previously, after sorting or on page 2+, the wrong row got checked.
- The `data` prop is watched deeply (`deep: true`): in Vue 3, `push`/`splice` on an array do not trigger a watcher without `deep`, while in 1.x the table reacted to them. On any change of `data`, the selection is rebuilt from `row.isChecked` (previously the selection state was not recreated, and when `data` grew with `optional` the table crashed).
- The `resize` listener on `window` is now removed on unmount (in 1.x the hook was written with the typo `beforeDestory` and never fired).
- `AtCheckbox` and `AtPagination` are registered locally — Table works with `app.use(AtTable)` without global registration of the other components.
- Events are declared in `emits`: `rowClick` (the native `MouseEvent` of a row click), `on-select-all`, `on-selection-change`, `on-sort-change`, `on-page-change`, `on-page-size-change`. Names are unchanged. What to change: nothing.

#### Tabs, TabPane

- v-model: prop `value` → `modelValue` (a string — the `name` of the active pane). Before: `value` was read once on creation, `input` was not emitted (v-model was one-way). After: `v-model="active"` works both ways — clicking a tab emits `update:modelValue`, an external change of `modelValue` switches the tab; `:value` → `:model-value`. An empty `modelValue` — the first pane is active (as in 1.x), but there are no more events on mount.
- `on-change` (`{ index, name }`) and `on-tab-remove` (`{ index, name }`) — names and arguments unchanged. Before: `on-change` also fired on mount (default selection of the first pane); after: only on user selection (a click or closing the active tab), not on an external change of `modelValue`. What to change: if you listened to `on-change` for synchronization — replace it with `v-model`.
- Closing a tab: as in 1.x, the pane is removed from the DOM by the **consumer** in the `on-tab-remove` handler (`tabList.splice(index, 1)`). Before: Tabs temporarily removed the item from the nav itself, but after the next update it came back if the pane had not been removed. After: the nav is built from the mounted `AtTabPane`s, the item disappears only together with the pane. If the active tab is closed, Tabs selects the next non-disabled one (otherwise the previous one) and emits `update:modelValue` + `on-change` with the index in the list without the closed pane.
- Tabs ↔ TabPane link: before `$children`/`$parent.updateNav()` (direct children only) → after, provide/inject + registration in DOM order: panes can be wrapped in other elements/components, panes added later or reordered (keyed `v-for`) take their place in the nav according to DOM order. The pane's `label`/`icon`/`disabled`/`closable` are reactive.
- An `AtTabPane` without `name` gets a name = its index in DOM order as a string (`'0'`, `'1'`, …), known already on the first render; in 1.x it was a number. An `AtTabPane` outside `AtTabs` simply shows its content.
- Closing a non-active tab that sits before an active `AtTabPane` without `name`: Tabs emits `update:modelValue` with the active pane's index name after removal (`'2'` → `'1'`), so it stays selected once the consumer removes the closed pane; `on-change` is not emitted (the active pane does not change).

#### Textarea

- v-model: the `modelValue` prop + the `update:modelValue` event instead of `value` + `input`; `change` (a string), `focus`, `blur` — names unchanged.
- Before: `input`/`change` were also emitted when the value was changed by the parent (a programmatic text change produced `change`). After: `update:modelValue` and `change` — only on user input, once each; an external `modelValue` change only updates the field (as with Input/Select/Switch).
  What to change: if `@change` was used to react to a programmatic value change — watch your own variable with `watch`.

#### Tooltip, Popover (shared popover mixin)

- Open-state `v-model`: before, the `value` prop, the component emitted only `toggle` (`v-model` worked one way); after, the `modelValue` prop + the `update:modelValue` event on every open/close (click, hover, focus, click outside), `toggle` remains.
  What to change: `v-model="open"` works as is; `:value="open"` → `:model-value="open"`, instead of `@toggle` you can use `v-model` for synchronization.
- Popover: the `title`/`content` props are still inserted as HTML (`v-html`, a decision to keep the API unchanged); escaping untrusted strings is the consumer's responsibility, or use the `#title`/`#content` slots. The `title` slot is rendered only when the `title` prop is non-empty (as in 1.x).
  What to change: before `<template slot="content">` → after `<template #content>` (Vue 3 slot syntax); everything else is unchanged.

### Services

- `Message` (`$Message`): the call API is unchanged — `Message('text')`, `Message({ message, type, icon, duration, onClose })`, `Message.info/success/warning/error/loading(...)`, `Message.close(id)`, `Message.closeAll()`, the call returns a close function.
  New: the returned function has an `id` property — `const close = Message('…'); Message.close(close.id)` (in 1.x `id` was not exposed, `close(id)` was internal).
  Import for `<script setup>`: `import { Message } from '@amazingcat/cattr-ui'`; it can also be installed separately: `app.use(Message)` (puts `$Message` into `globalProperties`).
  Before: it worked right after import. After: the service renders in the application context — call it **after** `app.use(CattrUI)` or a separate `app.use(Message)` install (for each of the four services, `install` remembers the app if `app.use(CattrUI)` has not been called yet; `app.use(CattrUI)` always overwrites it with the latest app). Before any install there is no `appContext`: the application's global components, `globalProperties` and `provide` are unavailable inside the service.
  Minor points: the `options` object is no longer mutated (previously `type`/`onClose` were written into it); `Message.close(id)` now also hides the message, not just removes it from the stack, and calls `onClose` (the second, internal argument `close(id, onClose)` is removed); `Message.closeAll()` closes all messages (previously it skipped every second one); `onClose(vm)` receives the public instance of the message component, as before.

- `Dialog` (`$Modal`): methods and signatures are unchanged — `$Modal.alert/confirm/prompt/info/success/warning/error(content, title, options)` or `(options)`, `$Modal.close()`, they return a `Promise`.
  `confirm`/`prompt`: resolve on OK (`'confirm'`; for `prompt` — `{ value, action: 'confirm' }`), reject `'cancel'` on cancel; `alert`/`info`/`success`/`warning`/`error`: resolve on any close (`'confirm'`/`'cancel'`). Import: `import { Dialog } from '@amazingcat/cattr-ui'`, separate install `app.use(Dialog)` (puts `$Modal`).
  Before: it worked after import. After: the service renders in the application context — call it **after** `app.use(CattrUI)` or `app.use(Dialog)`. `AtModal` registers `AtButton`/`AtInput` locally, so `app.use(Dialog)` (or `app.use(AtModal)`) without `app.use(CattrUI)` gives a working dialog with buttons and an input field.
  Default titles of status dialogs (object form without `title`): before, Chinese `信息/成功/警告/错误` → after, English `Info/Success/Warning/Error` (there are no `at.modal.info…` keys in the locales; to translate, pass `title`). In the string form `$Modal.info('text')` there is still no title.
  Behavioral fixes: 1) queue — before: each call immediately opened a new dialog on top of the previous one, and the promise/callback of the first could receive the answer of the second; after: dialogs are shown one at a time, the next one — after the close animation of the current one. 2) Escape, the close button and a click on the mask count as `'cancel'` (before: the promise and callback were not called at all and the queue "hung"). 3) `callback` from `options` (or as the second argument `Dialog(options, cb)`) is called as `cb(action)`, for `prompt` — `cb(value, action)`, and **together** with the promise (before: with `options.callback` the promise was not resolved, the callback received `(action, instance)`); when a `callback` is present, rejection of the promise does not produce `unhandledrejection`. 4) `$Modal.close()` closes the current one and clears the queue; promises of dialogs closed this way, as in 1.x, are not resolved.
  Options are passed to `AtModal` as props (`title`, `content`, `type`, `okText`, `cancelText`, `maskClosable`, `showClose`, `showCancelButton`, `showConfirmButton`, `showInput`, `inputValue`, `inputPlaceholder`, `width`, `styles`…); unknown keys are ignored. The `options` object is not mutated.
  What to change: callbacks of the form `(action, instance)` → `(action)` / `(value, action)`; adapt logic that expected several dialogs to be shown simultaneously to the queue.

- `LoadingBar` (`$Loading`): the call API is unchanged — `start()`, `update(percent)` (a number), `finish()`, `error()`, `config({ width })`; the single bar is created lazily on the first call and removed 800 ms after `finish()`/`error()`.
  Import for `<script setup>`: `import { LoadingBar } from '@amazingcat/cattr-ui'`; separate install: `app.use(LoadingBar)` (puts `$Loading` into `globalProperties`, remembers the app for the services if `app.use(CattrUI)` has not been called).
  Before: Vue 2 `extend`/`mount`, parameters via `data`. After: `mountService` + the `percent`, `status`, `show`, `width` props on `AtLoadingBar`.
  New: `LoadingBar.destroy()` — immediately removes the bar and stops the timers (for example, on a route change or in tests). `config({ width })` also applies to a bar that is already shown (in 1.x — only to the next one).
  Fixed: `start()` right after `finish()`/`error()` is no longer removed by the delayed hiding of the previous run. What to change: nothing.
  Fixed: `config({ width })` changes the bar height. Side effect: in 1.x `height: 4px !important` in CSS overrode the inline height, so the bar was always 4px; now, without `config()`, the documented default of 2px applies. What to change: to restore the previous look — `LoadingBar.config({ width: 4 })` at application startup.

- `Notification` (`$Notify`): calling `Notification({ title, message, type, icon, duration, showClose, onClose })`, `Notification('text')` (string = `message`), `Notification.info/success/warning/error(...)` — as before.
  Import for `<script setup>`: `import { Notification } from '@amazingcat/cattr-ui'`; separate install `app.use(Notification)` (puts `$Notify` into `globalProperties`). Call it after `app.use(CattrUI)` or `app.use(Notification)` (see `Message`).
  Before: the call returned the component instance (`vm`, with `vm.id`, `vm.handleClose()`). After: it returns a close function, like `Message`. What to change: `const n = this.$Notify(...); n.handleClose()` → `const close = this.$Notify(...); close()`; `n.id` → `close.id` (for `Notification.close(id)`).
  Added: `Notification.closeAll()` (did not exist in 1.x). `Notification.close(id)` now also hides the notification (and calls its `onClose`), not just removes it from the stack and shifts the others; `id` is a property of the returned close function.
  Before: `icon` was shown only if `type` was not one of `success/error/warning/info` (the type icon won, without `type` there was no icon at all). After: `icon` takes priority over the type icon and is shown even without `type` (as with `Message`). The default type is still empty (no icon), not `info` as stated in the 1.x documentation.
  `title`/`message` are rendered as text (`{{ }}`, in 1.x `v-text`), HTML is not interpreted — unchanged. The `options` object is not mutated; `onClose(vm)` receives the public component instance.

### Styles

- Vue 3 transition classes: before `.x-enter` / `.x-leave` (Vue 2) → after `.x-enter-from` / `.x-leave-from` for the start/end state (`-enter-active`, `-leave-active`, `-enter-to`, `-leave-to` unchanged).
  The library's animations (`fade`, `slide-up`, `move-up`, `notification-fade` in `animation.scss`) are built on `@keyframes` in `-enter-active`/`-leave-active` and did not use Vue 2 names — no changes were needed in `src/stylesheet`: modal/alert/loading-bar (`fade`), select/dropdown/submenu/tooltip/popover (`slide-up`), message (`move-up`), notification (`notification-fade`) animate as before (verified against the CSS and transition names).
  What to change: if the project has its own styles on `.at-*-enter`, `.at-*-leave` or on `.fade-enter`/`.slide-up-enter` (or its own `<transition name>`), rename them to `-enter-from`/`-leave-from`; otherwise the transition's start state will not be applied and the element will appear without animation.
- Prebuilt CSS is included in the package: `import '@amazingcat/cattr-ui/style.css'` (`dist/css/at.css`) or `@amazingcat/cattr-ui/style.min.css` (`dist/css/at.min.css`), icon fonts — `dist/css/fonts/*` (the CSS references `./fonts/…`, the bundler picks them up by itself; the `@amazingcat/cattr-ui/css/*` path is open in `exports`). There are no source maps in the package. Default theme; for a custom theme — the SCSS sources `src/stylesheet/src/index.scss` (below).
  What to change: if the theme is not overridden — replace the `…/src/stylesheet/src/index.scss` import with `@amazingcat/cattr-ui/style.css` and remove `sass` from devDependencies. Verified on Vite 8 without Sass: the CSS builds, the `feather.*` fonts are copied to `assets/`.
- Sass for the SCSS sources: `sass-embedded` is recommended (native Dart Sass, Vite picks it up by itself, the CLI is also `sass`; the library is built with it too). `sass` still works. With pnpm ≥ 10 both options run into `@parcel/watcher` (an optional dependency of `sass` with an install script → `ERR_PNPM_IGNORED_BUILDS`): with `sass-embedded`, `sass` comes in via the fallback packages `sass-embedded-all-unknown`/`sass-embedded-unknown-all` (for platforms without a native binary), and pnpm substitutes it as an optional peer of Vite.
  What to change (the project's `pnpm-workspace.yaml`):

  ```yaml
  # sass-embedded
  ignoredOptionalDependencies:
    - sass-embedded-all-unknown
    - sass-embedded-unknown-all
  # or sass
  allowBuilds:
    '@parcel/watcher': false # or ignoredOptionalDependencies: ['@parcel/watcher']
  ```

  After the change, delete `pnpm-lock.yaml` or reinstall with `--no-frozen-lockfile` (verified with pnpm 12.15, Vite 8.3.5, `sass-embedded`/`sass` 1.106.1).

- The prebuilt CSS is built with `pnpm build:style` (`src/stylesheet/css/`) and copied to `dist/css` by `pnpm build`. Autoprefixing: before `last 2 versions, ie > 8` → after, the styles package `browserslist` `last 2 versions, not dead`. Selectors and values have not changed; outdated prefixes `-webkit-box-*`, `-ms-flex*`, `-webkit-transform`/`-webkit-transition`/`-webkit-animation`, etc. are removed. Source maps (`at.css.map`, `at.min.css.map`) are now external rather than base64 inside the CSS; they are generated by `pnpm build:style` and are not included in the package.
  What to change: nothing, unless you need IE / old WebKit support; otherwise run the CSS through your own autoprefixer with your own `browserslist`.
- The style sources (`src/stylesheet/src/**`) have been moved from `@import` to Sass modules (`@use`/`@forward`, `math.div`, `color.mix`, `string.*`, `meta.*`); the build and docs run without `DEPRECATION WARNING`. `index.scss` does `@forward` of the variables (`variables/default.scss`, `variables/timing-function.scss` — all with `!default`) and the mixins, then `@use` of `core/` and `components/`. The output CSS is the same (selectors and values match).
  Before: theme variables were overridden globally before `@import`:

  ```scss
  $brand-blue-500: #ff5722;
  @import '~@amazingcat/cattr-ui/src/stylesheet/src/index.scss';
  ```

  After: module configuration at load time (verified with `sass` and `sass-embedded` 1.106.1):

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

  What to change: replace "variables + `@import`" with your own SCSS entry using `@use … with (…)` and import it instead of `index.scss`; load the configured styles once and before any other files from `src/stylesheet` (a module is configured only on its first load). In your own `.scss`/`<style lang="scss">`, the library's variables and mixins are no longer global: `@use '@amazingcat/cattr-ui/src/stylesheet/src/variables' as *;` and `@use '@amazingcat/cattr-ui/src/stylesheet/src/mixins' as *;` (or `cattr.$…` via the namespace). Each `<style lang="scss">` in an SFC is compiled separately and does not see the configuration from the entry — if the theme is also needed in your own components, move it into `_theme.scss` (`@forward '…/src/stylesheet/src/variables' with (…)` + `@forward '…/mixins'`), in the entry `@use 'theme'; @use '…/index.scss';`, in components `@use '@/styles/theme' as *;` (verified). An unknown name in `with (…)` is a compilation error. The old way (`$var: …; @import …`) still works for now, but with `DEPRECATION WARNING [import]`, and will disappear in Sass 3.
  Minor point: `core/grid.scss` no longer overwrites the global `$screen-*`/`$container-*` with its own values — after `@import index.scss`, `$screen-sm-max` is now `767px` from `default.scss` (was `991px`); the grid itself has not changed.

### Documentation and development

- Build: before webpack 3 (`build:component`, `build:locale`, `build:doc`, `prepublish`) → after `pnpm build` (Vite library mode, ESM, `vue` external; then `pnpm build:style` and copying the prebuilt CSS to `dist/css`). The `build:component`, `build:locale`, `build:doc`, `prepublish` scripts are removed; `build:package` is kept as an alias of `pnpm build` for CI. Styles: `pnpm build:style`. Requires Node ≥ 24.
- Tests: `pnpm test` (Vitest + `@vue/test-utils` 2 + happy-dom), `pnpm test:watch`.
- Linter: ESLint 10 flat config (`eslint.config.js`) + eslint-plugin-vue 10 + Prettier 3 (`.prettierrc`). Commands `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`. `.eslintrc.js` and `eslint-config-o2team` are removed.
- CI (GitHub Actions): on pull request and push to `main`/`feat/vue-3` — `install --frozen-lockfile`, `lint --max-warnings 0`, `format:check`, `test`, `build`, `build:docs`; on push to `main` — deployment of the documentation to GitHub Pages; on release creation — publishing to npm.
- Documentation: `pnpm dev` — the site dev server on Vite with HMR (`--host`, port 7200), `pnpm build:docs` — `pnpm build:style` + a static site in `dist-docs/` (hash router, `base: './'`, for GitHub Pages). Config — `vite.docs.config.js`; the site imports the library directly from `src/`, a prior `pnpm build` is not needed. Site stack: vue-router 5, vue-i18n 11 (`legacy: false`), unplugin-vue-markdown + markdown-it-container (`:::demo`), highlight.js 11; `clipboard`, `vue-markdown-loader`, yaml-loader are not used. A demo that does not compile under Vue 3 is replaced on the site with a `.demo-error` placeholder and reported to the build console (`[docs] demo does not compile …`).

## 1.x

The 1.x version history is kept in the documentation: `docs/markdown/en/changelog.md`, `docs/markdown/zh/changelog.md`.
