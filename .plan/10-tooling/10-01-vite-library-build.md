---
id: 10-01
title: Сборка библиотеки на Vite, Vue 3 в зависимостях, удаление Webpack/Babel
status: done
depends_on: [00-02, 00-03, 00-04]
parallel: false
model: opus
touches: [package.json, pnpm-lock.yaml, pnpm-workspace.yaml, vite.config.js, build/**, .babelrc, src/index.js]
---
## Цель
`pnpm build` собирает библиотеку и локали через Vite library mode. Vue 3 установлен. Webpack 3, Babel 6 и их лоадеры удалены.
Сборка docs на этом этапе **не** работает (её переносит 40-01) — это ожидаемо.

## Факты
- Сейчас: `build/component.js` (UMD `at.js`/`at.min.js`, externals vue), `build/locale.js` (UMD на каждый `src/locale/lang/*.js`: de, en-US, fa-IR, ko-KR, pt-BR, zh-CN), Webpack 3.12, Babel 6, vue-loader 12, `vue` alias на `vue/dist/vue.js`.
- `src/index.js` использует `module.exports` + `module.exports.default` — в ESM-сборке заменить на `export`. Содержимое install переписывает 20-01, здесь только синтаксис экспорта, чтобы Vite собрал.
- `pnpm-workspace.yaml`: `allowBuilds` с phantomjs/uglifyjs/es5-ext — устаревшие, вычистить вместе с зависимостями.
- `src/stylesheet` — отдельный workspace-пакет со своей sass-сборкой, не трогать.
- Потребитель на Vite → UMD не нужен. Формат: только ESM.

## Шаги
1. Зависимости. Удалить: `babel-*`, `webpack*`, `*-loader` (все), `extract-text-webpack-plugin`, `html-webpack-plugin`, `favicons-webpack-plugin`, `webpack-dashboard`, `webpack-merge`, `webpack-bundle-analyzer`, `express`, `connect-history-api-fallback`, `http-proxy-middleware`, `nodemon`, `ora`, `shelljs`, `cheerio`, `cross-env`, `json-loader`, `yaml-loader`, `vue-template-compiler`, `vue-router`, `vue-i18n` (вернутся в devDeps в 40-01), `markdown-it*`, `highlight.js`, `clipboard` (вернутся в 40-01), `postcss-url`, `resolve-url-loader`, `autoprefixer`, `eslint*` (10-02 поставит новые).
   Добавить: `vue@^3.5` в `peerDependencies` + `devDependencies`; `vite`, `@vitejs/plugin-vue`, `sass` (уже есть) в devDependencies. `deepmerge` → 4.x в dependencies. `babel-runtime` удалить.
   Версии брать актуальные: `scripts/node.sh npm view <pkg> version`.
2. `vite.config.js`: `build.lib` с `entry: { index: 'src/index.js', 'locale/de': 'src/locale/lang/de.js', ... }` (сгенерировать список из `src/locale/lang`), `formats: ['es']`, `rollupOptions.external: ['vue']`, `output.preserveModules: false`, `fileName: (format, name) => `${name}.js``. `css.preprocessorOptions.scss.api: 'modern-compiler'` на будущее.
3. `package.json`: `"type": "module"`, `"main"`/`"module"`: `dist/index.js`, `exports`: `"."`, `"./locale/*": "./dist/locale/*.js"`, `"./src/*": "./src/*"`, `"./package.json"`; `sideEffects: ["**/*.css", "**/*.scss"]`; `files: ["dist", "src"]`; `engines.node: ">=24"`; scripts: `build` (vite build), `build:style` (`pnpm --filter cattr-ui-style build`), `dev`/`build:docs` оставить заглушками с `echo "see 40-01"` чтобы CI не падал молча. Скрипт `prepublish` удалить.
4. Удалить `build/`, `.babelrc`. Обновить `.gitignore` (убрать yarn-записи, добавить `.vite/`).
5. `src/index.js`: заменить `module.exports = {...}` на именованные экспорты + `export default { install, ... }`; `if (window.Vue) install(window.Vue)` удалить. Остальная логика без изменений (20-01).
6. `pnpm install --no-frozen-lockfile`, коммит lockfile. Проверить `pnpm-workspace.yaml` → оставить только `packages: [src/stylesheet]` и реально нужные `allowBuilds`.
7. Changelog: снять `[TODO 10-01]` в разделах «Требования к окружению» и «Документация и разработка».

## Критерии приёмки
- `scripts/node.sh pnpm build` завершается без ошибок, в `dist/` есть `index.js`, `locale/en-US.js` и остальные 5 локалей.
- `dist/index.js` не содержит строки `from "vue"` иначе как внешний импорт (vue не забандлен): `grep -c "createApp\|defineComponent" dist/index.js` даёт 0 определений Vue-runtime.
- В `package.json` нет пакетов `webpack*`, `babel*`, `*-loader`.
- `scripts/node.sh pnpm build:style` собирает `src/stylesheet/css/at.css`.

## Проверка
```sh
scripts/node.sh pnpm install --no-frozen-lockfile
scripts/node.sh pnpm build
scripts/node.sh pnpm build:style
ls dist dist/locale
```

## Changelog
ESM-only, `exports`, peer `vue ^3.5`, пути локалей, удаление UMD.

## Найдено по ходу
- (из 00-02/00-03) `pnpm install --frozen-lockfile` на текущем lockfile падает: postinstall `phantomjs-prebuilt@2.1.16` требует `bzip2`, которого нет в `node:24-slim`. Решено на уровне образа: `scripts/node.Dockerfile` содержит bzip2 и toolchain, полный `pnpm install` проходит. Сама зависимость всё равно уходит в этой задаче.

## Заметки агента
Ожидаемо: после этой задачи `src` не работает в рантайме Vue 3 (Vue.extend, $children и т.д.). Задача только про сборку.
- Версии: vue 3.5.44 (peer `^3.5.0`), vite 8.3.5 (rolldown 1.2.15), @vitejs/plugin-vue 6.0.10, sass 1.106.1, deepmerge 4.3.1. Lockfile: +705/−8235 строк.
- dist: `index.js` 134.6 kB (gzip 32.3 kB, не минифицирован), `locale/*.js` 0.5 kB ×6, всего 164K. `index.js` импортирует `./locale/en-US.js` (дефолтная локаль) и `vue`; deepmerge забандлен (external только `vue`) — при желании вынести `dependencies` в external.
- `allowBuilds`: остался только `@parcel/watcher` (опц. зависимость sass, без него `ERR_PNPM_IGNORED_BUILDS`). В `node.sh` стоит `CI=1` → для смены lockfile нужен `pnpm install --no-frozen-lockfile`.
- Отклонения: `build:package` оставлен алиасом `pnpm build` — его вызывает `.github/workflows/npm-publish.yml` (50-02). `dev`/`build:docs` — заглушки с `exit 1` (deploy-docs иначе выложил бы dist библиотеки). Скрипт `lint` удалён вместе с eslint 4 (вернёт 10-02); `.eslintrc.js` и `eslint-config-o2team` в `src/stylesheet/package.json` не тронуты (10-02).
- Правка компонента для сборки: `table.vue` — `:key` перенесён с `<tr>` на `<template v-for>` (единственная ошибка компилятора Vue 3 по всем SFC).
- `require('../utils/NodeList.js')` в `src/mixins/popover.js` rolldown превратил в ленивый init — сборка/ESM корректны, правка не нужна (20-04 может заменить на import).
- 20-01: импорт dist в node падает `SyntaxError: The requested module 'vue' does not provide an export named 'default'` — `import Vue from 'vue'` в locale/index.js, loading-bar.js, notic.js, dialog.js, message.js. Сейчас именованные экспорты — `Button`, … (не `At*`), `locale` экспортирован как `use`. deepmerge 4: опция `clone` устарела.
- 40-01/40-02: docs/markdown/{en,zh}/{installation,quickstart}.md и zh/introduction.md описывают webpack/UMD.
