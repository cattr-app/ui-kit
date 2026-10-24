---
id: 50-04-stylesheet-toolchain
title: cattr-ui-style — мажоры postcss/autoprefixer и Sass-модули вместо @import
status: done
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
- `docs/assets/style/docs.scss`, `docs/assets/style/index.scss` (строки 1–2) и `docs/components/header.vue:111` ещё `@import`-ят `src/stylesheet/src/{variables,mixins}/index.scss` → 17 `DEPRECATION WARNING [import]` в `pnpm build:docs`. Файлы были закрыты для этой задачи (параллельные правки). Исправление: `@import '…/variables/index.scss'` → `@use '…/variables' as *`, `@import '…/mixins/index.scss'` → `@use '…/mixins' as *` (проверено компиляцией).

## Заметки агента
- Версии: postcss-cli 12.0.0, autoprefixer 10.6.1, postcss 8.5.31 (явный peer postcss-cli), sass 1.106.1, sass-migrator 2.6.1 (через `pnpm dlx`, в зависимости не добавлен). `rimraf`/`copyfiles` → `src/stylesheet/scripts/clean.mjs` (`node:fs`), `postcss.json` → `postcss.config.mjs`, `browserslist: last 2 versions, not dead` в package.json пакета. `pnpm -r outdated` пуст.
- `css/at.css`: декларации и селекторы без вендорных префиксов совпадают 1:1 (сравнение через postcss: 3721 деклараций до/после, до и после миграции на модули). Отличия: убраны префиксы под IE/старый WebKit (`-webkit-box-*`, `-ms-flex*`, `-webkit-transform/transition/animation`, `@-webkit-keyframes`), убраны многократные дубли doc-комментариев variables/mixins (их выводил каждый `@import`), карта исходников внешняя вместо base64 → at.css 429 → 163 КБ, at.min.css 214 → 123 КБ.
- sass-migrator падал на `core/grid.scss` (переобъявлял `$screen-*`/`$container-*` из default.scss); grid сделан самодостаточным (локальные переменные, порядок объявлений изменён, значения те же). Вывод мигратора (namespace `default.`, `tint.` и т.д.) переделан на `@use '../variables' as *` / `@use '../mixins' as *`, `variables/index.scss` и `mixins/index.scss` — `@forward`.
- Тема: `@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' as cattr with ($brand-blue-500: #ff5722, …)` — проверено `sass` (load-path на пакет); для SFC — partial `_theme.scss` с `@forward '…/variables' with (…)`. Описано в CHANGELOG-MIGRATION «Стили» и quickstart en/zh. Через Vite-резолвер потребителя не проверялось (только sass CLI).
- `pnpm build:style` — 0 deprecation; `pnpm build:docs` — 17, все из закрытых для задачи файлов (см. «Найдено по ходу»), подавление в `vite.docs.config.js` убрано.
- `docs/views/*.vue`, `docs/components/{footer,sidebar}.vue` переведены на `@use` (вне `touches`, нужно для критерия).
