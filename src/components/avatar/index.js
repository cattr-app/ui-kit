import Avatar from './src/avatar.vue'

Avatar.install = app => {
  app.component(Avatar.name, Avatar)
}

export default Avatar
