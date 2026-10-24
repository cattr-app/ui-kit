---
id: 30-w3-loading-bar
title: LoadingBar ($Loading) → Vue 3
status: done
depends_on: [20-01, 20-02, 20-03, 20-04]
parallel: true
model: opus
touches: [src/components/loading-bar/**]
---
## Цель
Компонент(ы) работают на Vue 3 по общему чеклисту из `30-components/README.md`.

## Факты (инвентаризация 2026-10-24)

- `$mount` ×1
- `Vue.extend` ×1
- файлы: loading-bar.js loading-bar.vue 

## Специфика
- `loading-bar.js`: класс с `Vue.extend`/`$mount`, единственный инстанс, `update({percent,status,show})`, `destroy()`. Через `mountService` с reactive props; API `start/update/finish/error` — проверить фактический набор в `index.js` и сохранить.

## Критерии приёмки
- Общий чеклист README выполнен; в папке компонента нет `emitter`, `findComponent`, `$children`, `$on(`, `.native`, `beforeDestroy`, `$emit('input'`.
- `scripts/node.sh pnpm exec eslint src/components/loading-bar` — 0 ошибок.
- Smoke-тест добавлен, `scripts/node.sh pnpm test` зелёный, `pnpm build` проходит.

## Проверка
```sh
grep -rnE 'emitter|findComponent|\$children|\$on\(|\.native|beforeDestroy|emit\(.input.' src/components/loading-bar && exit 1 || true
scripts/node.sh pnpm exec eslint src/components/loading-bar
scripts/node.sh pnpm test
scripts/node.sh pnpm build
```

## Changelog
Записать в CHANGELOG-MIGRATION.md → «По компонентам», если изменилось что-то кроме `modelValue`.

Записано в «Сервисы» → `LoadingBar` (`$Loading`): API сохранён, добавлены `destroy()` и `install`, `config({ width })` применяется к уже показанной полосе, повторный `start()` после `finish()/error()` больше не гасится отложенным hide.

## Найдено по ходу

- `src/stylesheet/src/components/loading-bar.scss`: `.at-loading-bar { height: 4px!important }` перебивает inline-высоту из `config({ width })` — опция `width` визуально не работает ни в 1.x, ни сейчас. Стили вне scope (п.10), решать в отдельной задаче/40-docs.

## Заметки агента
- Класс `src/loading-bar.js` — тонкая обёртка над `mountService(LoadingBarVue, props)`; `update()` патчит только заданные ключи (`percent/status/show/width`) через `service.update`, без старой проверки на truthy (раньше `percent: 0`/`show: false` игнорировались). `destroy()` → `unmount()` + сброс ссылки; без DOM (SSR) — no-op.
- `loading-bar.vue`: `data` → props `percent`, `status`, `show`, `width` (`height`/`color`/`failedColor` в коде 1.x не было, не добавлял); `emits` не нужен — компонент ничего не эмитит.
- `index.js`: ленивый единственный инстанс сохранён; таймер hide (800 мс) теперь отслеживается и чистится в `destroy()`/`start()`/`update()` — в 1.x он мог удалить полосу, запущенную заново сразу после `finish()`. `destroy()` без инстанса больше не создаёт его ради удаления.
- Публичное: добавлены `LoadingBar.destroy()` (нужен для тестов/очистки) и `LoadingBar.install`; `config({ width })` обновляет и уже показанную полосу. Тест `test/components/loading-bar.spec.js`, 5 `it`.
- Fade-out при скрытии не проигрывается (как и в 1.x: элемент удаляется сразу по таймеру hide).
