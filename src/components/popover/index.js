import Popover from './src/popover.vue'

Popover.install = app => {
  app.component(Popover.name, Popover)
}

export default Popover
