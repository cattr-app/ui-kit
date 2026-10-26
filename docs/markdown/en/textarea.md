
# Textarea

----

Textarea Input for multiline text, not for rich text entry.

## Basic

The textarea is fixed as two lines default, similear to the `AtInput` component.

:::demo
```html
<at-textarea v-model="inputValue" placeholder="Please input..."></at-textarea>
```
:::

## Disabled

To make textarea as disabled, add `disabled` property to the Textarea.

:::demo
```html
<at-textarea v-model="inputValue" placeholder="Please input..." disabled></at-textarea>
```
:::

## Adaptive Text Height (Limited)

Automatically adjusted the height of textarea according to the number of lines. The minimum and maximum number of rows can be set by `minRows` and `maxRows` properties.

:::demo
```html
<p class="demo-desc">minRows=2, maxRows=4</p>
<at-textarea v-model="inputValue2" min-rows="2" max-rows="4" placeholder="Please input multiline text..."></at-textarea>
```
:::

## Adaptive Text Height (Without Limited)

Automatically adjusted the height of textarea according to the number of lines without limited. Use `autosize` property.

:::demo
```html
<at-textarea v-model="inputValue3" autosize placeholder="Please input multiline text..."></at-textarea>
```
:::

## Textarea Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| name | same as native textarea | String | - | - |
| modelValue (v-model) | the value of textarea | String | - | - |
| rows | same as native textarea | Number | - | 2 |
| autosize | adaptive text height | Boolean | - | false |
| minRows | minimum number of rows for adaptive height | Number / String | - | - |
| maxRows | maximum number of rows for adaptive height | Number / String | - | - |
| placeholder | the text of placeholder | String | - | - |
| disabled | whether the textarea is disabled | Boolean | - | false |
| readonly | same as native textarea | Boolean | - | false |
| minlength | same as native textarea | Number | - | - |
| maxlength | same as native textarea | Number | - | - |
| autofocus | same as native textarea | Boolean | - | false |
| resize | whether to be resize by the user | String | `none`, `both`, `horizontal`, `vertical`  | `vertical` |

## Textarea Events

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| update:modelValue | Emitted when the value changes, used by `v-model` | the value (String) |
| change | Emitted when the value changes | the value (String) |
| focus | Emitted when focus | native `Event` |
| blur | Emitted when blur | native `Event` |

<script>
export default {
  data() {
    return {
      inputValue: '',
      inputValue2: '',
      inputValue3: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .at-textarea {
    & + .at-textarea {
      margin-top: 15px;
    }
  }
</style>
