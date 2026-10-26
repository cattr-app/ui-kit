<template>
  <ul
    v-if="simple"
    class="at-pagination at-pagination--simple"
    :class="{
      [`at-pagination--${size}`]: size,
    }"
  >
    <li
      :title="t('at.pagination.prevText')"
      class="at-pagination__prev"
      :class="{
        'at-pagination--disabled': currentPage === 1,
      }"
      @click="handlePrev"
    >
      <i class="icon icon-chevron-left"></i>
    </li>
    <div class="at-pagination__simple-paging">
      <input
        type="text"
        class="at-input__original"
        :value="currentPage"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @change="handleKeyup"
      />
      <span>/</span>
      <span class="at-pagination__paging-total">{{ totalPage }}</span>
    </div>
    <li
      :title="t('at.pagination.nextText')"
      class="at-pagination__next"
      :class="{
        'at-pagination--disabled': currentPage === totalPage,
      }"
      @click="handleNext"
    >
      <i class="icon icon-chevron-right"></i>
    </li>
  </ul>
  <ul
    v-else
    class="at-pagination"
    :class="{
      [`at-pagination--${size}`]: size,
    }"
  >
    <span v-show="showTotal" class="at-pagination__total">
      <slot name="total">{{
        `${t('at.pagination.total')} ${total} ${t('at.pagination.items')}`
      }}</slot>
    </span>
    <li
      :title="t('at.pagination.prevText')"
      class="at-pagination__prev"
      :class="{
        'at-pagination--disabled': currentPage === 1,
      }"
      @click="handlePrev"
    >
      <i class="icon icon-chevron-left"></i>
    </li>
    <template v-if="totalPage < 9">
      <li
        v-for="num in pageRange"
        :key="num"
        class="at-pagination__item"
        :class="{
          'at-pagination__item--active': currentPage === num,
        }"
        @click="changePage(num)"
      >
        {{ num }}
      </li>
    </template>
    <template v-else>
      <li
        class="at-pagination__item"
        :class="{ 'at-pagination__item--active': currentPage === 1 }"
        @click="changePage(1)"
      >
        1
      </li>
      <li
        v-if="currentPage > 4"
        class="at-pagination__item at-pagination__item--jump-prev"
        :title="t('at.pagination.prev5Text')"
        @click="handleJumpPrev"
      >
        <i class="icon icon-chevrons-left"></i>
      </li>
      <li v-if="currentPage > 3" class="at-pagination__item" @click="changePage(currentPage - 2)">
        {{ currentPage - 2 }}
      </li>
      <li v-if="currentPage > 2" class="at-pagination__item" @click="changePage(currentPage - 1)">
        {{ currentPage - 1 }}
      </li>
      <li
        v-if="currentPage !== 1 && currentPage !== totalPage"
        class="at-pagination__item at-pagination__item--active"
      >
        {{ currentPage }}
      </li>
      <li
        v-if="currentPage < totalPage - 1"
        class="at-pagination__item"
        @click="changePage(currentPage + 1)"
      >
        {{ currentPage + 1 }}
      </li>
      <li
        v-if="currentPage < totalPage - 2"
        class="at-pagination__item"
        @click="changePage(currentPage + 2)"
      >
        {{ currentPage + 2 }}
      </li>
      <li
        v-if="currentPage < totalPage - 3"
        class="at-pagination__item at-pagination__item--jump-next"
        :title="t('at.pagination.next5Text')"
        @click="handleJumpNext"
      >
        <i class="icon icon-chevrons-right"></i>
      </li>
      <li
        v-if="totalPage > 1"
        class="at-pagination__item"
        :class="{ 'at-pagination__item--active': currentPage === totalPage }"
        @click="changePage(totalPage)"
      >
        {{ totalPage }}
      </li>
    </template>
    <li
      :title="t('at.pagination.nextText')"
      class="at-pagination__next"
      :class="{
        'at-pagination--disabled': currentPage === totalPage,
      }"
      @click="handleNext"
    >
      <i class="icon icon-chevron-right"></i>
    </li>
    <div v-if="showSizer" class="at-pagination__sizer">
      <at-select v-model="currentPageSize" :size="size" @on-change="changeSize">
        <at-option v-for="item in pageSizeOpts" :key="item" :value="item">{{
          `${item} ${t('at.pagination.pageSize')}`
        }}</at-option>
      </at-select>
    </div>
    <div v-if="showQuickjump" class="at-pagination__quickjump">
      <span>{{ t('at.pagination.goto') }}</span>
      <input
        v-model="jumpPageNum"
        type="text"
        class="at-input__original"
        @keydown="handleKeydown"
        @keyup.enter="changePage()"
      />
      <span>{{ t('at.pagination.pageText') }}</span>
    </div>
  </ul>
</template>

<script>
import Locale from '../../../mixins/locale'

export default {
  name: 'AtPagination',
  mixins: [Locale],
  props: {
    current: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    size: {
      type: String,
    },
    simple: {
      type: Boolean,
      default: false,
    },
    showTotal: {
      type: Boolean,
      default: false,
    },
    showQuickjump: {
      type: Boolean,
      default: false,
    },
    showSizer: {
      type: Boolean,
      default: false,
    },
    pageSizeOpts: {
      type: Array,
      default() {
        return [10, 20, 30, 40]
      },
    },
  },
  emits: ['page-change', 'pagesize-change', 'update:current', 'update:pageSize'],
  data() {
    return {
      currentPage: this.current,
      currentPageSize: this.pageSize,
      jumpPageNum: this.current,
    }
  },
  computed: {
    totalPage() {
      const num = Math.ceil(this.total / this.currentPageSize)
      return num === 0 ? 1 : num
    },
    visiblePage() {
      return this.totalPage >= 5 ? 5 : this.totalPage
    },
    pageRange() {
      const range = []
      let start = 1

      if (this.currentPage + this.visiblePage / 2 > this.totalPage) {
        start = this.totalPage - this.visiblePage + 1
        start = start > 0 ? start : 1
      } else if (this.currentPage - this.visiblePage / 2 > 0) {
        start = Math.ceil(this.currentPage - this.visiblePage / 2)
      }

      for (let i = 0; i < this.visiblePage && i < this.totalPage; i++) {
        range.push(start + i)
      }

      return range
    },
  },
  watch: {
    current(val) {
      this.currentPage = val
    },
    pageSize(val) {
      this.currentPageSize = val
    },
    // `total`/`pageSize` shrank below the current page: move to the new last page
    totalPage(val) {
      if (this.currentPage > val) this.changePage(val)
    },
  },
  methods: {
    clampPage(page) {
      const num = page | 0
      if (num < 1) return 1
      return num > this.totalPage ? this.totalPage : num
    },
    changePage(page) {
      const num = this.clampPage(page || this.jumpPageNum || 1)

      this.jumpPageNum = num
      if (this.currentPage !== num) {
        this.currentPage = num
        this.$emit('update:current', num)
        this.$emit('page-change', num)
      }
    },
    handlePrev() {
      const page = this.currentPage
      if (page <= 1) return false
      this.changePage(page - 1)
    },
    handleNext() {
      const page = this.currentPage
      if (page >= this.totalPage) return false
      this.changePage(page + 1)
    },
    handleJumpPrev() {
      const page = this.currentPage - 5
      page ? this.changePage(page) : this.changePage(1)
    },
    handleJumpNext() {
      const page = this.currentPage + 5
      page > this.totalPage ? this.changePage(this.totalPage) : this.changePage(page)
    },
    handleKeydown(evt) {
      // block only printable non-digit characters; Tab, Delete, Home/End, arrows and
      // Ctrl/Cmd/Alt combos (select all, copy, paste) keep working
      const printable = typeof evt.key === 'string' && evt.key.length === 1
      if (printable && !/^[0-9]$/.test(evt.key) && !evt.ctrlKey && !evt.metaKey && !evt.altKey) {
        evt.preventDefault()
      }
    },
    handleKeyup(evt) {
      if (evt.key === 'ArrowDown') {
        this.handlePrev()
      } else if (evt.key === 'ArrowUp') {
        this.handleNext()
      } else if (evt.key === 'Enter') {
        const page = this.clampPage(evt.target.value)
        evt.target.value = page
        this.changePage(page)
      }
    },
    changeSize(size) {
      this.currentPageSize = size
      this.$emit('update:pageSize', size)
      this.changePage(1)
      this.$emit('pagesize-change', size)
    },
  },
}
</script>
