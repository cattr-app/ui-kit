---
id: 40-02
title: Обновить примеры в markdown под Vue 3 API
status: todo
depends_on: [40-01, 30-w4-table]
parallel: false
touches: [docs/markdown/en/**, docs/markdown/zh/**]
---
## Цель
Все демо на сайте документации работают и показывают актуальный API. Один агент на язык допустим (en и zh параллельно, файлы не пересекаются) — тогда создать две подзадачи `40-02-en`, `40-02-zh` копированием этого файла.

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

## Заметки агента
