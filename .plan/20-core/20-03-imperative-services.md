---
id: 20-03
title: Инфраструктура императивных сервисов (createVNode/render) и эталон Message
status: todo
depends_on: [20-01]
parallel: true
model: opus
touches: [src/utils/mount-service.js, src/components/message/**, test/**]
---
## Цель
Замена `Vue.extend` + `$mount` + `$destroy` на `createVNode`/`render` с пробросом `appContext`. Message мигрирован как эталон; Dialog, Notification, LoadingBar делают задачи 30-w3-*.

## Факты
- `message.js`: `Vue.extend(MessageVue)`, `new MessageConstructor({ data: options })`, `instance.$mount()`, стек `instances[]` с расчётом `top` по `offsetHeight`, `zIndex` seed, `Message.close(id)`, `Message.closeAll`, методы `info/success/warning/error/loading`. Возвращает функцию закрытия.
- `message.vue`: `this.$destroy(true)` + удаление `$el` после transition `after-leave`; `Vue.prototype.$isServer` guard.
- `data: options` в Vue 2 подменяло data; в Vue 3 параметры передаются как props → в `message.vue` все поля (`message`, `type`, `icon`, `duration`, `showClose`, `onClose`, `top`, `visible`) должны стать props или state внутри `setup`.
- Сервисы должны рендерить `at-icon`/`at-button` и `t()` — нужен `appContext` приложения: берётся из `app` при `install` (20-01 кладёт его в `src/utils/context.js`, напр. `setCurrentApp(app)` / `getCurrentApp()`).

## Шаги
1. `src/utils/mount-service.js`: `mountService(Component, props, { appContext })` → создаёт `div`, `vnode = createVNode(Component, props)`, `vnode.appContext = appContext ?? getCurrentApp()?._context ?? null`, `render(vnode, container)`, `document.body.appendChild(container.firstElementChild)`; возвращает `{ instance: vnode.component, el, unmount() { render(null, container); el.remove() } }`. Guard SSR: `typeof window === 'undefined'`.
2. `message.vue`: props вместо data; `emits: ['close', 'destroy']`; по `after-leave` эмитить `destroy`, не трогать `$destroy`; `onClose` вызывать из `close()`.
3. `message.js`: через `mountService`; `instances[]` хранит `{ id, vm, el, unmount }`; `Message.close`, `closeAll`, типизированные методы, возврат функции закрытия — поведение 1:1 с текущим. Экспорт `default Message`; `Message.install = app => { app.config.globalProperties.$Message = Message }` (чтобы работало и как отдельный плагин).
4. Тесты `test/components/message.spec.js` (happy-dom): `Message('hi')` добавляет элемент `.at-message` в `document.body`; второй — ниже первого (`style.top` больше); вызов возвращённой функции и таймер `duration` удаляют элемент; `Message.closeAll()` очищает.
5. Записать в «Заметки агента» точную сигнатуру `mountService` — её используют 30-w3-modal, -notification, -loading-bar.

## Критерии приёмки
- `grep -rn "Vue.extend\|\$mount\|\$destroy\|\$isServer\|import Vue" src/components/message src/utils/mount-service.js` пусто.
- `pnpm test`, `pnpm build`, eslint по затронутым файлам — без ошибок.

## Проверка
```sh
scripts/node.sh pnpm test
scripts/node.sh pnpm exec eslint src/components/message src/utils/mount-service.js
scripts/node.sh pnpm build
```

## Changelog
`$Message` API без изменений по вызову; импорт `import { Message } from '@amazingcat/cattr-ui'`. Если потребитель вызывал `Message` **до** `app.use` — теперь иконки/локаль внутри не отрендерятся; вызывать после `app.use`.

## Найдено по ходу

## Заметки агента
