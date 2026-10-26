import OptionGroup from '../select/src/option-group.vue'

OptionGroup.install = app => {
  app.component(OptionGroup.name, OptionGroup)
}

export default OptionGroup
