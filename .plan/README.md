# План миграции cattr-ui на Vue 3 + Vite

Ветка интеграции: `feat/vue-3`. Результат: `@amazingcat/cattr-ui@2.0.0` на Vue 3.5, сборка Vite, ESLint 10 + Prettier 3.
Потребитель (`cattr-app/frontend-application`) мигрирует на Vite + Vue 3 параллельно и будет адаптирован по `CHANGELOG.md` (корень репозитория).

## Фиксированные решения

- Обратная совместимость публичного API **не** требуется. Каждое ломающее изменение фиксируется в `CHANGELOG.md` (формат «было / стало / что править в проекте»).
- Ветка `release/1.x` не заводится. Патчи под Vue 2 не планируются.
- Инструменты обновляются до самых свежих взаимно совместимых версий. **Откат на старые мажоры линтеров/prettier запрещён**: при конфликте правил адаптируется код, а не конфиг.
- Никаких compat-прослоек внутри библиотеки (нет `value`+`modelValue`, нет двойной сигнатуры `render`). `@vue/compat` в библиотеке не используется.
- Node на хосте нет. Все node-команды только через `scripts/node.sh` (docker, общий кэш в `~/.cache/cattr-ui-node`).
- Form/FormItem удаляются (не экспортировались, зависимость `async-validator` не объявлена).
- Бренд `at-ui` заменяется на `cattr-ui` только в идентификаторах и текстах (00-04). CSS-префикс `at-`, имена компонентов `At*`/`<at-*>` и ключи локали `at.*` **остаются**.

## Структура

```
.plan/
  README.md                 этот файл
  00-prep/ 10-tooling/ 20-core/ 30-components/ 40-docs/ 50-release/
```

Файл задачи = frontmatter + разделы. Статусы: `todo | in-progress | blocked | done`.
Зависимости в `depends_on` (список id). `parallel: true` означает, что задачу можно вести одновременно с другими задачами того же этапа.
`model` — модель субагента для задачи: `haiku` для механических переименований, переносов и правок, где всё описано в задаче и нет подводных камней; `opus` для всего, где нужны решения (сборка, инфраструктура, компоненты со связями, сервисы). Оркестратор запускает субагента с этой моделью; если субагент на `haiku` упёрся в неописанную проблему — ставит `blocked`, пишет в «Заметки агента», оркестратор перезапускает задачу на `opus`.

## Порядок и параллелизм

| Этап | Задачи | Режим |
|---|---|---|
| 00-prep | 00-01 … 00-04 | 00-02 и 00-03 параллельно, затем 00-04 |
| 10-tooling | 10-01 → 10-02 → 10-03 | строго последовательно (меняют package.json и lockfile) |
| 20-core | 20-01 → 20-02, 20-03, 20-04 | 20-02/20-03/20-04 параллельно после 20-01 |
| 30-components | w1-*, w2-*, w3-*, w4-table | все параллельно после всего 20-core |
| 40-docs | 40-01 → 40-02 → 40-03 | после 30 (40-01 можно начать после 10-03) |
| 50-release | 50-01 → 50-02 → 50-03 | последовательно, в конце |

## Правила для агента

0. **Бриф субагенту** = путь к файлу задачи + ссылка на этот README + модель из поля `model`. Не пересказывать задачу в промпте, субагент читает файл сам.
1. **Worktree на задачу.** `git worktree add ../cattr-ui-<id> -b task/<id> feat/vue-3`. Работать только там. По завершении оркестратор делает rebase на `feat/vue-3` и fast-forward merge, затем `git worktree remove`.
2. **Прочитать перед стартом:** этот README, файл задачи, `CHANGELOG.md` (корень репозитория), а для 30-components ещё `30-components/README.md`.
3. **Зависимости пакетов меняют только задачи 00-*, 10-*, 20-01, 40-01, 50-01.** Остальные задачи не трогают `package.json`/`pnpm-lock.yaml`. Если без новой зависимости не обойтись, статус `blocked` и запись в «Заметки агента» с обоснованием.
4. **Установка:** `scripts/node.sh pnpm install --frozen-lockfile`. Если задача меняет зависимости: `scripts/node.sh pnpm install --no-frozen-lockfile` и коммит lockfile (скрипт выставляет `CI=1`, поэтому обычный `pnpm install` ведёт себя как frozen и упадёт при расхождении).
5. **Проверка перед коммитом:** команды из раздела «Проверка» задачи. Для любого кода после 10-02: `scripts/node.sh pnpm lint` и `scripts/node.sh pnpm format:check` без ошибок **в затронутых файлах**. После 10-03: `scripts/node.sh pnpm test`.
6. **Коммиты:** Conventional Commits, scope = компонент или область: `feat(select): migrate to provide/inject`, `build: switch to vite library mode`, `refactor(core): replace emitter mixin`, `docs: ...`, `style: ...`, `chore(plan): ...`. Footer: `Plan: <id>` и `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Форматирование prettier по всему репозиторию делается отдельным коммитом `style: ...`, не смешивать с логикой.
7. **Changelog:** если задача меняет публичное поведение, в том же коммите добавить запись в `CHANGELOG.md` (корень репозитория; раздел текущей версии, подраздел по компоненту/области). Публичным считается всё, что видит потребитель: имена компонентов, props, events, slots, сигнатуры сервисов `$Message/$Modal/$Notify/$Loading`, пути импорта, формат dist, формат i18n-хука.
8. **Статус:** при старте `status: in-progress`, при завершении `status: done`, заполнить «Заметки агента» (что отклонилось от плана, что обнаружено для других задач). Обновление статуса входит в финальный коммит задачи.
9. **Не расширять scope.** Нашёл проблему вне своей задачи: запиши в «Заметки агента» своей задачи и, если нужно, добавь строку в раздел «Найдено по ходу» в соответствующем файле задачи. Не чинить.
10. **Не трогать:** `src/stylesheet/**` (кроме явного указания в задаче), `.github/**` (только 50-02), файлы других компонентов.
11. **Запрещено:** `kubectl`, `helm`, любые действия с k3s; откат версий инструментов.

## Статус задач

`scripts/plan-status.sh` — таблица всех задач; `scripts/plan-status.sh ready` — задачи, которые можно брать прямо сейчас (все зависимости `done`).

## Запуск node

```sh
scripts/node.sh pnpm install --frozen-lockfile
scripts/node.sh pnpm lint
CATTR_UI_DOCKER_ARGS="-p 7200:7200" scripts/node.sh pnpm dev   # dev-сервер документации
scripts/node.sh npm view <pkg> version                           # проверить актуальную версию
```

Baseline-сборка до 10-01 (проверено 2026-10-24): `scripts/node.sh pnpm install --frozen-lockfile`, затем `CATTR_UI_DOCKER_ARGS="-e NODE_OPTIONS=--openssl-legacy-provider" scripts/node.sh pnpm build:package` (webpack 3 на Node 24 требует legacy openssl).

Кэш: `~/.cache/cattr-ui-node` — `corepack/` (бинарь pnpm), `pnpm-store/` (content-addressable store скачанных пакетов, общий для всех worktree; `node_modules` хардлинкуются из него), `pnpm-cache/` (метаданные registry), `npm/`. Образ `cattr-ui-node:24` собирается автоматически при первом запуске из `scripts/node.Dockerfile` (`node:24-slim` + bzip2/xz/unzip, python3/make/g++, git — всё, что нужно lifecycle-скриптам pnpm и node-gyp). Если задача требует нового системного пакета — добавить его в Dockerfile и пересобрать `CATTR_UI_NODE_REBUILD=1 scripts/node.sh true`, записать в «Заметки агента». Контейнер удаляется по выходу. pnpm 12 читает настройки только из переменных с префиксом `pnpm_config_*` (не `npm_config_*`) — учтено в скрипте.
Одновременные запуски из разных worktree безопасны: pnpm store рассчитан на параллельный доступ.

## Шаблон задачи

```markdown
---
id: 30-w1-button
title: Button, ButtonGroup → Vue 3
status: todo
depends_on: [20-01, 20-02, 20-04]
parallel: true
model: opus
touches: [src/components/button/**, src/components/button-group/index.js]
---
## Цель
## Факты (из инвентаризации)
## Шаги
## Критерии приёмки
## Проверка
## Changelog
## Найдено по ходу
## Заметки агента
```

## Целевые версии (проверено 2026-10-24 через `npm view`)

vue 3.5.44 · vue-router 5.4.0 · vue-i18n 11.4.16 · vite 8.3.5 · @vitejs/plugin-vue 6.0.10 · vitest 5.0.5 · @vue/test-utils 2.5.1 ·
eslint 10.13.0 · eslint-plugin-vue 10.11.1 · vue-eslint-parser 10.4.1 · sass 1.106.1 · unplugin-vue-markdown 32.1.1 · markdown-it 15.0.3 · markdown-it-container 4.0.0 · highlight.js 11.12.0 · deepmerge 4.3.1.
Vue 3.6 пока rc, не брать. Перед установкой агент перепроверяет актуальную версию через `npm view`.
