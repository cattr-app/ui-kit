# Бэклог: ветки `component-*` (не входят в миграцию)

Оценка 2026-10-24. Три remote-ветки автора upstream (JChehe, 2017–2018), никогда не мержились ни в at-ui, ни в cattr-ui. Ответвлены от состояния до форка, отстают от `main` на 46–126 коммитов; стили в них лежат в submodule `at-ui-style`, который в cattr-ui заменён вендоренной копией `src/stylesheet` без этих файлов.

| Ветка | Состояние | Вердикт |
|---|---|---|
| `component-carousel` | заглушка: два компонента по 12 строк без логики, пустой md, стилей нет | удалить ветку, кода нет |
| `component-datepicker` | завершённый `AtDatePicker` (1081 строка): типы `date/month/year/daterange`, shortcuts, disabledDate, extra footer, размеры, i18n (en/zh), docs en/zh. Зависимость `moment`. Стили в `at-ui-style@475253d` → `src/components/datepicker.scss` (~400 строк, `.at-date-picker`, `.at-date-picker-range`) | кандидат на перенос **после** миграции, отдельной задачей |
| `component-timepicker` | завершённый `AtTimePicker` (421 строка): формат, steps, disabledHours/Minutes/Seconds, hideDisabledOptions, размеры, addon-слот, i18n, docs. Зависимость `moment`. Стили в `at-ui-style@9d8a986` → `src/components/time-picker.scss`. Плюс утилиты `scrollTop`, `capitalizeFirstLetter` в `util.js` | кандидат на перенос после миграции |

## Почему не в основной план

- Фронтенд Cattr сейчас использует `vue2-datepicker` + `moment`/`moment-timezone`/`vue-moment`. При переходе на Vue 3 `vue2-datepicker` и `vue-moment` отпадают, т.е. потребность в пикере появится, но решение «свой пикер из at-ui vs `@vuepic/vue-datepicker`» — продуктовое, вне scope миграции.
- Оба компонента завязаны на `moment` (19 и 15 обращений). Тянуть `moment` в библиотеку в 2026 году не стоит; при переносе заменить на `dayjs` (API-совместим) или на нативный `Intl` + `date-fns`.
- Код чистый для Vue 2 (нет `$parent/$children/$on`, только `Clickoutside`, `Locale` mixin), но: v-model **не реализован** — компоненты эмитят только `on-change`/`on-open-change`, prop `value` только входной; есть незакрытый TODO «keyboard input»; шаблон datepicker 300 строк без разбиения на панели.
- Стили нужно забирать из upstream-репозитория по хэшам выше и адаптировать под переменные нашего `src/stylesheet/src/variables`.

## Что из веток стоит взять в процессе миграции

- `scrollTop(el, from, to, duration)` из `util.js` ветки timepicker — пригодится в `30-w3-select` (прокрутка к активной опции при навигации клавиатурой) и `30-w3-tabs`. Брать без polyfill'а `requestAnimationFrame`.
- Идеи API для будущих пикеров: `shortcuts: [{ text, onClick }]`, `disabledDate(date)`, слот футера, `on-open-change`, пропсы `allowClear`, `steps`.

## Если решат переносить (черновик задач, не активны)

- `60-01-datepicker`: порт на Vue 3 + `modelValue`, `dayjs` вместо `moment`, стили из `at-ui-style@475253d`, разбить на `DatePanel/MonthPanel/YearPanel/RangePanel`, локали в 6 языков (`src/locale/lang`), docs en/zh, тесты. Оценка 3–4 дня, `model: opus`.
- `60-02-timepicker`: аналогично, стили из `at-ui-style@9d8a986`. 1–2 дня, `model: opus`.
- Ветки `component-*` после переноса или отказа удалить из origin.
