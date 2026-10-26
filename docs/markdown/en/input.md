
# Input

----

## Basic

Basic Input Box, default width is `100%`.

:::demo
```html
<at-input v-model="inputValue" placeholder="Please input"></at-input>
<at-input v-model="inputValue" placeholder="Disabled" disabled></at-input>
<at-input v-model="password" type="password" placeholder="Password"></at-input>
```
:::

## With Status

Add the property `status`, which represents the input box with different meanings. It does not affect the button logic. Provide four status by default: `success`，`error`，`warning`，`info`

:::demo
```html
<at-input v-model="inputValue2" placeholder="success" status="success" icon="check-circle"></at-input>
<at-input v-model="inputValue2" placeholder="error" status="error" icon="x-circle"></at-input>
<at-input v-model="inputValue2" placeholder="warning" status="warning" icon="alert-circle"></at-input>
<at-input v-model="inputValue2" placeholder="info" status="info" icon="info"></at-input>
```
:::

## Wich Icon

To display the tooltip icon after the input box, add `icon` property to Input. Its value is the class name of Icon. Please refer to the section of `Brand/Icon` for details.

:::demo
```html
<at-input v-model="inputValue3" placeholder="Please input url" icon="link"></at-input>
```
:::

## Pre / Post Label

Use the `#prepend` or `#append` slot to customize the input box.

:::demo
```html
<at-input v-model="inputValue4" placeholder="Please input">
  <template #prepend>
    <span>Https://</span>
  </template>
</at-input>
<at-input v-model="inputValue4" placeholder="Please input" size="small">
  <template #append>
    <span>@cattr.app</span>
  </template>
</at-input>
<at-input v-model="inputValue4" placeholder="Please input">
  <template #prepend>
    <i class="icon icon-link"></i>
  </template>
</at-input>
<at-input v-model="inputValue4" placeholder="Please input" prepend-button>
  <template #prepend>
    <span>Search</span>
  </template>
</at-input>
<at-input v-model="inputValue4" placeholder="Please input" append-button>
  <template #append>
    <span>Search</span>
  </template>
</at-input>
<at-input v-model="inputValue4" placeholder="Please input" prepend-button>
  <template #prepend>
    <i class="icon icon-search"></i>
  </template>
</at-input>
<at-input v-model="inputValue4" placeholder="Please input" append-button>
  <template #append>
    <i class="icon icon-search"></i>
  </template>
</at-input>
```
:::

## Size

There are three sizes of an Input box: `large`，`normal`，`small`.

:::demo
```html
<at-input v-model="inputValue" size="large" placeholder="Large Size"></at-input>
<at-input v-model="inputValue" placeholder="Normal Size"></at-input>
<at-input v-model="inputValue" size="small" placeholder="Small Size"></at-input>
```
:::

## Input Props

| Property      | Description          | Type      | Accepted values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| type | type of the native input | String | `text`, `password`, `number`, `email`… | `text` |
| name | same as `name` in native input | String | - | - |
| modelValue (v-model) | binding value | String / Number | - | - |
| placeholder | placeholder of input | String | - | - |
| disabled | whether input is disabled | Boolean | - | false |
| readonly | same as native input | Boolean | - | false |
| maxlength | maximum input text length | Number | - | - |
| minlength | minimum input text length | Number | - | - |
| max | same as native input | Number | - | - |
| min | same as native input | Number | - | - |
| autofocus | same as native input | Boolean | - | false |
| size | size of input | String | `small`, `normal`, `large` | normal |
| status | status of input | String | `success`, `error`, `warning`, `info` | - |
| icon | name of the icon shown after the input (without the `icon-` prefix) | String | - | - |
| prependButton | whether has prepend button or not | Boolean | - | false |
| appendButton | whether has append button or not | Boolean | - | false |

## Input slot

| Name | Description          |
|------ |------------ |
| prepend | Preposed content |
| append | Append content |

## Input Events

| Event Name | Description          | Return Value  |
|---------- |-------------- |---------- |
| update:modelValue | Emitted on every input, used by `v-model` | the input value (String) |
| change | Emitted on every input | the input value (String) |
| focus | Emitted when focus | native `Event` |
| blur | Emitted when blur | native `Event` |

Other attributes and listeners (`id`, `autocomplete`, `aria-*`, `@keyup.enter`, `@keydown`, `@paste`…) are passed to the native `<input>`; `class` and `style` stay on the wrapper `div.at-input`. Note that `@input` on `<at-input>` therefore receives the native `Event`; use `@update:model-value` or `@change` to get the value.

<script>
export default {
  data() {
    return {
      inputValue: '',
      inputValue2: '',
      inputValue3: '',
      inputValue4: '',
      password: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.at-input {
  width: 200px;

  & + .at-input {
    margin-top: 15px;
  }
}
</style>
