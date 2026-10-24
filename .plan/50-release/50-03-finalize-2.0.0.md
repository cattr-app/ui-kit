---
id: 50-03
title: Финализация changelog, версия 2.0.0, проверка состава пакета
status: todo
depends_on: [50-02]
parallel: false
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
