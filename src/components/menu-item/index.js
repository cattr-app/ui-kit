import MenuItem from '../menu/src/menu-item.vue'

MenuItem.install = app => {
  app.component(MenuItem.name, MenuItem)
}

export default MenuItem
