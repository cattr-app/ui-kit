import Tooltip from './src/tooltip.vue'

Tooltip.install = app => {
  app.component(Tooltip.name, Tooltip)
}

export default Tooltip
