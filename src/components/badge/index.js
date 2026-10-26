import Badge from './src/badge.vue'

Badge.install = app => {
  app.component(Badge.name, Badge)
}

export default Badge
