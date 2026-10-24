import Alert from './src/alert.vue'

Alert.install = app => {
  app.component(Alert.name, Alert)
}

export default Alert
