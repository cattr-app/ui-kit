
# InputNumber 数字输入框

----

## 基础用法

支持传入 `step` 精度，以及指定取值范围 `max` , `min`。默认 `step` 取整数 1

:::demo
```html
<p class="demo-desc">基本输入框</p>
<div class="row no-gutter">
  <div class="col-md-4">
    <at-input-number v-model="num"></at-input-number><br>
  </div>
</div>
<p class="demo-desc">有取值范围的输入框，min=0, max=5</p>
<div class="row no-gutter">
  <div class="col-md-4">
    <at-input-number :min="0" :max="5"></at-input-number>
  </div>
</div>
```
:::

## 不可用状态

设置属性 `disabled` 禁用输入框

:::demo
```html
<div class="row no-gutter">
  <div class="col-md-4">
    <at-input-number disabled></at-input-number>
  </div>
</div>
```
:::

## 小数输入

参数 `step` 可以配置成小数

:::demo
```html
<p class="demo-desc">step=0.3, min=1</p>
<div class="row no-gutter">
  <div class="col-md-4">
    <at-input-number v-model="num2" :step="0.3" :min="1"></at-input-number>
  </div>
</div>
```
:::

## 不同尺寸

配置属性 `size`，可控制输入框的尺寸，默认支持三种尺寸：`large`，`normal`，`small`

:::demo
```html
<div class="row">
  <div class="col-sm-12 col-md-4">
    <at-input-number size="small"></at-input-number>
  </div>
  <div class="col-sm-12 col-md-4">
    <at-input-number></at-input-number>
  </div>
  <div class="col-sm-12 col-md-4">
    <at-input-number size="large"></at-input-number>
  </div>
</div>
```
:::

## InputNumber 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue | 输入框的值，可通过 `v-model` 绑定 | Number | - | 0 |
| size | 输入框尺寸 | String | `small`, `normal`, `large` | normal |
| step | 每次递增或递减的数目 | Number | - | 1 |
| min | 最小值 | Number | - | -Infinity |
| max | 最大值 | Number | - | Infinity |
| disabled | 是否禁用输入框 | Boolean | - | false |
| readonly | 是否设置成只读 | Boolean | - | false |
| autofocus | 是否自动聚焦到输入框 | Boolean | - | false |

未声明为参数的属性和监听器（如 `id`、`placeholder`、`@keyup`）会绑定到内部的原生 `<input>` 上，`class` 和 `style` 保留在外层元素上。Vue 3 中已移除 `native` 修饰符，直接监听即可。

## InputNumber 事件

| 事件名称      | 说明          | 返回值  |
|---------- |-------------- |---------- |
| focus | 获得焦点时触发 | event |
| blur | 失去焦点时触发 | event |
| update:modelValue | 绑定的值有变化时触发（用于 `v-model`） | 输入框的值 |
| change | 绑定的值有变化时触发（点击 +/- 或输入后失焦、回车），外部修改 `modelValue` 时不触发 | 输入框的值 |

<script>
export default {
  data() {
    return {
      num: 2,
      num2: 1
    }
  }
}
</script>
