import Skeleton from './src/skeleton.vue'

Skeleton.install = app => {
  app.component(Skeleton.name, Skeleton)
}

export default Skeleton
