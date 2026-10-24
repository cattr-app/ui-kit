
# Timeline

---

## Basic

Basic timeline.

:::demo
```html
<at-timeline>
  <at-timeline-item><p>Brush teeth and wash face</p></at-timeline-item>
  <at-timeline-item><p>Have breakfast</p></at-timeline-item>
  <at-timeline-item><p>Work</p></at-timeline-item>
  <at-timeline-item><p>Sleep</p></at-timeline-item>
</at-timeline>
```
:::

## Circle Colors

Set the color of circles. green means completed or success status, red means error, yellow means warning, and blue means ongoing or other default status.

:::demo
```html
<at-timeline>
  <at-timeline-item color="blue"><p>Brush teeth and wash face</p></at-timeline-item>
  <at-timeline-item color="green"><p>Have breakfast</p></at-timeline-item>
  <at-timeline-item color="red"><p>Work</p></at-timeline-item>
  <at-timeline-item color="yellow"><p>Sleep</p></at-timeline-item>
</at-timeline>
```
:::

## Last Item

When the timeline is incomplete and ongoing, put a ghost item at last.

:::demo
```html
<at-timeline pending>
  <at-timeline-item><p>Brush teeth and wash face</p></at-timeline-item>
  <at-timeline-item><p>Have breakfast</p></at-timeline-item>
  <at-timeline-item><p>Work</p></at-timeline-item>
  <at-timeline-item><p>Sleep</p></at-timeline-item>
</at-timeline>
```
:::

## Custom Timeline Items

Accepts a `slot` to customize the timeline item's content, such as the icon.

:::demo
```html
<at-timeline>
  <at-timeline-item color="blue">
    <template #dot><i class="icon icon-github"></i></template>
    <p>Brush teeth and wash face</p>
  </at-timeline-item>
  <at-timeline-item color="green">
    <template #dot><i class="icon icon-zap"></i></template>
    <p>Have breakfast</p>
  </at-timeline-item>
  <at-timeline-item color="red">
    <template #dot><i class="icon icon-award"></i></template>
    <p>Work</p>
  </at-timeline-item>
  <at-timeline-item color="yellow">
    <template #dot><i class="icon icon-watch"></i></template>
    <p>Sleep</p>
  </at-timeline-item>
</at-timeline>
```
:::

## Timeline Props

| Property    | Description         | Type      | Accepted Values | Default  |
|-------- |------------ |---------- |-----------------  |-------- |
| pending | to specify whether the last node is a ghost node | Boolean | - | false |

## TimelineItem Props

| Property    | Description         | Type      | Accepted Values | Default  |
|-------- |------------ |---------- |-----------------  |-------- |
| color | circle color | String | `blue`、`red`、`green`、`yellow` | `blue` |

## TimelineItem Slot

| Name      | Description |
|----------|-------- |
| dot | custom defined timeline item content |
| - | main content |
