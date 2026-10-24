import Timeline from './src/timeline.vue'

Timeline.install = app => {
  app.component(Timeline.name, Timeline)
}

export default Timeline
