
# Message

----

Compared to `Notification`, `Message` is lighter,, centered at the top of the page, and used to display global messages, such as the feedback of operations.

- Provide four type of Message: `success`, `Error`, `Warning`, `Info`
- Showing and disappearing at the center of the top is a lightweight cue that does not interrupt user operations.

`Cattr UI` adds the global object `$Message` to `app.config.globalProperties`, so you can use `this.$Message` directly in components. In `<script setup>` import the service: `import { Message } from '@amazingcat/cattr-ui'` (call it after `app.use(CattrUI)`).

- `this.$Message(config)`
- `this.$Message.info(config)`
- `this.$Message.success(config)`
- `this.$Message.warning(config)`
- `this.$Message.error(config)`
- `this.$Message.loading(config)`
- `this.$Message.closeAll()`

`config` is a string (the message text) or an options object, see below. Every call returns a function that closes this message.

## Basic

There are four type of Message: `success`, `error`, `warning`, `info`.

:::demo
```html
<at-button @click="handleClick('info')">Info</at-button>
<at-button @click="handleClick('success')">Success</at-button>
<at-button @click="handleClick('warning')">Warning</at-button>
<at-button @click="handleClick('error')">Error</at-button>

<script>
  export default {
    methods: {
      handleClick (type) {
        if (type === 'info') {
          this.$Message.info('This is a info message!')
        } else if (type === 'success') {
          this.$Message.success('This is a success message!')
        } else if (type === 'warning') {
          this.$Message.warning('This is a warning message!')
        } else if (type === 'error') {
          this.$Message.error('This is a error message!')
        }
      }
    }
  }
</script>
```
:::

## Customize Duration

Customize message display duration by the `duration` option, in milliseconds (default `3000`). `0` keeps the message until it is closed.

:::demo
```html
<at-button @click="changeDuration">Customize Duration</at-button>

<script>
  export default {
    methods: {
      changeDuration () {
        this.$Message.info({
          message: 'This is a tooltip that will be closed after 10s automatically.',
          duration: 10000
        })
      }
    }
  }
</script>
```
:::

## Message of Loading

`this.$Message.loading` (like every other method) returns the method of close, which can be used to close manually.

:::demo
```html
<at-button @click="showLoading">Loading...</at-button>

<script>
  export default {
    methods: {
      showLoading () {
        const loading = this.$Message.loading({
          message: 'Loading...',
          duration: 0
        })
        setTimeout(loading, 3000)
      }
    }
  }
</script>
```
:::

## Message Options

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| type | the type of Message | String | `success`, `error`, `warning`, `info`, `loading` | `info` |
| message | the content of Message (shown as text) | String / Number | - | - |
| duration | time before auto-dismiss, in milliseconds; `0` disables auto-dismiss | Number | - | 3000 |
| icon | class name of a custom icon (e.g. `icon-star`), has priority over the icon of the type | String | - | icon of the type |
| onClose | specify a function that will be called when the message is closed, receives the message component instance | Function | - | - |

<script>
  export default {
    methods: {
      handleClick (type) {
        if (type === 'info') {
          this.$Message.info('This is a info message!')
        } else if (type === 'success') {
          this.$Message.success('This is a success message!')
        } else if (type === 'warning') {
          this.$Message.warning('This is a warning message!')
        } else if (type === 'error') {
          this.$Message.error('This is a error message!')
        }
      },
      changeDuration () {
        this.$Message.info({
          message: 'This is a tooltip that will be closed after 10s automatically.',
          duration: 10000
        })
      },
      showLoading () {
        const loading = this.$Message.loading({
          message: 'Loading...',
          duration: 0
        })
        setTimeout(loading, 3000)
      }
    }
  }
</script>


