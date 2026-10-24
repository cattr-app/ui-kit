import TabPane from '../tabs/src/tab-pane.vue'

TabPane.install = app => {
  app.component(TabPane.name, TabPane)
}

export default TabPane
