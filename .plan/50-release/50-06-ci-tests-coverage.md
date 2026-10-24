---
id: 50-06
title: Тесты и отчёт покрытия в GitHub Actions
status: done
depends_on: [50-03]
parallel: true
model: opus
touches: [.github/workflows/ci.yml, vitest.config.js, .gitignore]
---
## Цель
На каждом PR (и push в `main`/`feat/vue-3`) прогоняются тесты с покрытием; результат виден в job summary и комментарием в PR; падение покрытия ниже порога валит job.

## Факты
- `ci.yml` (50-02) уже запускается на `pull_request` и `push` в `main`, `feat/vue-3`; шаг `Test` = `pnpm test`.
- `pnpm test:coverage` = `vitest run --coverage`, провайдер v8, `reporter: ['text','text-summary']`, include `src/**/*.{js,vue}`, exclude `src/stylesheet/**`, `src/locale/lang/**`. Текущее покрытие: statements 81.67%, branches 74.22%, functions 80.43%, lines 82.93%.
- `coverage/` в `.gitignore`.

## Шаги
1. `vitest.config.js` → `coverage.reporter: ['text-summary', 'json-summary', 'json', 'lcov']` (json-summary/json нужны action'у для PR-комментария, lcov — для внешних инструментов); `coverage.thresholds: { statements: 80, branches: 70, functions: 78, lines: 80 }` (чуть ниже текущих, чтобы ловить деградацию, но не падать на шуме). `reportOnFailure: true`, чтобы отчёт писался и при красных тестах.
2. `ci.yml`: шаг `Test` заменить на `pnpm test:coverage`; после него: (а) `cat coverage/coverage-summary.json` → краткая таблица в `$GITHUB_STEP_SUMMARY` (маленький node-однострочник или `jq`); (б) `actions/upload-artifact@v4` с `coverage/` (retention 14 дней, `if: always()`); (в) комментарий в PR через `davelosert/vitest-coverage-report-action@v2` с `if: github.event_name == 'pull_request'` — проверь актуальный мажор через `npm view`-аналога нет; используй v2 и запиши; для комментария нужны `permissions: pull-requests: write` — добавить на уровне job (не workflow), `contents: read` оставить.
3. Триггеры: оставить `pull_request` и `push` в `main`/`feat/vue-3`; добавить `workflow_dispatch`. Еженедельный `schedule` НЕ добавлять (lockfile frozen, дрейфа нет) — записать как рассмотренный вариант.
4. Параллельная задача 50-05 правит шаги `Build library`/`Build documentation` и package.json — не трогай их; меняй только блок тестов/покрытия и `permissions`.
5. `actionlint` в docker (как в 50-02), образ удалить. Прогнать `scripts/node.sh pnpm test:coverage` — пороги проходят; `pnpm lint --max-warnings 0`, `format:check`.

## Критерии приёмки
- actionlint чистый; `pnpm test:coverage` зелёный с порогами; `coverage/coverage-summary.json` создаётся.
- В `ci.yml`: coverage-шаг, summary, artifact, PR-комментарий под `if: pull_request`, `workflow_dispatch`.

## Проверка
```sh
scripts/node.sh pnpm test:coverage && ls coverage | head
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest -color
```

## Changelog
нет

## Найдено по ходу

## Заметки агента
- Покрытие (v8): statements 81.67%, branches 74.22%, functions 80.43%, lines 82.93%; пороги 80/70/78/80 проходят, нарушение проверено (`--coverage.thresholds.lines=99` → exit 1); `reportOnFailure: true`.
- Отклонение: reporter `lcovonly` вместо `lcov` — HTML-отчёт кладёт в `coverage/lcov-report/*.js`, и `eslint .` (нет `coverage/**` в ignores eslint.config) падает локально после `test:coverage`. Если добавить `coverage/**` в ignores, можно вернуть `lcov` ради HTML в артефакте.
- ci.yml: `Test with coverage` → `Coverage summary` (node-однострочник по `coverage-summary.json` в `$GITHUB_STEP_SUMMARY`, проверен локально) → `upload-artifact@v4` (`coverage/`, 14 дней, `if: always()`) → `davelosert/vitest-coverage-report-action@v2` только на `pull_request`; job-level `permissions: contents: read, pull-requests: write`; добавлен `workflow_dispatch`.
- `schedule` не добавлен: lockfile frozen, зависимости не дрейфуют между прогонами, еженедельный прогон ничего нового не покажет.
- Риск: в PR из форков токен read-only, шаг комментария упадёт (403) — при появлении внешних PR добавить условие `head.repo.full_name == github.repository`. actionlint чистый, lint/format:check зелёные.
