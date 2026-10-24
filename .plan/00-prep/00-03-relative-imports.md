---
id: 00-03
title: Заменить alias-импорты at-ui/src/... на относительные пути
status: done
depends_on: [00-01]
parallel: true
model: haiku
touches: [src/components/**, src/mixins/**, docs/**]
---
## Цель
Убрать зависимость исходников от webpack-alias `at-ui` → корень репозитория. Нужно для Vite и для потребителя, импортирующего из `src`.

## Факты
Вхождения (`grep -rhoE "from '(at-ui|src|components|stylesheet)[^']*'" src docs | sort | uniq -c`):
- `at-ui/src/mixins/emitter` ×14, `at-ui/src/utils/util` ×8, `at-ui/src/mixins/popover` ×6, `at-ui/src/mixins/locale` ×3,
  `at-ui/src/directives/clickoutside` ×3, `at-ui/src/utils/collapse-transition` ×2, `at-ui/src/locale` ×1,
  `at-ui/src/components/{tooltip,pagination,input-number,checkbox}` ×1 каждый, `src/utils/collapse-transition` ×1.
- В `docs/`: `from 'at-ui'` ×8, `at-ui/dist/locale/*` ×2 (примеры в markdown), `at-ui-lib`, `at-ui-locale-*`, `at-ui-style` — это docs-alias'ы, их трогать **не надо** (уйдут в 40-01).

## Шаги
1. В `src/**/*.{vue,js}` заменить `at-ui/src/<path>` на относительный путь от файла. Проверить глубину: компоненты лежат в `src/components/<name>/src/*.vue` → `../../../mixins/emitter` и т.п.
2. `src/utils/collapse-transition` → относительный.
3. Alias'ы `at-ui`, `src`, `components`, `stylesheet` в `build/webpack.base.conf.js` оставить (сборка Webpack живёт до 10-01).
4. Снять `[TODO 00-03]` в changelog.

## Критерии приёмки
- `grep -rn "from 'at-ui/src\|from 'src/" src` пусто.
- `scripts/node.sh pnpm build:package` проходит (или зафиксировано, что падает по причине, не связанной с импортами).

## Проверка
```sh
grep -rn "from 'at-ui/src\|from 'src/" src && exit 1 || true
scripts/node.sh pnpm build:package
```

## Changelog
Раздел «Требования к окружению»: alias `at-ui` у потребителя больше не нужен.

## Найдено по ходу

## Заметки агента
- Замены: 22 файла в `src/components/**` (вне `src/components/form/**`, по требованию оркестратора), 40 строк импортов `at-ui/src/...` → относительный путь. Расширения не добавлялись. Каждый целевой путь проверен на существование (`.js`/`.vue`/`index.js`), неразрешённых нет.
- Группы: `mixins/emitter` и `mixins/popover`, `utils/util`, `mixins/locale`, `directives/clickoutside`, `utils/collapse-transition`, `locale` (modal → `../../../locale`, резолвится в `src/locale/index.js`), межкомпонентные `components/{tooltip,input-number,checkbox,pagination}` → `../../<name>` (через `index.js` каталога).
- Критерий: `grep -rn "from 'at-ui/src\|from 'src/" src --exclude-dir=form` → пусто (exit 1). Дополнительно `grep -rn "at-ui/src" src | grep -v src/components/form/` → 0 строк.
- `scripts/node.sh pnpm install --frozen-lockfile` ПАДАЕТ на postinstall пакета `phantomjs-prebuilt@2.1.16` (зависимость `supports-color@4.5.0`): `tar jxf /tmp/phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2` → `tar (child): bzip2: Cannot exec: No such file or directory`; `ERR_PNPM_EXECUTOR_LIFECYCLE_SCRIPT_FAILED`. Не чинилось (по инструкции). Следствие: `scripts/node.sh pnpm build:package` не запускалась, проверка сборки невозможна в этой задаче. Нужна отдельная задача/решение по устаревшему phantomjs (пакет и его postinstall, вероятно, уходят вместе с Webpack-тулингом в 10-*).
- `package.json`, `pnpm-lock.yaml`, `src/stylesheet`, `docs/`, `build/` не менялись. Alias'ы в `build/webpack.base.conf.js` оставлены.
- CHANGELOG-MIGRATION.md: снята пометка `[TODO 00-03]` с записи о внутренних импортах (текст записи не менялся).
