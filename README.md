# Cattr UI

UI-библиотека Cattr на Vue 2. Проект является форком [AT UI](https://github.com/at-ui/at-ui) и сохраняет его API, дополняя оригинальную библиотеку стилями, темой и исправлениями, необходимыми Cattr.

> Это внутренняя библиотека Cattr, а не официальный релиз AT UI. Для новых проектов стоит учитывать, что она основана на устаревшем стеке Vue 2 и Webpack 2.

## Отличия от AT UI

- пакет публикуется как `@amazingcat/cattr-ui`;
- исходники AT UI Style включены в `src/stylesheet`, отдельный пакет стилей не нужен;
- переменные, сетка, шрифты и стили компонентов адаптированы под интерфейс Cattr;
- поддерживается импорт отдельных компонентов;
- добавлено событие `rowClick` для строк таблицы;
- включены исправления поведения `InputNumber`, `Tabs`, `Table` и других компонентов, используемых в Cattr.

## Установка

```bash
yarn add @amazingcat/cattr-ui
```

## Подключение

Подключение всей библиотеки:

```js
import Vue from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/src/stylesheet/src/index.scss'

Vue.use(CattrUI)
```

После этого компоненты доступны глобально:

```vue
<template>
  <at-button type="primary">Сохранить</at-button>
</template>
```

Для импорта отдельного компонента:

```js
import Vue from 'vue'
import Button from '@amazingcat/cattr-ui/src/components/button'
import '@amazingcat/cattr-ui/src/stylesheet/src/index.scss'

Vue.use(Button)
```

## Разработка

Проект использует Node.js 14 (`lts/fermium`) и Yarn 3.2.

```bash
yarn install
yarn dev
```

Основные команды:

| Команда | Назначение |
| --- | --- |
| `yarn dev` | Запустить локальную документацию и стенд разработки |
| `yarn lint` | Проверить JavaScript- и Vue-файлы линтером |
| `yarn build:locale` | Собрать локализации |
| `yarn build:component` | Собрать библиотеку компонентов |
| `yarn build:doc` | Собрать документацию |
| `yarn dist` | Выполнить полную сборку |

По умолчанию dev-сервер доступен по адресу <http://localhost:7200/>.

## Upstream и лицензия

Исходный проект: [AT UI](https://github.com/at-ui/at-ui).

Проект распространяется по лицензии [MIT](LICENSE).
