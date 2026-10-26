
# Table

----

## Basic

Basic Usage

:::demo
```html
<at-table :columns="columns1" :data="data1"></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data1: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ]
      }
    }
  }
</script>
```
:::

## Stripe

Set `stripe` property to apply stripe style. Used to distinguish between different rows.

:::demo
```html
<at-table :columns="columns1" :data="data1" stripe></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data1: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ]
      }
    }
  }
</script>
```
:::

## Border

Defaults to no column borders, set `border` property to add borders.

:::demo
```html
<at-table :columns="columns1" :data="data1" border></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data1: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ]
      }
    }
  }
</script>
```
:::

## Fixed Height

Set `height` property to fix the height of Table. It'll make the header fixed on the top of Table.

:::demo
```html
<at-table :columns="columns1" :data="data1" height="220"></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data1: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ]
      }
    }
  }
</script>
```
:::

## Multiple Choices

Set `optional` property to apply multi-choices function. `on-selection-change` event will be emitted when a row is selected. `on-select-all` event will be emitted when click `select-all` checkbox.

:::demo
```html
<at-table :columns="columns1" :data="data2" optional></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data2: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          }
        ]
      }
    }
  }
</script>
```
:::

## Sort

You can sort the data by seeting `sortType: normal` to a `columns` prop's item.

There are three type of `sortType`: `normal (No sort)`, `desc (Descending)`, `asc (Ascending)`

:::demo
```html
<at-table :columns="columns2" :data="data2"></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data2: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          }
        ]
      }
    }
  }
</script>
```
:::

## Custom Column Template

You can render the column by setting `render` to certain columns prop's items. It is based on Vue's [render function](https://vuejs.org/guide/extras/render-function.html).

`render` receives one argument, an object `{ item, column, index }`: the data of the current row, the current column and the index of the row as displayed (position in the current page / sort order, from 0; the original index in `data` is `item.index`). It returns a VNode created with `h` imported from `vue`, using the Vue 3 VNode format: props and listeners (`onClick`) at the top level, children of components as a function or an object of slots. Import the components you render (`import { AtButton } from '@amazingcat/cattr-ui'`) or use `resolveComponent('AtButton')` inside the render function.

:::demo
```html
<at-table :columns="columns3" :data="data2"></at-table>

<script>
  import { h } from 'vue'
  import { AtButton } from '@amazingcat/cattr-ui'

  export default {
    data () {
      return {
        columns3: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          },
          {
            title: 'Operation',
            render: ({ item }) => {
              return h('div', [
                h(AtButton, {
                  size: 'small',
                  hollow: true,
                  style: { marginRight: '8px' },
                  onClick: () => this.$Message(item.name)
                }, () => 'View Name'),
                h(AtButton, {
                  size: 'small',
                  hollow: true,
                  onClick: () => this.$Message(item.address)
                }, () => 'View Address')
              ])
            }
          }
        ],
        data2: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          }
        ]
      }
    }
  }
</script>
```
:::

## Size

There are three type of size: `small`, `normal`, `large`. Default is `normal`.

:::demo
```html
<at-table :columns="columns3" :data="data2" size="large"></at-table>

<at-table style="margin-top: 24px;" :columns="columns4" :data="data2" size="small"></at-table>

<script>
  import { h } from 'vue'
  import { AtButton } from '@amazingcat/cattr-ui'

  export default {
    data () {
      return {
        columns3: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          },
          {
            title: 'Operation',
            render: ({ item }) => {
              return h('div', [
                h(AtButton, {
                  size: 'small',
                  hollow: true,
                  style: { marginRight: '8px' },
                  onClick: () => this.$Message(item.name)
                }, () => 'View Name'),
                h(AtButton, {
                  size: 'small',
                  hollow: true,
                  onClick: () => this.$Message(item.address)
                }, () => 'View Address')
              ])
            }
          }
        ],
        columns4: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          },
          {
            title: 'Operation',
            render: ({ item }) => {
              return h('div', [
                h(AtButton, {
                  size: 'smaller',
                  hollow: true,
                  style: { marginRight: '8px' },
                  onClick: () => this.$Message(item.name)
                }, () => 'View Name'),
                h(AtButton, {
                  size: 'smaller',
                  hollow: true,
                  onClick: () => this.$Message(item.address)
                }, () => 'View Address')
              ])
            }
          }
        ],
        data2: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          }
        ]
      }
    }
  }
</script>
```
:::

## Pagination

Set `pagination` to apply pagination function.

:::demo
```html
<at-table :columns="columns2" :data="data3" pagination></at-table>

<script>
  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        data3: this.makePageData()
      }
    },
    methods: {
      makePageData () {
        const data = [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ]
        let pageData = []

        for (let i = 0; i < 5; i++) {
          pageData = pageData.concat(data)
        }

        return pageData
      }
    }
  }
</script>
```
:::

## Table Props

| Property      | Description          | Type      | Accepted values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| size | the size of table | String | `small`, `normal`, `large` | `normal` |
| stripe | determine whether to apply stripe style | Boolean | - | false |
| border | determine whether to show the border of column | Boolean | - | false |
| data | the data of table | Array | - | [] |
| columns | the title of table | Array | - | [] |
| optional | determine whether the rows are multi-choices | Boolean | - | false |
| pagination | determine whether the pagination is displayed | Boolean | - | false |
| page-size | amount shown in each page | Number | - | 10 |
| show-page-total | to display the total number and range | Boolean | - | true |
| show-page-sizer | determine whether `page-size` can be changed | Boolean | - | false |
| show-page-quickjump | determine whether you can jump to a page directly | Boolean | - | false |
| height | the height of table | Number / String | - | - |

## Table Events

| Event Name      | Description          | Return Value  |
|---------- |-------------- |---------- |
| on-selection-change | Emitted when the row was selected | rows of selected |
| on-select-all | Emitted when all rows was selected | rows of selected |
| on-sort-change | Emitted when the sort order of a column was changed | `{ column, order, key }` |
| on-page-change | Emitted when the page was changed | page number |
| on-page-size-change | Emitted when the page sizer was changed | page size |
| rowClick | Emitted when a row was clicked | native `MouseEvent` |

## Column Options

| Property      | Description          | Type      | Accepted values                           | Default  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| title | the title of column | String | - | - |
| key | the key of the row data shown in the column | String | - | - |
| render | custom cell render function `({ item, column, index }) => VNode`, `h` is imported from `vue` | Function | - | - |
| sortType | enables sorting by the column, initial order | String | `normal`, `asc`, `desc` | - |
| sortMethod | custom compare function `(a, b, type)` | Function | - | - |
| width | the width of column | Number / String | - | - |
| className | class name of the column header | String | - | - |

<script>
  import { h } from 'vue'
  import { AtButton } from '@amazingcat/cattr-ui'

  export default {
    data () {
      return {
        columns1: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        columns2: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          }
        ],
        columns3: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          },
          {
            title: 'Operation',
            render: ({ item }) => {
              return h('div', [
                h(AtButton, {
                  size: 'small',
                  hollow: true,
                  style: { marginRight: '8px' },
                  onClick: () => this.$Message(item.name)
                }, () => 'View Name'),
                h(AtButton, {
                  size: 'small',
                  hollow: true,
                  onClick: () => this.$Message(item.address)
                }, () => 'View Address')
              ])
            }
          }
        ],
        columns4: [
          {
            title: 'Name',
            key: 'name'
          },
          {
            title: 'Age',
            key: 'age',
            sortType: 'normal'
          },
          {
            title: 'Address',
            key: 'address'
          },
          {
            title: 'Operation',
            render: ({ item }) => {
              return h('div', [
                h(AtButton, {
                  size: 'smaller',
                  hollow: true,
                  style: { marginRight: '8px' },
                  onClick: () => this.$Message(item.name)
                }, () => 'View Name'),
                h(AtButton, {
                  size: 'smaller',
                  hollow: true,
                  onClick: () => this.$Message(item.address)
                }, () => 'View Address')
              ])
            }
          }
        ],
        data1: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ],
        data2: [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          }
        ],
        data3: this.makePageData()
      }
    },
    methods: {
      makePageData () {
        const data = [
          {
            name: 'Stephen Curry',
            age: 18,
            address: 'Shenzhen Shi, Baoan Qu'
          },
          {
            name: 'Lebron James',
            age: 25,
            address: 'Gangding, Tianhe, Guangzhou'
          },
          {
            name: 'Kobe Bryant',
            age: 24,
            address: 'Pudong, Shanghai'
          },
          {
            name: 'Kevin Durant',
            age: 22,
            address: 'Shen Nan Da Dao, Nanshan Qu, Shenzhen Shi'
          },
          {
            name: 'Russell Westbrook',
            age: 21,
            address: 'Chaoyang District, Beijing'
          },
          {
            name: 'Tim Duncan',
            age: 26,
            address: 'The Mixc of Shenzhen City '
          },
          {
            name: 'Tony Parker',
            age: 25,
            address: 'Shenzhen Book City'
          },
          {
            name: 'Kyrie Irving',
            age: 20,
            address: 'Guangzhou Higher Education Mega Center'
          },
          {
            name: 'Isaiah Thomas',
            age: 19,
            address: 'Chaoyang District, Beijing'
          }
        ]
        let pageData = []

        for (let i = 0; i < 5; i++) {
          pageData = pageData.concat(data)
        }

        return pageData
      }
    }
  }
</script>
