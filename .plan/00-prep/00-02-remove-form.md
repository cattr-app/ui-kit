---
id: 00-02
title: Удалить Form/FormItem и их документацию
status: done
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
- `src/components/input/src/input.vue` (строки 116, 126) и `src/components/input-number/src/input-number.vue` (строка 133) вызывают `this.dispatch('AtFormItem', ...)`. После удаления форм это no-op (родителя с таким именем нет), но строка `AtFormItem` попадает под grep из критерия приёмки. Вне `touches` задачи, не чинено. Нужно решение: отдельная задача на удаление dispatch-вызовов из input/input-number (или правка критерия).
- `docs/router/nav.config.yml`: строка 147 — это заголовок ГРУППЫ `Form` над компонентами Checkbox, Input, InputNumber, Radio, Rate, Select, Switch, Slider, Textarea, а не пункт Form/FormItem. Пункта Form/FormItem в nav нет, в zh-секции аналога нет. Группа не удалялась, иначе потерялись бы документированные компоненты.
- `src/stylesheet/src/components/form.scss` и закомментированный `// @import './form.scss'` в `index.scss` остались (стили не трогаем по правилам). Классы `.at-form*` относятся к форме, которой больше нет.
- `scripts/node.sh pnpm install --frozen-lockfile` падает на postinstall `phantomjs-prebuilt` (нет `bzip2` в контейнере), см. «Заметки агента».

## Заметки агента
- Сделано: `git rm -r` для `src/components/form/` (index.js, src/form.vue, src/form-item.vue), `docs/markdown/en/form.md`, `docs/markdown/zh/form.md`.
- Отклонение от шагов: шаг 2 (удалить пункты Form из nav.config.yml) не выполнен. См. «Найдено по ходу».
- Changelog: снята пометка `[TODO 00-02]` в разделе «Удалено» `CHANGELOG-MIGRATION.md`, добавлена строка про импорт из `src/components/form`.
- Проверка install: `scripts/node.sh pnpm install --frozen-lockfile` → exit 1:
  `ERR_PNPM_EXECUTOR_LIFECYCLE_SCRIPT_FAILED` в `phantomjs-prebuilt@2.1.16 install`:
  `tar jxf /tmp/phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2` → `tar (child): bzip2: Cannot exec: No such file or directory`.
  Не чинилось (по инструкции). Полный лог в `/tmp/0002-install.log`.
- `pnpm build:package` не запускалось: без установленных зависимостей оно не проверяемо. Критерий считается по grep.
- Grep критерия `grep -rn "AtForm\|components/form\|form.md" src docs --include=*.js --include=*.vue --include=*.yml` НЕ пуст. Остались 3 совпадения по `AtFormItem` в input.vue (2) и input-number.vue (1). Это не `AtForm`-компонент, а строка dispatch. Вне scope, см. «Найдено по ходу». Критерий формально не выполнен.
