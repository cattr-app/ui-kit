---
id: 10-02
title: ESLint 10 flat config + eslint-plugin-vue 10 + Prettier 3, адаптация кода
status: done
depends_on: [10-01]
parallel: false
model: opus
touches: [package.json, pnpm-lock.yaml, eslint.config.js, .prettierrc, .prettierignore, .editorconfig, .eslintrc.js, src/**, docs/**]
---
## Цель
Рабочий линтер и форматтер на актуальных мажорах. Код приведён к новым правилам там, где это не требует миграции на Vue 3.
**Откат на ESLint 9 / старые плагины запрещён.** Несовместимость решается заменой плагина или адаптацией кода.

## Факты
- Сейчас ESLint 4 + `eslint-config-o2team` + `eslint-plugin-html`, `.eslintrc.js`. Prettier нет.
- Конфиг prettier задан заказчиком (ниже). Плагины не подключать: tailwind в репозитории нет.
- Правила Vue 3 (`flat/recommended`) на ещё не мигрированном коде дадут ошибки `no-deprecated-*` — это нормальная **инвентаризация**, их закрывают задачи 20-*/30-*. Отключать их нельзя.

## Шаги
1. Зависимости (devDependencies, актуальные версии через `npm view`): `eslint`, `@eslint/js`, `eslint-plugin-vue`, `vue-eslint-parser`, `globals`, `eslint-config-prettier`, `prettier`.
2. `.prettierrc` ровно такого содержания:
   ```json
   {
     "semi": false,
     "singleQuote": true,
     "tabWidth": 2,
     "useTabs": false,
     "trailingComma": "all",
     "endOfLine": "lf",
     "printWidth": 100,
     "bracketSpacing": true,
     "arrowParens": "avoid"
   }
   ```
   `.prettierignore`: `dist`, `node_modules`, `pnpm-lock.yaml`, `src/stylesheet/css`, `docs/markdown/**` (markdown с демо форматировать нельзя — ломает блоки `:::demo`), `.plan/**`.
3. `eslint.config.js` (ESM): `@eslint/js` recommended → `eslint-plugin-vue` `configs['flat/recommended']` → `eslint-config-prettier` последним. `languageOptions.globals`: browser + node для `vite.config.js`/`scripts`. `ignores`: `dist`, `node_modules`, `src/stylesheet/css`, `.plan`. Правила проекта: `vue/multi-word-component-names: off` (имена `AtButton` многословные, но docs-компоненты нет), `vue/require-default-prop: off`, `vue/require-explicit-emits: error`, `vue/no-deprecated-*` оставить `error` (из recommended). Lint `.md` не делать.
4. Удалить `.eslintrc.js`, `src/stylesheet/.eslintrc.js` (если есть ссылки на o2team).
5. Scripts: `lint: eslint .`, `lint:fix: eslint . --fix`, `format: prettier . --write`, `format:check: prettier . --check`.
6. Коммит 1 (`build(lint): ...`): конфиги и зависимости.
   Коммит 2 (`style: format codebase with prettier`): `pnpm format` по всему репозиторию, без ручных правок.
   Коммит 3 (`refactor: adapt to eslint 10 rules`): `pnpm lint:fix`, затем ручные правки по правилам, **не связанным с Vue 2→3** (`no-prototype-builtins`, `no-unused-vars`, `prefer-const`, `vue/order-in-components`, `vue/attributes-order` и т.п.).
7. В «Заметки агента» записать итог `pnpm lint`: количество оставшихся ошибок по правилам (`eslint . -f json | jq`), все они должны быть из семейства `vue/no-deprecated-*`, `vue/require-explicit-emits`, `vue/no-v-for-template-key-on-child`, `vue/require-toggle-inside-transition`, `vue/no-multiple-template-root`, т.е. предмет задач 20/30.
8. Changelog: снять `[TODO 10-02]`.

## Критерии приёмки
- `scripts/node.sh pnpm format:check` — 0 проблем.
- `scripts/node.sh pnpm lint` — ошибки только из списка п.7, перечислены в заметках с количеством.
- `scripts/node.sh pnpm build` по-прежнему проходит.
- В `package.json` только мажоры: eslint ≥10, eslint-plugin-vue ≥10, prettier ≥3.

## Проверка
```sh
scripts/node.sh pnpm install --no-frozen-lockfile
scripts/node.sh pnpm format:check
scripts/node.sh pnpm lint ; scripts/node.sh sh -c "pnpm exec eslint . -f json | node -e 'let d=\"\";process.stdin.on(\"data\",c=>d+=c).on(\"end\",()=>{const m={};for(const f of JSON.parse(d))for(const x of f.messages)m[x.ruleId]=(m[x.ruleId]||0)+1;console.log(m)})'"
scripts/node.sh pnpm build
```

## Changelog
Команды lint/format.

## Найдено по ходу
- (из 00-04) `src/stylesheet/.eslintrc.js` уже удалён; корневой `.eslintrc.js` extends `o2team` и `eslint-config-o2team` остаётся в devDependencies корня и `src/stylesheet/package.json` — удалить обе записи здесь.

## Заметки агента
- Версии: eslint 10.13.0, @eslint/js 10.0.1, eslint-plugin-vue 10.11.1, vue-eslint-parser 10.4.1, prettier 3.9.10, eslint-config-prettier 10.1.8, globals 17.13.0. Несовместимостей с ESLint 10 нет; `eslint-plugin-html` не нужен (vue-eslint-parser).
- Отклонение: в `.prettierignore` добавлено `src/stylesheet/**` (кроме `package.json`) — иначе prettier переформатирует 39 scss/json пакета стилей (README п.10).
- `lint:fix` запускался с `--rule` off для `vue/no-deprecated-destroyed-lifecycle` и `vue/no-deprecated-slot-attribute`: их автофикс — миграция Vue 2→3 (задачи 20/30).
- Итог `pnpm lint`: 95 проблем (89 errors, 6 warnings); из списка п.7 — 80 errors: require-explicit-emits 59, no-deprecated-events-api 10, no-deprecated-v-on-native-modifier 6, no-deprecated-destroyed-lifecycle 3, no-deprecated-slot-attribute 1, require-toggle-inside-transition 1 — инвентаризация 20/30.
- Вне списка п.7 (поведенческие, оставлены, записаны в «Найдено по ходу»): errors — no-undef 8 (`require`/`process`: docs 7 → 40-01, `mixins/popover.js` 1 → 20-04), no-self-assign 1 (message.js → 20-03); warnings — vue/no-required-prop-with-default 3 (alert, pagination, progress), vue/no-v-html 3 (popover 2, breadcrumb 1).
- Ручные правки (эквивалентные): неиспользуемые параметры/`catch (e)`, `hasOwnProperty.call`, мёртвые присваивания (notic, pagination, slider, table), self-assign в table, `:key` (index в src, стабильные в docs), sidebar `default: () => []`, rename `columnIndex` в table, удалены неиспользуемые Checkbox/Pagination в table, `ref` в textarea.
- Найдено: баг клампа страницы в pagination (w3-pagination), регистрация at-checkbox/at-pagination в table (w4-table).
