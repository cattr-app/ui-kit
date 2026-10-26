import Breadcrumb from './src/breadcrumb.vue'

Breadcrumb.install = app => {
  app.component(Breadcrumb.name, Breadcrumb)
}

export default Breadcrumb
