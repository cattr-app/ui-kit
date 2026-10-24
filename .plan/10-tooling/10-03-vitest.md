---
id: 10-03
title: Vitest + @vue/test-utils, smoke-инфраструктура
status: todo
depends_on: [10-02]
parallel: false
model: opus
touches: [package.json, pnpm-lock.yaml, vitest.config.js, test/**, .gitignore]
---
## Цель
`pnpm test` работает; есть helper и один эталонный тест, который копируют задачи 30-*.

## Факты
- `.gitignore` содержит строку `test` — удалить её, иначе тесты не попадут в git.
- Тесты на Vue 3 код до миграции компонентов писать бессмысленно; эталон делаем на `src/utils/util.js` (чистые функции) и на `AtButton` только после 30-w1-button (там агент добавит сам).

## Шаги
1. devDependencies: `vitest`, `@vue/test-utils`, `happy-dom` (или `jsdom`, выбрать то, что совместимо с текущим vitest), `@vitest/coverage-v8` (опционально).
2. `vitest.config.js`: `mergeConfig` с `vite.config.js` (без `build.lib`), `test.environment: 'happy-dom'`, `test.include: ['test/**/*.spec.js']`, `test.globals: false`.
3. `test/helpers/mount.js`: обёртка над `mount` из `@vue/test-utils`, которая подключает плагин библиотеки (`global.plugins: [CattrUI]`) — чтобы вложенные `at-*` резолвились. До 20-01 плагин не рабочий, поэтому helper экспортировать, но эталонный тест его не использовать.
4. `test/utils/util.spec.js`: тесты `camelCaseToHyphen`, `deepCopy`, `hasClass/addClass/removeClass` (на `document.createElement`).
5. Scripts: `test: vitest run`, `test:watch: vitest`. Удалить из `.gitignore` строку `test`, добавить `coverage/`.
6. В `.plan/30-components/README.md` уже описано, какие smoke-тесты пишет каждая задача; ничего менять не нужно.

## Критерии приёмки
- `scripts/node.sh pnpm test` — зелёный, ≥1 файл тестов.
- `scripts/node.sh pnpm lint` не добавил ошибок в `test/**` и `vitest.config.js`.

## Проверка
```sh
scripts/node.sh pnpm install
scripts/node.sh pnpm test
scripts/node.sh pnpm lint
```

## Changelog
нет

## Найдено по ходу

## Заметки агента
