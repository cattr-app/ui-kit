
# Modal 模态框

----

模态对话框，当需要询问用户处理事务，又不希望跳转页面时，可以使用模态框 `Modal` 在当前页面打开一个浮层并承载相应的操作。

当需要弹出一个简洁的确认框时，也可以使用默认的精简版模态框。`Cattr UI` 在 `app.config.globalProperties` 中添加了全局对象 `$Modal`，可以直接通过 `this.$Modal` 对象操作实例方法；在 `<script setup>` 中可以使用 `import { Dialog } from '@amazingcat/cattr-ui'`。需在 `app.use(CattrUI)` 之后调用

## Modal 实例方法

通过调用 `this.$Modal` 的方法来使用，每个方法都可以传入配置对象 `config`，也可以传入 `(content, title, config)`，并返回 `Promise`：
- `this.$Modal.alert(config)`
- `this.$Modal.confirm(config)`
- `this.$Modal.prompt(config)`
- `this.$Modal.info(config)`
- `this.$Modal.success(config)`
- `this.$Modal.warning(config)`
- `this.$Modal.error(config)`
- `this.$Modal.close()`：关闭当前对话框并清空等待队列

对话框每次只显示一个，后续调用会在当前对话框关闭之后依次显示。

## 消息提醒

弹出会中断用户的对话框，直到用户知晓该信息之后才可以关闭，属于交互比较重的操作。（类似于 `window.alert`）

可以用 `Promise` 的方式捕获操作反馈，也可以用传入 `callback` 参数的方式。`callback(action)` 的参数 `action` 为 `'confirm'` 或 `'cancel'`（按 `ESC`、点击关闭按钮或遮罩层也算作 `'cancel'`）；`prompt` 的回调为 `callback(value, action)`

:::demo
```html
<p class="demo-desc">this.$Modal.alert()</p>
<at-button @click="modalAlert">Alert</at-button>

<script>
  export default {
    methods: {
      modalAlert () {
        this.$Modal.alert({
          title: '这里是标题名称',
          content: '这里是文本内容',
          callback: action => {
            this.$Message(action)
          }
        })
      }
    }
  }
</script>
```
:::

## 确认消息

对用户操作的一个反馈，用于确定是否需要继续操作。（类似于 `window.confirm`）

:::demo
```html
<p class="demo-desc">this.$Modal.confirm()</p>
<at-button @click="modalConfirm">Confirm</at-button>

<script>
  export default {
    methods: {
      modalConfirm () {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作需要非常谨慎，您确定要这么做吗？'
        }).then(() => {
          this.$Message('点击了「确认」按钮')
        }).catch(() => {
          this.$Message('点击了「取消」按钮')
        })
      }
    }
  }
</script>
```
:::

## 提交信息

弹出输入对话框，提醒用户输入相应内容。（类似于 `window.prompt`）

:::demo
```html
<p class="demo-desc">this.$Modal.prompt({ title: '提示', content: '请输入邮件地址：' })</p>
<at-button @click="modalPrompt">Prompt</at-button>

<script>
  export default {
    methods: {
      modalPrompt () {
        this.$Modal.prompt({
          title: '提示',
          content: '请输入邮件地址：'
        }).then((data) => {
          this.$Message(`点击了「确认」按钮，输入框的值为 ${data.value}`)
        }).catch(() => {
          this.$Message('点击了「取消」按钮')
        })
      }
    }
  }
</script>
```
:::

## 消息类的对话框

除了上述的类 `window` 对话框，`Cattr UI` 还提供了四种消息类的对话框，主要用来展示一些重要信息。该类的对话框默认不显示关闭按钮和取消按钮，点击遮罩层也不能关闭。传入配置对象且未设置 `title` 时，默认标题分别为 `Info`、`Success`、`Warning`、`Error`（如需翻译请传入 `title`）

:::demo
```html
<p class="demo-desc">this.$Modal.success()</p>
<at-button @click="handleClick('success')">成功</at-button>
<at-button @click="handleClick('error')">错误</at-button>
<at-button @click="handleClick('warning')">警告</at-button>
<at-button @click="handleClick('info')">消息</at-button>

<script>
  export default {
    methods: {
      handleClick (type) {
        if (type === 'info') {
          this.$Modal.info({
            content: '这里是提示的消息'
          })
        } else if (type === 'success') {
          this.$Modal.success({
            content: '这里是成功的消息'
          })
        } else if (type === 'warning') {
          this.$Modal.warning({
            content: '这里是警告的消息'
          })
        } else if (type === 'error') {
          this.$Modal.error({
            content: '这里是错误的消息'
          })
        }
      }
    }
  }
</script>
```
:::

## 组件化方式调用

前面提到的是通过 `this.$Modal` 的方法来使用，如果要自定义对话框，可使用组件化的方式

:::demo
```html
<at-button @click="modal1=true">显示自定义模态框</at-button>
<at-modal v-model="modal1" title="这里是标题" @on-confirm="handleConfirm" @on-cancel="handleCancel">
  <p>这里是模态框的文本内容!</p>
  <p>这里是模态框的文本内容!</p>
</at-modal>

<script>
  export default {
    methods: {
      handleConfirm () {
        this.$Message('Confirm')
      },
      handleCancel () {
        this.$Message('Cancel')
      }
    }
  }
</script>
```
:::

## 自定义样式

`Modal` 组件提供了自定义页头、页脚的插槽 `#header` 和 `#footer`，可灵活的控制对话框的样式结构。通过与其他组件的交互，可实现复杂的功能需求。

:::demo
```html
<at-button @click="modal2=true">自定义页头和页脚</at-button>
<at-button @click="modal3=true">不带标题</at-button>
<at-modal v-model="modal2">
  <template #header>
    <div style="text-align:center;">
      <span>这里是标题</span>
    </div>
  </template>
  <div style="text-align:center;">
    <p>能看到这里的内容吗？</p>
  </div>
  <template #footer>
    <div>
      <at-button style="width:100%;" type="error" @click="closeModal2">这里是按钮</at-button>
    </div>
  </template>
</at-modal>
<at-modal v-model="modal3">
  <p>这里是模态框的文本内容!</p>
</at-modal>

<script>
  export default {
    methods: {
      closeModal2 () {
        this.modal2 = false
      }
    }
  }
</script>
```
:::

## 禁用关闭

- 设置属性 `show-close` 为 `false` 可取消右上角的关闭按钮以及键盘的 `ESC` 键；
- 设置属性 `close-on-press-esc` 为 `false` 仅取消键盘的 `ESC` 键；
- 设置属性 `mask-closable` 为 `false` 可取消遮罩层的点击关闭事件；

:::demo
```html
<at-button @click="modal4=true">禁用右上角关闭按钮（含 ESC）</at-button>
<at-button @click="modal5=true">取消遮罩层关闭</at-button>
<at-modal v-model="modal4" title="标题" :show-close="false">这里是文本</at-modal>
<at-modal v-model="modal5" title="标题" :show-close="false" :mask-closable="false">这里是文本</at-modal>
```
:::

## 自定义窗口位置

通过属性 `styles` 传入 `CSS Style Object`，可更改弹框的样式

:::demo
```html
<at-button @click="modal6=true">仅改变距离顶部的位置</at-button>
<at-modal v-model="modal6" title="标题" :styles="{top: '20px'}">这里是文本内容</at-modal>
```
:::

## Modal 参数

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| modelValue | 是否显示模态框，可通过 `v-model` 绑定 | Boolean | - | false |
| title | 模态框的标题 | String | - | - |
| content | 模态框的内容 | String | - | - |
| cancelText | 取消按钮的文本 | String | - | 语言包中的 `at.modal.cancelText` |
| okText | 确定按钮的文本 | String | - | 语言包中的 `at.modal.okText` |
| maskClosable | 点击遮罩层是否可以关闭模态框 | Boolean | - | true |
| showHead | 是否显示标题 | Boolean | - | true |
| showClose | 是否显示关闭按钮 | Boolean | - | true |
| showFooter | 是否显示底部按钮 | Boolean | - | true |
| showCancelButton | 是否显示取消按钮 | Boolean | - | true |
| showConfirmButton | 是否显示确定按钮 | Boolean | - | true |
| showInput | 是否显示输入框（打开时自动获取焦点） | Boolean | - | false |
| inputValue | 输入框的初始值 | String / Number | - | - |
| inputPlaceholder | 输入框的占位文本 | String | - | - |
| width | 模态框的宽度 | Number / String | - | `520` |
| closeOnPressEsc | 按 `ESC` 是否可以关闭模态框（`showClose` 为 `false` 时同样不可关闭） | Boolean | - | true |
| styles | 模态框的自定义样式 | Object | - | - |

## Modal 事件

| 事件名称 | 说明          | 返回参数  |
|---------- |-------------- |---------- |
| update:modelValue | 模态框关闭时触发（用于 `v-model`） | `false` |
| on-confirm | 点击确定按钮时触发 | - |
| on-cancel | 取消时触发：点击取消按钮、关闭按钮、遮罩层（`maskClosable`）或按 `ESC` | - |
| after-leave | 关闭动画结束后触发 | - |

## $Modal 参数

`this.$Modal.xxx(config)` 的配置对象 `config` 会作为属性传给 `AtModal`，未知的键会被忽略：

| 参数      | 说明          | 类型      | 默认值  |
|---------- |-------------- |---------- |-------- |
| title | 对话框的标题 | String | 消息类对话框为 `Info` / `Success` / `Warning` / `Error`，其他为空 |
| content | 对话框的内容 | String | - |
| okText | 确定按钮的文本 | String | 语言包中的 `at.modal.okText` |
| cancelText | 取消按钮的文本 | String | 语言包中的 `at.modal.cancelText` |
| maskClosable | 点击遮罩层是否可以关闭 | Boolean | `confirm` / `prompt` 为 true，其他为 false |
| showClose | 是否显示关闭按钮 | Boolean | 消息类对话框为 false，其他为 true |
| showCancelButton | 是否显示取消按钮 | Boolean | `confirm` / `prompt` 为 true，其他为 false |
| showConfirmButton | 是否显示确定按钮 | Boolean | true |
| showInput | 是否显示输入框 | Boolean | `prompt` 为 true，其他为 false |
| inputValue | 输入框的初始值 | String / Number | - |
| inputPlaceholder | 输入框的占位文本 | String | - |
| width | 对话框的宽度 | Number / String | `520` |
| styles | 对话框的自定义样式 | Object | - |
| callback | 关闭时的回调：`callback(action)`，`prompt` 为 `callback(value, action)`；与 `Promise` 同时生效 | Function | - |

返回的 `Promise`：`confirm` 点击确定时 resolve `'confirm'`，`prompt` resolve `{ value, action: 'confirm' }`，取消时 reject `'cancel'`；`alert` 和消息类对话框在任何方式关闭时都 resolve（`'confirm'` 或 `'cancel'`）。

## Modal Slots

| 名称     | 说明          |
|-------- |------------------- |
| header | 自定义模态框的头部 |
| footer | 自定义模态框的底部，即底部按钮部分（按钮上直接使用 `@click`，无需 `native` 修饰符） |
| - | 自定义模态框的主体内容 |

<script>
  export default {
    data () {
      return {
        modal1: false,
        modal2: false,
        modal3: false,
        modal4: false,
        modal5: false,
        modal6: false
      }
    },
    methods: {
      handleClick (type) {
        if (type === 'info') {
          this.$Modal.info({
            content: '这里是提示的消息'
          })
        } else if (type === 'success') {
          this.$Modal.success({
            content: '这里是成功的消息'
          })
        } else if (type === 'warning') {
          this.$Modal.warning({
            content: '这里是警告的消息'
          })
        } else if (type === 'error') {
          this.$Modal.error({
            content: '这里是错误的消息'
          })
        }
      },
      modalAlert () {
        this.$Modal.alert({
          title: '这里是标题名称',
          content: '这里是文本内容',
          callback: action => {
            this.$Message(action)
          }
        })
      },
      modalConfirm () {
        this.$Modal.confirm({
          title: '提示',
          content: '此操作需要非常谨慎，您确定要这么做吗？'
        }).then(() => {
          this.$Message('点击了「确认」按钮')
        }).catch(() => {
          this.$Message('点击了「取消」按钮')
        })
      },
      modalPrompt () {
        this.$Modal.prompt({
          title: '提示',
          content: '请输入邮件地址：'
        }).then((data) => {
          this.$Message(`点击了「确认」按钮，输入框的值为 ${data.value}`)
        }).catch(() => {
          this.$Message('点击了「取消」按钮')
        })
      },
      handleConfirm () {
        this.$Message('Confirm')
      },
      handleCancel () {
        this.$Message('Cancel')
      },
      closeModal2 () {
        this.modal2 = false
      }
    }
  }
</script>
