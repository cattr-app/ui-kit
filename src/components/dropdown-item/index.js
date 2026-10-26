import DropdownItem from '../dropdown/src/dropdown-item.vue'

DropdownItem.install = app => {
  app.component(DropdownItem.name, DropdownItem)
}

export default DropdownItem
