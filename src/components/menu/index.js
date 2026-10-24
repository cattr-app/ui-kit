import Menu from './src/menu.vue'

Menu.install = app => {
  app.component(Menu.name, Menu)
}

export default Menu
