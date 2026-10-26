import Pagination from './src/pagination.vue'

Pagination.install = app => {
  app.component(Pagination.name, Pagination)
}

export default Pagination
