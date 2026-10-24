
# Collapse 折叠面板

----

## 基础用法

可以同时展开多个面板。

:::demo
```html
<at-collapse v-model="basicActive">
  <at-collapse-item
    v-for="(item, index) in list" :key="index"
    :title="item.title" :disabled="item.disabled">
    <div>
      {{ item.content }}
    </div>
  </at-collapse-item>
</at-collapse>
```
:::

## 手风琴效果

手风琴，每次只能打开一个面板。

:::demo
```html
<at-collapse v-model="accordionActive" accordion>
  <at-collapse-item
    v-for="(item, index) in list" :key="index"
    :title="item.title">
    <div>
      {{ item.content }}
    </div>
  </at-collapse-item>
</at-collapse>
```
:::

## 面板嵌套

面板内可以嵌套面板。

:::demo
```html
<at-collapse v-model="nestingActive" @on-change="changeHandle">
  <at-collapse-item
    v-for="(item, index) in list" :key="index"
    :title="item.title">
    <div>
      {{ index !== 0 ? item.content : '' }}
      <at-collapse accordion v-if="index === 0">
        <at-collapse-item title="嵌套面板">
          <div>嵌套面板的内容</div>
        </at-collapse-item>
      </at-collapse>
    </div>
  </at-collapse-item>
</at-collapse>
```
:::


## 自定义标题

除了可以通过属性 `title` 设置标题外，也可以通过插槽 `#title` 传入自定义内容。

:::demo
```html
<at-collapse v-model="value" accordion>
  <at-collapse-item name="collapse1">
    <template #title><div>标题一 <i class="icon icon-info"></i></div></template>
    <div>内容一</div>
  </at-collapse-item>
  <at-collapse-item name="collapse2">
    <template #title><div>标题一 <i class="icon icon-box"></i></div></template>
    <div>内容一</div>
  </at-collapse-item>
  <at-collapse-item>
    <template #title><div>标题一 <i class="icon icon-calendar"></i></div></template>
    <div>内容一</div>
  </at-collapse-item>
</at-collapse>
```
:::

## 极简风格

设置属性 `simple` 使用极简风格的折叠面板

:::demo
```html
<at-collapse v-model="simpleActive" simple accordion>
  <at-collapse-item
    v-for="(item, index) in list" :key="index"
    :title="item.title">
    <div>
      {{ item.content }}
    </div>
  </at-collapse-item>
</at-collapse>
```
:::

## Collapse 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| accordion | 是否开启手风琴模式（即至多展开一个面板项） | Boolean | - | false |
| modelValue | 当前激活面板项的 `name` 值，可使用 `v-model` 双向绑定 | Array / String / Number | - | - |
| simple | 是否使用极简风格 | Boolean | - | false |

## Collapse 事件

| 事件名称      | 说明          | 返回值  |
|---------- |-------------- |---------- |
| update:modelValue | 切换面板项时触发（用于 `v-model`） | 当前已展开面板项的 `name` 数组 |
| on-change | 切换面板项时触发 | 当前已展开面板项的 `name` 数组 |

## CollapseItem 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| title | 面板项的标题（或通过插槽 `#title` 传入任意内容） | String | - | - |
| name | 当前面板项的 `name`，与 Collapse 的 `modelValue` 对应，不填则为索引值（`'0'`, `'1'`, …） | String | - | - |
| disabled | 是否禁用当前面板项，禁用后将无法通过用户交互改变 | Boolean | - | false |

## CollapseItem slot

| 名称      | 说明 |
|----------|-------- |
| title | 面板项的标题（可传入任意内容） |
| - | 面板项的内容 |

<script>
  export default {
    data () {
      return {
        list: [
          { title: '标题1', content: '内容1' },
          { title: '标题2', content: '内容2' },
          { title: '标题3', content: '内容3', disabled: true }
        ],
        basicActive: ['0', '1'],
        accordionActive: '0',
        nestingActive: '0',
        simpleActive: '0',
        value: 'collapse1'
      }
    },
    methods: {
      changeHandle (val) {
        this.$Message.info(`collapse change event: ${val}`)
      }
    }
  }
</script>
