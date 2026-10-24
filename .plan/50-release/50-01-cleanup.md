---
id: 50-01
title: Удаление Vue 2 остатков, полный зелёный lint/test/build
status: todo
depends_on: [40-02-en, 40-02-zh, 40-03]
parallel: false
model: opus
touches: [src/**, test/**, package.json, pnpm-lock.yaml, pnpm-workspace.yaml]
---
## Цель
В репозитории нет кода и зависимостей, оставшихся от Vue 2. `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm build:docs` зелёные целиком.

## Шаги
1. Удалить, если не импортируются (`grep -rn <name> src docs test`): `src/mixins/emitter.js`, `findComponent*` из `src/utils/util.js`, `src/utils/NodeList.js`, `src/mixins/popover.js` (если 20-04 заменил на composable), `docs/utils/*`.
2. `pnpm exec depcheck` (запустить через `pnpm dlx depcheck`) — убрать неиспользуемые зависимости; `pnpm outdated` — поднять минорные/патч версии всех пакетов, lockfile перегенерировать.
3. `pnpm-workspace.yaml`: `allowBuilds` только для реально нужных пакетов (посмотреть предупреждения `pnpm install`).
4. Пройти по всем `.plan/**` файлам: раздел «Найдено по ходу» — каждую запись либо закрыть здесь (если мелкая), либо превратить в задачу `50-04-<slug>.md`.
5. Полный прогон всех проверок. `pnpm lint` должен быть 0 warnings тоже — если остались warnings `require-explicit-emits`, закрыть.

## Критерии приёмки
- `grep -rn "emitter\|findComponent\|NodeList\|\$children\|Vue.extend\|\$isServer\|beforeDestroy\|\.native" src docs/components docs/views docs/main.js docs/router test` пусто.
- Все пять команд проверки — exit 0, lint без warnings.

## Проверка
```sh
scripts/node.sh pnpm install --no-frozen-lockfile
scripts/node.sh pnpm lint --max-warnings 0
scripts/node.sh pnpm format:check
scripts/node.sh pnpm test
scripts/node.sh pnpm build
scripts/node.sh pnpm build:docs
```

## Changelog
Проверить, что в `CHANGELOG-MIGRATION.md` не осталось пометок `[TODO …]`.

## Найдено по ходу
- (из 40-02-en) Баги компонентов, найденные при прогоне всех docs-страниц: (а) `rate.vue` — при `v-model` один клик эмитит `on-change` дважды (из `confirmValue` и из watcher `modelValue`), watcher также эмитит на внешнее изменение; (б) `textarea.vue` — watcher `store` эмитит `update:modelValue`/`change`, когда `modelValue` меняет родитель (расходится с Input/Select/Switch); (в) `Message.close(id)`/`Notification.close(id)` описаны в changelog как публичные, но `id` наружу не возвращается — либо вернуть `id` (например, свойством на функции закрытия), либо убрать `close(id)` из changelog, оставив функцию закрытия и `closeAll()`. Решить и починить здесь с тестами.
- (из 40-02-en) Обход `[\v\f]` в `transforms.before` в `vite.docs.config.js` можно удалить после мержа 40-02-zh (символ `\v` убран из обоих `color.md`).
- (из 40-02-en) В демо `table.md` атрибут `sort` на `<at-table>` — несуществующий prop, проваливается в DOM; убрать из обоих языков или не трогать.
- (из 30-w2-steps/collapse) `useChild` регистрирует ребёнка в `onMounted`, поэтому первый кадр рендерится с `index = -1` (у Steps — номер «0» и без ширины, у CollapseItem без `name` раскрытие после mount). Возможное улучшение `useChildren`: регистрировать в `setup` с `el = null` и пересортировывать в `onMounted`. Решить, нужно ли; при SSR это заметно.
- (из 30-w1-slider) `<at-input-number>` внутри Slider стоит под `v-show="false"` — мёртвая разметка; решить, удалить ли её вместе с `inputValue`.

## Заметки агента
