import DropdownMenu from '../dropdown/src/dropdown-menu.vue'

DropdownMenu.install = app => {
  app.component(DropdownMenu.name, DropdownMenu)
}

export default DropdownMenu
