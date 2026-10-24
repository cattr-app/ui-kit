# Этап 30: миграция компонентов

Один файл = одна задача = один worktree = один субагент. Все задачи параллельны между собой.
Зависимости: все `20-*` в статусе `done`. Radio (20-02) и Message (20-03) уже мигрированы как эталоны — **читать их код перед началом**.

## Общий чеклист (выполняется для каждого компонента, в файле задачи не дублируется)

1. **v-model**: prop `value` → `modelValue`, `this.$emit('input', v)` → `this.$emit('update:modelValue', v)`. Внутренний `watch: { value }` → `watch: { modelValue }`. Опция `model: {...}` удаляется.
2. **emits**: явный массив `emits: [...]` со всеми событиями компонента (правило `vue/require-explicit-emits`). Имена событий оставить как есть (`on-change`, `on-click` и т.д.), чтобы не плодить изменения, кроме `input`.
3. **Lifecycle**: `beforeDestroy` → `beforeUnmount`, `destroyed` → `unmounted`.
4. **`.native`** удалить: события на `at-button`/`at-input` теперь пробрасываются через `$attrs` (убедиться, что у дочернего компонента единственный корень или задан `inheritAttrs: false` + `v-bind="$attrs"` на нужном элементе).
5. **`$children` / `$parent` / `$on` / `dispatch` / `broadcast` / `findComponent*`** → provide/inject по паттерну ниже. После правки в файле не должно остаться импортов `mixins/emitter` и `findComponent`.
6. **Слоты**: `slot="x"` → `v-slot:x`/`#x`; в script `this.$slots.x` — это функция: проверка наличия `!!this.$slots.x`, в render — `this.$slots.x?.()`. В шаблонах `$slots.default` как булево работает.
7. **`<transition>`**: внутри единственный элемент с `v-if/v-show` (правило `require-toggle-inside-transition`). `<template v-for>` — `:key` на `<template>`.
8. **Корень шаблона**: если корень один — ничего; если фрагмент — проверить, куда падают `class`/`style`/listeners от родителя, при необходимости `inheritAttrs: false`.
9. **Приватные поля `this._x`**: в Vue 3 `_`-префикс в data не проксируется; переименовать в `timer`/`triggerEl` в data или держать вне реактивности (замыкание/`markRaw`).
10. **Options API сохраняем.** Переписывать на `<script setup>` не нужно — это не цель миграции. Composition API использовать только там, где это упрощает provide/inject.
11. **Lint**: `scripts/node.sh pnpm exec eslint <папка компонента>` — 0 ошибок, включая `vue/no-deprecated-*`. `scripts/node.sh pnpm format:check` по затронутым файлам.
12. **Smoke-тест** `test/components/<name>.spec.js`: монтируется с плагином (helper из `test/helpers/mount.js`), рендерит ожидаемый корневой класс, основное взаимодействие эмитит ожидаемое событие (для v-model — `update:modelValue`). 2–4 `it`, без снапшотов.
13. **Документация**: markdown в `docs/markdown/**` **не трогать** (этап 40). Но если меняется публичный API, кроме v-model (имя prop/event/slot, сигнатура), записать в `CHANGELOG-MIGRATION.md` → «По компонентам» и в раздел «Changelog» своего файла.
14. **Коммит**: `feat(<component>): migrate to vue 3` + `Plan: 30-wN-<name>`; статус задачи → `done` в том же коммите.

## Паттерн provide/inject

Эталон: `src/components/radio/src/{context.js,radio-group.vue,radio.vue,radio-button.vue}`, тесты `test/components/radio.spec.js`.

1. Ключ: в `src/components/<name>/src/context.js` — `export const TabsContext = createContext('AtTabs')` (`createContext` из `src/utils/context.js` → `{ key, provide(value), inject(fallback) }`; `provide`/`inject` вызывать только в `setup()`).
2. Родитель в `setup(props, { emit })` отдаёт **один** `reactive({...})`: props через `toRef(props, 'x')` (ref внутри reactive разворачивается — ребёнок читает `ctx.x`, без `.value`) + методы-команды (`update(v)`, `select(name)`), которые делают `emit` от имени родителя. Ребёнок никогда не эмитит в родителя сам.
3. Ребёнок: `setup() { const group = TabsContext.inject(null); return { group } }` — `null`, если компонент может жить без родителя (как Radio); `inject()` без аргумента = родитель обязателен (Vue warn в dev). Остальной компонент — обычный Options API, `this.group?.x` в computed/шаблоне.
4. Индекс/список детей (Tabs, Steps, Timeline, Collapse, Select, Menu): родитель `const { children, register, unregister } = useChildren()` из `src/composables/useChildren.js` и кладёт их в контекст; ребёнок `const { index } = useChild(Ctx.inject(null), exposed)` — регистрация в `setup` (пересортировка по DOM в `onMounted`), снятие в `onBeforeUnmount`, `children` — `shallowReactive` в DOM-порядке (`compareDocumentPosition`), `children[i].exposed` — то, что передал ребёнок (по умолчанию его proxy). Пример — `test/composables/useChildren.spec.js`. Переупорядочивание без перемонтирования (keyed `v-for`) — вызвать `sort()` из `onUpdated` родителя.
5. Минимум:
   ```js
   // parent: <at-tabs>
   setup(props, { emit }) {
     TabsContext.provide(reactive({ modelValue: toRef(props, 'modelValue'), update: v => emit('update:modelValue', v) }))
   },
   // child: <at-tab-pane>
   setup() {
     return { tabs: TabsContext.inject(null) }
   },
   computed: { active() { return this.tabs?.modelValue === this.name } },
   methods: { onClick() { this.tabs?.update(this.name) } },
   ```
6. `mixins/emitter.js` и `findComponent*` из `utils/util.js` не импортировать; сами файлы не удалять (удалит 50-01).

## Паттерн императивных сервисов

Эталон: `src/components/message/src/message.js` + `message.vue`, тесты `test/components/message.spec.js`.

- Сигнатура: `mountService(Component, props = {}, { appContext } = {})` → `{ instance, vm, el, update(patch), unmount() } | null` (`null` без `window`, SSR). `appContext` по умолчанию `getCurrentApp()?._context` — сервис работает с `<at-*>`/`t()` только после `app.use(CattrUI)`.
- Корневой элемент компонента (должен быть один элемент) переносится в `document.body`; `el` — он же.
- Параметры сервиса → **props** компонента (никаких `data: options`), слушатели → `onXxx` в props (`onClose`, `onDestroy`), в компоненте `emits: [...]`.
- Обновлять props только через `update(patch)`: мержит patch в текущие props и перерендеривает vnode в тот же контейнер, Vue патчит тот же instance (state/`el` сохраняются). Мутация `reactive`-объекта, переданного в props, **не работает** (`createVNode` копирует его).
- Внутреннее состояние (`visible`, таймеры) — `data` компонента; методы вызывать через `vm` (`service.vm.close()`).
- Очистка: компонент эмитит `destroy` в `@after-leave` своего `<transition>`, сервис вызывает `unmount()` (`render(null, container)` + `el.remove()`, повторный вызов безопасен). `$destroy`/`$el.parentNode.removeChild` не использовать, таймеры чистить в `beforeUnmount`.
- Стек экземпляров (`instances[]` с `{ id, vm, el, update, unmount }`) держит сервис; итерировать копию, если `close` делает `splice`. `Service.install = app => { app.config.globalProperties.$X = Service }`.
- Тесты: в happy-dom CSS нет, `<transition>` завершает leave через animation frame — `vi.useFakeTimers()` + `await vi.runAllTimersAsync()` + `nextTick()`, затем проверять, что элемент удалён из `document.body`.

## Волны

Волны — только подсказка по сложности, а не порядок. Запускать можно всё сразу; если субагентов мало, начинать с w3 (select, menu, modal) — там выше риск найти проблему в инфраструктуре 20-*.

| Волна | Задачи |
|---|---|
| w1 простые | button, tag, badge, alert, card, progress, switch, tooltip, popover, textarea, input, input-number, rate, slider |
| w2 пары | checkbox, collapse, steps, timeline, breadcrumb, dropdown |
| w3 сложные | select, menu, tabs, pagination, modal (+Dialog), notification, loading-bar |
| w4 | table |
