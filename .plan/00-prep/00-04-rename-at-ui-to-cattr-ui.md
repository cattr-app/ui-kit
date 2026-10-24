---
id: 00-04
title: Переименовать идентификаторы at-ui → cattr-ui (без CSS-префикса и имён компонентов)
status: done
depends_on: [00-03]
parallel: false
model: haiku
touches: [src/stylesheet/package.json, src/stylesheet/CONTRIBUTING.md, src/stylesheet/src/index.scss, src/stylesheet/src/variables/default.scss, src/locale/README.md, package.json, README.md, docs/**]
---
## Цель
В репозитории не остаётся названий `at-ui` / `AT-UI` / `AT UI` / `at-ui-style` и ссылок на aotu/o2team как на текущий проект.
**Не трогать** (решение заказчика): CSS-классы `at-*`, имена компонентов `At*` и теги `<at-*>`, ключи локали `at.*`, имена scss-файлов/миксинов.

## Факты
- Импорты `from 'at-ui/...'` уже убраны в 00-03 (зависимость). Остальные вхождения вне import-путей: ~230 в 45 файлах.
- `src/stylesheet/package.json`: `name: at-ui-style`, description, keywords `at-ui`/`at-ui-style`, author, `eslint-config-o2team` в devDependencies; `src/stylesheet/.eslintrc.js` extends `o2team` (удаляет 10-02, здесь не трогать, кроме случая, если файл мешает `grep`-критерию — тогда удалить сразу).
- `src/stylesheet/src/index.scss:2` и `variables/default.scss` — баннер-комментарий `AT-UI`. `src/stylesheet/CONTRIBUTING.md` — текст про AT-UI/AOTU Labs.
- `package.json` (корень): keywords `at`, `at-ui`.
- `src/locale/README.md`: упоминание `AT-UI`.
- `docs/`: `main.js` (alias-импорты `at-ui-lib`, `at-ui-locale-*`, `at-ui-style` — **оставить**, их заменяет 40-01; ключ `localStorage 'at-ui-language'` — переименовать), `router/index.js` (тот же ключ), `components/header.vue`, `footer.vue` (ссылки на github at-ui/aotu, логотипы), `index.html` (title), `views/index*.vue`.
- `docs/markdown/{en,zh}/*.md`: ~150 вхождений в тексте и примерах (`import ... from 'at-ui'`, `at-ui/dist/locale/*`, «AT-UI»). `changelog.md` — история upstream-версий, **не переименовывать**, добавить в начало строку «История AT UI до форка».
- `LICENSE` уже `amazingcat LLC` — не трогать. Упоминание «форк AT UI» в README сохранить как единственное место с оригинальным названием.
- `docs/assets/logo-at*.svg|png`, `aotu*.png`, `o2logo*` — файлы ассетов: заменить ссылки в коде, сами файлы удалить, если после правки не используются (`grep -rn <basename> docs`).

## Шаги
1. Скриптовая замена по `src docs README.md package.json` с исключениями `docs/markdown/*/changelog.md`, `LICENSE`, `src/stylesheet/css`:
   - `at-ui-style` → `cattr-ui-style`; `at-ui-language` → `cattr-ui-language`;
   - import-пути в markdown: `'at-ui'` → `'@amazingcat/cattr-ui'`, `at-ui/dist/locale/<x>` → `@amazingcat/cattr-ui/locale/<x>` (формат 2.0, см. changelog);
   - текст `AT-UI` / `AT UI` / `at-ui` → `Cattr UI`; `AT-UI-Style` → `Cattr UI Style`.
   Затем ручной просмотр `git diff` каждого файла: не задеть `at-` классы и `<at-*>` теги (замена строго по границам слова: `\bat-ui\b`, `\bAT-UI\b`).
2. `src/stylesheet/package.json`: `name: cattr-ui-style`, `private: true`, description «Stylesheet for Cattr UI», keywords `cattr`, `cattr-ui`, author `Cattr Team <hi@cattr.app>`. Проверить `pnpm --filter cattr-ui-style build` (команда `build:style` появится в 10-01; здесь `scripts/node.sh pnpm --filter cattr-ui-style build`).
3. `CONTRIBUTING.md` стилей: сократить до 5–10 строк про структуру `src/stylesheet/src` и сборку, без AOTU.
4. docs `header.vue`/`footer.vue`/`index*.vue`: ссылки на `https://github.com/cattr-app/ui-kit`, `https://cattr.app`; блоки «AOTU Labs / O2Team» убрать; неиспользуемые ассеты удалить.
5. Корневой `package.json`: keywords `cattr`, `cattr-ui`, `vue`, `vue3`, `ui`, `components`.
6. Changelog: запись в «Требования к окружению» — в примерах документации пакет импортируется как `@amazingcat/cattr-ui`; действий в проекте не требует, если он уже импортирует `@amazingcat/cattr-ui` (если фронтенд ещё на `@cattr/ui-kit` — заменить имя пакета).

## Критерии приёмки
- `grep -rniE "\bat-ui\b|\bat ui\b|aotu|o2team|at-ui-style" src docs README.md package.json --exclude-dir=css | grep -vE "docs/markdown/(en|zh)/changelog.md|README.md:.*форк"` пусто.
- `grep -rc "class=\"at-" src/components | awk -F: '{s+=$2} END {print s}'` не изменился относительно `main` (CSS-классы не задеты): сравнить с `git grep -c 'class="at-' main -- src/components | awk -F: '{s+=$2} END {print s}'`.
- `scripts/node.sh pnpm --filter cattr-ui-style build` проходит.

## Проверка
```sh
grep -rniE "\bat-ui\b|\bat ui\b|aotu|o2team|at-ui-style" src docs README.md package.json --exclude-dir=css | grep -vE "docs/markdown/(en|zh)/changelog.md|README.md:.*форк" && exit 1 || true
scripts/node.sh pnpm --filter cattr-ui-style build
# baseline webpack-сборка на текущем lockfile (webpack 3 на Node 24 требует legacy openssl):
scripts/node.sh pnpm install --frozen-lockfile
CATTR_UI_DOCKER_ARGS="-e NODE_OPTIONS=--openssl-legacy-provider" scripts/node.sh pnpm build:package
ls dist/at.js dist/at.min.js dist/locale
```

## Changelog
Имя пакета в примерах; имя workspace-пакета стилей (внутреннее).

## Найдено по ходу
- (из 00-02) `src/stylesheet/src/components/form.scss` и закомментированный `@import './form.scss'` в `index.scss` остались после удаления Form. Стили вне scope 00-04; решить в 50-01 (удалить, если `.at-form*` нигде не используется).

- (из 00-04) `build/component.js`, `build/locale.js`: баннеры собранного dist `AT-UI ... https://at.aotu.io ... O2Team`; `build/webpack.base.conf.js` и `build/webpack.prod.conf.js`: alias `at-ui*`. Не трогал (вне touches), уйдёт вместе с переписыванием сборки в 10-01.
- (из 00-04) корневой `.eslintrc.js` extends `o2team`; корневой и стилевой `package.json` держат devDependency `eslint-config-o2team`. Удалить в 10-02 вместе с конфигом.
- (из 00-04) `docs/components/header.vue` использует `logo-at@2x.png` (логотип AT). Замены логотипа Cattr в репо нет, файл оставлен.
- (из 00-04) Ссылки на `npm/@amazingcat/cattr-ui/dist/at.min.js` и `cattr-ui-style` в installation.md/introduction.md ведут на UMD-dist и приватный пакет; переписать в 40-02.


## Заметки агента
- Сделано: word-boundary замена `at-ui`/`AT-UI`/`AT UI` в src, docs, README; `at-ui-style`/`at-ui-language` → `cattr-ui-*`; `'at-ui'` импорты в markdown → `'@amazingcat/cattr-ui'`; `src/stylesheet/package.json` (name, private, description, keywords, author); корневые keywords; `CONTRIBUTING.md` стилей сокращён; footer/header/index.html без AOTU/O2Team; Hotjar-сниппет удалён из `docs/index.html` (трекер upstream-сайта at-ui.github.io, не относится к cattr); ссылки на upstream GitHub → `cattr-app/ui-kit`, у feather-ссылки в design.md — `feathericons/feather`; `vue init at-ui/at-template` и starter-kit абзац в quickstart удалены; картинка card-демо с misc.aotu.io удалена; демо-текст `O2Team`/`凹凸实验室` → `Cattr`; README: upstream-ссылка и дубль «Исходный проект» оставлены только в строке про форк.
- Удалённые ассеты: docs/assets/aotu.png, aotu@2x.png, o2logo.png, o2logo@2x.png, o2logo_2.png, o2logo-doc.png; logo-at* оставлены (используются header.vue). Удалён `src/stylesheet/.eslintrc.js` (extends o2team, мешал grep-критерию).
- Grep-критерий (после правок) выдаёт 5 строк: `src/stylesheet/package.json:31` и `package.json:65` — devDependency `eslint-config-o2team` (оставлена, уйдёт в 10-02, lockfile не трогал); `docs/main.js:9-12` — alias-импорты `at-ui-lib`, `at-ui-locale-zh/en`, `import 'at-ui-style'` (сознательно, заменит 40-01). `localStorage` ключ в docs/main.js и docs/router/index.js переименован в `cattr-ui-language`.
- `class="at-` в src/components: feat/vue-3 = 206, worktree = 206 (совпало). main = 210, разница от удалённых Form/FormItem; сравнивал с feat/vue-3 по брифу. Сверка at-токенов в diff: удалены только `at-ui*`, `at-template`, `at-webpack-boilerplate` (quickstart).
- `scripts/node.sh pnpm install --frozen-lockfile`: OK, lockfile не менялся (workspace-переименование ему не помешало).
- `scripts/node.sh pnpm --filter cattr-ui-style build`: OK (css/at.css, at.min.css; много deprecation-варнингов sass, не ошибки).
- Baseline `build:package` (с `NODE_OPTIONS=--openssl-legacy-provider`): OK, `dist/at.js`, `dist/at.min.js`, `dist/locale/*` созданы.
- Commit: один, ветка task/00-04, без push/merge/rebase.
