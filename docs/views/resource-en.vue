<template>
  <div class="wrapper">
    <m-header></m-header>
    <div class="at-container row">
      <sidebar :data="navs"></sidebar>
      <div class="at-markdown col-sm-24 col-md-18 col-lg-20">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in" @after-leave="afterLeave">
            <component :is="Component"></component>
          </transition>
        </router-view>
      </div>
    </div>
    <m-footer></m-footer>
  </div>
</template>

<script>
import MHeader from '../components/header.vue'
import MFooter from '../components/footer.vue'
import Sidebar from '../components/sidebar.vue'
import navsConfig from '../router/nav.config.js'

export default {
  components: {
    Sidebar,
    MHeader,
    MFooter,
  },
  data() {
    return {
      navs: navsConfig.en.resource,
    }
  },
  methods: {
    afterLeave() {
      window.scrollTo(0, 0)
    },
  },
}
</script>

<style lang="scss">
@use '../assets/style/docs.scss';
</style>

<style lang="scss" scoped>
.wrapper {
  background-color: #f8faff;
}
.page-header {
  position: relative !important;
}
.footer {
  box-shadow: 0 4px 30px 0 rgba(223, 225, 230, 0.8);
}
</style>
