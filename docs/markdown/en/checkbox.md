
# Checkbox

----

## Basic

Bind `v-model` (a Boolean) separately for standalone use.

:::demo
```html
<at-checkbox v-model="checkboxValue1" label="Shenzhen">Shenzhen</at-checkbox>
<p class="demo-desc">{{ checkboxValue1 }}</p>
```
:::

## Disabled

To make a checkbox as disabled, add `disabled` property to the `Checkbox`.

:::demo
```html
<at-checkbox v-model="checkboxValue2" label="Shenzhen" disabled>Shenzhen</at-checkbox>
<at-checkbox v-model="checkboxValue3" label="Cattr" disabled checked>Cattr</at-checkbox>
```
:::

## Checkbox Group

Use `CheckboxGroup` combined with array to generate a combination.

:::demo
```html
<at-checkbox-group v-model="checkboxValue4">
  <at-checkbox label="Shenzhen">Shenzhen</at-checkbox>
  <at-checkbox label="Beijing">Beijing</at-checkbox>
  <at-checkbox label="Shanghai">Shanghai</at-checkbox>
  <at-checkbox label="Guangzhou" disabled>Guangzhou</at-checkbox>
  <at-checkbox label="Cattr" disabled>Cattr</at-checkbox>
</at-checkbox-group>
<p class="demo-desc">{{ checkboxValue4 }}</p>
```
:::

## Checkbox Props

| Property      | Description          | Type      | Accepted values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue (v-model) | whether the checkbox is selected (standalone use only) | Boolean | - | false |
| label | value of selection, used inside Checkbox Group | String / Number / Boolean | - | - |
| name | same as native checkbox | String | - | - |
| disabled | disable selection or not | Boolean | - | false |
| checked | initial selected state (standalone use only; inside a group use `modelValue` of the group) | Boolean | - | false |

## Checkbox Events

Emitted only when the checkbox is used alone; inside a group listen to the events of Checkbox Group.

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| update:modelValue | Emitted when the user toggles the checkbox, used by `v-model` | `true` / `false` |
| on-change | Emitted when the user toggles the checkbox | `true` / `false` |

## Checkbox Group Props

| Property      | Description          | Type      | Accepted values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue (v-model) | `label` values of the selected checkboxes | Array | - | [] |

## Checkbox Group Events

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| update:modelValue | Emitted when the user toggles a checkbox of the group, used by `v-model` | new array of the selected `label` values (the original array is not mutated) |
| on-change | Emitted when the user toggles a checkbox of the group | new array of the selected `label` values |

<script>
export default {
  data() {
    return {
      checkboxValue1: true,
      checkboxValue2: false,
      checkboxValue3: false,
      checkboxValue4: ['Shenzhen', 'Cattr']
    }
  }
}
</script>
