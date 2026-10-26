import Option from '../select/src/option.vue'

Option.install = app => {
  app.component(Option.name, Option)
}

export default Option
