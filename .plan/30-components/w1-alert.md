---
id: 30-w1-alert
title: Alert → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/alert/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- событий без `emits`: 1
- файлы: alert.vue 

## Специфика
- Проверить transition вокруг закрытия.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/alert` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/alert && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/alert
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- (из 10-02) Prop `message` одновременно `required` и с `default` — ошибка `vue/no-required-prop-with-default`, решить (убрать одно из двух) и отразить в changelog.

## Заметки агента
- Сделано: `emits: ['on-close']`; `default: ''` у `message` убран (оставлен `required`) — закрыт пункт «Найдено по ходу», запись в CHANGELOG-MIGRATION.md → «Alert».
- Публичный API: только prop `message` без default (см. changelog). Имена событий/props/slots не менялись; v-model у Alert нет, `modelValue` не нужен.
- Переходы: `<transition name="fade">` с одним `div v-show` — по чеклисту без изменений. Классы `fade-*` в `animation.scss` заданы через `-enter-active`/`-leave-active` (совместимо с Vue 3), `-enter-from` не используются.
- Тест: `test/components/alert.spec.js`, 4 `it` (класс/тип/сообщение, description+иконка, close → on-close и display:none, closeText). Корень — `<transition>`, поэтому `wrapper.classes()` пуст: использовать `wrapper.find('.at-alert')`.
- Подозрительное: `docs/assets/style/docs.scss` использует Vue 2 классы `.fade-enter`/`.fade-leave-active` — docs не трогались (этап 40), но переход в доках сломается на Vue 3.
- Проверки: eslint 0 ошибок, prettier check ок, `pnpm test` 59/59, `pnpm build` ок.
