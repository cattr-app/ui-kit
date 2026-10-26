# Cattr UI

UI-библиотека Cattr на Vue 3 и Vite. Проект является форком [AT UI](https://github.com/at-ui/at-ui) и сохраняет его API, дополняя оригинальную библиотеку стилями, темой и исправлениями, необходимыми Cattr.

> Это внутренняя библиотека Cattr, а не официальный релиз оригинальной библиотеки.

## Отличия от оригинала

- пакет публикуется как `@amazingcat/cattr-ui` и поставляется как ESM, peer-зависимость — `vue` `^3.5`;
- в пакете есть готовый CSS (`@amazingcat/cattr-ui/style.css`) и исходники стилей SCSS (`src/stylesheet`) для своей темы, отдельный пакет стилей не нужен;
- переменные, сетка, шрифты и стили компонентов адаптированы под интерфейс Cattr;
- поддерживается импорт отдельных компонентов;
- добавлено событие `rowClick` для строк таблицы;
- включены исправления поведения `InputNumber`, `Tabs`, `Table` и других компонентов, используемых в Cattr.

## Установка

```bash
pnpm add @amazingcat/cattr-ui
```

## Подключение

Подключение всей библиотеки:

```js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/style.css'
import App from './App.vue'

createApp(App).use(CattrUI).mount('#app')
```

`style.css` — готовый CSS с темой по умолчанию (есть и `style.min.css`), шрифты иконок подтягиваются сборщиком из пакета; Sass для него не нужен. После этого компоненты доступны глобально:

```vue
<template>
  <at-button type="primary">Сохранить</at-button>
</template>
```

Для импорта отдельного компонента используйте именованный экспорт `At*`:

```js
import { createApp } from 'vue'
import { AtButton } from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(AtButton)
app.mount('#app')
```

Вместо `app.use(AtButton)` можно вызвать `app.component(AtButton.name, AtButton)`.

Своя тема: вместо `style.css` подключите собственный SCSS-вход, который загружает исходники стилей с переопределёнными переменными (`src/stylesheet/src/variables/default.scss`):

```scss
// src/styles/cattr-ui.scss
@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' as cattr with (
  $brand-blue-500: #ff5722
);
```

```js
import './styles/cattr-ui.scss'
```

Для SCSS нужен Sass: `pnpm add -D sass-embedded` (рекомендуется; подойдёт и `sass`). С pnpm ≥ 10 добавьте в `pnpm-workspace.yaml` проекта, иначе `pnpm install` завершится ошибкой `ERR_PNPM_IGNORED_BUILDS` из-за `@parcel/watcher`:

```yaml
ignoredOptionalDependencies:
  - sass-embedded-all-unknown
  - sass-embedded-unknown-all
```

Для `sass` вместо этого: `allowBuilds: { '@parcel/watcher': false }`. Подробности — раздел «Стили» в [`CHANGELOG.md`](CHANGELOG.md).

Локали подключаются из `@amazingcat/cattr-ui/locale/<lang>` и передаются в плагин. Доступны `de`, `en-US` (по умолчанию), `fa-IR`, `ko-KR`, `pt-BR`, `zh-CN`:

```js
import de from '@amazingcat/cattr-ui/locale/de'

app.use(CattrUI, { locale: de })
```

Подключение к vue-i18n (версия 11, `legacy: false`) через хук `i18n(key, values)`:

```js
app.use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })
```

Если хук возвращает `null` или `undefined`, строка берётся из встроенной локали. У `i18n.global.t` для отсутствующего ключа вернётся сам ключ, поэтому fallback не сработает; в этом случае проверяйте `i18n.global.te(key)` или добавьте ключи `at.*` в сообщения vue-i18n.

## Миграция с 1.x

Пошаговое описание изменений с чеклистом миграции — в [`CHANGELOG.md`](CHANGELOG.md). Главное:

- `v-model` работает через prop `modelValue` и событие `update:modelValue`: `:value` и `@input` заменить на `:model-value` и `@update:model-value`;
- установка плагина через глобальный `Vue` заменена на `app.use(...)` после `createApp`;
- сигнатура `render` колонки таблицы изменилась: `render: (h, params)` стала `render: ({ item, column, index })`, VNode пишется в формате Vue 3;
- модификатор `.native` удалён: `@click.native` → `@click`.

## Разработка

Для разработки используются Node.js 24 (версия закреплена в `.nvmrc`) и pnpm (версия закреплена в поле `packageManager` `package.json`).

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Основные команды:

| Команда              | Назначение                                                                         |
| -------------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`           | Dev-сервер сайта документации на Vite с HMR (порт 7200)                            |
| `pnpm build`         | Сборка библиотеки в `dist/` (Vite, library mode, ESM) и готового CSS в `dist/css/` |
| `pnpm build:style`   | Сборка стилей (workspace-пакет `cattr-ui-style`)                                   |
| `pnpm build:docs`    | `build:style` и статический сайт документации в `dist-docs/`                       |
| `pnpm lint`          | Проверить JavaScript- и Vue-файлы линтером (ESLint)                                |
| `pnpm lint:fix`      | Проверить линтером и исправить автоматически исправимые ошибки                     |
| `pnpm format`        | Отформатировать файлы Prettier                                                     |
| `pnpm format:check`  | Проверить форматирование Prettier без изменений                                    |
| `pnpm test`          | Запустить тесты Vitest один раз                                                    |
| `pnpm test:watch`    | Запустить тесты Vitest в режиме watch                                              |
| `pnpm test:coverage` | Запустить тесты с отчётом покрытия (`coverage/`)                                   |

Dev-сервер документации: <http://localhost:7200/>.

При push в ветку `main` GitHub Actions собирает документацию и публикует её на GitHub Pages.

## Upstream и лицензия

Проект распространяется по лицензии [MIT](LICENSE).
