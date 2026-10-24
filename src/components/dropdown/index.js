import Dropdown from './src/dropdown.vue'

Dropdown.install = app => {
  app.component(Dropdown.name, Dropdown)
}

export default Dropdown
