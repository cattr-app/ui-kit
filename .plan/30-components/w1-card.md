---
id: 30-w1-card
title: Card → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/card/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$slots` ×3
- файлы: card.vue 

## Специфика
- Только emits/lint.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/card` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE "emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\('input'" src/components/card && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/card
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- Grep-критерий из раздела «Проверка» не работает: в двойных кавычках shell `\$children` и `\$on\(` превращаются в `$children`/`$on\(`, а `$` в ERE — якорь конца строки, поэтому эти альтернативы никогда не совпадают. Исправленная версия с одинарными кавычками тоже даёт 0 совпадений. Для остальных задач w1–w4 стоит поправить шаблон (`grep -F` или экранирование `\\$`).

## Заметки агента
- Изменений в `src/components/card` не понадобилось: нет `emits`/событий, lifecycle-хуков, `.native`, `$parent`/`$children`/`$on`; `$slots` в шаблоне (`v-if="$slots.title"`) в Vue 3 работает как есть; корень один.
- `emits` не добавлялся: компонент не эмитит событий. Публичного API не менялось, запись в CHANGELOG-MIGRATION.md не нужна.
- Добавлен `test/components/card.spec.js` (4 `it`: корневые классы и модификаторы, слоты title/extra/default, режим loading).
- Проверено: eslint по папке 0 ошибок, `pnpm test` 59/59 (card 4/4), `pnpm format:check` и `pnpm build` зелёные.
- Вне задачи (не чинил): в тестах других компонентов (`mount.spec.js`, `mount-service.spec.js`) Vue warn `Property "style" was accessed during render` из `AtButton`.
