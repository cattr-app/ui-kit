---
id: 50-03
title: Финализация changelog, версия 2.0.0, проверка состава пакета
status: done
depends_on: [50-02]
parallel: false
model: opus
touches: [CHANGELOG.md, .plan/CHANGELOG-MIGRATION.md, package.json, docs/markdown/*/changelog.md]
---
## Цель
Версия 2.0.0, итоговый `CHANGELOG.md` для команды фронтенда, проверенный состав пакета и его работоспособность во внешнем Vite-проекте. Дальнейшие шаги вне плана и выполняются вручную после проверок.

## Шаги
1. `.plan/CHANGELOG-MIGRATION.md` → перенести в корень как `CHANGELOG.md` (раздел `## 2.0.0`), убрать пометки `[TODO]`, отсортировать: Требования → Подключение → v-model → Компоненты (по алфавиту) → Сервисы → Удалено. Каждая запись с примером «было/стало». Добавить в начало чеклист миграции проекта из 8–12 пунктов (последовательность действий во фронтенде).
2. `package.json`: `version: 2.0.0`, проверить `files`, `exports`, `peerDependencies`, `repository`.
3. `scripts/node.sh pnpm pack` → распаковать во временную папку в контейнере, проверить состав: `dist/index.js`, `dist/locale/*.js`, `src/**` (включая `stylesheet/src`), `README.md`, `CHANGELOG.md`, `LICENSE`; нет `test`, `docs`, `.plan`. Удалить архив.
4. Проверка потребления: в контейнере создать временный Vite-проект (`pnpm create vite tmp --template vue`), установить tarball, `app.use(CattrUI)`, отрендерить `<at-button>` и `<at-select>` в `vitest`-тесте или просто `vite build` без ошибок. Временную папку удалить.
5. Решить судьбу `.plan/`: предложение — перенести в `docs/migration/` как историю или удалить отдельным коммитом после мержа `feat/vue-3` в `main`. Записать решение в заметки, не выполнять без подтверждения человека.
6. Подготовить текст PR `feat/vue-3 → main` в `.plan/PR.md`: краткое описание, ссылка на CHANGELOG.md, список ломающих изменений, инструкция проверки.

## Критерии приёмки
- `CHANGELOG.md` без `[TODO]`; `grep -c "Было" CHANGELOG.md` ≥ 15.
- `pnpm pack` содержит ожидаемые файлы; внешний Vite-проект собирается с пакетом.
- `.plan/PR.md` готов.

## Проверка
```sh
grep -n "TODO" CHANGELOG.md && exit 1 || true
scripts/node.sh sh -c "pnpm pack --pack-destination /tmp && tar tzf /tmp/amazingcat-cattr-ui-2.0.0.tgz | sort"
```

## Changelog
Это и есть changelog.

## Найдено по ходу

## Заметки агента
- `CHANGELOG.md` в корне: чеклист из 12 шагов с командами grep (проверены на образце), разделы в порядке задачи, компоненты по алфавиту; добавлен подраздел Badge/Breadcrumb/Card/Tag (сверено с кодом), исправлены: имя пакета в «Удалено» (`@cattr/ui-kit` → `@amazingcat/cattr-ui`), неполный список v-model (добавлены Dropdown, Popover, Tooltip, RadioButton), ссылки на id задач плана и промежуточные сборки, заявление о визуальной проверке анимаций. `[TODO]` нет, `grep -c "Было"` = 33. `.plan/CHANGELOG-MIGRATION.md` удалён, ссылки в README и `.plan/README.md` (правила 2, 7, структура) → `CHANGELOG.md`; в файлах задач оставлены как история.
- Состав пакета: `pnpm pack` с исходным `files: [dist, src]` тащил `src/stylesheet/node_modules/*` (симлинки workspace), `scripts/clean.mjs`, `postcss.config.mjs`, `CONTRIBUTING.md`, dot-файлы, и **не** включал `CHANGELOG.md` (npm не добавляет его автоматически). Стало `files: [dist, src, "!src/stylesheet/*", src/stylesheet/package.json, src/stylesheet/src, CHANGELOG.md]` — pnpm pack отрицание понимает: 200 файлов (dist/index.js + 6 локалей, src/** с 57 файлами `stylesheet/src` включая шрифты, `stylesheet/package.json`, README, CHANGELOG, LICENSE); нет test/docs/.plan/node_modules/`stylesheet/css` (проверено и при собранном css)/`stylesheet/scripts`.
- Потребитель (контейнер, `/tmp`, tarball через `file:`; vue 3.5.44, vite 8.3.5, plugin-vue 6.0.10, sass 1.106.1): `vite build` прошёл (CSS 151.6 kB со шрифтами feather, JS 172.8 kB), `@use '…/index.scss' as cattr with ($brand-blue-500: #ff5722)` через резолвер Vite работает; `node import('@amazingcat/cattr-ui')` — 52 экспорта, default `{install, version}`, `version` = 2.0.0; `locale/de` — object; SSR `renderToString` `<at-button>`/`<at-select>` после `app.use(CattrUI, { locale: de })` — ок; `sass --load-path=node_modules` с `with (…)` — ок. Для pnpm 12 потребителю нужен `allowBuilds: { '@parcel/watcher': false }` (иначе `ERR_PNPM_IGNORED_BUILDS` от sass). Временный проект жил только в контейнере.
- `src/stylesheet/package.json` в пакете с `"main": "css/at.css"`, а `css/` не публикуется — на SCSS-импорты не влияет, но `import '@amazingcat/cattr-ui/src/stylesheet'` (каталог) не сработает; готовый CSS из пакета больше не доступен (записано в CHANGELOG «Стили»).
- `.plan/` не трогался. Варианты для человека: (а) перенести в `docs/migration/` как историю миграции (поправить `.prettierignore`/ссылки), (б) удалить отдельным коммитом `chore(plan): remove migration plan` после мержа `feat/vue-3` в `main` (история остаётся в git). `.plan/PR.md` готов.
- Прогон: install --frozen-lockfile ок, lint --max-warnings 0 ок, format:check ок, test 42 файла / 213 тестов, build (dist/index.js 127.37 kB, gzip 30.51 kB), build:docs ок.
