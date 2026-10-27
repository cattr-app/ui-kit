
# Skeleton

----

A placeholder shown while the content is loading. The API follows `vue-loading-skeleton`.

## Basic

Without content, `at-skeleton` renders a placeholder that takes the full width of its container and the height of a text line.

:::demo
```html
<at-skeleton></at-skeleton>
```
:::

## Multiple Lines

Use `count` to render several placeholders, for example for a paragraph. Each one takes its own line inside a block `tag`.

:::demo
```html
<at-skeleton :count="3" tag="div" class="skeleton-lines"></at-skeleton>
```
:::

## Size and Shape

`width` and `height` accept a number (pixels) or any CSS length. `circle` makes the placeholder round, e.g. for an avatar.

:::demo
```html
<div class="skeleton-row">
  <at-skeleton circle :width="48" :height="48"></at-skeleton>
  <div class="skeleton-row__text">
    <at-skeleton width="40%" height="16px"></at-skeleton>
    <at-skeleton width="80%"></at-skeleton>
  </div>
</div>
```
:::

## Wrapping Content

Wrap the content that is being loaded. While `loading` is not set, the placeholder is shown as long as the default slot is empty, and the content replaces it once it renders anything.

:::demo
```html
<p>
  <at-button size="small" @click="name = name ? '' : 'Jane Roe'">{{ name ? 'Reset' : 'Load' }}</at-button>
</p>
<h4 class="skeleton-title"><at-skeleton width="160px">{{ name }}</at-skeleton></h4>
```
:::

## Loading State

`loading` controls the placeholder explicitly: `true` shows it even over existing content, `false` always shows the content.

:::demo
```html
<p><at-switch v-model="loading"></at-switch> loading</p>
<at-skeleton :loading="loading" :count="2" tag="div" class="skeleton-lines">
  <p>The content is ready.</p>
  <p>The placeholder is replaced by the wrapped elements.</p>
</at-skeleton>
```
:::

## Animation

`duration` sets the length of one shimmer cycle in seconds; `0` turns the animation off.

:::demo
```html
<at-skeleton :duration="3" tag="div" class="skeleton-lines"></at-skeleton>
<at-skeleton :duration="0" tag="div" class="skeleton-lines"></at-skeleton>
```
:::

## Skeleton Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| loading | whether the placeholder is shown; when not set, it is shown while the default slot is empty | Boolean | - | - |
| count | number of placeholders | Number | - | 1 |
| width | width of a placeholder, a number is in pixels | String / Number | - | 100% |
| height | height of a placeholder, a number is in pixels | String / Number | - | - |
| circle | whether the placeholder is round | Boolean | - | false |
| duration | length of one animation cycle in seconds, `0` disables the animation | Number | - | the theme's `$skeleton-duration` (1.5s) |
| tag | wrapper element; an empty string renders the content without a wrapper | String | - | `span` |

## Skeleton Slots

| Name      | Description          |
|------------- |-------------- |
| default | the content shown instead of the placeholder |

<script>
export default {
  data() {
    return {
      name: '',
      loading: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .skeleton-lines {
    margin-bottom: 16px;

    :deep(.at-skeleton) {
      display: block;
      margin-bottom: 8px;
    }
  }
  .skeleton-row {
    display: flex;
    align-items: center;
    max-width: 400px;

    &__text {
      flex: 1;
      margin-left: 16px;

      :deep(.at-skeleton) {
        display: block;
        margin: 4px 0;
      }
    }
  }
  .skeleton-title {
    margin: 0;
  }
</style>
