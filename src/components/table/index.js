import Table from './src/table.vue'

Table.install = app => {
  app.component(Table.name, Table)
}

export default Table
