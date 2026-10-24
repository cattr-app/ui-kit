<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in" @after-leave="afterLeave">
      <component :is="Component"></component>
    </transition>
  </router-view>
</template>

<script>
export default {
  methods: {
    afterLeave() {
      window.scrollTo(0, 0)
    },
  },
}
</script>
