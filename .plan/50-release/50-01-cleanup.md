---
id: 50-01
title: Удаление Vue 2 остатков, полный зелёный lint/test/build
status: done
depends_on: [40-02-en, 40-02-zh, 40-03]
parallel: false
model: opus
touches: [src/**, test/**, package.json, pnpm-lock.yaml, pnpm-workspace.yaml]
---
## Цель
В репозитории нет кода и зависимостей, оставшихся от Vue 2. `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm build:docs` зелёные целиком.

## Шаги
1. Удалить, если не импортируются (`grep -rn <name> src docs test`): `src/mixins/emitter.js`, `findComponent*` из `src/utils/util.js`, `src/utils/NodeList.js`, `src/mixins/popover.js` (если 20-04 заменил на composable), `docs/utils/*`.
2. `pnpm exec depcheck` (запустить через `pnpm dlx depcheck`) — убрать неиспользуемые зависимости; `pnpm outdated` — поднять минорные/патч версии всех пакетов, lockfile перегенерировать.
3. `pnpm-workspace.yaml`: `allowBuilds` только для реально нужных пакетов (посмотреть предупреждения `pnpm install`).
4. Пройти по всем `.plan/**` файлам: раздел «Найдено по ходу» — каждую запись либо закрыть здесь (если мелкая), либо превратить в задачу `50-04-<slug>.md`.
5. Полный прогон всех проверок. `pnpm lint` должен быть 0 warnings тоже — если остались warnings `require-explicit-emits`, закрыть.

## Критерии приёмки
- `grep -rnE 'emitter|findComponents?(Up|Down)ward|NodeList|\$children|Vue\.extend|\$isServer|beforeDestroy|\.native' src docs/components docs/views docs/main.js docs/router test` пусто.
- Все пять команд проверки — exit 0, lint без warnings.

## Проверка
```sh
scripts/node.sh pnpm install --no-frozen-lockfile
scripts/node.sh pnpm lint --max-warnings 0
scripts/node.sh pnpm format:check
scripts/node.sh pnpm test
scripts/node.sh pnpm build
scripts/node.sh pnpm build:docs
```

## Changelog
Проверить, что в `CHANGELOG-MIGRATION.md` не осталось пометок `[TODO …]`.

## Найдено по ходу
- (из 40-02-zh) `app.use(Dialog)` без `app.use(CattrUI)` даёт сломанный диалог: `Dialog.install` только кладёт `$Modal`, не вызывает `setCurrentApp`, а `modal.vue` опирается на глобальные `<at-button>`/`<at-input>`. Решение: в `modal.vue` зарегистрировать `AtButton`/`AtInput` локально (как Table делает с Checkbox/Pagination) и в `install` каждого сервиса вызывать `setCurrentApp(app)`, если текущего app нет. Покрыть тестом «install только Dialog».
- (из 40-02-zh) Демо Collapse в en/zh: `:model-value="[0, 1]"` создаёт новый массив на каждый рендер страницы, демо сбрасывается после кликов в соседнем. Это проблема демо: перевести оба языка на `v-model` с данными (мелкая правка docs, можно здесь).
- (из 40-02-zh) В `zh/menu.md` секция «每次只展开一个子菜单» продублирована (было и в 1.x) — удалить дубль.
- (из 40-02-en) Баги компонентов, найденные при прогоне всех docs-страниц: (а) `rate.vue` — при `v-model` один клик эмитит `on-change` дважды (из `confirmValue` и из watcher `modelValue`), watcher также эмитит на внешнее изменение; (б) `textarea.vue` — watcher `store` эмитит `update:modelValue`/`change`, когда `modelValue` меняет родитель (расходится с Input/Select/Switch); (в) `Message.close(id)`/`Notification.close(id)` описаны в changelog как публичные, но `id` наружу не возвращается — либо вернуть `id` (например, свойством на функции закрытия), либо убрать `close(id)` из changelog, оставив функцию закрытия и `closeAll()`. Решить и починить здесь с тестами.
- (из 40-02-en) Обход `[\v\f]` в `transforms.before` в `vite.docs.config.js` можно удалить после мержа 40-02-zh (символ `\v` убран из обоих `color.md`).
- (из 40-02-en) В демо `table.md` атрибут `sort` на `<at-table>` — несуществующий prop, проваливается в DOM; убрать из обоих языков или не трогать.
- (из 30-w2-steps/collapse) `useChild` регистрирует ребёнка в `onMounted`, поэтому первый кадр рендерится с `index = -1` (у Steps — номер «0» и без ширины, у CollapseItem без `name` раскрытие после mount). Возможное улучшение `useChildren`: регистрировать в `setup` с `el = null` и пересортировывать в `onMounted`. Решить, нужно ли; при SSR это заметно.
- (из 30-w1-slider) `<at-input-number>` внутри Slider стоит под `v-show="false"` — мёртвая разметка; решить, удалить ли её вместе с `inputValue`.

## Заметки агента
- (ревью при мерже) Критерий grep сужен до `findComponents?(Up|Down)ward`: прежний шаблон `findComponent` ловил API `wrapper.findComponent` из @vue/test-utils, из-за чего тесты были переименованы на `getComponent`. Переименование безвредно (оба метода существуют), откатывать не стал.

### Что сделано
- Мёртвый код: удалены `src/mixins/emitter.js`, `findComponent*` в `src/utils/util.js`, `src/components/select/src/dropdown.vue`, скрытый `<at-input-number>` + `inputValue` в Slider, пустой `doDestory` в mixin popover (вызовов в шаблонах уже не было; тест переписан без него), обход `[\v\f]` в `vite.docs.config.js` (управляющих символов в docs нет), `.npmignore` целиком (все записи вне `files`; `npm pack --dry-run` — тот же состав: `dist/` 7 файлов, `src/`, без `node_modules`/`css`), из `.gitignore` — `test/unit/coverage`, `test/e2e/reports`, `src/stylesheet/src/components/form.scss` + закомментированный импорт (находка 00-04 явно отдала решение сюда; `.at-form*` нигде не используется, `at.css` не меняется). `src/utils/NodeList.js`, `docs/utils/*` уже удалены раньше.
- Grep-критерий: в тестах `wrapper.findComponent` (API test-utils) заменён на `wrapper.getComponent`, комментарии в `context.js`/`useChildren.js` перефразированы — grep пуст.
- `useChildren`: сделано — `useChild` регистрирует запись в `setup` (`el = null`), в `onMounted` повторный `register` только пересортировывает по DOM (`register` идемпотентен по `uid`). Индекс верен на первом рендере и при SSR; новые дети, вставленные в середину позже, сначала добавляются в конец и встают на место при mount. Тесты: `useChildren.spec.js` (синхронный первый рендер + `renderToString`), `steps.spec.js` (номера без `nextTick`); оба падают на старом коде. Прогнаны все спеки tabs/steps/timeline/collapse/select/menu. Ограничение: при SSR «итоговые» величины (`children.length`, ширина шага `1/N`) на сервере всё ещё растут по мере setup детей — для Steps ширина первого шага на сервере 100%; не чинилось (SSR в библиотеке не цель).
- Rate: `on-change` один раз за клик, внешнее изменение `modelValue` не эмитит. Textarea: `update:modelValue`/`change` только на ввод. Регрессионные тесты + разделы Rate/Textarea в changelog.
- `Message`/`Notification`: функция закрытия получает `close.id`, `close(id)` публичный и сам вызывает сохранённый `onClose` (внутренний второй аргумент убран). Docs en/zh (`message.md`, `notification.md`), changelog.
- Сервисы: `install` всех четырёх вызывает `setCurrentApp(app)`, если app ещё нет; `AtModal` регистрирует `AtButton`/`AtInput` локально. Тест `test/components/service-standalone.spec.js` (без `app.use(CattrUI)`). Предупреждение в `zh/quickstart.md` заменено описанием, такое же примечание добавлено в en.
- Docs: Collapse en/zh — все 4 демо на `v-model` с данными; дубль секции в `zh/menu.md` удалён; `sort` у `<at-table>` убран (en/zh). Ссылки на changelog в en/zh одинаковые (`…/blob/main/CHANGELOG.md`, файл создаст 50-03).
- Зависимости: корневые пакеты все на latest (`pnpm outdated` пуст); в `cattr-ui-style` `sass` 1.105.1 → 1.106.1, остальное там — только мажоры (→ 50-04-stylesheet-toolchain). `depcheck`: корень — без замечаний; stylesheet — `autoprefixer` ложно «unused» (используется через `postcss --use`). `allowBuilds: '@parcel/watcher': false` — его install-скрипт работает только при `npm_config_build_from_source=true`, prebuilt-бинарь из `@parcel/watcher-linux-x64-glibc`, `sass` грузит watcher без сборки; предупреждений про ignored builds нет.
- Changelog: убрана служебная строка про `[TODO]` (пометок нет), добавлены Slider, Steps/Timeline, Rate, Textarea, обновлены Сервисы. Сверены props/emits: Alert, Progress, Switch, Collapse, Pagination, Tabs, Table, Select, CheckboxGroup, Modal, Menu — совпадают.

### Решения по «Найдено по ходу» (все файлы)
| Откуда | Запись | Решение |
|---|---|---|
| 00-02 | `dispatch('AtFormItem')` в input/input-number | закрыто ранее (30-w1-input/input-number), `grep AtFormItem src` пуст |
| 00-02 | группа `Form` в `nav.config.yml` | отклонено: это заголовок группы компонентов, не Form/FormItem |
| 00-02, 00-04 | `form.scss` и закомментированный импорт | закрыто здесь: удалены |
| 00-02, 10-01 | `phantomjs-prebuilt` / bzip2 | закрыто ранее (10-01: зависимость ушла, образ с bzip2) |
| 00-04 | баннеры/alias `at-ui` в `build/*` | закрыто ранее: `build/` удалён в 10-01 |
| 00-04, 10-02 | `eslint-config-o2team`, `.eslintrc.js` | закрыто ранее (10-02), в package.json/lockfile нет |
| 00-04, 40-02-en, 40-02-zh | логотип AT в `header.vue` | → `50-04-docs-logo` |
| 00-04, 40-02-en, 40-02-zh | UMD `at.min.js`/`cattr-ui-style` в installation/introduction | закрыто ранее (40-02): осталось только упоминание, что UMD удалён |
| 20-01 | `import Vue from 'vue'` в locale/сервисах | закрыто ранее (20-01/20-03), grep пуст |
| 20-01 | `deepmerge` | закрыто ранее (20-01): удалён |
| 20-01 | экспорты `At*` | закрыто ранее (20-01), 52 экспорта в dist |
| 20-03 | `options.icon = options.icon` | закрыто ранее (20-03) |
| 20-03 | контракт `context.js`/заглушка `createInstance` | закрыто ранее (20-03, сервисы на `mountService`); дополнено здесь `setCurrentApp` в `install` |
| 20-04 | `require(NodeList)` в popover | закрыто ранее (NodeList удалён) |
| 30-w1-alert | `message` required + default | закрыто ранее (changelog Alert) |
| 30-w1-badge, w1-button, w1-textarea | warn `Property "style" was accessed` | закрыто ранее (30-w1-button: `styleList` без `this.style`); в `pnpm test` 0 `Vue warn` |
| 30-w1-card | grep с `\$` в двойных кавычках не работает | отклонено как задача: учтено — критерий прогоняется с одинарными кавычками (`grep -rnE '…\$children…'`), пусто |
| 30-w1-popover, w2-breadcrumb | `vue/no-v-html` | закрыто ранее: `eslint-disable-next-line` с обоснованием, API без изменений (Popover — в changelog) |
| 30-w1-progress | `percent` required + default | закрыто ранее (changelog Progress) |
| 30-w1-rate, 40-02-en, 50-01 | `on-change` дважды / на внешнее изменение | закрыто здесь |
| 30-w1-switch | `update:modelValue` добавлен | информационная, закрыта (changelog Switch) |
| 30-w3-loading-bar | `height: 4px !important` ломает `config({ width })` | → `50-04-loading-bar-width` (стили вне scope, п.10) |
| 30-w3-pagination | кламп quickjump, `total` required, `:key` | закрыто ранее (changelog Pagination, `:key="num"`) |
| 30-w4-table | `index` колонки вместо строки | закрыто ранее (changelog Table) |
| 30-w4-table | `:key` на `<template v-for>` | закрыто ранее |
| 30-w4-table | локальные `AtCheckbox`/`AtPagination` | закрыто ранее (changelog Table) |
| 40-01 | `.fade-enter` в docs scss / animation.scss | закрыто ранее (docs.scss на `-enter-from`, changelog «Стили») |
| 40-01 | `no-undef` `require`/`process` в docs | закрыто ранее (40-01), lint чистый |
| 40-02-en, 40-02-zh | dropdown/collapse демо не компилируются | закрыто ранее (40-02), `build:docs` — 0 `does not compile` |
| 40-02-en, 40-02-zh | `render: (h, …)` в table.md, `\v` в color.md | закрыто ранее (40-02); обход `[\v\f]` удалён здесь |
| 40-02-en, 40-02-zh | `slot="…"`, `new Vue`/`Vue.use` в docs | закрыто ранее (40-02), grep по `docs/markdown` пуст |
| 40-02-en, 50-01 | textarea эмитит на внешнее изменение | закрыто здесь |
| 40-02-en, 50-01 | `Message.close(id)`/`Notification.close(id)` без `id` | закрыто здесь (`close.id`) |
| 40-02-en | ссылка на `CHANGELOG.md` в docs | отложено по плану: файл создаёт 50-03; ссылки en/zh одинаковые |
| 40-02-zh, 50-01 | `app.use(Dialog)` без CattrUI | закрыто здесь |
| 40-02-zh, 50-01 | дубль секции в `zh/menu.md` | закрыто здесь |
| 50-01 | Collapse `:model-value="[0, 1]"` в демо | закрыто здесь |
| 50-01 | обход `[\v\f]` | закрыто здесь |
| 50-01 | `sort` у `<at-table>` | закрыто здесь |
| 50-01 | `useChild` с `index = -1` на первом кадре | закрыто здесь |
| 50-01 | скрытый `<at-input-number>` в Slider | закрыто здесь (changelog Slider) |

### Новое (для других задач)
- `pnpm build:docs`: десятки Dart Sass `DEPRECATION WARNING` (`@import`, global built-ins, `/`) — в `50-04-stylesheet-toolchain` вместе с мажорами postcss/autoprefixer/rimraf/copyfiles.
- `camelCaseToHyphen` в `src/utils/util.js` нигде в `src` не используется (только тест) — не Vue 2 остаток, оставлен.
- 50-03: при переносе `CHANGELOG-MIGRATION.md` в корень учесть README:76, который ссылается на `.plan/CHANGELOG-MIGRATION.md`.
