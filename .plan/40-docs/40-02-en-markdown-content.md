---
id: 40-02-en
title: Обновить примеры в markdown под Vue 3 API (en)
status: done
depends_on: [40-01, 30-w4-table]
parallel: false
model: opus  # переопределено при ревью 40-01: правка демо требует решений (битый HTML, render-примеры table, menu.md), не механика
touches: [docs/markdown/en/**]
---
## Цель
Все демо на сайте документации работают и показывают актуальный API. Эта подзадача покрывает только `docs/markdown/en/**`; парная подзадача делает другой язык параллельно. Содержание правок должно совпадать между языками: правь код демо одинаково, меняй только текст описания на своём языке.

## Факты
- `slot="..."` — 26 файлов, 170 вхождений → `#name` / `v-slot:name` (на `<template>`).
- `new Vue` — 4 файла (installation, quickstart, i18n, changelog?) → `createApp`.
- `Vue.` — 13 файлов, 27 вхождений (`Vue.use`, `Vue.prototype`) → `app.use`, `app.config.globalProperties`.
- `render: (h, params)` в `table.md` (en/zh по ~5 примеров) → новая сигнатура из 30-w4-table.
- `$Modal.*`, `$Message`, `$Notify`, `$Loading` — вызовы валидны, проверить только изменившиеся дефолты (титулы статусных диалогов, см. changelog 30-w3-modal).
- `v-model` работает как есть; примеры с `:value`/`@input` (если есть) → `:model-value`/`@update:model-value`.
- `.native` в markdown нет. `i18n.md` описывает `Vue.locale`/vue-i18n 5 — переписать по changelog 20-01.
- `changelog.md` в docs — оставить историю 1.x, добавить раздел 2.0 со ссылкой на `CHANGELOG-MIGRATION.md` (к релизу 50-03 он станет `CHANGELOG.md`).

## Шаги
1. Массовые замены скриптом (`sed`/node) по шаблонам из фактов, затем ручная проверка diff каждого файла.
2. Прогнать `pnpm dev`, открыть каждую страницу компонента, убедиться, что демо рендерятся и консоль без ошибок/warning'ов Vue. Список страниц — `docs/router/nav.config.js`.
3. `installation.md`, `quickstart.md`, `i18n.md` переписать по разделу «Подключение» changelog.

## Критерии приёмки
- `grep -rn 'slot="\|new Vue\|Vue\.use\|Vue\.prototype\|render: (h' docs/markdown` пусто.
- `scripts/node.sh pnpm build:docs` без ошибок; в браузере (или через vitest + happy-dom рендер markdown-компонентов, если проще автоматизировать) нет `[Vue warn]`.

## Проверка
```sh
grep -rn 'slot="\|new Vue\|Vue\.use\|Vue\.prototype\|render: (h' docs/markdown && exit 1 || true
scripts/node.sh pnpm build:docs
```

## Changelog
нет (документация).

## Найдено по ходу
- (из 00-04) `installation.md` и `introduction.md` (en/zh) ссылаются на UMD `dist/at.min.js` через CDN и на пакет стилей `cattr-ui-style`, который приватный. Переписать на ESM-импорт и `@amazingcat/cattr-ui/src/stylesheet/src/index.scss`.
- (из 00-04) В `docs/components/header.vue` используются `docs/assets/logo-at*.svg|png` — логотипа Cattr в репозитории нет. Либо добавить логотип Cattr (взять из фронтенда), либо оставить текстовый заголовок.
- (из 40-01) Не компилируются в Vue 3 (на сайте плашка `.demo-error`, в консоли сборки `[docs] demo does not compile`): `dropdown.md` en/zh — 3 демо (стр. 40, 67, 85: `<i class="icon …">` без `</i>` внутри `<at-button>`), `collapse.md` en:68 / zh:69 — незакрытые теги. Раньше их чинил cheerio в webpack-пайплайне.
- (из 40-01) Падают в рантайме: `table.md` en/zh — `render: (h, params) => …` (`h is not a function`, в Vue 3 `h` импортируется из `vue`). `color.md` en/zh:25 — символ `\v` перед `class` (сейчас заменяется на пробел в `transforms.before` в `vite.docs.config.js`; после правки контента можно убрать).
- (из 40-01) Молча ломаются (`slot="…"` в Vue 3 — обычный атрибут, контент уходит в default-слот): card, collapse, dropdown, input, menu, modal, popover, switch, tabs, timeline, tooltip (en и zh), а также в тексте changelog. `new Vue`/`Vue.use`/`Vue.prototype` в примерах кода (не живых демо): installation, i18n, introduction, quickstart, message, modal, notification, loadingbar.
- (из 40-02-en, для 50-01) `src/components/rate/src/rate.vue:69-72` + `:110-111`: при `v-model` клик эмитит `on-change` дважды — сам `confirmValue` и затем watcher `modelValue` (он эмитит `on-change` и на любое внешнее изменение). Документация en описывает `on-change` как «callback when select value».
- (из 40-02-en, для 50-01) `src/components/textarea/src/textarea.vue:75-81`: watcher `store` эмитит `update:modelValue` и `change` и при изменении `modelValue` родителем (программная смена значения даёт `change`), в отличие от Input/Select/Switch.
- (из 40-02-en) `Message.close(id)` / `Notification.close(id)` описаны в changelog как публичные, но `id` наружу не отдаётся (вызов возвращает только функцию закрытия) — в docs en задокументированы возвращаемая функция и `closeAll()`, `close(id)` не упомянут. Решить в 50-01: убрать из changelog или вернуть `id`.
- (из 40-02-en) Ссылка в docs `changelog.md` (раздел 2.0.0) ведёт на `https://github.com/cattr-app/ui-kit/blob/main/CHANGELOG.md` — файл появится только в 50-03 (переименование `CHANGELOG-MIGRATION.md`).

## Заметки агента
- Все `docs/markdown/en/*.md` приведены к Vue 3: `slot="x"` → `<template #x>` (элемент со slot обёрнут в template), `:value` на v-model-компонентах → `:model-value` (collapse, switch, menu, rate, tabs), table: 5 колонок `render: ({ item }) => h(AtButton, {…, onClick}, () => '…')` с `import { h } from 'vue'` + `import { AtButton } from '@amazingcat/cattr-ui'` в демо и в скрипте страницы.
- Битый HTML исправлен: dropdown (3× `<i>` без `</i>`), collapse (3× `<i>` в `#title`), switch (`</at-switch size="large">`), color.md:25 — убран `\v`. Обход `[\v\f]` в `vite.docs.config.js` НЕ удалён: zh/color.md:25 на момент работы ещё содержит `\v` — убрать после мержа обоих языков (40-03).
- Переписаны installation/quickstart/i18n/introduction по «Подключению» changelog (ESM, `createApp().use(CattrUI, { locale, i18n })`, SCSS из пакета, `@amazingcat/cattr-ui/locale/<lang>`, `i18n.global.t` + оговорка про `te`); CDN/UMD/`cattr-ui-style` убраны. `changelog.md`: раздел 2.0.0, русская строка про upstream переведена на английский.
- Таблицы API сверены с `props`/`emits`: modelValue/update:modelValue (input, inputnumber, textarea, checkbox(+group props), radio(+button), select(+Option/OptionGroup), switch, slider, rate, modal, tabs, collapse, dropdown, tooltip, popover), pagination `update:current`/`update:pageSize`, table `on-sort-change`/`rowClick` + таблица опций колонки, tabs (`unclosable` → `:closable`, name String, имя по умолчанию `'0'…`), menu (`#title`, слоты Submenu), modal (`$Modal` опции, промисы, очередь, `callback`, титулы Info/Success/Warning/Error, валидный JS prompt), message/notification (мс, тип по умолчанию пустой, иконка, closeAll, функция закрытия), loadingbar (`update(percent)`, `destroy`).
- Демо-код намеренно оставлен близким к оригиналу (popover `@toggle`, menu `watch`, switch `changeStatus`), чтобы en/zh совпадали; новых демо не добавлено.
- Проверка: временный vitest-спек (mount всех en-страниц с router/i18n/CattrUI + клик по кнопкам/вкладкам/пунктам меню и т.п., падает на `console.warn/error`, Vue warn/errorHandler и `.demo-error`) — 40/40, 0 предупреждений; спек не закоммичен. `build:docs` — ошибки компиляции только в zh. lint, test (199) зелёные.

