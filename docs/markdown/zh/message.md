
# Message 全局提示

----

相比 `Notification`，`Message` 更轻量，居中显示在页面顶部，用于展示全局消息，例如操作的反馈信息

- 提供消息、成功、错误、警告等反馈提示
- 在顶部居中显示，并自动消失，是一种不打断用户操作的轻量级提示

我们在 `app.config.globalProperties` 中添加了全局对象 `$Message`，我们可以直接通过 `this.$Message` 操作实例；在 `<script setup>` 中可以使用 `import { Message } from '@amazingcat/cattr-ui'`。需在 `app.use(CattrUI)` 之后调用

- `this.$Message(config)`
- `this.$Message.info(config)`
- `this.$Message.success(config)`
- `this.$Message.warning(config)`
- `this.$Message.error(config)`
- `this.$Message.loading(config)`
- `this.$Message.close(id)`：关闭指定提示
- `this.$Message.closeAll()`：关闭所有提示

`config` 可以是字符串（即 `message`），也可以是配置对象。每次调用都返回一个关闭当前提示的函数，函数的 `id` 属性可传给 `this.$Message.close(id)`。

## 基础用法

四种类型的消息提示

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
          this.$Message.info('这是一条提示信息这是一条提示信息这是一条提示信息这是一条提示信息这是一条提示信息')
        } else if (type === 'success') {
          this.$Message.success('这是一条成功信息')
        } else if (type === 'warning') {
          this.$Message.warning('这是一条警告信息')
        } else if (type === 'error') {
          this.$Message.error('这是一条错误信息')
        }
      }
    }
  }
</script>
```
:::

## 修改延时

提示默认的显示时长为 `3s`，可传递 `duration` 来自定义时长

:::demo
```html
<at-button @click="changeDuration">修改延时</at-button>

<script>
  export default {
    methods: {
      changeDuration () {
        this.$Message.info({
          message: '这是一条提示信息，10s 后自动关闭',
          duration: 10000
        })
      }
    }
  }
</script>
```
:::

## 加载中

`this.$Message.loading` 返回关闭方法，可用于手动关闭提示框

:::demo
```html
<at-button @click="showLoading">显示加载中...</at-button>

<script>
  export default {
    methods: {
      showLoading () {
        const loading = this.$Message.loading({
          message: '加载中...',
          duration: 0
        })
        setTimeout(loading, 3000)
      }
    }
  }
</script>
```
:::

## Message 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| type | 全局提示的类别 | String | `success`, `error`, `warning`, `info`, `loading` | `info` |
| message | 提示的内容 | String / Number | - | - |
| duration | 自动关闭的延时，单位为毫秒，设为 `0` 则不自动关闭 | Number | - | 3000 |
| icon | 自定义类别ICON，优先于类别的图标 | String | - | - |
| onClose | 关闭提示框时的回调函数，参数为提示组件的实例 | Function | - | - |

<script>
  export default {
    methods: {
      handleClick (type) {
        if (type === 'info') {
          this.$Message.info('这是一条提示信息这是一条提示信息这是一条提示信息这是一条提示信息这是一条提示信息')
        } else if (type === 'success') {
          this.$Message.success('这是一条成功信息')
        } else if (type === 'warning') {
          this.$Message.warning('这是一条警告信息')
        } else if (type === 'error') {
          this.$Message.error('这是一条错误信息')
        }
      },
      changeDuration () {
        this.$Message.info({
          message: '这是一条提示信息，10s 后自动关闭',
          duration: 10000
        })
      },
      showLoading () {
        const loading = this.$Message.loading({
          message: '加载中...',
          duration: 0
        })
        setTimeout(loading, 3000)
      }
    }
  }
</script>


