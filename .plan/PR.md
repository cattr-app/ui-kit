# feat: Cattr UI 2.0.0 — Vue 3, Vite, ESM

`feat/vue-3 → main`

Библиотека `@amazingcat/cattr-ui` переведена с Vue 2 (`^2.5`) и webpack 3 на Vue 3.5 и Vite 8 (library mode, ESM). Версия пакета — 2.0.0, обратная совместимость с 1.x не сохраняется.

- Все 43 компонента и 4 сервиса (`$Message`, `$Modal`, `$Notify`, `$Loading`) переписаны под Vue 3: `modelValue`/`update:modelValue`, `emits`, provide/inject вместо `$parent`/`$children`/`dispatch`, сервисы монтируются в контексте приложения.
- Сборка: Vite library mode, `dist/index.js` (127.4 kB, gzip 30.5 kB) + 6 локалей `dist/locale/*.js`; UMD удалён. Стили — SCSS на модулях Sass (`@use … with`), тема настраивается без `@import`.
- Инструменты: ESLint 10 flat config + eslint-plugin-vue 10, Prettier 3, Vitest 5 — 42 файла, 213 тестов; `pnpm lint --max-warnings 0` — 0 ошибок / 0 предупреждений.
- Документация: сайт на Vite + vue-router 5 + vue-i18n 11, деплой на GitHub Pages; CI на GitHub Actions (lint, format, test, build, build:docs).
- Миграция выполнена по плану из 51 задачи (`.plan/`), каждое ломающее изменение описано в `CHANGELOG.md` в формате «Было → Стало → Что править».
- В пакете есть готовый CSS (`@amazingcat/cattr-ui/style.css`, шрифты в `dist/css/fonts`), библиотека собирает стили через `sass-embedded`; CI прогоняет тесты с покрытием (строки 82.9%, пороги 80/70/78/80), пишет summary, выгружает отчёт артефактом и комментирует PR.
- Пакет проверен во внешнем Vite-проекте, установленном из tarball: `vite build`, импорт `@amazingcat/cattr-ui` и `/locale/de` в Node, SSR-рендер `<at-button>`/`<at-select>`, тема через `@use … with`.

## Ломающие изменения

Полный список с чеклистом миграции — [`CHANGELOG.md`](../CHANGELOG.md). Главное:

1. Peer dependency `vue ^3.5`; пакет только ESM (`exports`), UMD `dist/at.js` и глобальная `at` удалены; локали — `@amazingcat/cattr-ui/locale/<lang>`.
2. Подключение: `Vue.use(CattrUI)` → `createApp(App).use(CattrUI, { locale, i18n })`; именованные экспорты `At*` (`AtButton`, …), default export — только `{ install, version }`.
3. `v-model` везде через `modelValue` + `update:modelValue`: `:value`/`@input` → `:model-value`/`@update:model-value`.
4. `.native` и `slot="…"` больше не работают: `@click.native` → `@click`, `slot="menu"` → `<template #menu>`.
5. Колонки Table: `render: (h, params)` → `render: ({ item, column, index })`, VNode в формате Vue 3, `index` — индекс строки.
6. Сервисы: вызывать после `app.use(CattrUI)`; `$Notify` возвращает функцию закрытия; `$Modal` — очередь диалогов, отмена Escape/крестиком/маской даёт `'cancel'`, OK больше не вызывает `on-cancel`.
7. События `on-change` (Select, Rate, Tabs, Textarea, RadioGroup) срабатывают только на действия пользователя, не на программную смену значения.
8. Стили: `$var; @import index.scss` → `@use '…/src/stylesheet/src/index.scss' with (…)`; классы переходов `-enter`/`-leave` → `-enter-from`/`-leave-from`; `AtForm`/`AtFormItem` удалены.

## Как проверить

```sh
scripts/node.sh pnpm install --frozen-lockfile
scripts/node.sh pnpm lint --max-warnings 0
scripts/node.sh pnpm format:check
scripts/node.sh pnpm test
scripts/node.sh pnpm build
scripts/node.sh pnpm build:docs
scripts/node.sh sh -c "pnpm pack --pack-destination /tmp && tar tzf /tmp/amazingcat-cattr-ui-2.0.0.tgz | sort"
CATTR_UI_DOCKER_ARGS="-p 7200:7200" scripts/node.sh pnpm dev   # сайт документации: http://localhost:7200/
```

## Что дальше

- Миграция `cattr-app/frontend-application` на Vue 3 + Vite по чеклисту из `CHANGELOG.md` (раздел «Чеклист миграции проекта», команды grep для поиска мест правки).
- Публикация 2.0.0: GitHub release → workflow `npm-publish.yml` (`npm version from-git` берёт версию из тега, тег release — `v2.0.0`).
- Решить судьбу `.plan/`: перенести в `docs/migration/` как историю миграции или удалить отдельным коммитом после мержа `feat/vue-3` в `main`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
