
# Card 卡片

---

## 典型卡片

包含标题、内容和额外操作。

:::demo
```html
<at-card style="width: 300px;">
  <template #title><h4>Card Title</h4></template>
  <template #extra><a>Extra</a></template>
  <div>
    Card Content
  </div>
</at-card>
```
:::

## 无边框

通过设置属性 `bordered: false`，不添加边框。

:::demo
```html
<at-card style="width: 300px;" :bordered="false">
  <template #title><h4>Card Title</h4></template>
  <template #extra><a>Extra</a></template>
  <div>
    Card Content
  </div>
</at-card>
```
:::

## 无阴影
通过设置属性 `no-hover: true` 来禁用鼠标悬停时显示的阴影效果。

:::demo
```html
<at-card style="width: 300px;" :no-hover="true">
  <template #title><h4>Card Title</h4></template>
  <template #extra><a>Extra</a></template>
  <div>
    Card Content
  </div>
</at-card>
```
:::

## 只显示卡片内容区域

只显示卡片内容，而不显示标题和额外操作。

:::demo
```html
<at-card style="width: 300px;" :body-style="{ padding: 0 }">
  <div>
    <div style="padding: 14px;">
      <p>Cattr UI</p>
    </div>
  </div>
</at-card>
```
:::


## 预加载的卡片（默认）

数据加载前的文本块 Loading。

:::demo
```html
<at-card :loading="loading" :style="{ width: '300px' }">
  <template #title><h4>Card Title</h4></template>
  <template #extra><a>Extra</a></template>
  <div>
    Card Content
  </div>
</at-card>
```
:::

## 预加载的卡片（自定义）

自定义数据加载前的文本块 Loading。

:::demo
```html
<at-card :loading="loading" style="width: 300px">
  <template #title><h4>Card Title</h4></template>
  <template #extra><a>Extra</a></template>
  <template #loading>加载中...</template>
  <div>
    Card Content
  </div>
</at-card>
```
:::

## Card 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| bordered | 是否有边框 | Boolean | - | true |
| noHover | 取消鼠标移过时所显示的阴影 | Boolean | - | false |
| bodyStyle | 自定义内容区域的样式 | Object | - | {} |
| loading | 当卡片内容还在加载中时，是否显示 loading | Boolean | - | false |

## Card slot

| 名称      | 说明 |
|----------|-------- |
| title | 自定义卡片标题 |
| extra | 自定义额外显示的内容，默认位置是在标题右侧 |
| loading | 自定义 loading 显示内容 |
| - | 卡片内容 |

<script>
export default {
  data() {
    return {
      loading: true
    }
  }
}
</script>
