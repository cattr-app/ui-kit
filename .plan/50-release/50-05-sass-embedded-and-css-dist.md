---
id: 50-05
title: sass-embedded вместо sass; собранный CSS в пакете
status: in-progress
depends_on: [50-03]
parallel: true
model: opus
touches: [package.json, src/stylesheet/package.json, pnpm-workspace.yaml, pnpm-lock.yaml, vite.config.js, vite.docs.config.js, scripts/**, README.md, CHANGELOG.md, docs/markdown/*/installation.md, docs/markdown/*/quickstart.md, .github/workflows/ci.yml]
---
## Цель
1. Потребитель и сама библиотека не упираются в `ERR_PNPM_IGNORED_BUILDS` из-за `@parcel/watcher` (optional dep `sass`): библиотека использует `sass-embedded`, запись `allowBuilds` в `pnpm-workspace.yaml` не нужна.
2. В пакете есть готовый CSS: потребитель без кастомизации темы подключает `@amazingcat/cattr-ui/style.css` и не ставит sass вовсе.

## Факты (проверено 2026-10-24 в контейнере, pnpm 12.15)
- `sass` → optional `@parcel/watcher` с install-скриптом → pnpm 12 падает и в CI, и локально без `allowBuilds`.
- `sass-embedded@1.106.1` ставится без build-скриптов (платформенные бинарники в optional-пакетах `sass-embedded-<platform>` без scripts), `compileString` работает, Vite использует его автоматически, если установлен; CLI тоже называется `sass`.
- Сборка стилей: `src/stylesheet/package.json` → `build:scss`/`build:scss-minify`/`start` через CLI `sass`, выход `src/stylesheet/css/{at.css,at.min.css,*.map,fonts/}`; `css/` не публикуется (`files` корня). Шрифты в css ссылаются относительно `fonts/`.
- `vite.config.js`: `build.emptyOutDir: true` — очищает `dist/` при `vite build`.

## Шаги
1. Замена: в корне и в `src/stylesheet/package.json` `sass` → `sass-embedded` той же версии; `pnpm install --no-frozen-lockfile`; убрать `allowBuilds` из `pnpm-workspace.yaml` (оставить только `packages`); убедиться, что `pnpm install --frozen-lockfile` без предупреждений/ошибок про build-скрипты; `pnpm build:style`, `pnpm build:docs`, `pnpm test` зелёные (vitest.config наследует vite-конфиг: scss компилируется через sass-embedded).
2. CSS в пакете: `pnpm build` должен производить `dist/index.js`, `dist/locale/*.js` и `dist/css/at.css`, `dist/css/at.min.css`, `dist/css/fonts/*` (без `.map` или с — решить, лучше без). Реализация: `build: vite build && pnpm build:style && node scripts/copy-css.mjs` (копирование `src/stylesheet/css/{at.css,at.min.css,fonts}` в `dist/css`) ИЛИ вывод сборки стилей сразу в `../../dist/css` с порядком «vite build, затем стили». Проверить, что `@font-face` в `dist/css/at.css` резолвится в `dist/css/fonts/`.
3. `package.json` `exports`: `"./style.css": "./dist/css/at.css"`, `"./style.min.css": "./dist/css/at.min.css"`, `"./css/*": "./dist/css/*"` (для шрифтов). `files` уже включает `dist`. `sideEffects` уже покрывает `*.css`.
4. Документация: README (раздел «Подключение» — два варианта: готовый CSS `import '@amazingcat/cattr-ui/style.css'` без sass; SCSS с `@use … with` для темы — требует `sass-embedded` или `sass`), `docs/markdown/{en,zh}/installation.md` и `quickstart.md` (то же), `CHANGELOG.md` → «Стили» (готовый CSS снова в пакете, путь; рекомендация `sass-embedded`; в чеклисте миграции п.1 и п.10 — упомянуть `sass-embedded` и `allowBuilds`/`ignoredOptionalDependencies` как альтернативу для тех, кто остаётся на `sass`).
5. Проверка потребления: временный проект в контейнере (как в 50-03) с tarball: вариант A — только `import '@amazingcat/cattr-ui/style.css'` без sass в devDependencies → `vite build` проходит, в CSS есть `.at-btn` и `@font-face` с путём на `fonts/`; вариант B — `sass-embedded` + `@use … with` → работает, цвет переопределён. `pnpm install` в обоих без `ERR_PNPM_IGNORED_BUILDS`.
6. CI: в `.github/workflows/ci.yml` шаг `Build library` уже вызывает `pnpm build` — убедиться, что он теперь покрывает и стили; шаг `Build documentation` оставить. Параллельная задача 50-06 правит в `ci.yml` только блок тестов/покрытия — не трогай его.

## Критерии приёмки
- `grep -n "allowBuilds\|parcel" pnpm-workspace.yaml` пусто; `grep -n '"sass"' package.json src/stylesheet/package.json` пусто (есть `sass-embedded`).
- `pnpm install --frozen-lockfile` без строки `Ignored build scripts`.
- `pnpm build` → `ls dist/css` содержит `at.css at.min.css fonts`; `pnpm pack` содержит `package/dist/css/**`.
- Все проверки: `lint --max-warnings 0`, `format:check`, `test`, `build`, `build:docs` зелёные; внешний проект (A и B) собирается.

## Проверка
```sh
scripts/node.sh pnpm install --frozen-lockfile
scripts/node.sh pnpm build && ls dist/css dist/css/fonts | head
scripts/node.sh sh -c "pnpm pack --pack-destination /tmp && tar tzf /tmp/amazingcat-cattr-ui-2.0.0.tgz | grep dist/css | head"
scripts/node.sh pnpm lint --max-warnings 0 && scripts/node.sh pnpm format:check && scripts/node.sh pnpm test && scripts/node.sh pnpm build:docs
```

## Changelog
«Стили»: готовый CSS в пакете; `sass-embedded`.

## Найдено по ходу

## Заметки агента
