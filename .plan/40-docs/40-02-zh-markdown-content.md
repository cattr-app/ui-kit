---
id: 40-02-zh
title: Обновить примеры в markdown под Vue 3 API (zh)
status: done
depends_on: [40-01, 30-w4-table]
parallel: false
model: opus  # переопределено при ревью 40-01: правка демо требует решений (битый HTML, render-примеры table, menu.md), не механика
touches: [docs/markdown/zh/**]
---
## Цель
Все демо на сайте документации работают и показывают актуальный API. Эта подзадача покрывает только `docs/markdown/zh/**`; парная подзадача делает другой язык параллельно. Содержание правок должно совпадать между языками: правь код демо одинаково, меняй только текст описания на своём языке.

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

- (из 40-02-zh) `app.use(Dialog)` без `app.use(CattrUI)` не работает: `Dialog.install` (`src/components/modal/src/dialog.js:218`) только кладёт `$Modal` в `globalProperties` и не вызывает `setCurrentApp`, а `modal.vue` использует глобальные `<at-button>`/`<at-input>` (локальных импортов нет, `src/components/modal/src/modal.vue:63`) — у `mountService` нет `appContext`, кнопки не резолвятся. То же для `Message/Notification/LoadingBar.install` (там некритично: `<at-*>` не используются). В quickstart.md (zh) добавлено предупреждение; починка — 50-01 или отдельная задача.
- (из 40-02-zh) `docs/markdown/zh/menu.md` содержит раздел «每次只展开一个子菜单» дважды (стр. ~144 и ~238, в en — один раз). Унаследовано, оставлено как есть.

## Заметки агента
- Демо приведены к варианту en (сверено по коммиту `docs(en)`: структура тегов во всех `:::demo` совпадает, кроме унаследованного дубля в menu.md). Описательный текст — на китайском.
- Переписаны installation/quickstart/i18n/introduction (ESM, `createApp().use(CattrUI, { locale, i18n })`, стили из `src/stylesheet/src/index.scss`, локали `@amazingcat/cattr-ui/locale/<lang>`, оговорка про `i18n.global.t`/`te`); CDN/UMD и `cattr-ui-style` убраны. changelog.md: раздел «2.0.0（Vue 3）» со ссылкой на `blob/main/CHANGELOG.md` (файла пока нет — появится в 50-03).
- Таблицы props/events/slots сверены с `props`/`emits` компонентов: `value`→`modelValue`, добавлены `update:*`, Pagination `update:current/update:pageSize`, `toggle` у Tooltip/Popover/Dropdown, `$Modal` опции/титулы/`callback`, Notification тип по умолчанию пустой и `closeAll`, Tabs без `unclosable`, имена `'0','1'`, Table: колонки, `on-sort-change`, `rowClick`, слот `emptyText`.
- Проверка: временный vitest-спек (не закоммичен) монтирует все 40 `zh/*.md` с memory-router, vue-i18n и CattrUI, ловит `console.warn/error`, `warnHandler`, `errorHandler`, `.demo-error`, плюс прокликивает кнопки/вкладки/переключатели/модалки — 0 предупреждений (на исходных файлах тот же спек ловит collapse/dropdown/table).
- `build:docs`: для `zh/` ни одного `does not compile`. Обход `\v` в `vite.docs.config.js` не трогал (в zh символа больше нет).
- Замечание к демо (как в en): `:model-value="[0, 1]"` в collapse.md — новый массив на каждый ре-рендер страницы, после клика в демо с `v-model="value"` первое демо сбрасывается в исходное состояние. Не баг библиотеки, но лучше перейти на `v-model` с данными в обоих языках.
