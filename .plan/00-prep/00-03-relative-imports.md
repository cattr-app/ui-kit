---
id: 00-03
title: Заменить alias-импорты at-ui/src/... на относительные пути
status: todo
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
