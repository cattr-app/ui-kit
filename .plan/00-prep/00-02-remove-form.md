---
id: 00-02
title: Удалить Form/FormItem и их документацию
status: todo
depends_on: [00-01]
parallel: true
model: haiku
touches: [src/components/form/**, docs/markdown/en/form.md, docs/markdown/zh/form.md, docs/router/nav.config.yml]
---
## Цель
Убрать мёртвый код до миграции, чтобы не переносить его на Vue 3.

## Факты
- `src/components/form/` (326 строк) не импортируется из `src/index.js`, компоненты не регистрируются.
- `form-item.vue` импортирует `async-validator`, которого нет ни в `package.json`, ни в `pnpm-lock.yaml`.
- Документация: `docs/markdown/{en,zh}/form.md`, пункт `Form` в `docs/router/nav.config.yml` (строка ~147 и аналог в zh-секции).

## Шаги
1. `git rm -r src/components/form docs/markdown/en/form.md docs/markdown/zh/form.md`.
2. Удалить пункты Form из обеих языковых секций `nav.config.yml`.
3. `grep -rn "form" src docs/router docs/views docs/components` — убедиться, что ссылок на `AtForm`/`form.md` не осталось (стили `src/stylesheet` не трогать).
4. Запись в `CHANGELOG-MIGRATION.md` → раздел «Удалено»: снять `[TODO 00-02]`.

## Критерии приёмки
- `grep -rn "AtForm\|components/form\|form.md" src docs --include=*.js --include=*.vue --include=*.yml` пусто.
- Текущая сборка Webpack не ломается: `scripts/node.sh pnpm install --frozen-lockfile && scripts/node.sh pnpm build:package` (если `pnpm install` падает на устаревших postinstall-скриптах — зафиксировать в заметках и считать критерий выполненным по grep).

## Проверка
```sh
scripts/node.sh pnpm install --frozen-lockfile
scripts/node.sh pnpm build:package
```

## Changelog
Раздел «Удалено»: AtForm/AtFormItem удалены. Если проект импортировал `@cattr/ui-kit/src/components/form` напрямую — заменить на собственную форму или `vee-validate`.

## Найдено по ходу

## Заметки агента
