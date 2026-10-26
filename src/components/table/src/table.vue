<template>
  <div
    class="at-table"
    :class="{
      'at-table--fixHeight': height,
      'at-table--stripe': stripe,
      [`at-table--${size}`]: size,
      [`at-table--border`]: border,
    }"
    :style="tableStyles"
  >
    <!-- S Content -->
    <div class="at-table__content" :style="contentStyle">
      <!-- S Header -->
      <div v-if="height" class="at-table__header">
        <table>
          <colgroup>
            <col v-if="optional" class="at-table__col-selection" />
            <col
              v-for="(column, index) in columnsData"
              :key="index"
              :width="setCellWidth(column, index)"
            />
          </colgroup>
          <thead ref="header" class="at-table__thead">
            <tr>
              <!-- S Checkbox -->
              <th v-if="optional" class="at-table__cell at-table__column-selection">
                <at-checkbox
                  :model-value="isSelectAll"
                  @click.prevent="handleSelectAll"
                ></at-checkbox>
              </th>
              <!-- E Checkbox -->
              <!-- S Column th -->
              <th
                v-for="(column, index) in columnsData"
                :key="index"
                class="at-table__cell at-table__column"
                :class="column.className"
                :style="{
                  cursor: column.sortType ? 'pointer' : 'text',
                }"
                @click="column.sortType && handleSort(index)"
              >
                {{ column.title }}
                <template v-if="column.sortType">
                  <div
                    class="at-table__column-sorter"
                    :class="{
                      'sort-asc': column._sortType === 'asc',
                      'sort-desc': column._sortType === 'desc',
                    }"
                  >
                    <span class="at-table__column-sorter-up" @click.stop="handleSort(index, 'asc')"
                      ><i class="icon icon-chevron-up"></i
                    ></span>
                    <span
                      class="at-table__column-sorter-down"
                      @click.stop="handleSort(index, 'desc')"
                      ><i class="icon icon-chevron-down"></i
                    ></span>
                  </div>
                </template>
              </th>
              <!-- E Column th -->
            </tr>
          </thead>
        </table>
      </div>
      <!-- E Header -->

      <!-- S Body -->
      <div class="at-table__body" :style="bodyStyle">
        <table>
          <colgroup>
            <col v-if="optional" class="at-table__col-selection" />
            <col
              v-for="(column, index) in columnsData"
              :key="index"
              :width="setCellWidth(column, index)"
            />
          </colgroup>
          <thead v-if="!height" ref="header" class="at-table__thead">
            <tr>
              <!-- S Checkbox -->
              <th v-if="optional" class="at-table__cell at-table__column-selection">
                <at-checkbox
                  :model-value="isSelectAll"
                  @click.prevent="handleSelectAll"
                ></at-checkbox>
              </th>
              <!-- E Checkbox -->
              <!-- S Column th -->
              <th
                v-for="(column, index) in columnsData"
                :key="index"
                class="at-table__cell at-table__column"
                :class="column.className"
                :style="{
                  cursor: column.sortType ? 'pointer' : 'text',
                }"
                @click="column.sortType && handleSort(index)"
              >
                {{ column.title }}
                <template v-if="column.sortType">
                  <div
                    class="at-table__column-sorter"
                    :class="{
                      'sort-asc': column._sortType === 'asc',
                      'sort-desc': column._sortType === 'desc',
                    }"
                  >
                    <span class="at-table__column-sorter-up" @click.stop="handleSort(index, 'asc')"
                      ><i class="icon icon-chevron-up"></i
                    ></span>
                    <span
                      class="at-table__column-sorter-down"
                      @click.stop="handleSort(index, 'desc')"
                      ><i class="icon icon-chevron-down"></i
                    ></span>
                  </div>
                </template>
              </th>
              <!-- E Column th -->
            </tr>
          </thead>

          <tbody v-if="sortData.length" ref="body" class="at-table__tbody">
            <template v-for="(item, rowIndex) in sortData" :key="item.index">
              <tr @click="$emit('rowClick', $event)">
                <td v-if="optional" class="at-table__cell at-table__column-selection">
                  <at-checkbox
                    v-model="objData[item.index].isChecked"
                    @on-change="changeRowSelection"
                  ></at-checkbox>
                </td>
                <td
                  v-for="(column, columnIndex) in columns"
                  :key="columnIndex"
                  class="at-table__cell"
                >
                  <template v-if="column.render">
                    <Cell
                      :item="item"
                      :column="column"
                      :index="rowIndex"
                      :render="column.render"
                    ></Cell>
                  </template>
                  <template v-else>
                    {{ item[column.key] }}
                  </template>
                </td>
              </tr>
            </template>
          </tbody>

          <tbody v-else class="at-table__tbody">
            <tr>
              <td
                class="at-table__cell at-table__cell--nodata"
                :colspan="optional ? columns.length + 1 : columns.length"
              >
                <slot name="emptyText">{{ t('at.table.emptyText') }}</slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- E Body -->
    </div>
    <!-- E Content -->

    <!-- S Pagination -->
    <div v-if="pagination && total" ref="footer" class="at-table__footer">
      <at-pagination
        :current="currentPage"
        :size="size"
        :total="total"
        :page-size="pageCurSize"
        :show-total="showPageTotal"
        :show-sizer="showPageSizer"
        :show-quickjump="showPageQuickjump"
        @page-change="pageChange"
        @pagesize-change="pageSizeChange"
      ></at-pagination>
    </div>
    <!-- E Pagination -->
  </div>
</template>

<script>
import Locale from '../../../mixins/locale'
import { getStyle, deepCopy } from '../../../utils/util'
import AtCheckbox from '../../checkbox'
import AtPagination from '../../pagination'
import Cell from './render'

export default {
  name: 'AtTable',
  components: {
    AtCheckbox,
    AtPagination,
    Cell,
  },
  mixins: [Locale],
  props: {
    size: {
      type: String,
      default: 'normal',
    },
    stripe: {
      type: Boolean,
      default: false,
    },
    border: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default() {
        return []
      },
    },
    columns: {
      type: Array,
      default() {
        return []
      },
    },
    optional: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Boolean,
      default: false,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    showPageTotal: {
      type: Boolean,
      default: true,
    },
    showPageSizer: {
      type: Boolean,
      default: false,
    },
    showPageQuickjump: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
    },
  },
  emits: [
    'rowClick',
    'on-select-all',
    'on-selection-change',
    'on-sort-change',
    'on-page-change',
    'on-page-size-change',
  ],
  data() {
    return {
      objData: this.makeObjData(), // use for checkbox to select all
      sortData: [], // use for sort or paginate
      allData: [],
      // Active sort, set once from the columns' initial `sortType`, then by the header:
      // the column `key` and its order; `normal` (key null) is the original data order.
      sortKey: null,
      sortOrder: 'normal',
      columnsData: [],
      total: 0,
      bodyHeight: 0,
      pageCurSize: this.pageSize,
      columnsWidth: {},
      currentPage: 1,
    }
  },
  computed: {
    tableStyles() {
      const styles = {}

      if (this.height) {
        styles.height = `${this.height}px`
      }

      return styles
    },
    isSelectAll() {
      let isAll = true
      if (!this.sortData.length) {
        isAll = false
      }
      for (let i = 0, len = this.sortData.length; i < len; i++) {
        if (!this.objData[this.sortData[i].index].isChecked) {
          isAll = false
          break
        }
      }

      return isAll
    },
    bodyStyle() {
      const styles = {}
      if (this.bodyHeight !== 0) {
        const headerHeight = parseInt(getStyle(this.$refs.header, 'height')) || 0
        styles.height = `${this.bodyHeight}px`
        styles.marginTop = `${headerHeight}px`
      }
      return styles
    },
    contentStyle() {
      const styles = {}
      if (this.bodyHeight !== 0) {
        const headerHeight = parseInt(getStyle(this.$refs.header, 'height')) || 0
        styles.height = `${this.bodyHeight + headerHeight}px`
      }
      return styles
    },
  },
  watch: {
    height() {
      this.calculateBodyHeight()
    },
    allData() {
      this.total = this.allData.length
    },
    sortData() {
      this.handleResize()
    },
    pageSize(size) {
      this.pageCurSize = size
    },
    pageCurSize() {
      this.clampCurrentPage()
      this.sortData = this.makeDataWithPaginate(this.currentPage)
    },
    columns: {
      deep: true,
      handler() {
        // Keep the active sort while its column is still sortable, otherwise back to the original order
        const sorted = this.columns.some(item => item.sortType && item.key === this.sortKey)
        if (!sorted) {
          this.sortKey = null
          this.sortOrder = 'normal'
        }
        this.columnsData = this.makeColumns()
        this.allData = this.makeDataWithSort()
        this.sortData = this.makeDataWithPaginate(this.currentPage)
      },
    },
    data: {
      deep: true,
      handler() {
        this.objData = this.makeObjData()
        this.allData = this.makeDataWithSort()
        // Stay on the current page while it still exists, the pager keeps highlighting it
        this.clampCurrentPage()
        this.sortData = this.makeDataWithPaginate(this.currentPage)
      },
    },
  },
  created() {
    this.initSort()
    this.columnsData = this.makeColumns()
    this.sortData = this.makeDataWithSortAndPage()
  },
  mounted() {
    this.calculateBodyHeight()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    calculateBodyHeight() {
      if (this.height) {
        this.$nextTick(() => {
          const headerHeight = parseInt(getStyle(this.$refs.header, 'height')) || 0
          const footerHeight = parseInt(getStyle(this.$refs.footer, 'height')) || 0

          this.bodyHeight = this.height - headerHeight - footerHeight
        })
      } else {
        this.bodyHeight = 0
      }
    },
    initSort() {
      const column = this.columns.find(item => item.sortType && item.sortType !== 'normal')
      if (column) {
        this.sortKey = column.key
        this.sortOrder = column.sortType
      }
    },
    makeColumns() {
      const columns = deepCopy(this.columns)
      columns.forEach((column, idx) => {
        column._index = idx
        column._sortType =
          column.sortType && this.sortKey != null && column.key === this.sortKey
            ? this.sortOrder
            : 'normal'
      })
      return columns
    },
    makeData() {
      const data = deepCopy(this.data)
      data.forEach((row, idx) => {
        row.index = idx
      })
      return data
    },
    makeObjData() {
      const rowData = {}

      this.data.forEach((row, index) => {
        const newRow = deepCopy(row)

        newRow.isChecked = !!newRow.isChecked

        rowData[index] = newRow
      })

      return rowData
    },
    makeDataWithSortAndPage(pageNum) {
      const allData = this.makeDataWithSort()
      this.allData = allData

      const data = this.makeDataWithPaginate(pageNum)
      return data
    },
    clampCurrentPage() {
      const pageCount = Math.max(1, Math.ceil(this.allData.length / this.pageCurSize))
      if (this.currentPage > pageCount) {
        this.currentPage = 1
      }
    },
    makeDataWithPaginate(page) {
      page = page || 1
      const pageStart = (page - 1) * this.pageCurSize
      const pageEnd = pageStart + this.pageCurSize
      let pageData

      if (this.pagination) {
        pageData = this.allData.slice(pageStart, pageEnd)
      } else {
        pageData = this.allData
      }
      return pageData
    },
    makeDataWithSort() {
      const data = this.makeData()

      if (this.sortOrder !== 'normal') {
        const column = this.columnsData.find(item => item.sortType && item.key === this.sortKey)
        if (column) this.sort(data, this.sortOrder, column)
      }

      return data
    },
    handleSelectAll() {
      const status = !this.isSelectAll

      for (const data of this.sortData) {
        this.objData[data.index].isChecked = status
      }

      const selection = this.getSelection()

      status && this.$emit('on-select-all', selection)
      this.$emit('on-selection-change', selection)
    },
    handleSort(index, type) {
      const key = this.columnsData[index].key
      const sortType = this.columnsData[index]._sortType
      const sortNameArr = ['normal', 'desc', 'asc']

      if (this.columnsData[index].sortType) {
        if (!type) {
          const tmpIdx = sortNameArr.indexOf(sortType)
          if (tmpIdx >= 0) {
            type = sortNameArr[tmpIdx + 1 > 2 ? 0 : tmpIdx + 1]
          }
        }
        // Sort the whole data set (not only the current page), `normal` restores the original order
        this.sortKey = type === 'normal' ? null : key
        this.sortOrder = type === 'normal' ? 'normal' : type
        // Only one column is sorted at a time: clear the arrow of the previously sorted one
        this.columnsData.forEach((column, idx) => {
          column._sortType = idx === index ? type : 'normal'
        })
        this.sortData = this.makeDataWithSortAndPage(this.currentPage)
      } else {
        this.columnsData[index]._sortType = type
      }

      this.$emit('on-sort-change', {
        column: JSON.parse(JSON.stringify(this.columns[this.columnsData[index]._index])),
        order: type,
        key,
      })
    },
    sort(data, type, column) {
      const key = column.key
      data.sort((a, b) => {
        if (column.sortMethod) {
          return column.sortMethod(a[key], b[key], type)
        } else if (type === 'asc') {
          return a[key] > b[key] ? 1 : -1
        }
        return a[key] < b[key] ? 1 : -1
      })
      return data
    },
    getSelection() {
      const selectionIndexArray = []
      for (const i in this.objData) {
        if (this.objData[i].isChecked) {
          selectionIndexArray.push(i | 0)
        }
      }
      return JSON.parse(
        JSON.stringify(this.data.filter((data, index) => selectionIndexArray.indexOf(index) > -1)),
      )
    },
    changeRowSelection() {
      const selection = this.getSelection()
      this.$emit('on-selection-change', selection)
    },
    pageChange(page) {
      this.$emit('on-page-change', page)
      this.currentPage = page
      this.sortData = this.makeDataWithPaginate(page)
    },
    pageSizeChange(size) {
      this.$emit('on-page-size-change', size)
      this.pageCurSize = size
    },
    handleResize() {
      this.$nextTick(() => {
        const columnsWidth = {}

        if (this.data.length && this.$refs.body) {
          const $td = this.$refs.body.querySelectorAll('tr')[0].querySelectorAll('td')
          // the selection cell comes first and has no column
          const offset = this.optional ? 1 : 0

          for (let i = offset; i < $td.length; i++) {
            const column = this.columnsData[i - offset]
            let width = parseInt(getStyle($td[i], 'width'))

            if (column) {
              if (column.width) {
                width = column.width
              }
              columnsWidth[column._index] = { width }
            }
          }
        }

        this.columnsWidth = columnsWidth
      })
    },
    setCellWidth(column) {
      let width = ''

      if (column.width) {
        width = column.width
      } else if (this.columnsWidth[column._index]) {
        width = this.columnsWidth[column._index].width
      }

      width = width === '0' ? '' : width
      return width
    },
  },
}
</script>
