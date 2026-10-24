import Card from './src/card.vue'

Card.install = app => {
  app.component(Card.name, Card)
}

export default Card
