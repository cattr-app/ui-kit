
# Avatar 头像

----

显示用户图片，没有图片时在彩色背景上显示用户名的首字母，API 与 `vue-avatar` 一致

## 首字母

首字母取自 `username`：每个单词的第一个字母，最多三个。背景色按用户名从调色板中选取，同一个名字总是得到同一种颜色；文字颜色是背景色按 `lighten` 调亮后的颜色

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe"></at-avatar>
  <at-avatar username="John Doe"></at-avatar>
  <at-avatar username="Mary-Jane Watson"></at-avatar>
  <at-avatar username="Anna Maria de la Cruz"></at-avatar>
  <at-avatar username="Alex" :lighten="40"></at-avatar>
</div>
```
:::

## 自定义首字母和颜色

`initials` 替换计算出的首字母，`parser` 用自定义函数计算首字母（参数为用户名和默认的解析函数）。`background-color` 和 `color` 设置颜色

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe" initials="?"></at-avatar>
  <at-avatar username="Jane Roe" :parser="lastName"></at-avatar>
  <at-avatar username="Jane Roe" background-color="#6190E8" color="#FFFFFF"></at-avatar>
  <at-avatar username="" background-color="#EAEAEA"></at-avatar>
</div>
```
:::

## 尺寸和形状

`size` 设置宽高（像素），字号随之变化。`:rounded="false"` 显示方形头像，`custom-style` 在计算出的样式之上追加任意内联样式，例如圆角

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe" :size="24"></at-avatar>
  <at-avatar username="Jane Roe" :size="32"></at-avatar>
  <at-avatar username="Jane Roe" :size="64"></at-avatar>
  <at-avatar username="Jane Roe" :rounded="false"></at-avatar>
  <at-avatar username="Jane Roe" :custom-style="{ borderRadius: '8px' }"></at-avatar>
</div>
```
:::

## 行内显示

头像默认是块级元素（`display: flex`），设置 `inline` 后在文字中行内显示

:::demo
```html
<p>
  负责人 <at-avatar username="Jane Roe" :size="20" inline></at-avatar> Jane Roe
  和 <at-avatar username="John Doe" :size="20" inline></at-avatar> John Doe
</p>
```
:::

## 图片

设置 `src` 显示图片。图片加载失败时显示首字母

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe" :src="photo"></at-avatar>
  <at-avatar username="John Doe" :src="brokenPhoto" class="avatar-fallback"></at-avatar>
</div>
```
:::

## Avatar 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| username | 用户名，用于计算首字母和背景色 | String | - | - |
| initials | 替换计算结果显示的首字母 | String | - | - |
| parser | `(username, defaultParser) => initials` | Function | - | 各单词首字母，最多 3 个 |
| src | 图片地址，加载失败时显示首字母 | String | - | - |
| size | 宽高（像素） | Number | - | 50 |
| rounded | 是否为圆形 | Boolean | - | true |
| inline | 是否行内显示（`inline-flex`） | Boolean | - | false |
| background-color | 首字母的背景色 | String | - | 按 `username` 从调色板选取 |
| color | 首字母的文字颜色 | String | - | 背景色按 `lighten` 调亮 |
| lighten | 文字颜色相对背景色的调亮程度（加到每个 RGB 通道） | Number | - | 80 |
| custom-style | 额外的内联样式，覆盖计算出的样式 | Object | - | - |
| alt | 无障碍名称；空字符串表示装饰性头像（对读屏软件隐藏） | String | - | `username` |

## Avatar 事件

| 事件名称      | 说明          | 返回值  |
|------------- |-------------- |---------- |
| avatar-initials | 挂载时显示首字母（未设置 `src`）则触发 | `(username, initials)` |

<script>
const photo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><rect width="50" height="50" fill="#79A1EB"/><circle cx="25" cy="20" r="9" fill="#FFFFFF"/><path d="M8 50c2-11 9-17 17-17s15 6 17 17z" fill="#FFFFFF"/></svg>'

export default {
  data() {
    return {
      photo: `data:image/svg+xml,${encodeURIComponent(photo)}`,
          brokenPhoto: 'data:image/png;base64,AAAA'
    }
  },
  methods: {
    lastName(username, defaultParser) {
      return defaultParser(username.split(' ').pop())
    }
  }
}
</script>

<style lang="scss" scoped>
  .at-component__sample .at-avatar {
    margin-right: 8px;
  }
  .avatar-row {
    display: flex;
    align-items: center;
  }
  p .at-avatar {
    vertical-align: middle;
  }
</style>
