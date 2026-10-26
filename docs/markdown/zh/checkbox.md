
# Checkbox 多选框

----

## 基本多选框

独立使用时，需要单独绑定 `model`

:::demo
```html
<at-checkbox v-model="checkboxValue1" label="深圳">深圳</at-checkbox>
<p class="demo-desc">{{ checkboxValue1 }}</p>
```
:::

## 不可用的多选框

添加 `disabled` 属性禁用多选框

:::demo
```html
<at-checkbox v-model="checkboxValue2" label="深圳" disabled>深圳</at-checkbox>
<at-checkbox v-model="checkboxValue3" label="Cattr" disabled checked>Cattr</at-checkbox>
```
:::

## 多选框组

适用于多个多选框绑定同一个 `model` 的情景

:::demo
```html
<at-checkbox-group v-model="checkboxValue4">
  <at-checkbox label="深圳">深圳</at-checkbox>
  <at-checkbox label="北京">北京</at-checkbox>
  <at-checkbox label="上海">上海</at-checkbox>
  <at-checkbox label="广州" disabled>广州</at-checkbox>
  <at-checkbox label="Cattr" disabled>Cattr</at-checkbox>
</at-checkbox-group>
<p class="demo-desc">{{ checkboxValue4 }}</p>
```
:::

## Checkbox 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue | 独立使用时的选中状态，可通过 `v-model` 绑定 | Boolean | - | false |
| label | 选中状态的值（在多选框组中使用） | String / Number / Boolean | - | - |
| name | 原生 `name` 属性 | String | - | - |
| disabled | 是否禁用按钮 | Boolean | - | false |
| checked | 是否已勾选（仅独立使用时有效，在多选框组中请通过组的 `modelValue` 控制） | Boolean | - | false |

## Checkbox Group 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue | 已勾选的多选框的 `label` 数组，可通过 `v-model` 绑定 | Array | - | [] |

## Checkbox 事件

| 事件名称      | 说明          | 返回值  |
|---------- |-------------- |---------- |
| update:modelValue | 独立使用时，选中状态变化时触发（用于 `v-model`） | `true` / `false` |
| on-change | 独立使用时，选中状态变化时触发（在多选框组中不触发，请监听组的事件） | `true` / `false` |

## Checkbox Group 事件

| 事件名称      | 说明          | 返回值  |
|---------- |-------------- |---------- |
| update:modelValue | 勾选的值变化时触发（用于 `v-model`） | 新的已勾选 `label` 数组 |
| on-change | 勾选的值变化时触发 | 新的已勾选 `label` 数组 |

<script>
export default {
  data() {
    return {
      checkboxValue1: true,
      checkboxValue2: false,
      checkboxValue3: false,
      checkboxValue4: ['深圳', 'Cattr']
    }
  }
}
</script>
