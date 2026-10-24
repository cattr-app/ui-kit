---
id: 30-w3-loading-bar
title: LoadingBar ($Loading) → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-03, 20-04]
parallel: true
model: opus
touches: [src/components/loading-bar/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$mount` ×1
- `Vue.extend` ×1
- файлы: loading-bar.js loading-bar.vue 

## Специфика
- `loading-bar.js`: класс с `Vue.extend`/`$mount`, единственный инстанс, `update({percent,status,show})`, `destroy()`. Через `mountService` с reactive props; API `start/update/finish/error` — проверить фактический набор в `index.js` и сохранить.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/loading-bar` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/loading-bar && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/loading-bar
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
