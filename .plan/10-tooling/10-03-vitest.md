---
id: 10-03
title: Vitest + @vue/test-utils, smoke-инфраструктура
status: done
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
scripts/node.sh pnpm install --no-frozen-lockfile
scripts/node.sh pnpm test
scripts/node.sh pnpm lint
```

## Changelog
нет

## Найдено по ходу

## Заметки агента
- (ревью при мерже) Асинхронный `mount` с ленивым импортом плагина заменён на синхронный со статическим импортом; `test/helpers/mount.spec.js` удалён. До 20-01 helper никем не импортируется, поэтому падение `src/index.js` на Vue 2 коде тесты не задевает. Sanity-спек для helper добавляет 20-01.
- Версии: vitest 5.0.5, @vue/test-utils 2.5.1, happy-dom 21.0.4 (vitest 5 peer `happy-dom: '*'`). Coverage-пакет не ставился; `coverage/` в `.gitignore` есть.
- `vitest.config.js`: `mergeConfig` с `vite.config.js`, из которого деструктуризацией выброшен `build` (lib/externals). Сборка `pnpm build` не изменилась, test/** в dist не попадает.
- `import('src/index.js')` сейчас падает при вычислении модуля: `Vue.extend` на `undefined` в `notification/src/notic.js` (и аналогично в остальных сервисах с `import Vue from 'vue'`).
- Поэтому `test/helpers/mount.js` импортирует плагин лениво: `mount` асинхронный, в 30-* писать `const wrapper = await mount(Comp, opts)`. `test/helpers/mount.spec.js` проверяет только экспорт, helper не вызывает.
- Для 20-01/20-03: после того как `src/index.js` станет импортируемым, первый же вызов helper проверит `app.use(CattrUI)`; статический импорт можно вернуть, `await` в тестах при этом не ломается.
- `pnpm lint`: 95 проблем (89 errors) — как до задачи, в test/** и vitest.config.js 0. `vitest.config.js` добавлен в блок node globals eslint.
