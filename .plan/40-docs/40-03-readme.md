---
id: 40-03
title: README под 2.0
status: todo
depends_on: [40-01]
parallel: true
touches: [README.md, src/locale/README.md]
---
## Цель
README описывает подключение в Vue 3 + Vite, разработку через `scripts/node.sh`, команды pnpm.

## Шаги
1. Разделы «Подключение» и «Для импорта отдельного компонента» — по разделу «Подключение» changelog: `createApp`, `app.use(CattrUI)`, именованные импорты, стили `@amazingcat/cattr-ui/src/stylesheet/src/index.scss`, локали `@amazingcat/cattr-ui/locale/<lang>`.
2. «Разработка»: Node 24 / pnpm из `packageManager`; на машине без Node — `scripts/node.sh`; таблица команд `dev`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `build`, `build:style`, `build:docs`.
3. Убрать абзац «основана на устаревшем стеке Vue 2 и Webpack 3». Упомянуть `CHANGELOG.md` (миграция с 1.x).
4. `src/locale/README.md` — обновить пример регистрации локали.

## Критерии приёмки
- Все команды из README существуют в `package.json`.
- `scripts/node.sh pnpm format:check` проходит (README форматируется prettier).

## Проверка
```sh
for s in dev lint lint:fix format format:check test build build:style build:docs; do grep -q "\"$s\"" package.json || echo "missing $s"; done
scripts/node.sh pnpm format:check
```

## Changelog
нет

## Найдено по ходу

## Заметки агента
