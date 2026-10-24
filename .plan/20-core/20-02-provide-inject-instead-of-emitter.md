---
id: 20-02
title: Замена emitter-mixin и findComponent* на provide/inject; эталон Radio/RadioGroup/RadioButton
status: done
depends_on: [20-01]
parallel: true
model: opus
touches: [src/utils/context.js, src/composables/**, src/components/radio/**, src/components/radio-group/index.js, src/components/radio-button/index.js, test/**, .plan/30-components/README.md]
---
## Цель
Инфраструктура связи «родитель ↔ потомки» без `$children`, `$on`, `$parent.$options.name`. Один эталонный компонент мигрирован полностью, остальные задачи 30-* повторяют паттерн.

## Факты
- `src/mixins/emitter.js`: `dispatch` (поиск вверх по `$parent` по `$options.name` + `$emit`) и `broadcast` (рекурсия по `$children`). Используется в 14 файлах; приёмники делают `this.$on(...)` в `created/mounted` (14 мест: dropdown, form(удалён), menu, menu-item, submenu, select, option, select/dropdown, radio).
- `src/utils/util.js`: `findComponentUpward/findComponentsUpward/findComponentDownward/findComponentsDownward` — `$parent/$children`. Используются 29 раз (select, menu, tabs и др.).
- Radio: `radio.vue` (`$on('init-data')`, `dispatch`), `radio-group.vue` (`broadcast`), `radio-button.vue` (читает `$parent.value/size/fill/textColor`, пишет `$parent.$emit('input')`).
- В Vue 3 `$children` нет; `$parent` есть, но пропускает фрагменты/`Transition`, и завязка на `$options.name` хрупкая.

## Шаги
1. `src/utils/context.js`: фабрика `createContext(name)` → `{ key: Symbol(name), provide(value), inject(fallback) }`. Паттерн регистрации детей с сохранением DOM-порядка: `src/composables/useChildren.js` — родитель держит `shallowReactive([])`, ребёнок в `onMounted` вызывает `register({ uid, el, exposed })`, в `onBeforeUnmount` — `unregister`; порядок пересчитывается по `el.compareDocumentPosition` (нужен для Tabs/Steps/Timeline/Collapse, где важен индекс).
2. `src/composables/useParent.js` (опционально, если удобнее): `inject` с предупреждением `console.warn` в dev, если родитель не найден.
3. Radio целиком на новый паттерн (Options API допустим, но без mixin emitter):
   - `RadioGroup`: `provide(RADIO_GROUP_KEY, { modelValue: toRef(props,'modelValue'), size, fill, textColor, update(v) })`; `modelValue`/`update:modelValue`; `emits: ['update:modelValue','change']`.
   - `Radio`, `RadioButton`: `inject(RADIO_GROUP_KEY, null)`; состояние из группы, если есть, иначе собственный `modelValue`. Убрать `$on('init-data')`, `dispatch`, `$parent.*`.
4. Удалить импорты emitter/findComponent из radio-файлов. Сами `emitter.js` и `findComponent*` **не удалять** (их используют ещё не мигрированные компоненты) — удаляет 50-01.
5. Тесты `test/components/radio.spec.js`: группа из трёх радио, клик по второму → `update:modelValue` с его значением; `RadioButton` наследует `size` из группы; одиночный `Radio` без группы работает по своему `modelValue`.
6. Дописать в `.plan/30-components/README.md` раздел «Паттерн provide/inject» с реальными именами файлов/функций, которые получились (3–5 строк + ссылка на radio как пример).

## Критерии приёмки
- `grep -rn "emitter\|findComponent\|\$parent\|\$children\|\$on(" src/components/radio` пусто.
- `pnpm test`, `pnpm build` зелёные; `pnpm exec eslint src/components/radio src/utils/context.js src/composables` без ошибок.
- `30-components/README.md` обновлён.

## Проверка
```sh
scripts/node.sh pnpm test
scripts/node.sh pnpm exec eslint src/components/radio src/utils src/composables
scripts/node.sh pnpm build
```

## Changelog
Radio/RadioGroup: `modelValue`; событие `change` остаётся. Запись в «По компонентам».

## Найдено по ходу

## Заметки агента
- `createContext(name)` → `{ key: Symbol(name), provide(value) → value, inject(...fallback) }` (`src/utils/context.js`); `inject()` без аргумента — родитель обязателен (Vue warn), `inject(null)` — опционален.
- `useChildren()` → `{ children /* shallowReactive [{ uid, el, exposed }] в DOM-порядке */, register(child), unregister(uid), sort() }`; `useChild(parent | null, exposed = proxy)` → `{ parent, index: ComputedRef<number> }` (`src/composables/useChildren.js`). `useParent.js` не делал — хватает `inject()` без fallback.
- Ключ группы и общая логика Radio/RadioButton — `src/components/radio/src/context.js` (`RadioGroupContext`, `useRadio(props, emit)`); группа провайдит `reactive({ modelValue, size, fill, textColor, update })`.
- Отклонение: в 1.x событие группы называлось `radio-group-change` (так и в docs), а не `change`; по задаче теперь `change`, записано в changelog как «было → стало». Docs (`docs/markdown/*/radio.md`) обновит 40-*. `RadioButton` получил `modelValue` (работает без группы).
- Lint `pnpm lint`: до 89 errors / 6 warnings → после 86 errors / 6 warnings (ушли 3 ошибки radio).
- Для 30-*: `sort()` нужен только при переупорядочивании детей без перемонтирования; `el` берётся из `proxy.$el` (для компонента-фрагмента — якорный текстовый узел, порядок всё равно корректен).
