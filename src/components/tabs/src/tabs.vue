<template>
  <div
    class="at-tabs"
    :class="{
      'at-tabs--small': size === 'small',
      'at-tabs--card': type === 'card',
      'at-tabs--scroll': scrollable,
    }"
  >
    <div class="at-tabs__header">
      <div v-if="$slots.extra" class="at-tabs__extra">
        <slot name="extra"></slot>
      </div>
      <div class="at-tabs__nav">
        <!-- S prev btn -->
        <span
          v-if="scrollable"
          class="at-tabs__prev"
          :class="{
            'at-tabs__prev--disabled': !prevable,
          }"
          @click="scrollPrev"
        >
          <i class="icon icon-chevron-left"></i>
        </span>
        <!-- E prev btn -->
        <!-- S next btn -->
        <span
          v-if="scrollable"
          class="at-tabs__next"
          :class="{
            'at-tabs__next--disabled': !nextable,
          }"
          @click="scrollNext"
        >
          <i class="icon icon-chevron-right"></i>
        </span>
        <!-- E next btn -->
        <!-- S Tab nav -->
        <div class="at-tabs__nav-wrap">
          <div ref="navScroll" class="at-tabs__nav-scroll">
            <div ref="nav" class="at-tabs-nav" :style="navStyle">
              <div
                v-for="(item, index) in navList"
                :key="index"
                class="at-tabs-nav__item"
                :class="{
                  'at-tabs-nav__item--active': index === activeIndex,
                  'at-tabs-nav__item--disabled': item.disabled,
                  'at-tabs-nav__item--closable': item.closable,
                }"
                @click="setNavByIndex(index)"
              >
                <!-- S icon -->
                <i
                  v-if="item.icon"
                  class="icon at-tabs-nav__icon"
                  :class="{
                    [item.icon]: item.icon,
                  }"
                >
                </i
                >{{ item.label }}
                <!-- E icon -->
                <!-- S close btn -->
                <span
                  v-if="item.closable"
                  class="at-tabs-nav__close"
                  @click.stop="removeHandle(index)"
                >
                  <i class="icon icon-x"></i>
                </span>
                <!-- E close btn -->
              </div>
            </div>
          </div>
        </div>
        <!-- E Tab nav -->
      </div>
    </div>
    <div class="at-tabs__body" :style="tabsBodyTranslateStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, toRef, watch } from 'vue'
import { useChildren } from '../../../composables/useChildren'
import { TabsContext } from './context'

export default {
  name: 'AtTabs',
  props: {
    modelValue: {
      type: String,
    },
    type: {
      type: String,
      default: 'line',
      validator: val => ['line', 'card'].indexOf(val) > -1,
    },
    size: {
      type: String,
      default: 'default',
      validator: val => ['default', 'small'].indexOf(val) > -1,
    },
    closable: {
      type: Boolean,
      default: false,
    },
    animated: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'on-change', 'on-tab-remove'],
  setup(props, { emit }) {
    const { children, register, unregister, sort } = useChildren()
    const currentValue = ref(props.modelValue)

    watch(
      () => props.modelValue,
      value => {
        currentValue.value = value
      },
    )

    // Panes in DOM order: `reactive({ name, label, icon, disabled, closable })` from each AtTabPane.
    const navList = computed(() => children.map(child => child.exposed))
    const activeKey = computed(() => currentValue.value || navList.value[0]?.name)
    const activeIndex = computed(() =>
      Math.max(
        0,
        navList.value.findIndex(item => item.name === activeKey.value),
      ),
    )

    function select(name, index) {
      if (name === activeKey.value) return
      currentValue.value = name
      emit('update:modelValue', name)
      emit('on-change', { index, name })
    }

    function setNavByIndex(index) {
      const item = navList.value[index]
      if (!item || item.disabled) return
      select(item.name, index)
    }

    // The pane itself is removed by the consumer in `on-tab-remove`; Tabs only moves the selection.
    function removeHandle(index) {
      const list = navList.value
      const tab = list[index]
      if (!tab || tab.disabled) return

      emit('on-tab-remove', { index, name: tab.name })

      if (tab.name !== activeKey.value) return

      const rest = list.filter((item, i) => i !== index)
      const next =
        list.slice(index + 1).find(item => !item.disabled) ||
        list
          .slice(0, index)
          .reverse()
          .find(item => !item.disabled)

      if (next) select(next.name, rest.indexOf(next))
    }

    TabsContext.provide(
      reactive({
        activeKey,
        animated: toRef(props, 'animated'),
        closable: toRef(props, 'closable'),
        children,
        register,
        unregister,
      }),
    )

    return { navList, activeKey, activeIndex, sort, setNavByIndex, removeHandle }
  },
  data() {
    return {
      navOffset: 0,
      navStyle: {
        transform: '',
      },
      nextable: false,
      prevable: false,
      scrollTimer: null,
    }
  },
  computed: {
    scrollable() {
      return this.prevable || this.nextable
    },
    tabsBodyTranslateStyle() {
      const translateValue = this.animated ? `${-this.activeIndex * 100}%` : 0

      return {
        transform: `translate3d(${translateValue}, 0, 0)`,
      }
    },
  },
  watch: {
    activeKey() {
      this.$nextTick(() => {
        this.scrollToActiveTab()
      })
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateHandle, false)

    this.updateHandle()
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null
      this.scrollToActiveTab()
    }, 0)
  },
  updated() {
    // Keyed `v-for` reorders panes without remounting them: keep nav in DOM order.
    this.sort()
    this.updateHandle()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateHandle, false)
    clearTimeout(this.scrollTimer)
  },
  methods: {
    scrollPrev() {
      if (!this.prevable) return

      const containerWidth = this.$refs.navScroll.offsetWidth
      const currentOffset = this.getCurrentScrollOffset()

      if (currentOffset === 0) return

      const newOffset = currentOffset > containerWidth ? currentOffset - containerWidth : 0

      this.setOffset(newOffset)
    },
    scrollNext() {
      if (!this.nextable) return

      const containerWidth = this.$refs.navScroll.offsetWidth
      const currentOffset = this.getCurrentScrollOffset()
      const navWidth = this.$refs.nav.offsetWidth

      if (navWidth - currentOffset <= containerWidth) return

      const newOffset =
        navWidth - currentOffset > containerWidth * 2
          ? currentOffset + containerWidth
          : navWidth - containerWidth

      this.setOffset(newOffset)
    },
    scrollToActiveTab() {
      if (!this.scrollable || !this.$el) return

      const activeTab = this.$el.querySelector('.at-tabs-nav__item--active')
      const navScroll = this.$refs.navScroll

      if (!activeTab || !navScroll) return

      const activeTabBounds = activeTab.getBoundingClientRect()
      const navScrollBounds = navScroll.getBoundingClientRect()
      const currentOffset = this.getCurrentScrollOffset()
      let newOffset = currentOffset

      if (activeTabBounds.left < navScrollBounds.left) {
        newOffset = currentOffset - (navScrollBounds.left - activeTabBounds.left)
      }

      if (activeTabBounds.right > navScrollBounds.right) {
        newOffset = currentOffset + (activeTabBounds.right - navScrollBounds.right)
      }

      this.setOffset(newOffset)
    },
    getCurrentScrollOffset() {
      return this.navOffset
    },
    setOffset(value) {
      this.navOffset = Math.abs(value)
      this.navStyle.transform = `translate3d(-${this.navOffset}px, 0, 0)`
    },
    updateHandle() {
      if (!this.$refs.nav || !this.$refs.navScroll) {
        return
      }

      const navWidth = this.$refs.nav.offsetWidth
      const containerWidth = this.$refs.navScroll.offsetWidth
      const currentOffset = this.getCurrentScrollOffset()

      if (containerWidth < navWidth) {
        this.prevable = currentOffset !== 0
        this.nextable = currentOffset + containerWidth < navWidth
        if (navWidth - currentOffset < containerWidth) {
          this.setOffset(navWidth - containerWidth)
        }
      } else {
        this.nextable = false
        this.prevable = false

        if (currentOffset > 0) {
          this.setOffset(0)
        }
      }
    },
  },
}
</script>
