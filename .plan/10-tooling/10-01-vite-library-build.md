---
id: 10-01
title: Сборка библиотеки на Vite, Vue 3 в зависимостях, удаление Webpack/Babel
status: todo
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
6. `pnpm install` (не frozen), коммит lockfile. Проверить `pnpm-workspace.yaml` → оставить только `packages: [src/stylesheet]` и реально нужные `allowBuilds`.
7. Changelog: снять `[TODO 10-01]` в разделах «Требования к окружению» и «Документация и разработка».

## Критерии приёмки
- `scripts/node.sh pnpm build` завершается без ошибок, в `dist/` есть `index.js`, `locale/en-US.js` и остальные 5 локалей.
- `dist/index.js` не содержит строки `from "vue"` иначе как внешний импорт (vue не забандлен): `grep -c "createApp\|defineComponent" dist/index.js` даёт 0 определений Vue-runtime.
- В `package.json` нет пакетов `webpack*`, `babel*`, `*-loader`.
- `scripts/node.sh pnpm build:style` собирает `src/stylesheet/css/at.css`.

## Проверка
```sh
scripts/node.sh pnpm install
scripts/node.sh pnpm build
scripts/node.sh pnpm build:style
ls dist dist/locale
```

## Changelog
ESM-only, `exports`, peer `vue ^3.5`, пути локалей, удаление UMD.

## Найдено по ходу
- (из 00-02/00-03) `pnpm install --frozen-lockfile` на текущем lockfile падает: postinstall `phantomjs-prebuilt@2.1.16` требует `bzip2`, которого нет в `node:24-slim`. Уходит вместе с удалением старых devDependencies в этой задаче; отдельно чинить не нужно. До этого baseline-сборку проверять с `--ignore-scripts`.

## Заметки агента
Ожидаемо: после этой задачи `src` не работает в рантайме Vue 3 (Vue.extend, $children и т.д.). Задача только про сборку.
