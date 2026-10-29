
# Select 选择器

----

## 基础用法

基本用法，可添加 `disabled` 属性禁用选择器

:::demo
```html
<at-select v-model="model1" style="width:100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州广州广州广州广州广州广州广州广州广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
</at-select>

<at-select v-model="model2" style="width:100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
</at-select>

<at-select v-model="model2" disabled style="width:100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
</at-select>
```
:::


## 不同尺寸

可设置 `size` 属性控制选择器大小，提供三种尺寸：`large`，`normal`，`small`

:::demo
```html
<at-select v-model="model3" size="small" style="width: 100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
</at-select>
<at-select v-model="model3" size="normal" style="width: 100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
</at-select>
<at-select v-model="model3" size="large" style="width: 100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
</at-select>
```
:::


## 可清空选择

设置 `clearable` 属性可清空已选项，仅适用于单选选择器

:::demo
```html
<at-select v-model="model4" clearable size="large" style="width: 100px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
</at-select>
```
:::


## 分组选项

选项可通过使用 `AtOptionGroup` 组件进行分组，分组的名称可使用属性 `label` 设置

:::demo
```html
<at-select v-model="model5" style="width: 100px">
  <at-option-group label="广东省">
    <at-option value="1">深圳</at-option>
    <at-option value="2">广州</at-option>
    <at-option value="3">珠海</at-option>
  </at-option-group>
  <at-option-group label="其他">
    <at-option value="4">上海</at-option>
    <at-option value="5">北京</at-option>
    <at-option value="6" disabled>成都</at-option>
    <at-option value="7">昆明</at-option>
    <at-option value="8">杭州</at-option>
  </at-option-group>
</at-select>
```
:::


## 自定义模板

可自定义 `AtOption` 显示的内容，但是请给 `AtOption` 添加 `label` 属性，这可以让选择器优先显示选项的 `label` 值，而不是内容本身

:::demo
```html
<at-select v-model="model6" style="width: 140px">
  <at-option value="1" label="深圳"><span>深圳</span><span style="float: right;opacity: .6;font-size: 0.8em;">Shenzhen</span></at-option>
  <at-option value="2" label="广州"><span>广州</span><span style="float: right;opacity: .6;font-size: 0.8em;">Guangzhou</span></at-option>
  <at-option value="3" label="上海"><span>上海</span><span style="float: right;opacity: .6;font-size: 0.8em;">Shanghai</span></at-option>
  <at-option value="4" label="北京"><span>北京</span><span style="float: right;opacity: .6;font-size: 0.8em;">Beijin</span></at-option>
  <at-option value="5" label="成都"><span>成都</span><span style="float: right;opacity: .6;font-size: 0.8em;">Chengdu</span></at-option>
</at-select>
```
:::


## 多选列表

设置 `multiple` 属性可开启多项选择器，此时绑定的 `model` 将接受数组类型的数据

:::demo
```html
<at-select v-model="model7" multiple style="width: 240px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
</at-select>
```
:::


## 可搜索列表

添加 `filterable` 属性开启选择列表的可搜索功能

:::demo
```html
<at-select v-model="model8" filterable size="large" style="width: 240px">
  <at-option value="1">深圳</at-option>
  <at-option value="2">广州</at-option>
  <at-option value="3">上海</at-option>
  <at-option value="4">北京</at-option>
  <at-option value="5">成都</at-option>
  <at-option value="6">厦门</at-option>
  <at-option value="7">昆明</at-option>
  <at-option value="8">杭州</at-option>
</at-select>
```
:::

## 远程搜索

设置 `remote` 和 `remote-method` 从服务器加载选项。打开下拉框时以空查询调用 `remote-method(query, { signal })`，用户停止输入后（`debounce`，300 毫秒）以输入的文本调用。在最近一次调用结束（完成、拒绝或同步抛出异常）前，选择器显示加载状态，已被取代或取消的调用的结果（例如 `AbortError`）会被忽略；选项由使用方通过 `at-option` 渲染，不在本地过滤。`signal` 是 `AbortSignal`，开始新的搜索时会被中止：应用响应前先检查它（或传给 `fetch`/axios），这样旧查询的迟到响应不会覆盖新的结果。

列表末尾进入可视区域时（滚动、键盘导航，或已加载的页不足以填满下拉框）触发 `on-load-more`，参数为 `{ query, signal }`，列表每变化一次最多触发一次。在其中加载下一页，并在加载期间设置 `loading`；没有更多数据时忽略该事件。`fallback-label` 为尚未加载选项的已选值提供显示文本；在本选择器中选过的选项的文本会被记住。插槽 `#empty` 和 `#footer` 接收 `{ query, loading }`。

最近一次 `remote-method` 调用被拒绝或抛出异常时，选择器结束加载状态并触发 `on-remote-error(error, { query })`；错误不会再次抛出，请在该事件中展示它（例如在 `#empty` 中）。已被取代或取消的调用的错误会被忽略，不触发事件。`on-load-more` 的处理函数不会被等待：请在处理函数中处理下一页的错误。

示例服务器 400 毫秒后响应，每页 15 个任务，按名称搜索。底部按钮以输入的名称新建任务并选中它；可以用 Tab 聚焦、用 Enter 触发。

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
    <span v-if="loading">正在加载任务…</span>
    <span v-else>没有匹配“{{ query }}”的任务</span>
  </template>
  <template #footer="{ query }">
    <span>已加载 {{ tasks.items.length }} / {{ tasks.total }}</span>
    <at-button v-if="query" size="small" type="primary" style="float: right" @click="create(query)">新建“{{ query }}”</at-button>
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

## 远程搜索多选

`multiple` 模式下选择后保留查询和已加载的结果，便于从一次搜索中选择多项；结果变化时标签保留其文本。

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

## 远程搜索向上弹出

设置 `placement="top"` 时下拉框在输入框上方打开，高度变化时重新定位：结果返回、追加一页以及加载行出现或消失时。

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

## Select 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
| :---------- | :-------------- | :---------- | :-----------------------------  | :-------- |
| modelValue | 指定当前组件的 value 值，可通过 `v-model` 绑定 | String / Number / Array | - | - |
| multiple | 是否支持多选 | Boolean | - | false |
| disabled | 是否禁用选择器 | Boolean | - | false |
| clearable | 是否支持清空功能 | Boolean | - | false |
| filterable | 是否支持搜索功能 | Boolean | - | false |
| placeholder | 选择器的占位文案 | String | - | 请选择 |
| size | 设置选择器的尺寸 | String | `large`, `normal`, `small` | normal |
| notFoundText | 搜索无结果的提示 | String | - | 无匹配数据 |
| placement | `dropdown` 出现的位置 | String | `top`, `bottom` | bottom |
| valueWithLabel | 是否将 `label` 值一并返回，默认只返回 `value` | Boolean | - | false |
| remote | 通过 `remote-method` 加载选项；显示输入框，选项不在本地过滤 | Boolean | - | false |
| remoteMethod | `(query, { signal }) => Promise \| void`，打开时（空查询）和输入后调用；开始新的搜索时 `signal` 被中止 | Function | - | - |
| debounce | 最后一次输入到调用 `remote-method` 的延迟（毫秒） | Number | - | 300 |
| loading | 显示加载状态（例如加载下一页时）；期间不触发 `on-load-more` | Boolean | - | false |
| loadingText | 加载状态的文本 | String | - | 加载中 |
| fallbackLabel | `value => label`，为没有渲染选项（例如尚未加载）的已选值提供文本；返回 `undefined` 表示未知 | Function | - | - |

## Select 事件

| 事件名称      | 说明          | 返回值  |
|---------- |-------------- |---------- |
| update:modelValue | 用户选择、删除标签或清空时触发（用于 `v-model`） | 选中的选项值，类型为 `String`，`Number` 或者 `Array` |
| on-change | 用户选择、删除标签或清空时触发，程序修改 `modelValue` 时不触发 | 选中的选项值，类型为 `String`，`Number` 或者 `Array`；设置 `value-with-label` 时为 `{ value, label }` 或其数组 |
| on-load-more | 仅 `remote`：未在加载时列表末尾进入可视区域；在列表变化或开始新的搜索之前只触发一次 | `{ query, signal }`，当前搜索的查询和 `AbortSignal` |
| on-remote-error | 仅 `remote`：最近一次 `remote-method` 调用被拒绝或抛出异常；加载状态结束，错误不会再次抛出。已被取代或取消的调用的错误会被忽略 | `(error, { query })`，错误和失败调用的查询 |

## Select 插槽

| 名称      | 说明          | 参数  |
|---------- |-------------- |---------- |
| default | `at-option` / `at-option-group` | - |
| empty | 没有选项时代替 `notFoundText`（`remote` 模式下也代替加载文本）显示的内容 | `{ query, loading }` |
| footer | 列表下方的内容，例如“新建”按钮；没有匹配结果时也显示 | `{ query, loading }` |

## Option 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| value | 选项的值 | String / Number | - | - |
| label | 选项的显示文本，不设置时取插槽内容的文本 | String / Number | - | - |
| disabled | 是否禁用该选项 | Boolean | - | false |

## OptionGroup 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| label | 分组的名称 | String | - | - |

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
