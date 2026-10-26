import MenuItemGroup from '../menu/src/menu-group.vue'

MenuItemGroup.install = app => {
  app.component(MenuItemGroup.name, MenuItemGroup)
}

export default MenuItemGroup
