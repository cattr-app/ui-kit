---
id: 50-01
title: Удаление Vue 2 остатков, полный зелёный lint/test/build
status: todo
depends_on: [40-02]
parallel: false
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
scripts/node.sh pnpm install
scripts/node.sh pnpm lint --max-warnings 0
scripts/node.sh pnpm format:check
scripts/node.sh pnpm test
scripts/node.sh pnpm build
scripts/node.sh pnpm build:docs
```

## Changelog
Проверить, что в `CHANGELOG-MIGRATION.md` не осталось пометок `[TODO …]`.

## Найдено по ходу

## Заметки агента
