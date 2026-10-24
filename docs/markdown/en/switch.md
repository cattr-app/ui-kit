
# Switch

----

Switch is used for switching between two states, it's similar with the singleton `Checkbox`. But the `Switch` button is triggered to change state, while `Checkbox` is used more in form.

## Basic

Basic usage, trigger events when status changed.

:::demo
```html
<at-switch v-model="check" @change="changeStatus"></at-switch>
<span>{{check}}</span>
```
:::

## Inline Text or Icon

The contents of switch button can be customized, such as inserting text or icons to enhance visual effects. Complete by the `#checkedText` and `#unCheckedText` slots.

:::demo
```html
<at-switch>
  <template #checkedText><span>Open</span></template>
  <template #unCheckedText><span>Close</span></template>
</at-switch>
<at-switch>
  <template #checkedText><span><i class="icon icon-left-arrow"></i></span></template>
  <template #unCheckedText><span><i class="icon icon-right-arrow"></i></span></template>
</at-switch>
```
:::

## Disabled

To make a switch button as disabled, add `disabled` property to the Switch Button.

:::demo
```html
<at-switch disabled :model-value="true">
  <template #checkedText><span>Open</span></template>
  <template #unCheckedText><span>Close</span></template>
</at-switch>
<at-switch disabled>
  <template #checkedText><span>Open</span></template>
  <template #unCheckedText><span>Close</span></template>
</at-switch>
<at-switch disabled></at-switch>
```
:::

## Size

There are three sizes of a Switch Button: `large`，`normal`，`small`.

:::demo
```html
<div>
  <at-switch size="small"></at-switch>
  <at-switch size="small">
    <template #checkedText><span>Open</span></template>
    <template #unCheckedText><span>Close</span></template>
  </at-switch>
  <at-switch size="small" disabled></at-switch>
</div>
<div style="margin-top: 8px;">
  <at-switch></at-switch>
  <at-switch>
    <template #checkedText><span>Open</span></template>
    <template #unCheckedText><span>Close</span></template>
  </at-switch>
  <at-switch disabled></at-switch>
</div>
<div style="margin-top: 8px;">
  <at-switch size="large"></at-switch>
  <at-switch size="large">
    <template #checkedText><span>Open</span></template>
    <template #unCheckedText><span>Close</span></template>
  </at-switch>
  <at-switch size="large" disabled></at-switch>
</div>
```
:::

## Switch Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue (v-model) | whether the Switch is checked | Boolean | - | false |
| size | size of Switch | String | `small`, `normal`, `large` | normal |
| disabled | whether the Switch is disabled | Boolean | — | false |

## Switch Slots

| Name      | Description          |
|---------- |-------------- |
| checkedText | customize content when state is opening |
| unCheckedText | customize content when state is closed |

## Switch Events

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| update:modelValue | Emitted on every click (not when `disabled`), used by `v-model` | true or false |
| change | Emitted when the state of the switch is changed by a click | true or false |

<script>
export default {
  data() {
    return {
      check: true
    }
  },
  methods: {
    changeStatus(status) {
      this.check = status
    }
  }
}
</script>

<style lang="scss" scoped>
.at-switch + .at-switch {
  margin-left: 20px;
}
</style>
