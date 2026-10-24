import Button from './src/button.vue'

Button.install = app => {
  app.component(Button.name, Button)
}

export default Button
