---
id: 50-04-docs-logo
title: Логотип Cattr в шапке сайта документации
status: todo
depends_on: [50-01]
parallel: true
model: haiku
touches: [docs/components/header.vue, docs/assets/**]
---
## Цель
Шапка docs-сайта не показывает логотип AT UI.

## Факты
- `docs/components/header.vue` использует `docs/assets/logo-at@2x.png`; в `docs/assets` также `logo-at.svg`, `logo-at-large.svg` (находки 00-04, 40-02-en/zh). Логотипа Cattr в репозитории нет.

## Шаги
1. Взять логотип Cattr у человека/из `cattr-app/frontend-application` (не скачивать из неизвестных источников) **или** заменить картинку текстовым заголовком `Cattr UI`.
2. Удалить неиспользуемые `logo-at*`, проверить `grep -rn logo-at docs` — пусто.

## Критерии приёмки
- `pnpm build:docs` зелёный, в шапке логотип Cattr или текст.

## Найдено по ходу

## Заметки агента
