
# LoadingBar

----

Create a loading progress bar globally to display the status of asynchronous requests.

Because of reusability, `LoadingBar` creates only one instance globally (lazily, on the first call). `Cattr UI` adds it to `app.config.globalProperties` as `$Loading`, so you can use `this.$Loading` directly in components. In `<script setup>` import the service: `import { LoadingBar } from '@amazingcat/cattr-ui'`.

## Basic

Invoke `$Loading` by three methods: `start()`, `finish()`, `error()`; `update(percent)` sets the progress manually.

:::demo
```html
<at-button @click="start">Start</at-button>
<at-button @click="finish">Finish</at-button>
<at-button @click="error">Error</at-button>
<at-button @click="update">Update</at-button>

<script>
  export default {
    methods: {
      start () {
        this.$Loading.start()
      },
      finish () {
        this.$Loading.finish()
      },
      error () {
        this.$Loading.error()
      },
      update () {
        this.$Loading.update(50)
      }
    }
  }
</script>
```
:::

## LoadingBar Methods

| Function Name      | Description          | Parameter      |
|---------- |-------------- |---------- |
| start | start loading the progress from 0, and load automatically | - |
| finish | complete progress, the bar is removed 800 ms later | - |
| error | display the error type of progress bar, the bar is removed 800 ms later | - |
| update | stop the automatic progress and set the percentage | percent, Number (0–100) |
| config | global configuration, also applied to the bar already shown | `{ width }` |
| destroy | remove the bar immediately and stop all timers (e.g. on route change or in tests) | - |

## LoadingBar Configs

Provides the global configuration of `LoadingBar`, usage methods below:

```js
this.$Loading.config({
  width: 4
})
```

:::demo
```html
<at-button @click="setWidth">{{ btnText }}</at-button>
```
:::

## LoadingBar Config Options

| Property      | Description          | Type      | Accepted Values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| width | the width of line | Number | - | 2 |

<script>
export default {
  data () {
    return {
      isSetWidth: false,
      btnText: 'Set line width to 4px'
    }
  },
  methods: {
    start () {
      this.$Loading.start()
    },
    finish () {
      this.$Loading.finish()
    },
    error () {
      this.$Loading.error()
    },
    update () {
      this.$Loading.update(50)
    },
    setWidth () {
      if (this.isSetWidth) {
        this.isSetWidth = false
        this.btnText = 'Set line width to 4px'
        this.$Loading.config({
          width: 2
        })
      } else {
        this.isSetWidth = true
        this.btnText = 'Cancel the line width to 4px'
        this.$Loading.config({
          width: 4
        })
      }
    }
  }
}
</script>
