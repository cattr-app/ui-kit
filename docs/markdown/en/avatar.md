
# Avatar

----

Shows a user picture or, without one, the user's initials on a coloured background. The API follows `vue-avatar`.

## Initials

The initials are taken from `username`: the first letter of each word, at most three. The background colour is picked from a palette by the name, so the same name always gets the same colour; the text is the background lightened by `lighten`.

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe"></at-avatar>
  <at-avatar username="John Doe"></at-avatar>
  <at-avatar username="Mary-Jane Watson"></at-avatar>
  <at-avatar username="Anna Maria de la Cruz"></at-avatar>
  <at-avatar username="Alex" :lighten="40"></at-avatar>
</div>
```
:::

## Custom Initials and Colours

`initials` replaces the computed initials, `parser` computes them with your own function (it gets the username and the default parser). `background-color` and `color` set the colours.

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe" initials="?"></at-avatar>
  <at-avatar username="Jane Roe" :parser="lastName"></at-avatar>
  <at-avatar username="Jane Roe" background-color="#6190E8" color="#FFFFFF"></at-avatar>
  <at-avatar username="" background-color="#EAEAEA"></at-avatar>
</div>
```
:::

## Size and Shape

`size` sets the width and height in pixels, the font size follows it. `:rounded="false"` makes the avatar square, `custom-style` adds any inline styles on top, e.g. a border radius.

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe" :size="24"></at-avatar>
  <at-avatar username="Jane Roe" :size="32"></at-avatar>
  <at-avatar username="Jane Roe" :size="64"></at-avatar>
  <at-avatar username="Jane Roe" :rounded="false"></at-avatar>
  <at-avatar username="Jane Roe" :custom-style="{ borderRadius: '8px' }"></at-avatar>
</div>
```
:::

## Inline

By default an avatar is a block (`display: flex`); `inline` places it in the text flow.

:::demo
```html
<p>
  Assigned to <at-avatar username="Jane Roe" :size="20" inline></at-avatar> Jane Roe
  and <at-avatar username="John Doe" :size="20" inline></at-avatar> John Doe
</p>
```
:::

## Image

With `src` the avatar shows the image. If the image fails to load, the initials are shown instead.

:::demo
```html
<div class="avatar-row">
  <at-avatar username="Jane Roe" :src="photo"></at-avatar>
  <at-avatar username="John Doe" :src="brokenPhoto" class="avatar-fallback"></at-avatar>
</div>
```
:::

## Avatar Props

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| username | the name the initials and the background colour are computed from | String | - | - |
| initials | initials to show instead of the computed ones | String | - | - |
| parser | `(username, defaultParser) => initials` | Function | - | first letters of the words, at most 3 |
| src | image URL; on a load error the initials are shown | String | - | - |
| size | width and height in pixels | Number | - | 50 |
| rounded | whether the avatar is round | Boolean | - | true |
| inline | whether the avatar is inline (`inline-flex`) | Boolean | - | false |
| background-color | background colour of the initials | String | - | from the palette by `username` |
| color | text colour of the initials | String | - | the background lightened by `lighten` |
| lighten | how much the background is lightened for the text colour (added to each RGB channel) | Number | - | 80 |
| custom-style | extra inline styles, applied over the computed ones | Object | - | - |
| alt | accessible name; an empty string marks the avatar as decorative (hidden from screen readers) | String | - | `username` |

## Avatar Events

| Event Name      | Description          | Return Value  |
|------------- |-------------- |---------- |
| avatar-initials | Emitted on mount when the initials are shown (no `src`) | `(username, initials)` |

<script>
const photo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><rect width="50" height="50" fill="#79A1EB"/><circle cx="25" cy="20" r="9" fill="#FFFFFF"/><path d="M8 50c2-11 9-17 17-17s15 6 17 17z" fill="#FFFFFF"/></svg>'

export default {
  data() {
    return {
      photo: `data:image/svg+xml,${encodeURIComponent(photo)}`,
      // valid base64, but not a PNG: the image fails to decode without a network request
      brokenPhoto: 'data:image/png;base64,AAAA'
    }
  },
  methods: {
    lastName(username, defaultParser) {
      return defaultParser(username.split(' ').pop())
    }
  }
}
</script>

<style lang="scss" scoped>
  .at-component__sample .at-avatar {
    margin-right: 8px;
  }
  .avatar-row {
    display: flex;
    align-items: center;
  }
  p .at-avatar {
    vertical-align: middle;
  }
</style>
