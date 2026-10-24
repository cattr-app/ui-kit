
# Collapse

----

## Basic

You can expand multiple items.

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

## Accordion

In accordion mode, only one item can be expanded at once.

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

## Item nesting

Collapse is nested inside the Collapse.

:::demo
```html
<at-collapse v-model="nestingActive" @on-change="changeHandle">
  <at-collapse-item
    v-for="(item, index) in list" :key="index"
    :title="item.title">
    <div>
      {{ index !== 0 ? item.content : '' }}
      <at-collapse accordion v-if="index === 0">
        <at-collapse-item title="Item nesting title">
          <div>Item nesting content</div>
        </at-collapse-item>
      </at-collapse>
    </div>
  </at-collapse-item>
</at-collapse>
```
:::

## Custom title

Besides using the title attribute, you can customize item title with named slots, which makes adding custom content, e.g. icons, possible.

:::demo
```html
<at-collapse v-model="value" accordion>
  <at-collapse-item name="collapse1">
    <template #title><div>Title 1 <i class="icon icon-info"></i></div></template>
    <div>content 1</div>
  </at-collapse-item>
  <at-collapse-item name="collapse2">
    <template #title><div>Title 2 <i class="icon icon-box"></i></div></template>
    <div>content 2</div>
  </at-collapse-item>
  <at-collapse-item>
    <template #title><div>Title 3 <i class="icon icon-calendar"></i></div></template>
    <div>content 3</div>
  </at-collapse-item>
</at-collapse>
```
:::

## Simple Mode

Set `simple` property to use a simple collapse.

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

## Collapse Props

| Property  | Description   | Type      | Accepted Values         | Default |
|---------- |-------------- |---------- |-----------------------  |-------- |
| accordion | whether to open the accordion mode (ie, expand at most one item) | Boolean | - | false |
| modelValue (v-model) | `name` of the active item(s); values are converted to strings | Array / String / Number | - | - |
| simple | whether to use simple mode | Boolean | - | false |

## Collapse Events

| Event Name| Description   | Return Value  |
|---------- |-------------- |-------------- |
| update:modelValue | emitted when the user expands or collapses an item (used by `v-model`) | array of the active item names (strings) |
| on-change | emitted when the user expands or collapses an item | array of the active item names (strings); in `accordion` mode one element or empty |

## CollapseItem Props

| Property  | Description   | Type      | Accepted Values                  | Default |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| title | title of the item (you can customize item title with named slots) | String | - | - |
| name | the name of current item, corresponds with `modelValue` of Collapse. If omitted, the index of the item inside its Collapse is used (`'0'`, `'1'`, …) | String | - | - |
| disabled | users cannot change opening status of a disabled item | Boolean | - | false |

## CollapseItem slot

| Name      | Description |
|----------|-------- |
| title | title of the item |
| - | content of the item |

<script>
  export default {
    data () {
      return {
        list: [
          { title: 'title 1', content: 'content 1' },
          { title: 'title 2', content: 'content 2' },
          { title: 'title 3', content: 'content 3', disabled: true }
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
