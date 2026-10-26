import Progress from './src/progress.vue'

Progress.install = app => {
  app.component(Progress.name, Progress)
}

export default Progress
