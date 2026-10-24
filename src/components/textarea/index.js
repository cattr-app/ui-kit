import Textarea from './src/textarea.vue'

Textarea.install = app => {
  app.component(Textarea.name, Textarea)
}

export default Textarea
