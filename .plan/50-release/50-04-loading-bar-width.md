---
id: 50-04-loading-bar-width
title: LoadingBar — опция config({ width }) не работает из-за height !important
status: done
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
- Убран `!important` у `height` в `.at-loading-bar` (scss), `build:style` подтверждён: в `css/at.css` нет `!important`. Тесты добавлены в spec (inline height после `config({ width: 6 })`, дефолт без config).
- ВНИМАНИЕ: inline `height` ставится всегда из prop `width`, а дефолт `width` = 2 (`index.js`: `let width = 2`; `loading-bar.vue`: `default: 2`). Значит без `config` полоса теперь 2px, а не 4px как раньше (при `!important` было 4px). Это изменение видимого дефолта; criterion «без config 4px» не выполнен. Чтобы вернуть 4px, нужно поменять дефолт в `index.js` (`let width = 2` → `4`) и в prop `width` `.vue` — вне разрешённых файлов, решение за оркестратором. В changelog это пока не отражено.
- Визуальная проверка на docs-странице не делалась (только unit-тесты и `build:style`).
