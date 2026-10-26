import CheckboxGroup from '../checkbox/src/checkbox-group.vue'

CheckboxGroup.install = app => {
  app.component(CheckboxGroup.name, CheckboxGroup)
}

export default CheckboxGroup
