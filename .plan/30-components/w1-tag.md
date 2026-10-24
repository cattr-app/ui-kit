---
id: 30-w1-tag
title: Tag → Vue 3
status: done
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: haiku
touches: [src/components/tag/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `tag.vue:3` require-toggle-inside-transition
- событий без `emits`: 2
- файлы: tag.vue 

## Специфика
- `<transition>` без `v-if/v-show` внутри (`require-toggle-inside-transition`): добавить `v-show="visible"` или убрать transition.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/tag` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/tag && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/tag
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

## Найдено по ходу

## Заметки агента
- (ревью при мерже) `<transition name="fade">` вокруг корня удалён вместе с фиктивным `visible: true`: закрытие тега делает родитель, анимация никогда не проигрывалась и в 1.x. Корень теперь `span.at-tag`.
- `tag.vue`: добавлен `emits: ['on-close']` (имя события и аргументы `(evt, name)` сохранены). Ничего из чеклиста про v-model/lifecycle/.native/провайд не применимо: у компонента нет `value`/`input`, `$parent`, `beforeDestroy`.
- `<transition name="fade">`: внутренний `<span>` получил `v-show="visible"`, `data() { visible: true }`. Флаг константный, поэтому видимое поведение не меняется; закрытие по-прежнему делает родитель (удаление компонента), fade-out при размонтировании сохраняется, так как transition остаётся корнем компонента.
- Публичного API не менялось (props, события, слоты, имена), поэтому `CHANGELOG-MIGRATION.md` не трогал.
- Подозрительно: `visible` всегда `true`, то есть директива формально удовлетворяет правилу `require-toggle-inside-transition`, но реально ничего не скрывает. Если нужно скрытие по on-close без участия родителя, это уже изменение поведения, вне scope задачи.
- Тест: при `<transition>` корне в VTU `wrapper.element`/`wrapper.classes()` указывают не на span, поэтому в тесте используется `wrapper.find('.at-tag')`. happy-dom отдаёт цвет как `#ff0000`, а не `rgb(...)`.
