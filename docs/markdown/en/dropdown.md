
# Dropdown

----

Show a folded-styled dropdown menu.

## Basic

The most basic dropdown combines with `AtDropdown`，`AtDropdownMenu` and `AtDropdownItem`.

:::demo
```html
<at-dropdown>
  <span>Dropdown <i class="icon icon-chevron-down"></i></span>
  <template #menu>
    <at-dropdown-menu>
      <at-dropdown-item>Shenzhen</at-dropdown-item>
      <at-dropdown-item>Guangzhou</at-dropdown-item>
      <at-dropdown-item disabled>Shanghai</at-dropdown-item>
      <at-dropdown-item divided>Beijing</at-dropdown-item>
      <at-dropdown-item>hangzhou</at-dropdown-item>
    </at-dropdown-menu>
  </template>
</at-dropdown>
<at-dropdown>
  <at-button size="small">Dropdown <i class="icon icon-chevron-down"></i></at-button>
  <template #menu>
    <at-dropdown-menu>
      <at-dropdown-item>Shenzhen</at-dropdown-item>
      <at-dropdown-item>Guangzhou</at-dropdown-item>
      <at-dropdown-item disabled>Shanghai</at-dropdown-item>
      <at-dropdown-item divided>Beijing</at-dropdown-item>
      <at-dropdown-item>hangzhou</at-dropdown-item>
    </at-dropdown-menu>
  </template>
</at-dropdown>
```
:::

## Two Ways to Trigger

Use `trigger` property to change the way of trigger. Default is `hover`.

:::demo
```html
<at-dropdown>
  <at-button size="small">Hover Menu <i class="icon icon-chevron-down"></i></at-button>
  <template #menu>
    <at-dropdown-menu>
      <at-dropdown-item name="shenzhen">Shenzhen</at-dropdown-item>
      <at-dropdown-item name="guangzhou">Guangzhou</at-dropdown-item>
      <at-dropdown-item name="shanghai" disabled>Shanghai</at-dropdown-item>
      <at-dropdown-item name="beijin" divided>Beijing</at-dropdown-item>
    </at-dropdown-menu>
  </template>
</at-dropdown>
<at-dropdown trigger="click">
  <at-button size="small">Click Menu <i class="icon icon-chevron-down"></i></at-button>
  <template #menu>
    <at-dropdown-menu>
      <at-dropdown-item name="shenzhen">Shenzhen</at-dropdown-item>
      <at-dropdown-item name="guangzhou">Guangzhou</at-dropdown-item>
      <at-dropdown-item name="shanghai" disabled>Shanghai</at-dropdown-item>
      <at-dropdown-item name="beijin" divided>Beijing</at-dropdown-item>
    </at-dropdown-menu>
  </template>
</at-dropdown>
```
:::

## Placement

To change the alignment of Dropdown, add `placement` property to the Dropdown.

:::demo
```html
<at-dropdown placement="bottom-right">
  <at-button size="small">Hover Menu <i class="icon icon-chevron-down"></i></at-button>
  <template #menu>
    <at-dropdown-menu>
      <at-dropdown-item name="shenzhen">Shenzhen</at-dropdown-item>
      <at-dropdown-item name="guangzhou">Guangzhou</at-dropdown-item>
      <at-dropdown-item name="shanghai" disabled>Shanghai</at-dropdown-item>
      <at-dropdown-item name="beijin" divided>Beijing</at-dropdown-item>
    </at-dropdown-menu>
  </template>
</at-dropdown>
```
:::

## Events

Event `on-dropdown-command` emitted when the dropdown item was clicked, return the name of `DropdownItem`.

:::demo
```html
<at-dropdown placement="bottom-right" @on-dropdown-command="handleCommand">
  <at-button size="small">Hover Menu <i class="icon icon-chevron-down"></i></at-button>
  <template #menu>
    <at-dropdown-menu>
      <at-dropdown-item name="shenzhen">Shenzhen</at-dropdown-item>
      <at-dropdown-item name="guangzhou">Guangzhou</at-dropdown-item>
      <at-dropdown-item name="shanghai" disabled>Shanghai</at-dropdown-item>
    </at-dropdown-menu>
  </template>
</at-dropdown>
```
:::

## Dropdown Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| trigger | the way to trigger | String | `click`, `hover`, `focus` | `hover` |
| placement | placement of popup | String | `top`, `top-left`, `top-right`, `bottom`, `bottom-left`, `bottom-right` | `bottom` |
| modelValue (v-model) | whether the menu is open | Boolean | - | false |

## Dropdown Events

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| on-dropdown-command | Emitted when the dropdown item was clicked (not for `disabled` items); the menu closes afterwards | the name of item |
| update:modelValue | Emitted on every open/close (trigger, item click, click outside), used by `v-model` | Boolean |
| toggle | Emitted when the menu is toggled by the `click` trigger | Boolean, the new open state |

## Dropdown Slots

| Name      | Description |
|----------|-------- |
| - | the trigger element |
| menu | the dropdown menu, `<template #menu><at-dropdown-menu>…</at-dropdown-menu></template>` |

## DropdownItem Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| name | the value of dropdown item | String | - | - |
| disabled | whether the Dropdown Item is disabled | Boolean | - | false |
| divided | whether to show split line | Boolean | - | false |

<style lang="scss" scoped>
  .at-dropdown + .at-dropdown {
    margin-left: 8px;
  }
  .at-dropdown__trigger {
    > span {
      font-size: 12px;
    }
  }
</style>

<script>
  export default {
    methods: {
      handleCommand (name) {
        this.$Message(`点击菜单：${name}`)
      }
    }
  }
</script>
