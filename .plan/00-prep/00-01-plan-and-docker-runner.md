---
id: 00-01
title: Скрипт запуска node в docker с общим кэшем, каркас плана
status: done
depends_on: []
parallel: false
touches: [scripts/node.sh, .plan/**]
---
## Цель
Единый способ запускать node/pnpm без Node на хосте; каркас `.plan/`.

## Результат
- `scripts/node.sh` — docker `node:24-slim`, `--rm`, uid/gid хоста, кэш `~/.cache/cattr-ui-node` (corepack shims, pnpm store, npm cache). Проверено: холодный запуск скачивает pnpm 12.9.0 один раз, тёплый запуск 0,7 с.
- `.plan/README.md`, `.plan/CHANGELOG-MIGRATION.md`, задачи этапов 00–50.

## Заметки агента
Выполнено 2026-10-24 при составлении плана. Инвентаризация Vue 2 паттернов сделана `eslint-plugin-vue@9` с правилами `no-deprecated-*`; результаты разнесены по задачам 30-*.
