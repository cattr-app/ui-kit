---
id: 50-04-loading-bar-width
title: LoadingBar — опция config({ width }) не работает из-за height !important
status: todo
depends_on: [50-01]
parallel: true
model: haiku
touches: [src/stylesheet/src/components/loading-bar.scss, test/components/loading-bar.spec.js, .plan/CHANGELOG-MIGRATION.md]
---
## Цель
`LoadingBar.config({ width })` меняет высоту полосы, как описано в docs (`loadingbar.md`).

## Факты
- `src/stylesheet/src/components/loading-bar.scss`: `.at-loading-bar { height: 4px !important }` перебивает inline `height` из prop `width` у `AtLoadingBar` — так было и в 1.x (находка 30-w3-loading-bar).
- В `CHANGELOG-MIGRATION.md` (раздел «Сервисы» → LoadingBar) это записано как «Известное».

## Шаги
1. Убрать `!important` (оставить `height: 4px` как дефолт) или перенести дефолт в prop `width` компонента; проверить, что без `config` полоса по-прежнему 4px.
2. Тест: после `LoadingBar.config({ width: 6 })` и `start()` у `.at-loading-bar` inline `height: 6px` (CSS в happy-dom не применяется — проверить inline-стиль и отсутствие `!important` в scss нельзя тестом; достаточно ручной проверки на `pnpm dev`).
3. Changelog: заменить «Известное» на исправление.

## Критерии приёмки
- `pnpm build:style`, `pnpm test`, `pnpm lint --max-warnings 0` зелёные; на docs-странице LoadingBar `config({ width })` визуально меняет высоту.

## Найдено по ходу

## Заметки агента
