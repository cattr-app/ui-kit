---
id: 30-w2-breadcrumb
title: Breadcrumb, BreadcrumbItem → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/breadcrumb/**, src/components/breadcrumb-item/index.js]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$parent` ×1
- файлы: breadcrumb-item.vue breadcrumb.vue 

## Специфика
- `breadcrumb-item` берёт `$parent.separator` → inject.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/breadcrumb` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/breadcrumb && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/breadcrumb
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу
- (из 10-02) `breadcrumb-item.vue` — ошибка `vue/no-v-html`, решить аналогично popover.

## Заметки агента
- `$parent.separator` (читался один раз в `mounted`, без реактивности) → `BreadcrumbContext` (`reactive({ separator: toRef(props, 'separator') })`); item `inject(null)`, без родителя разделитель `/`. Теперь смена `separator` у родителя реактивна и нет пустого первого рендера.
- `v-html` для `separator` оставлен (HTML-разделитель — API 1.x) с `eslint-disable-next-line vue/no-v-html` и комментарием, как в popover.
- Навигация: `href` → `window.location.href`, иначе `this.$router.replace/push(to)`; без `$router` клик ничего не делает (раньше падал с TypeError). `emits: []` в обоих компонентах.
- Последний разделитель по-прежнему рендерится в DOM и скрывается CSS (`:last-child`), как в 1.x. Публичное API не менялось — запись в CHANGELOG не нужна.
- Вне задачи: класс текста `at_breadcrumb__text` (подчёркивание вместо дефиса) — опечатка 1.x, оставлен как есть.
