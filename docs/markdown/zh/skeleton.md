
# Skeleton 骨架屏

----

在内容加载时显示的占位图，API 与 `vue-loading-skeleton` 一致

## 基础用法

没有内容时，`at-skeleton` 显示一个占满容器宽度、高度为一行文字的占位块

:::demo
```html
<at-skeleton></at-skeleton>
```
:::

## 多行

设置 `count` 显示多个占位块，例如段落。在块级 `tag` 中每个占位块各占一行

:::demo
```html
<at-skeleton :count="3" tag="div" class="skeleton-lines"></at-skeleton>
```
:::

## 尺寸和形状

`width` 和 `height` 可以是数字（像素）或任意 CSS 长度。设置 `circle` 显示圆形占位块，例如头像

:::demo
```html
<div class="skeleton-row">
  <at-skeleton circle :width="48" :height="48"></at-skeleton>
  <div class="skeleton-row__text">
    <at-skeleton width="40%" height="16px"></at-skeleton>
    <at-skeleton width="80%"></at-skeleton>
  </div>
</div>
```
:::

## 包裹内容

包裹正在加载的内容。未设置 `loading` 时，默认插槽为空就显示占位块，插槽渲染出内容后由内容替换占位块

:::demo
```html
<p>
  <at-button size="small" @click="name = name ? '' : 'Jane Roe'">{{ name ? 'Reset' : 'Load' }}</at-button>
</p>
<h4 class="skeleton-title"><at-skeleton width="160px">{{ name }}</at-skeleton></h4>
```
:::

## 加载状态

`loading` 显式控制占位块：`true` 时即使有内容也显示占位块，`false` 时始终显示内容

:::demo
```html
<p><at-switch v-model="loading"></at-switch> loading</p>
<at-skeleton :loading="loading" :count="2" tag="div" class="skeleton-lines">
  <p>The content is ready.</p>
  <p>The placeholder is replaced by the wrapped elements.</p>
</at-skeleton>
```
:::

## 动画

`duration` 设置一次闪烁动画的时长（秒），`0` 关闭动画

:::demo
```html
<at-skeleton :duration="3" tag="div" class="skeleton-lines"></at-skeleton>
<at-skeleton :duration="0" tag="div" class="skeleton-lines"></at-skeleton>
```
:::

## Skeleton 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| loading | 是否显示占位块；未设置时，默认插槽为空则显示 | Boolean | - | - |
| count | 占位块数量 | Number | - | 1 |
| width | 占位块宽度，数字单位为像素 | String / Number | - | 100% |
| height | 占位块高度，数字单位为像素 | String / Number | - | - |
| circle | 是否为圆形 | Boolean | - | false |
| duration | 一次动画的时长（秒），`0` 关闭动画 | Number | - | 主题变量 `$skeleton-duration`（1.5s） |
| tag | 外层元素；空字符串时内容不包裹外层元素 | String | - | `span` |

## Skeleton slot

| 名称      | 说明          |
|------------- |-------------- |
| default | 替换占位块显示的内容 |

<script>
export default {
  data() {
    return {
      name: '',
      loading: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .skeleton-lines {
    margin-bottom: 16px;

    :deep(.at-skeleton) {
      display: block;
      margin-bottom: 8px;
    }
  }
  .skeleton-row {
    display: flex;
    align-items: center;
    max-width: 400px;

    &__text {
      flex: 1;
      margin-left: 16px;

      :deep(.at-skeleton) {
        display: block;
        margin: 4px 0;
      }
    }
  }
  .skeleton-title {
    margin: 0;
  }
</style>
