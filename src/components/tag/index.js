import Tag from './src/tag.vue'

Tag.install = app => {
  app.component(Tag.name, Tag)
}

export default Tag
