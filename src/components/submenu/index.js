import Submenu from '../menu/src/submenu.vue'

Submenu.install = app => {
  app.component(Submenu.name, Submenu)
}

export default Submenu
