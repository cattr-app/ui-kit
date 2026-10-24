---
id: 40-01
title: Сайт документации на Vite: vue-router 5, vue-i18n 11, unplugin-vue-markdown, demobox
status: todo
depends_on: [10-03]
parallel: false
model: opus
touches: [docs/**, vite.docs.config.js, package.json, pnpm-lock.yaml]
---
## Цель
`pnpm dev` поднимает docs на Vite с HMR, `pnpm build:docs` собирает статический сайт в `dist-docs/` (или `dist/docs`) для GitHub Pages. Контент markdown на этом этапе не правится (40-02), поэтому часть демо будет сломана — допустимо, но сайт должен открываться и показывать страницы.
Задачу можно начинать после 10-03, но завершить (критерии) — только когда все 30-* `done`, иначе демо не рендерятся.

## Факты
- Сейчас: `docs/main.js` (`new Vue`, `Vue.use(VueI18n)`, `AtUI.i18n((key, value) => i18n.t(key, value))`), `docs/router/index.js` (vue-router 2: `require()` компонентов, `path: '*'`, `scrollBehavior` с `selector`, `root`), `nav.config.yml` через `json-loader!yaml-loader`, markdown через `vue-markdown-loader` с контейнером `:::demo` → `<demo-box><div slot="demo">…</div><div slot="source-code">…</div></demo-box>` (`build/webpack.base.conf.js`), `demobox.vue` читает `$slots['source-code'][0].elm.innerText`, `header.vue` хук `destroyed`, `docs/utils/nodelist.js` и `collapse-transition.js` — копии Vue 2 утилит, `docs/directives/clipboard.js` (директива Vue 2 на `clipboard`), highlight.js 9.
- Alias'ы `at-ui-lib`, `at-ui-locale-*`, `at-ui-style`, `vue` → `vue/dist/vue.js` — заменить на прямые импорты `../src/index.js`, `../src/locale/lang/*.js`, `../src/stylesheet/src/index.scss`.
- GitHub Pages: workflow публикует `dist`. Роутер hash-режим → `base: './'` достаточно.

## Шаги
1. devDependencies: `vue-router`, `vue-i18n`, `unplugin-vue-markdown`, `markdown-it-container`, `highlight.js`, `clipboard` (или заменить на `navigator.clipboard` и убрать зависимость), `js-yaml` не нужен — конвертировать `nav.config.yml` в `nav.config.js` (ESM export).
2. `vite.docs.config.js`: `root: 'docs'`, `base: './'`, plugins `vue({ include: [/\.vue$/, /\.md$/] })`, `Markdown({ markdownItSetup(md) { md.use(container, 'demo', {...}) }, wrapperComponent: null })`. Контейнер demo рендерит `<demo-box><template #demo>…</template><template #source-code>…</template></demo-box>`; подсветка через `highlight.js` 11 в `markdownItOptions.highlight`. Сохранить замену `table_open` на `<table class="table">` и класс `hljs` на `code` (см. `build/utils.js` до удаления — он уже удалён в 10-01, взять из git: `git show 0a49667:build/utils.js`).
3. `docs/main.js`: `createApp(App).use(router).use(i18n).use(CattrUI, { i18n: (k, v) => i18n.global.t(k, v) })`, `createI18n({ legacy: false, locale, fallbackLocale: 'en', messages })`. Регистрация `demo-box`, `icon-list`, директива clipboard (хуки Vue 3).
4. `docs/router/index.js`: `createRouter({ history: createWebHashHistory(), routes, scrollBehavior })`; `import.meta.glob('../markdown/**/*.md')` и `../views/*.vue` вместо `require`; `path: '/:pathMatch(.*)*'` вместо `*`; `scrollBehavior` возвращает `{ el: to.hash }` / `{ top: 0 }`.
5. `demobox.vue`: источник кода брать через `ref` на контейнер (`this.$refs.source.innerText`) вместо `$slots[...][0].elm`. `header.vue`: `unmounted`, `this.$i18n.locale` → `i18n.global.locale.value` или `useI18n().locale`. `docs/utils/nodelist.js`, `docs/utils/collapse-transition.js` — удалить, если не используются после правки (`grep -rn nodelist docs`), иначе заменить на импорт из `src`.
6. `docs/index.html` → корень Vite: `<script type="module" src="/main.js">`, убрать webpack-плейсхолдеры.
7. Scripts: `dev: vite --config vite.docs.config.js --host`, `build:docs: pnpm build && pnpm build:style && vite build --config vite.docs.config.js --outDir ../dist-docs`. Обновить `.gitignore`.
8. Prettier: `docs/markdown` остаётся в `.prettierignore`; остальное форматировать.
9. Changelog: раздел «Документация и разработка» — команды `dev`/`build:docs`.

## Критерии приёмки
- `CATTR_UI_DOCKER_ARGS="-p 7200:7200" scripts/node.sh pnpm dev` → `curl -s localhost:7200/ | grep -q '<div id="app">'`.
- `scripts/node.sh pnpm build:docs` создаёт `dist-docs/index.html`, в консоли сборки нет ошибок; страницы `/#/en/docs/button` и `/#/zh/docs/button` рендерят демо без ошибок в консоли (проверить сборку через `npx serve` в контейнере + curl на html достаточно; визуальную проверку делает 40-02).
- `pnpm lint` по `docs/**` — 0 ошибок.

## Проверка
```sh
scripts/node.sh pnpm install --no-frozen-lockfile
scripts/node.sh pnpm build:docs
scripts/node.sh pnpm exec eslint docs vite.docs.config.js
```

## Changelog
Команды разработки.

## Найдено по ходу
- (из 30-w1-alert) `docs/assets/style/docs.scss` использует классы переходов Vue 2 `.fade-enter`/`.fade-leave-active`; в Vue 3 это `.fade-enter-from`/`.fade-leave-active` + `.fade-enter-active`. Проверить все `*-enter`/`*-leave` в docs scss и в `src/stylesheet/src/components/animation.scss` (последнее — общая анимация библиотеки, чинить в 50-01 или здесь, записать решение).
- (из 10-02) В `docs/` остаются 7 ошибок `no-undef` (`require` в `router/index.js`, `directives/clipboard.js`; `process` в `main.js`, `router/index.js`) — уйдут при переходе на Vite/ESM.

## Заметки агента
