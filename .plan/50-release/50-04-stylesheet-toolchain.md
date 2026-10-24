---
id: 50-04-stylesheet-toolchain
title: cattr-ui-style — мажоры postcss/autoprefixer и Sass-модули вместо @import
status: todo
depends_on: [50-01]
parallel: false
model: opus
touches: [src/stylesheet/package.json, src/stylesheet/postcss.json, src/stylesheet/src/**, pnpm-lock.yaml, vite.docs.config.js]
---
## Цель
Сборка стилей на актуальных инструментах, без предупреждений Dart Sass о будущем удалении.

## Факты (50-01, 2026-10-24)
- `pnpm -r outdated`: в `src/stylesheet/package.json` только мажорные отставания — `autoprefixer` 7.2.6 → 10.x, `postcss-cli` 4.1.1 → 12.x, `rimraf` 2.7.1 → 6.x, `copyfiles` 1.2.0 → 2.x (minor/patch подняты в 50-01, корень актуален).
- `depcheck` в `src/stylesheet` считает `autoprefixer` неиспользуемым — ложное срабатывание (`postcss --use autoprefixer` в scripts).
- `pnpm build:docs` выводит десятки `DEPRECATION WARNING` Dart Sass: `[import]` (`@import` удаляется в Sass 3), `[global-builtin]`, `[slash-div]`.

## Шаги
1. Поднять мажоры (или заменить `rimraf`/`copyfiles` на `node:fs`/`sass` CLI, а `postcss-cli` + `autoprefixer` — на `browserslist` в Vite для docs и отдельный скрипт для `css/at.css`), проверить, что `css/at.css` не изменился по смыслу (diff до/после).
2. Перевести `src/stylesheet/src/**` на `@use`/`@forward` (`sass-migrator module`), `math.div` вместо `/`, `color.*`/`math.*` вместо глобальных функций. Публичные переменные `variables/default.scss` должны остаться переопределяемыми (`@use … with (…)`) — описать в `CHANGELOG-MIGRATION.md` → «Стили», как теперь переопределять тему.
3. Обновить docs (`quickstart.md` en/zh, раздел «Customize Theme»).

## Критерии приёмки
- `pnpm build:style`, `pnpm build:docs` без `DEPRECATION WARNING`; `pnpm -r outdated` пуст или только с обоснованными исключениями.

## Найдено по ходу

## Заметки агента
