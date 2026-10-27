
# Select

----

## Basic

To make a select as disabled, add `disabled` property to the Select.

:::demo
```html
<at-select v-model="model1" style="width:100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou~Guangzhou~Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
</at-select>

<at-select v-model="model2" style="width:100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
</at-select>

<at-select v-model="model2" disabled style="width:100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
</at-select>
```
:::


## Size

There are three sizes of a Select: `large`，`normal`，`small`.

:::demo
```html
<at-select v-model="model3" size="small" style="width: 100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
</at-select>
<at-select v-model="model3" size="normal" style="width: 100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
</at-select>
<at-select v-model="model3" size="large" style="width: 100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
</at-select>
```
:::


## Clearable

Set `clearable` property to give Select Button the ability to empty options, only enable in Single Select Button.

:::demo
```html
<at-select v-model="model4" clearable size="large" style="width: 100px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
</at-select>
```
:::


## Option Group

Options can be grouped by `OptionGroup` component, and the name of the group can be set using the `label` property.

:::demo
```html
<at-select v-model="model5" style="width: 100px">
  <at-option-group label="Guangdong">
    <at-option value="1">Shenzhen</at-option>
    <at-option value="2">Guangzhou</at-option>
    <at-option value="3">zhuhai</at-option>
  </at-option-group>
  <at-option-group label="Other">
    <at-option value="4">Shanghai</at-option>
    <at-option value="5">Beijing</at-option>
    <at-option value="6" disabled>chengdu</at-option>
    <at-option value="7">kunming</at-option>
    <at-option value="8">hangzhou</at-option>
  </at-option-group>
</at-select>
```
:::


## Customize Template

Customize the option content. When using label property in Option, the option will show the label preferentially. Otherwise the text of the custom content is used as the label (`textContent`, without HTML markup).

:::demo
```html
<at-select v-model="model6" style="width: 140px">
  <at-option value="1" label="Shenzhen"><span>Shenzhen</span><span style="float: right;opacity: .6;font-size: 0.8em;">Shenzhen</span></at-option>
  <at-option value="2" label="Guangzhou"><span>Guangzhou</span><span style="float: right;opacity: .6;font-size: 0.8em;">Guangzhou</span></at-option>
  <at-option value="3" label="Shanghai"><span>Shanghai</span><span style="float: right;opacity: .6;font-size: 0.8em;">Shanghai</span></at-option>
  <at-option value="4" label="Beijing"><span>Beijing</span><span style="float: right;opacity: .6;font-size: 0.8em;">Beijin</span></at-option>
  <at-option value="5" label="chengdu"><span>chengdu</span><span style="float: right;opacity: .6;font-size: 0.8em;">Chengdu</span></at-option>
</at-select>
```
:::


## Multiple

Add `multiple` property can support multiple select. In the multiple mode, model will accept an array value.

:::demo
```html
<at-select v-model="model7" multiple style="width: 240px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
</at-select>
```
:::


## Searchable

To set search mode, add `filterable` property to the Select.

:::demo
```html
<at-select v-model="model8" filterable size="large" style="width: 240px">
  <at-option value="1">Shenzhen</at-option>
  <at-option value="2">Guangzhou</at-option>
  <at-option value="3">Shanghai</at-option>
  <at-option value="4">Beijing</at-option>
  <at-option value="5">chengdu</at-option>
  <at-option value="6">xiameng</at-option>
  <at-option value="7">kunming</at-option>
  <at-option value="8">hangzhou</at-option>
</at-select>
```
:::

## Remote

Add `remote` and `remote-method` to load options from a server. `remote-method(query, { signal })` is called with an empty query when the dropdown opens and with the typed text after the user stops typing (`debounce`, 300 ms). The select shows the loading state until the latest call settles; the options are rendered by the consumer with `at-option`, they are not filtered locally. `signal` is an `AbortSignal` that is aborted when a newer search starts: check it before applying a response (or pass it to `fetch`/axios), so a late answer to an old query does not replace the new results.

`on-load-more` is emitted with `{ query, signal }` when the end of the list comes into view (by scrolling, with the keyboard, or because the loaded page does not fill the dropdown), once per change of the list. Load the next page there and set `loading` while it is in flight; ignore the event when there is nothing more. `fallback-label` gives the label of a selected value whose option is not loaded yet; labels of options picked in this select are remembered. Slots `#empty` and `#footer` receive `{ query, loading }`.

The demo server answers after 400 ms, 15 tasks per page, and searches by name. The footer button creates a task with the typed name and selects it; it can be reached with Tab and pressed with Enter.

:::demo
```html
<at-select
  v-model="model9"
  remote
  clearable
  :remote-method="(query, ctx) => search(tasks, query, ctx)"
  :loading="tasks.loading"
  :fallback-label="id => (id === knownTask.id ? knownTask.name : undefined)"
  @on-load-more="ctx => loadMore(tasks, ctx)"
  style="width: 240px"
>
  <at-option v-for="task in tasks.items" :key="task.id" :value="task.id" :label="task.name" />
  <template #empty="{ query, loading }">
    <span v-if="loading">Loading tasks…</span>
    <span v-else>No tasks match "{{ query }}"</span>
  </template>
  <template #footer="{ query }">
    <span>{{ tasks.items.length }} of {{ tasks.total }} loaded</span>
    <at-button v-if="query" size="small" type="primary" style="float: right" @click="create(query)">Create "{{ query }}"</at-button>
  </template>
</at-select>

<script>
  // fetchTasks(query, page) is the API call: resolves to { items, total }
  export default {
    data () {
      return {
        model9: 42,
        // the selected task known to the page: from the form data or just created
        knownTask: { id: 42, name: 'Task 42' },
        tasks: { items: [], total: 0, page: 0, loading: false },
      }
    },
    methods: {
      // createTask(name) is the API call that stores a task: resolves to { id, name }
      async create (query) {
        const task = await createTask(query)
        this.knownTask = task
        this.model9 = task.id
      },
      async search (list, query, { signal }) {
        const { items, total } = await fetchTasks(query, 1)
        // a newer search has started: this response is stale
        if (signal.aborted) return
        Object.assign(list, { items, total, page: 1 })
      },
      async loadMore (list, { query, signal }) {
        if (list.items.length >= list.total) return
        list.loading = true
        try {
          const { items } = await fetchTasks(query, list.page + 1)
          if (signal.aborted) return
          list.items.push(...items)
          list.page += 1
        } finally {
          list.loading = false
        }
      },
    },
  }
</script>
```
:::

## Remote Multiple

In `multiple` mode the query and the loaded results stay after a pick, so several options can be chosen from one search; tags keep their labels when the results change.

:::demo
```html
<at-select
  v-model="model10"
  remote
  multiple
  :remote-method="(query, ctx) => search(tasks2, query, ctx)"
  :loading="tasks2.loading"
  @on-load-more="ctx => loadMore(tasks2, ctx)"
  style="width: 320px"
>
  <at-option v-for="task in tasks2.items" :key="task.id" :value="task.id" :label="task.name" />
</at-select>
```
:::

## Remote Top Placement

With `placement="top"` the dropdown opens above the field and is re-positioned whenever its height changes: when the results arrive, when a page is added and when the loading row appears or goes away.

:::demo
```html
<at-select
  v-model="model11"
  remote
  placement="top"
  :remote-method="(query, ctx) => search(tasks3, query, ctx)"
  :loading="tasks3.loading"
  @on-load-more="ctx => loadMore(tasks3, ctx)"
  style="width: 240px"
>
  <at-option v-for="task in tasks3.items" :key="task.id" :value="task.id" :label="task.name" />
</at-select>
```
:::

## Select Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
| :---------- | :-------------- | :---------- | :-----------------------------  | :-------- |
| modelValue (v-model) | value of the selected option; an array in `multiple` mode | String / Number / Array | - | - |
| multiple | whether support multiple | Boolean | - | false |
| disabled | whether Select is disabled | Boolean | - | false |
| clearable | whether can clear option | Boolean | - | false |
| filterable | whether support filter | Boolean | - | false |
| placeholder | text for placeholder | String | - | Select |
| size | size of Select | String | `large`, `normal`, `small` | normal |
| notFoundText | text to show when search no found | String | - | `No matching data` (from locale) |
| placement | the direction of popup | String | `top`, `bottom` | bottom |
| trigger | the way to open the popup | String | `click` | `click` |
| valueWithLabel | `on-change` carries `{ value, label }` (an array of them in `multiple` mode) instead of the value; `v-model` keeps the plain value | Boolean | - | false |
| remote | load options with `remote-method`; the input is shown, options are not filtered locally | Boolean | - | false |
| remoteMethod | `(query, { signal }) => Promise \| void`, called on open (empty query) and after typing; `signal` is aborted when a newer search starts | Function | - | - |
| debounce | delay in ms between the last keystroke and the `remote-method` call | Number | - | 300 |
| loading | shows the loading state (e.g. while the next page is loading); `on-load-more` is not emitted meanwhile | Boolean | - | false |
| loadingText | text of the loading state | String | - | `Loading` (from locale) |
| fallbackLabel | `value => label` for a selected value whose option is not rendered (e.g. not loaded yet); `undefined` — unknown | Function | - | - |

## Select Events

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| update:modelValue | Emitted when the user changes the selection (click or Enter on an option, removing a tag, the clear icon), used by `v-model` | the value / new array of values (also with `valueWithLabel`) |
| on-change | Emitted together with `update:modelValue`, only on user actions (not when `modelValue` is changed by the parent) | the value / new array of values; `{ value, label }` with `valueWithLabel` |
| on-load-more | `remote` only: the end of the list came into view while not loading; emitted once until the list changes or a new search starts | `{ query, signal }` — the query and `AbortSignal` of the current search |

## Select Slots

| Name      | Description          | Scope  |
|---------- |-------------- |---------- |
| default | `at-option` / `at-option-group` | - |
| empty | content shown instead of `notFoundText` (and, in `remote` mode, the loading text) when there are no options | `{ query, loading }` |
| footer | content under the list, e.g. a "create" button; shown even when nothing is found | `{ query, loading }` |

## Option Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
| :---------- | :-------------- | :---------- | :-----------------------------  | :-------- |
| value | value of the option | String / Number | - | - |
| label | text shown in the selected value and used for filtering; the text of the slot is used if omitted | String / Number | - | - |
| disabled | whether the option is disabled | Boolean | - | false |

## OptionGroup Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
| :---------- | :-------------- | :---------- | :-----------------------------  | :-------- |
| label | name of the group | String | - | - |

<script>
  // Remote demos: a fake server with a delay, pages and a search.
  const TASKS = Array.from({ length: 95 }, (_, i) => ({ id: i + 1, name: `Task ${i + 1}` }))
  const PAGE_SIZE = 15
  const DELAY = 400

  function fetchTasks (query, page) {
    return new Promise(resolve => {
      setTimeout(() => {
        const found = TASKS.filter(task => task.name.toLowerCase().includes(query.toLowerCase()))
        const start = (page - 1) * PAGE_SIZE
        resolve({ items: found.slice(start, start + PAGE_SIZE), total: found.length })
      }, DELAY)
    })
  }

  function createTask (name) {
    return new Promise(resolve => {
      setTimeout(() => {
        const task = { id: TASKS.length + 1, name }
        TASKS.push(task)
        resolve(task)
      }, DELAY)
    })
  }

  export default {
    data () {
      return {
        model1: '',
        model2: '2',
        model3: '',
        model4: '',
        model5: '',
        model6: '',
        model7: [],
        model8: '',
        model9: 42,
        model10: [],
        model11: '',
        knownTask: { id: 42, name: 'Task 42' },
        tasks: { items: [], total: 0, page: 0, loading: false },
        tasks2: { items: [], total: 0, page: 0, loading: false },
        tasks3: { items: [], total: 0, page: 0, loading: false },
      }
    },
    methods: {
      async create (query) {
        const task = await createTask(query)
        this.knownTask = task
        this.model9 = task.id
      },
      async search (list, query, { signal }) {
        const { items, total } = await fetchTasks(query, 1)
        if (signal.aborted) return
        Object.assign(list, { items, total, page: 1 })
      },
      async loadMore (list, { query, signal }) {
        if (list.items.length >= list.total) return
        list.loading = true
        try {
          const { items } = await fetchTasks(query, list.page + 1)
          if (signal.aborted) return
          list.items.push(...items)
          list.page += 1
        } finally {
          list.loading = false
        }
      },
    },
  }
</script>
